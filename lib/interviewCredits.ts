import { getSupabaseServerClient } from "@/lib/supabase";
import { PLAN_PRODUCTS, type PlanProduct } from "@/lib/plans";

// An interview credit is a successful "interview" or plan transaction whose
// consumed_at is still null. start-ai-interview consumes the oldest one;
// the initiate route refuses a new interview order while one is unused.
export const INTERVIEW_CREDIT_PRODUCTS = ["interview", ...PLAN_PRODUCTS] as const;

export type InterviewCredit = { orderId: string; product: "interview" | PlanProduct };

export async function findOldestUnusedInterviewCredit(userId: string): Promise<InterviewCredit | null> {
  const { data, error } = await getSupabaseServerClient()
    .from("razorpay_transactions")
    .select("order_id, product")
    .eq("user_id", userId)
    .in("product", [...INTERVIEW_CREDIT_PRODUCTS])
    .eq("status", "success")
    .is("consumed_at", null)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (error) throw new Error(`Failed to load interview credit: ${error.message}`);
  return data ? { orderId: data.order_id, product: data.product as InterviewCredit["product"] } : null;
}

export async function countUnusedInterviewCredits(userId: string): Promise<number> {
  const { count, error } = await getSupabaseServerClient()
    .from("razorpay_transactions")
    .select("order_id", { count: "exact", head: true })
    .eq("user_id", userId)
    .in("product", [...INTERVIEW_CREDIT_PRODUCTS])
    .eq("status", "success")
    .is("consumed_at", null);
  if (error) throw new Error(`Failed to count interview credits: ${error.message}`);
  return count ?? 0;
}
