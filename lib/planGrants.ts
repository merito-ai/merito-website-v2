import { getSupabaseServerClient } from "@/lib/supabase";
import { unlockProduct } from "@/lib/productUnlocks";
import type { PlanProduct, PlanUpgrade } from "@/lib/plans";

// Effects of a paid (or admin-comped) plan. Idempotent: safe on webhook/verify/reconcile replays.
// Interview: the success+unconsumed plan txn itself is the credit (start-ai-interview).
// Reports: 3 credits are derived from report_unlocks.order_id (lib/plans.ts), nothing to write here.
// Upgrade: only Plan 2's extras (both mentoring sessions on the upgrade order; assistance is derived from the effective plan).
export async function applyPlanGrants(userId: string, orderId: string, product: PlanProduct | PlanUpgrade): Promise<void> {
  if (product !== "plan_upgrade_mentor") {
    await unlockProduct(userId, "personality");
    await unlockProduct(userId, "references");
  }
  if (product === "plan_prepare") return;
  // Plan 2 mentoring = two 30-min sessions (first + follow-up), one row each. The (order_id, session) unique index
  // makes replays no-ops and lets a legacy single-row order gain its follow-up.
  const { error } = await getSupabaseServerClient()
    .from("counselling_requests")
    .upsert([1, 2].map((session) => ({ user_id: userId, order_id: orderId, session })), { onConflict: "order_id,session", ignoreDuplicates: true });
  if (error) throw new Error(`Failed to record plan mentoring sessions: ${error.message}`);
}
