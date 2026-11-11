import { getSupabaseServerClient } from "@/lib/supabase";
import { isPersonalityComplete } from "@/lib/psychometrics/testFlow";
import { getPlanOrder, isPlanProduct, PLAN_UPGRADE } from "@/lib/plans";
import { PRODUCT_LABELS } from "@/lib/razorpay/pricing";
import { INTERVIEW_CREDIT_PRODUCTS } from "@/lib/interviewCredits";

// One plain-words status per product, for the admin candidate page.
export type EntitlementTone = "neutral" | "success" | "warning" | "danger";
export type EntitlementStatus = { label: string; tone: EntitlementTone };
export type RoleEntitlements = { leadId: string; roleTitle: string; level: string | null; report: EntitlementStatus; interview: EntitlementStatus };
export type CandidateEntitlements = {
  roles: RoleEntitlements[];
  account: { personality: EntitlementStatus; references: EntitlementStatus; counselling: EntitlementStatus; plan: EntitlementStatus };
  totalPaidPaise: number;
  unusedInterviewCredits: number;
};

type Txn = { order_id: string; product: string; lead_id: string | null; amount_paise: number; status: string; consumed_at: string | null };

const NOT_BOUGHT: EntitlementStatus = { label: "Not bought", tone: "neutral" };

function howPaid(txn: Txn | undefined): string {
  if (!txn) return "no payment found";
  return txn.amount_paise === 0 ? "free grant" : `paid ₹${(txn.amount_paise / 100).toLocaleString("en-IN")}`;
}

function plural(n: number, word: string): string {
  return `${n} ${word}${n === 1 ? "" : "s"}`;
}

export async function getCandidateEntitlements(userId: string): Promise<CandidateEntitlements> {
  const supabase = getSupabaseServerClient();
  const [
    { data: leadRows },
    { data: txnRows },
    { data: reportRows },
    { data: productRows },
    { data: interviewRows },
    { data: personalityRows },
    { data: referenceRows },
    { data: counsellingRows },
    plan,
  ] = await Promise.all([
    supabase.from("fitment_leads").select("id, role_title, candidate_level, created_at").eq("user_id", userId).order("created_at", { ascending: false }),
    supabase.from("razorpay_transactions").select("order_id, product, lead_id, amount_paise, status, consumed_at").eq("user_id", userId),
    supabase.from("report_unlocks").select("lead_id").eq("user_id", userId),
    supabase.from("product_unlocks").select("product").eq("user_id", userId),
    supabase.from("fitment_interviews").select("lead_id, role_title, status, updated_at").eq("user_id", userId).order("updated_at", { ascending: false }),
    supabase.from("personality_tests").select("version, culture_scores").eq("user_id", userId),
    supabase.from("reference_checks").select("status").eq("user_id", userId),
    // Plan 2 mentoring has one row per session (unique order_id + session), so count rows, not orders.
    supabase.from("counselling_requests").select("order_id, session, status").eq("user_id", userId),
    getPlanOrder(userId),
  ]);

  const txns = (txnRows ?? []) as Txn[];
  const success = txns.filter((t) => t.status === "success");
  const refunded = txns.filter((t) => t.status === "refunded");
  const unlockedLeads = new Set((reportRows ?? []).map((r) => r.lead_id as string | null));
  const unlockedProducts = new Set((productRows ?? []).map((r) => r.product as string));
  const hasBundle = success.some((t) => t.product === "bundle");

  const roles: RoleEntitlements[] = (leadRows ?? []).map((lead) => {
    const reportTxn = success.find((t) => (t.product === "report" || t.product === "bundle") && t.lead_id === lead.id);
    let report: EntitlementStatus = NOT_BOUGHT;
    if (unlockedLeads.has(lead.id)) {
      report = reportTxn || !plan
        ? { label: `Unlocked, ${howPaid(reportTxn)}`, tone: reportTxn ? "success" : "warning" }
        : { label: "Unlocked, in plan", tone: "success" };
    } else if (refunded.some((t) => (t.product === "report" || t.product === "bundle") && t.lead_id === lead.id)) {
      report = { label: "Refunded", tone: "warning" };
    }

    const iv = (interviewRows ?? []).find((r) => r.lead_id === lead.id) ?? (interviewRows ?? []).find((r) => !r.lead_id && r.role_title === lead.role_title);
    const interview: EntitlementStatus = !iv
      ? { label: "Not started", tone: "neutral" }
      : iv.status === "ready"
        ? { label: "Done", tone: "success" }
        : iv.status === "terminated"
          ? { label: "Ended early", tone: "danger" }
          : { label: "In progress", tone: "warning" };

    return { leadId: lead.id, roleTitle: lead.role_title, level: lead.candidate_level ?? null, report, interview };
  });

  const ownsVia = (product: string) => unlockedProducts.has(product) || hasBundle || Boolean(plan) || success.some((t) => t.product === product);
  const refundedOnly = (product: string) => refunded.some((t) => t.product === product);

  const personality: EntitlementStatus = (personalityRows ?? []).some(isPersonalityComplete)
    ? { label: "Done", tone: "success" }
    : ownsVia("personality")
      ? { label: "Bought, not finished", tone: "warning" }
      : refundedOnly("personality")
        ? { label: "Refunded", tone: "warning" }
        : NOT_BOUGHT;

  const refStatuses = (referenceRows ?? []).map((r) => r.status as string);
  const references: EntitlementStatus = refStatuses.includes("completed")
    ? { label: "Done", tone: "success" }
    : refStatuses.some((s) => s === "initiated" || s === "in_progress")
      ? { label: "In progress", tone: "warning" }
      : ownsVia("references")
        ? { label: "Bought, not started", tone: "warning" }
        : refundedOnly("references")
          ? { label: "Refunded", tone: "warning" }
          : NOT_BOUGHT;

  const sessions = counsellingRows ?? [];
  const byStatus = (s: string) => sessions.filter((r) => r.status === s).length;
  const parts = [
    byStatus("completed") && `${byStatus("completed")} done`,
    byStatus("scheduled") && `${byStatus("scheduled")} scheduled`,
    byStatus("requested") && `${byStatus("requested")} to schedule`,
    byStatus("cancelled") && `${byStatus("cancelled")} cancelled`,
  ].filter(Boolean);
  const counselling: EntitlementStatus =
    sessions.length > 0
      ? { label: `${plural(sessions.length, "session")}: ${parts.join(", ")}`, tone: byStatus("requested") > 0 ? "warning" : "success" }
      : refundedOnly("counselling")
        ? { label: "Refunded", tone: "warning" }
        : NOT_BOUGHT;

  const planTxn = plan ? success.find((t) => t.order_id === plan.orderId) : undefined;
  const planStatus: EntitlementStatus = plan
    ? { label: `${PRODUCT_LABELS[plan.product]}, ${howPaid(planTxn)}${plan.upgradeOrderId ? ", upgraded" : ""}`, tone: "success" }
    : refunded.some((t) => isPlanProduct(t.product) || t.product === PLAN_UPGRADE)
      ? { label: "Refunded", tone: "warning" }
      : { label: "None", tone: "neutral" };

  return {
    roles,
    account: { personality, references, counselling, plan: planStatus },
    totalPaidPaise: success.reduce((sum, t) => sum + t.amount_paise, 0),
    unusedInterviewCredits: success.filter((t) => (INTERVIEW_CREDIT_PRODUCTS as readonly string[]).includes(t.product) && t.consumed_at === null).length,
  };
}

export type BillingSummary = { paidPaise: number; unusedInterviewCredits: number; roles: number };

// Candidates list columns: one query per table for the whole page of users.
export async function getBillingSummaries(userIds: string[]): Promise<Map<string, BillingSummary>> {
  const result = new Map<string, BillingSummary>(userIds.map((id) => [id, { paidPaise: 0, unusedInterviewCredits: 0, roles: 0 }]));
  if (userIds.length === 0) return result;
  const supabase = getSupabaseServerClient();
  const [{ data: txnRows }, { data: leadRows }] = await Promise.all([
    supabase.from("razorpay_transactions").select("user_id, product, amount_paise, consumed_at").eq("status", "success").in("user_id", userIds),
    supabase.from("fitment_leads").select("user_id").in("user_id", userIds),
  ]);
  for (const t of txnRows ?? []) {
    const row = result.get(t.user_id);
    if (!row) continue;
    row.paidPaise += t.amount_paise;
    if ((INTERVIEW_CREDIT_PRODUCTS as readonly string[]).includes(t.product) && t.consumed_at === null) row.unusedInterviewCredits += 1;
  }
  for (const l of leadRows ?? []) {
    const row = result.get(l.user_id);
    if (row) row.roles += 1;
  }
  return result;
}
