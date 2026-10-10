import { getSupabaseServerClient } from "@/lib/supabase";
import { arePaymentsBypassed } from "@/lib/paymentsBypass";

// A returning candidate (new job / domain) refreshes their references at a
// loyalty price. No separate product: each successful "references" (or
// "bundle", which includes references) payment is one reference-check credit,
// and each completed check has used one up.
export const REFERENCE_REFRESH_PRICE_PAISE = 14900;

export async function countReferenceCredits(userId: string, excludeOrderId?: string): Promise<number> {
  const supabase = getSupabaseServerClient();
  let query = supabase
    .from("razorpay_transactions")
    .select("order_id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("status", "success")
    .in("product", ["references", "bundle"]);
  if (excludeOrderId) query = query.neq("order_id", excludeOrderId);
  const { count, error } = await query;
  if (error) throw new Error(`Failed to count reference credits: ${error.message}`);
  return count ?? 0;
}

// True when starting a fresh check after a completed one must be paid for.
export async function referenceRefreshNeedsPayment(userId: string): Promise<boolean> {
  if (arePaymentsBypassed()) return false;
  const supabase = getSupabaseServerClient();
  const { count, error } = await supabase
    .from("reference_checks")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("status", "completed");
  if (error) throw new Error(`Failed to count completed reference checks: ${error.message}`);
  return (count ?? 0) >= (await countReferenceCredits(userId));
}
