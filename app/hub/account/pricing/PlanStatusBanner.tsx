import { PRODUCT_LABELS } from "@/lib/razorpay/pricing";
import { PLAN_REPORT_CREDITS, PLAN_INTERVIEW_MINUTES, type PlanState } from "@/lib/plans";

export default function PlanStatusBanner({ plan }: { plan: NonNullable<PlanState["plan"]> }) {
  return (
    <div className="mx-auto font-[family-name:var(--font-poppins)]" style={{ maxWidth: 1040, padding: "28px 24px 0" }}>
      <div className="bg-[#141416] border border-[#ed1a24]/30" style={{ borderRadius: 14, padding: "14px 18px" }}>
        <p className="text-white/80" style={{ fontSize: 13.5, margin: 0, lineHeight: 1.6 }}>
          <span className="font-semibold text-white">Your plan: {PRODUCT_LABELS[plan.product]}</span>
          {" · "}Role reports left: {plan.reportCreditsLeft} of {PLAN_REPORT_CREDITS}
          {" · "}AI interview: {plan.interviewUsed ? "used" : `ready (${PLAN_INTERVIEW_MINUTES} min)`}
          {plan.product === "plan_mentor" && " · Mentoring session included — book it from Expert"}
        </p>
        <p className="text-white/45" style={{ fontSize: 12, margin: "4px 0 0" }}>
          Extra role reports ₹299 · reference refresh ₹149
        </p>
      </div>
    </div>
  );
}
