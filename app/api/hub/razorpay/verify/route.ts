import { createSupabaseServerClient } from "@/lib/supabaseAuthServer";
import { verifyPaymentSignature, fetchPayment } from "@/lib/razorpay/client";
import { finalizeRazorpayOrder } from "@/lib/razorpay/finalize";
import { sendPaymentGuardMismatchAlert } from "@/lib/paymentEmails";
import { completeReportUnlock } from "@/lib/completeReportUnlock";
import { getSupabaseServerClient } from "@/lib/supabase";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Not signed in." }, { status: 401 });
  }

  let body: { orderId?: string; paymentId?: string; signature?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { orderId, paymentId, signature } = body;
  if (!orderId || !paymentId || !signature) {
    return Response.json({ error: "orderId, paymentId, and signature are required." }, { status: 400 });
  }

  if (!verifyPaymentSignature({ orderId, paymentId, signature })) {
    return Response.json({ error: "Invalid payment signature." }, { status: 400 });
  }

  // Ask Razorpay what this payment actually is, then let finalize refuse
  // anything that isn't a captured payment for this order at the exact amount.
  // A thrown fetch (Razorpay unreachable) is not fatal here — the webhook and
  // the reconcile cron are the durable finalize paths; this route is best-effort UX.
  let guards: { amountPaise: number; status: string; orderId: string } | undefined;
  try {
    const payment = await fetchPayment(paymentId);
    guards = { amountPaise: payment.amount, status: payment.status, orderId: payment.order_id ?? "" };
  } catch (err) {
    console.error("verify: fetchPayment failed", { orderId, paymentId, error: err });
    return Response.json({ error: "Payment could not be verified." }, { status: 400 });
  }

  const result = await finalizeRazorpayOrder(orderId, paymentId, guards);

  if (!result.ok) {
    if (result.reason === "guard_mismatch") {
      await sendPaymentGuardMismatchAlert({ orderId, paymentId, amountPaise: guards.amountPaise }).catch((err) => {
        console.error("Failed to send payment guard-mismatch alert", { orderId, error: err });
      });
    }
    return Response.json({ error: "Payment could not be verified." }, { status: 400 });
  }

  // finalizeRazorpayOrder always applies the effect to the transaction's own
  // user_id, not whoever calls this route — so the effect itself is already
  // correct even if a different signed-in user somehow posted these values.
  // This check only stops that caller from receiving someone else's report
  // content back in the response.
  if (result.userId !== user.id) {
    return Response.json({ status: result.product === "counselling" ? "requested" : "unlocked" });
  }

  if (result.product === "counselling") {
    return Response.json({ status: "requested" });
  }

  if (result.leadId === null) {
    return Response.json({ status: "unlocked" });
  }

  const admin = getSupabaseServerClient();
  const { data: lead, error: leadError } = await admin
    .from("fitment_leads")
    .select("id, role_title, ib_applied_job_id, resume_match_status, resume_match_raw")
    .eq("id", result.leadId)
    .maybeSingle();

  if (leadError || !lead) {
    return Response.json({ status: "unlocked" });
  }

  // unlockReport was already called by finalizeRazorpayOrder (idempotent
  // insert — a duplicate-key error is swallowed) — reusing completeReportUnlock
  // here is just the simplest way to reuse its "fetch + cache the report"
  // logic, not a required second unlock.
  const reportResult = await completeReportUnlock(user.id, lead);

  if (reportResult.status === "error") {
    return Response.json({ status: "unlocked" });
  }
  if (reportResult.status === "pending") {
    return Response.json({ status: "pending" });
  }
  return Response.json({ status: "unlocked", report: reportResult.report });
}
