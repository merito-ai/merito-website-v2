import { getSupabaseServerClient } from "@/lib/supabase";
import { unlockProduct } from "@/lib/productUnlocks";
import type { PlanProduct, PlanUpgrade } from "@/lib/plans";

// Effects of a paid (or admin-comped) plan. Idempotent: safe on webhook/verify/reconcile replays.
// Interview: the success+unconsumed plan txn itself is the credit (start-ai-interview).
// Reports: 3 credits are derived from report_unlocks.order_id (lib/plans.ts), nothing to write here.
// Upgrade: only Plan 2's extras (mentoring on the upgrade order; assistance is derived from the effective plan).
export async function applyPlanGrants(userId: string, orderId: string, product: PlanProduct | PlanUpgrade): Promise<void> {
  if (product !== "plan_upgrade_mentor") {
    await unlockProduct(userId, "personality");
    await unlockProduct(userId, "references");
  }
  if (product === "plan_prepare") return;
  const supabase = getSupabaseServerClient();
  const { data: existing, error: readError } = await supabase
    .from("counselling_requests").select("id").eq("order_id", orderId).maybeSingle();
  if (readError) throw new Error(`Failed to check plan mentoring request: ${readError.message}`);
  if (existing) return;
  const { error } = await supabase.from("counselling_requests").insert({ user_id: userId, order_id: orderId });
  if (error) throw new Error(`Failed to record plan mentoring request: ${error.message}`);
}
