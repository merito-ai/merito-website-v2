"use client";

import { useRef, type ComponentType } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { X, Star, Check, Minus, FileChartColumn, Brain, Mic, Share2, UserCheck, Briefcase, ShieldCheck } from "lucide-react";
import { buildPlanCards } from "../pricing/pricingCatalog";
import { usePlanCheckout, type PlanBuy } from "../pricing/usePlanCheckout";
import { PLAN_UPGRADE_PRICE_LABEL } from "@/lib/razorpay/pricing";
import { PLAN_INTERVIEW_ONE_ROLE, PLAN_REPORT_COUNT } from "@/lib/planFeatures";
import { useModalFocus } from "./useModalFocus";
import { BTN_PRIMARY, BTN_GHOST, FONT_HEAD, FONT_BODY } from "./ui";

type Feature = { icon: ComponentType<{ size?: number; strokeWidth?: number; className?: string }>; text: string; off?: boolean; plus?: boolean };
const FEATURES: Record<"plan_prepare" | "plan_mentor", { summary: string; items: Feature[] }> = {
  plan_prepare: {
    summary: "Know where you stand and practise",
    items: [
      { icon: FileChartColumn, text: `Detailed reports for ${PLAN_REPORT_COUNT} roles` },
      { icon: Brain, text: "Personality + culture test" },
      { icon: Mic, text: PLAN_INTERVIEW_ONE_ROLE },
      { icon: Share2, text: "References + shareable profile" },
      { icon: Minus, text: "Mentoring", off: true },
      { icon: Minus, text: "Application assistance", off: true },
    ],
  },
  plan_mentor: {
    summary: "Everything, plus expert help to apply",
    items: [
      { icon: Check, text: "Everything in Assess + Prepare" },
      { icon: UserCheck, text: "Mentoring, two 30-min sessions", plus: true },
      { icon: Briefcase, text: "Application assistance, 3 companies", plus: true },
    ],
  },
};

// "Unlock plans": one shared popup for every entry point. Choosing a plan goes into the existing confirm dialog + Razorpay.
// Phones get a bottom sheet with a grab handle.
export default function PlansPopup({ onClose }: { onClose: () => void }) {
  const plans = buildPlanCards();
  const { paying, error, choose, dialog } = usePlanCheckout(plans);
  const panel = useRef<HTMLDivElement>(null);
  const onKeyDown = useModalFocus(panel, onClose);
  const [prepare, mentor] = plans;

  return createPortal(
    <div
      className="fixed inset-0 flex items-end sm:items-center justify-center sm:p-4"
      style={{ zIndex: 60, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby="plans-popup-title"
        tabIndex={-1}
        onKeyDown={onKeyDown}
        className={`fv-pop relative w-full sm:max-w-[700px] bg-[#1c1a1f] border border-white/[0.1] rounded-t-[22px] sm:rounded-[22px] overflow-y-auto outline-none ${FONT_BODY}`}
        style={{ maxHeight: "92vh", padding: "20px 18px 18px" }}
      >
        <div aria-hidden="true" className="sm:hidden bg-white/25" style={{ width: 40, height: 4, borderRadius: 4, margin: "-6px auto 12px" }} />
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          data-autofocus
          className="absolute flex items-center justify-center text-white/70 hover:text-white rounded-lg focus-visible:outline-2 focus-visible:outline-white"
          style={{ top: 8, right: 8, width: 44, height: 44, background: "none", border: "none", cursor: "pointer" }}
        >
          <X size={18} strokeWidth={2} />
        </button>
        <h2 id="plans-popup-title" className={`${FONT_HEAD} font-semibold text-white`} style={{ fontSize: "1.45rem", margin: "0 44px 6px 0" }}>
          Choose your plan
        </h2>
        <p className="text-white/70" style={{ fontSize: 13.5, lineHeight: 1.55, margin: "0 0 16px" }}>
          One-time payment. Start with {prepare.title} and upgrade to {mentor.title} anytime for {PLAN_UPGRADE_PRICE_LABEL}.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: 12 }}>
          {plans.map((plan) => {
            const rec = plan.product === "plan_mentor";
            const f = FEATURES[plan.product];
            const buy: PlanBuy = plan.product;
            return (
              <section
                key={plan.product}
                aria-labelledby={`plan-${plan.product}`}
                className={`flex flex-col ${rec ? "bg-[#ed1a24]/[0.07] border-[#ed1a24]/50" : "bg-white/[0.03] border-white/[0.1]"} border`}
                style={{ borderRadius: 16, padding: 16 }}
              >
                {rec && (
                  <span className="inline-flex items-center self-start font-semibold text-white bg-[#d9161f]" style={{ gap: 5, fontSize: 11, borderRadius: 999, padding: "3px 10px", marginBottom: 8 }}>
                    <Star size={12} strokeWidth={2.2} aria-hidden="true" />
                    Most complete
                  </span>
                )}
                <h3 id={`plan-${plan.product}`} className={`${FONT_HEAD} font-semibold text-white`} style={{ fontSize: 17, margin: 0 }}>
                  {plan.title}
                </h3>
                <p className="text-white/70" style={{ fontSize: 12.5, margin: "2px 0 10px" }}>{f.summary}</p>
                <p className={`${FONT_HEAD} font-bold text-white`} style={{ fontSize: 26, lineHeight: 1.1, margin: 0 }}>{plan.priceLabel}</p>
                <p className="text-white/60" style={{ fontSize: 11.5, margin: "2px 0 12px" }}>one-time payment</p>
                <ul style={{ listStyle: "none", padding: 0, margin: "0 0 14px", display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
                  {f.items.map(({ icon: Icon, text, off, plus }) => (
                    <li key={text} className={`flex items-start ${off ? "text-white/50 line-through" : "text-white/90"}`} style={{ gap: 8, fontSize: 13, lineHeight: 1.4 }}>
                      <Icon size={15} strokeWidth={2} className={`shrink-0 ${off ? "text-white/40" : plus ? "text-[#ff7a80]" : "text-[#3FCB8C]"}`} aria-hidden="true" />
                      {off && <span className="sr-only">Not included: </span>}
                      {text}
                    </li>
                  ))}
                </ul>
                <button type="button" onClick={() => choose(buy)} disabled={paying !== null} className={`${rec ? BTN_PRIMARY : BTN_GHOST} w-full`}>
                  {paying === buy ? "Opening payment…" : `Choose ${plan.title}`}
                </button>
                {error?.product === buy && (
                  <p role="alert" className="text-[#ff7a80]" style={{ fontSize: 12.5, margin: "8px 0 0", textAlign: "center" }}>
                    {error.message}
                  </p>
                )}
              </section>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center justify-between" style={{ gap: "6px 16px", marginTop: 14 }}>
          <span className="inline-flex items-center text-white/70" style={{ gap: 6, fontSize: 12.5 }}>
            <ShieldCheck size={15} strokeWidth={2} className="text-[#3FCB8C] shrink-0" aria-hidden="true" />
            Secure payment by Razorpay. You confirm before paying.
          </span>
          <Link href="/hub/account/pricing" onClick={onClose} className="inline-flex items-center font-semibold text-[#ff7a80] hover:underline focus-visible:outline-2 focus-visible:outline-white" style={{ fontSize: 13, minHeight: 44 }}>
            Compare all features
          </Link>
        </div>
      </div>
      {/* Outside the panel: the panel's open animation must not become the dialog's containing block. */}
      {dialog}
    </div>,
    document.body,
  );
}
