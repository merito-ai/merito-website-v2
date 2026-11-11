import { createSupabaseServerClient } from "@/lib/supabaseAuthServer";
import { getSupabaseServerClient } from "@/lib/supabase";
import { createOrder } from "@/lib/razorpay/client";
import { PRODUCT_PRICING, PRODUCT_LABELS, DEFAULT_LEVEL, referenceRefreshPricePaise, type CandidateLevel, type RazorpayProduct } from "@/lib/razorpay/pricing";
import { isProductUnlocked } from "@/lib/productUnlocks";
import { referenceRefreshNeedsPayment } from "@/lib/referenceCredits";
import { isEmailAllowlisted } from "@/lib/planAllowlist";
import { isPlanProduct, getPlanOrder, PLAN_UPGRADE } from "@/lib/plans";

export const runtime = "nodejs";

// "report" has its own dedicated route (app/api/hub/unlock-report) because
// it's tied to a specific fitment_leads row (leadId) — this generic route
// is for account-level products that aren't tied to any one lead.
const INITIATABLE_PRODUCTS: RazorpayProduct[] = ["counselling", "personality", "references", "interview", "plan_prepare", "plan_mentor", PLAN_UPGRADE];

function isInitiatableProduct(value: unknown): value is RazorpayProduct {
  return typeof value === "string" && (INITIATABLE_PRODUCTS as string[]).includes(value);
}

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Not signed in." }, { status: 401 });
  }

  let body: { product?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (!isInitiatableProduct(body.product)) {
    return Response.json({ error: "Unknown product." }, { status: 400 });
  }
  const product = body.product;

  if (isPlanProduct(product) || product === PLAN_UPGRADE) {
    // Server-side gate (spec): hiding the plan in the UI is not enough. Fails closed on DB errors.
    let allowlisted: boolean;
    let existingPlan: Awaited<ReturnType<typeof getPlanOrder>>;
    try {
      allowlisted = await isEmailAllowlisted(user.email);
      existingPlan = allowlisted ? await getPlanOrder(user.id) : null;
    } catch {
      return Response.json({ error: "Something went wrong starting payment." }, { status: 500 });
    }
    if (!allowlisted) {
      return Response.json({ error: "Plans aren't available on this account." }, { status: 403 });
    }
    // Upgrade (PM 2026-11-11) only lifts an active Plan 1; no downgrade, no second plan.
    if (product === PLAN_UPGRADE) {
      if (existingPlan?.product !== "plan_prepare") {
        return Response.json({ error: existingPlan ? "You already have Plan 2." : "Upgrading needs an active Plan 1." }, { status: 409 });
      }
    } else if (existingPlan) {
      return Response.json({ error: "You already have a plan." }, { status: 409 });
    }
  }

  const { data: lead } = await supabase
    .from("fitment_leads")
    .select("candidate_level")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const level = (lead?.candidate_level as CandidateLevel | null) ?? DEFAULT_LEVEL;
  let amountPaise = PRODUCT_PRICING[product][level];

  // Already own references: this purchase is a loyalty-priced refresh for a
  // new check, only allowed once the paid-for checks are used up.
  if (product === "references" && (await isProductUnlocked(user.id, "references"))) {
    if (!(await referenceRefreshNeedsPayment(user.id))) {
      return Response.json({ error: "You already have a reference check available." }, { status: 409 });
    }
    amountPaise = referenceRefreshPricePaise(Boolean(await getPlanOrder(user.id)));
  }

  const { orderId } = await createOrder({
    amountPaise,
    currency: "INR",
    receipt: `${product}-${Date.now()}`,
  });

  const admin = getSupabaseServerClient();
  const { error: insertError } = await admin.from("razorpay_transactions").insert({
    order_id: orderId,
    user_id: user.id,
    product,
    level,
    lead_id: null,
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
    description: PRODUCT_LABELS[product],
    prefill: { name: user.email?.split("@")[0] || "Candidate", email: user.email ?? "" },
  });
}
