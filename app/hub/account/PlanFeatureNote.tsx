import { getPlanOrder } from "@/lib/plans";
import { PLAN_FEATURE_DETAILS, type PlanFeatureKey } from "@/lib/planFeatures";

// Plan holders' one-line "what you get" under a feature page's title; same copy as the dashboard "Your plan" panel.
export default async function PlanFeatureNote({ userId, feature }: { userId: string; feature: PlanFeatureKey }) {
  const plan = await getPlanOrder(userId).catch(() => null); // a hint line: never break the page over it
  if (!plan || ((feature === "mentoring" || feature === "assistance") && plan.product !== "plan_mentor")) return null;
  return (
    <p className="font-[family-name:var(--font-poppins)] text-white/70" style={{ fontSize: 12.5, lineHeight: 1.5, margin: "8px 0 0" }}>
      <span className="font-semibold text-[#ed1a24]">In your plan:</span> {PLAN_FEATURE_DETAILS[feature]}
    </p>
  );
}
