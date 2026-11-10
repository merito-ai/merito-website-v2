import { createSupabaseServerClient } from "@/lib/supabaseAuthServer";
import { completeReportUnlock } from "@/lib/completeReportUnlock";
import { getSupabaseServerClient } from "@/lib/supabase";
import { createOrder } from "@/lib/razorpay/client";
import { PRODUCT_PRICING, DEFAULT_LEVEL, type CandidateLevel } from "@/lib/razorpay/pricing";
import { arePaymentsBypassed } from "@/lib/paymentsBypass";
import { getPlanOrder, planReportCreditsLeft } from "@/lib/plans";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Not signed in." }, { status: 401 });
  }

  let body: { leadId?: string; product?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const leadId = typeof body.leadId === "string" ? body.leadId.trim() : "";
  if (!leadId) {
    return Response.json({ error: "leadId is required." }, { status: 400 });
  }

  const product = body.product === "bundle" ? "bundle" : "report";

  const { data: lead, error: leadError } = await supabase
    .from("fitment_leads")
    .select("id, role_title, ib_applied_job_id, resume_match_status, resume_match_raw, candidate_level")
    .eq("user_id", user.id)
    .eq("id", leadId)
    .maybeSingle();

  if (leadError || !lead) {
    return Response.json({ error: "No fitment check found for this lead." }, { status: 400 });
  }

  // shortcut: two concurrent unlocks of different leads can both see 1 credit left and spend a 4th;
  // upgrade to a locking Postgres function if that's ever seen (open issue #8, accepted by PM).
  const bypassed = arePaymentsBypassed();
  const plan = product === "report" && !bypassed ? await getPlanOrder(user.id) : null;
  const planOrderId = plan && (await planReportCreditsLeft(plan.orderId)) > 0 ? plan.orderId : null;

  if (!planOrderId && !bypassed) {
    const level = (lead.candidate_level as CandidateLevel | null) ?? DEFAULT_LEVEL;
    const amountPaise = PRODUCT_PRICING[product][level];

    const { orderId } = await createOrder({
      amountPaise,
      currency: "INR",
      // Razorpay caps receipt at 40 chars; "report-" + a uuid leadId is 43.
      receipt: leadId,
    });

    const admin = getSupabaseServerClient();
    const { error: insertError } = await admin.from("razorpay_transactions").insert({
      order_id: orderId,
      user_id: user.id,
      product,
      level,
      lead_id: leadId,
      amount_paise: amountPaise,
      status: "initiated",
    });

    if (insertError) {
      return Response.json({ error: "Something went wrong starting payment." }, { status: 500 });
    }

    return Response.json({
      status: "checkout",
      orderId,
      amountPaise,
      currency: "INR",
      keyId: process.env.RAZORPAY_KEY_ID,
      name: "Merito",
      description: product === "bundle" ? "Full Profile Bundle" : "Detailed Fitment Report",
      prefill: { name: user.email?.split("@")[0] || "Candidate", email: user.email ?? "" },
    });
  }

  // A lead already unlocked hits 23505 in unlockReport and is swallowed, so no credit is spent.
  const result = await completeReportUnlock(user.id, lead, product, planOrderId ?? undefined);

  if (result.status === "error") {
    return Response.json({ error: result.message }, { status: 500 });
  }
  if (result.status === "pending") {
    return Response.json({ status: "pending" });
  }
  return Response.json({ status: "unlocked", report: result.report });
}
