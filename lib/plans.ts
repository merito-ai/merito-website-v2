import { getSupabaseServerClient } from "@/lib/supabase";
import { isEmailAllowlisted } from "@/lib/planAllowlist";

export const PLAN_PRODUCTS = ["plan_prepare", "plan_mentor"] as const;
export type PlanProduct = (typeof PLAN_PRODUCTS)[number];
// Plan 1 -> Plan 2 for the price difference. Deliberately NOT in PLAN_PRODUCTS: it carries no
// interview/report/reference credit of its own; it only lifts an existing plan_prepare to plan_mentor.
export const PLAN_UPGRADE = "plan_upgrade_mentor" as const;
export type PlanUpgrade = typeof PLAN_UPGRADE;
export const PLAN_REPORT_CREDITS = 3;
export const PLAN_INTERVIEW_MINUTES = 45;

export function isPlanProduct(p: unknown): p is PlanProduct {
  return typeof p === "string" && (PLAN_PRODUCTS as readonly string[]).includes(p);
}

// orderId is always the base plan order (report credits, interview credit); upgradeOrderId holds Plan 2's mentoring.
export type PlanOrder = { orderId: string; product: PlanProduct; interviewUsed: boolean; upgradeOrderId?: string };

// initiate refuses a second plan, so the newest successful plan row is the plan.
// Its consumed_at doubles as the plan's single interview credit (start-ai-interview).
// A successful upgrade paid after a plan_prepare makes it plan_mentor; a refunded upgrade (or base) drops out.
export async function getPlanOrder(userId: string): Promise<PlanOrder | null> {
  const { data, error } = await getSupabaseServerClient()
    .from("razorpay_transactions")
    .select("order_id, product, consumed_at, created_at")
    .eq("user_id", userId)
    .eq("status", "success")
    .in("product", [...PLAN_PRODUCTS])
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw new Error(`Failed to load plan: ${error.message}`);
  if (!data) return null;
  const plan: PlanOrder = { orderId: data.order_id, product: data.product as PlanProduct, interviewUsed: data.consumed_at !== null };
  if (plan.product !== "plan_prepare") return plan;
  const { data: upgrade, error: upgradeError } = await getSupabaseServerClient()
    .from("razorpay_transactions")
    .select("order_id")
    .eq("user_id", userId)
    .eq("status", "success")
    .eq("product", PLAN_UPGRADE)
    .gte("created_at", data.created_at)
    .limit(1)
    .maybeSingle();
  if (upgradeError) throw new Error(`Failed to load plan upgrade: ${upgradeError.message}`);
  return upgrade ? { ...plan, product: "plan_mentor", upgradeOrderId: upgrade.order_id } : plan;
}

export async function planReportCreditsLeft(orderId: string): Promise<number> {
  const { count, error } = await getSupabaseServerClient()
    .from("report_unlocks")
    .select("user_id", { count: "exact", head: true })
    .eq("order_id", orderId);
  if (error) throw new Error(`Failed to count plan report credits: ${error.message}`);
  return Math.max(0, PLAN_REPORT_CREDITS - (count ?? 0));
}

export type PlanState = { allowlisted: boolean; plan: (PlanOrder & { reportCreditsLeft: number }) | null };

export async function getPlanState(userId: string, email: string | null | undefined): Promise<PlanState> {
  const [allowlisted, plan] = await Promise.all([isEmailAllowlisted(email), getPlanOrder(userId)]);
  return { allowlisted, plan: plan ? { ...plan, reportCreditsLeft: await planReportCreditsLeft(plan.orderId) } : null };
}
