import { getSupabaseServerClient } from "@/lib/supabase";
import { isEmailAllowlisted } from "@/lib/planAllowlist";

export const PLAN_PRODUCTS = ["plan_prepare", "plan_mentor"] as const;
export type PlanProduct = (typeof PLAN_PRODUCTS)[number];
export const PLAN_REPORT_CREDITS = 3;
export const PLAN_INTERVIEW_MINUTES = 45;

export function isPlanProduct(p: unknown): p is PlanProduct {
  return typeof p === "string" && (PLAN_PRODUCTS as readonly string[]).includes(p);
}

export type PlanOrder = { orderId: string; product: PlanProduct; interviewUsed: boolean };

// initiate refuses a second plan, so the newest successful plan row is the plan.
// Its consumed_at doubles as the plan's single interview credit (start-ai-interview).
export async function getPlanOrder(userId: string): Promise<PlanOrder | null> {
  const { data, error } = await getSupabaseServerClient()
    .from("razorpay_transactions")
    .select("order_id, product, consumed_at")
    .eq("user_id", userId)
    .eq("status", "success")
    .in("product", [...PLAN_PRODUCTS])
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw new Error(`Failed to load plan: ${error.message}`);
  if (!data) return null;
  return { orderId: data.order_id, product: data.product as PlanProduct, interviewUsed: data.consumed_at !== null };
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
