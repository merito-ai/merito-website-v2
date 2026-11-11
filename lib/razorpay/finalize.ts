import { getSupabaseServerClient } from "@/lib/supabase";
import { unlockReport } from "@/lib/reportUnlocks";
import { unlockProduct, revokeProduct } from "@/lib/productUnlocks";
import { nextCounsellingState, updateCounsellingStatus, type CounsellingStatus } from "@/lib/adminCounselling";
import type { RazorpayProduct } from "@/lib/razorpay/pricing";
import { countReferenceCredits } from "@/lib/referenceCredits";
import { isPlanProduct, PLAN_PRODUCTS, PLAN_UPGRADE } from "@/lib/plans";
import { applyPlanGrants } from "@/lib/planGrants";
import { sendPlanWelcomeEmail } from "@/lib/paymentEmails";

async function getRoleTitleForLead(
  supabase: ReturnType<typeof getSupabaseServerClient>,
  leadId: string | null
): Promise<string | null> {
  if (!leadId) return null;
  const { data } = await supabase.from("fitment_leads").select("role_title").eq("id", leadId).maybeSingle();
  return data?.role_title ?? null;
}

export type FinalizeResult =
  | { ok: true; product: RazorpayProduct; userId: string; leadId: string | null }
  | { ok: false; reason: "unknown_order" | "unsupported_product" | "guard_mismatch" | "refunded" };

// Optional cross-check: the caller (webhook / client-verify / reconcile cron)
// asks Razorpay itself what the payment actually is, then hands the answer here.
// finalize refuses to grant the product unless it's a captured payment, for
// this order, for the exact amount the transaction row was created with.
export type PaymentGuards = { amountPaise: number; status: string; orderId: string };

// Signature verification (payment or webhook) happens in the calling route,
// not here — Razorpay's two channels carry different payloads, so each has
// its own verify function in lib/razorpay/client.ts. This function only
// applies the *effect* of an already-authenticated payment, and does so
// idempotently: unlockReport inserts and swallows a duplicate-key error, so calling it again on a
// webhook retry after a client-side verify already succeeded (or vice
// versa) is safe.
export async function finalizeRazorpayOrder(
  orderId: string,
  paymentId: string,
  guards?: PaymentGuards
): Promise<FinalizeResult> {
  const supabase = getSupabaseServerClient();
  const { data: txn, error } = await supabase
    .from("razorpay_transactions")
    .select("user_id, product, lead_id, status, amount_paise")
    .eq("order_id", orderId)
    .maybeSingle();

  if (error || !txn) {
    return { ok: false, reason: "unknown_order" };
  }

  const product = txn.product as RazorpayProduct;
  // A refunded order must never be granted again (webhooks are at-least-once; a late payment.captured carries a stale "captured").
  if (txn.status === "refunded") return { ok: false, reason: "refunded" };

  if (txn.status !== "success") {
    if (guards) {
      const okGuard =
        guards.orderId === orderId &&
        guards.status === "captured" &&
        guards.amountPaise === txn.amount_paise;
      if (!okGuard) {
        console.error("finalize: payment guard mismatch", {
          orderId,
          guards,
          expectedAmountPaise: txn.amount_paise,
          txnStatus: txn.status,
        });
        return { ok: false, reason: "guard_mismatch" };
      }
    }
    // Apply the product's effect first, then mark success — if the effect
    // throws (a transient DB error), the row stays "initiated" and a retry
    // genuinely re-attempts it instead of silently skipping it next time.
    if (product === "report") {
      const roleTitle = await getRoleTitleForLead(supabase, txn.lead_id as string | null);
      if (txn.lead_id && roleTitle) {
        await unlockReport(txn.user_id, txn.lead_id as string, roleTitle);
      } else {
        // Paid, but no lead to attach the unlock to -- log at error so it
        // surfaces: the txn is about to be marked success, so no retry repairs
        // this. leadId distinguishes "null" from "set but the lead row is gone".
        console.error("finalize: report order resolved no lead for report unlock", {
          orderId,
          leadId: txn.lead_id,
          roleTitle,
        });
      }
    } else if (product === "counselling") {
      const { error: insertError } = await supabase
        .from("counselling_requests")
        .upsert({ user_id: txn.user_id, order_id: orderId }, { onConflict: "order_id,session", ignoreDuplicates: true });
      if (insertError) {
        throw new Error(`Failed to record counselling request: ${insertError.message}`);
      }
    } else if (product === "personality") {
      await unlockProduct(txn.user_id, "personality");
    } else if (product === "references") {
      await unlockProduct(txn.user_id, "references");
    } else if (product === "bundle") {
      const roleTitle = await getRoleTitleForLead(supabase, txn.lead_id as string | null);
      if (txn.lead_id && roleTitle) {
        await unlockReport(txn.user_id, txn.lead_id as string, roleTitle);
      } else {
        // personality/references below still apply; only the report unlock is skipped.
        console.error("finalize: bundle order resolved no lead for report unlock", {
          orderId,
          leadId: txn.lead_id,
          roleTitle,
        });
      }
      await unlockProduct(txn.user_id, "personality");
      await unlockProduct(txn.user_id, "references");
    } else if (isPlanProduct(product) || product === PLAN_UPGRADE) {
      await applyPlanGrants(txn.user_id, orderId, product);
    }
    // Compare-and-set: when verify and webhook race, only the path that actually flips the row sends the email.
    const { data: flipped } = await supabase
      .from("razorpay_transactions")
      .update({ status: "success", payment_id: paymentId })
      .eq("order_id", orderId)
      .neq("status", "success")
      .select("order_id");
    if (flipped?.length && (isPlanProduct(product) || product === PLAN_UPGRADE)) {
      await sendPlanWelcomeEmail(txn.user_id, product === PLAN_UPGRADE ? "plan_mentor" : product).catch((err) =>
        console.error("finalize: plan welcome email failed", { orderId, err })
      );
    }
  }

  return { ok: true, product, userId: txn.user_id, leadId: txn.lead_id };
}

export type MarkFailedResult =
  | { ok: true; alreadyProcessed: boolean; orderId: string; amountPaise: number }
  | { ok: false; reason: "unknown_order" };

export async function markRazorpayPaymentFailed(orderId: string): Promise<MarkFailedResult> {
  const supabase = getSupabaseServerClient();
  const { data: txn, error } = await supabase
    .from("razorpay_transactions")
    .select("status, amount_paise")
    .eq("order_id", orderId)
    .maybeSingle();

  if (error || !txn) {
    return { ok: false, reason: "unknown_order" };
  }

  if (txn.status !== "initiated") {
    return { ok: true, alreadyProcessed: true, orderId, amountPaise: txn.amount_paise };
  }

  await supabase.from("razorpay_transactions").update({ status: "failed" }).eq("order_id", orderId);
  return { ok: true, alreadyProcessed: false, orderId, amountPaise: txn.amount_paise };
}

export type MarkRefundedResult =
  | { ok: true; alreadyProcessed: boolean }
  | { ok: false; reason: "unknown_order" };

async function revokeReportForLead(
  supabase: ReturnType<typeof getSupabaseServerClient>,
  userId: string,
  leadId: string | null
): Promise<void> {
  const roleTitle = await getRoleTitleForLead(supabase, leadId);
  if (leadId) {
    await supabase.from("report_unlocks").delete().eq("user_id", userId).eq("lead_id", leadId);
  }
  if (roleTitle) {
    // Legacy row (lead_id never backfilled) for the same role.
    await supabase.from("report_unlocks").delete().eq("user_id", userId).eq("role_title", roleTitle).is("lead_id", null);
  }
}

// Cancels every still-open session of the order (Plan 2 has two). Completed sessions stay as history;
// scheduled ones are cancelled too (the entitlement is gone), ops contacts the user about the booked slot.
async function revokeCounsellingForOrder(
  supabase: ReturnType<typeof getSupabaseServerClient>,
  orderId: string
): Promise<void> {
  const { data: requests, error } = await supabase.from("counselling_requests").select("id, status").eq("order_id", orderId);
  if (error) throw new Error(`Failed to load counselling requests for refund: ${error.message}`);
  for (const request of requests ?? []) {
    if (request.status !== "requested" && request.status !== "scheduled") continue;
    const patch = nextCounsellingState(request.status as CounsellingStatus, "cancelled", new Date().toISOString());
    await updateCounsellingStatus(request.id, patch);
  }
}

export async function markRazorpayRefunded(orderId: string): Promise<MarkRefundedResult> {
  const supabase = getSupabaseServerClient();
  const { data: txn, error } = await supabase
    .from("razorpay_transactions")
    .select("status, product, user_id, lead_id")
    .eq("order_id", orderId)
    .maybeSingle();

  if (error || !txn) {
    return { ok: false, reason: "unknown_order" };
  }

  if (txn.status !== "success") {
    return { ok: true, alreadyProcessed: true };
  }

  if (txn.product === "report") {
    await revokeReportForLead(supabase, txn.user_id, txn.lead_id);
  } else if (txn.product === "personality") {
    await revokePersonalityUnlessOtherwisePaid(txn.user_id, orderId);
  } else if (txn.product === "references") {
    await revokeReferencesUnlessOtherwisePaid(txn.user_id, orderId);
  } else if (txn.product === "bundle") {
    await revokeReportForLead(supabase, txn.user_id, txn.lead_id);
    await revokePersonalityUnlessOtherwisePaid(txn.user_id, orderId);
    await revokeReferencesUnlessOtherwisePaid(txn.user_id, orderId);
  } else if (txn.product === "counselling") {
    await revokeCounsellingForOrder(supabase, orderId);
  } else if (isPlanProduct(txn.product)) {
    const { error: unlockError } = await supabase.from("report_unlocks").delete().eq("order_id", orderId);
    if (unlockError) throw new Error(`Failed to revoke plan reports: ${unlockError.message}`);
    await revokePersonalityUnlessOtherwisePaid(txn.user_id, orderId);
    await revokeReferencesUnlessOtherwisePaid(txn.user_id, orderId);
    await revokeCounsellingForOrder(supabase, orderId);
    if (txn.product === "plan_prepare") await flagOrphanedUpgrade(txn.user_id, orderId);
  } else if (txn.product === PLAN_UPGRADE) {
    // Only Plan 2's extras; the effective plan reverts to Plan 1 because getPlanOrder ignores non-success upgrades.
    await revokeCounsellingForOrder(supabase, orderId);
  }
  // "interview" (and a plan's interview credit): no separate table for its grant -- the status flip below,
  // which start-ai-interview checks via `status='success'`, is the entire revocation.

  await supabase.from("razorpay_transactions").update({ status: "refunded" }).eq("order_id", orderId);
  return { ok: true, alreadyProcessed: false };
}

// Plan 1 refunded while its upgrade stays paid: the upgrade no longer confers a plan (getPlanOrder needs a
// live base) but its mentoring request is kept — the user paid for it. Not auto-refunded; ops decides.
async function flagOrphanedUpgrade(userId: string, refundedOrderId: string): Promise<void> {
  const { count } = await getSupabaseServerClient()
    .from("razorpay_transactions")
    .select("order_id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("status", "success")
    .eq("product", PLAN_UPGRADE);
  if ((count ?? 0) > 0) {
    console.error("refund: Plan 1 refunded while its paid plan upgrade remains; refund the upgrade too if intended", { userId, refundedOrderId });
  }
}

// A loyalty refresh is a second "references" payment: refunding it (or a
// bundle) must not take away references another payment still covers.
async function revokeReferencesUnlessOtherwisePaid(userId: string, refundedOrderId: string): Promise<void> {
  if ((await countReferenceCredits(userId, refundedOrderId)) > 0) return;
  await revokeProduct(userId, "references");
}

// Personality can be owned via several payments (personality, bundle, plan): a refund of one keeps it if another remains.
async function revokePersonalityUnlessOtherwisePaid(userId: string, refundedOrderId: string): Promise<void> {
  const { count, error } = await getSupabaseServerClient()
    .from("razorpay_transactions")
    .select("order_id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("status", "success")
    .in("product", ["personality", "bundle", ...PLAN_PRODUCTS])
    .neq("order_id", refundedOrderId);
  if (error) throw new Error(`Failed to check other personality purchases: ${error.message}`);
  if ((count ?? 0) > 0) return;
  await revokeProduct(userId, "personality");
}
