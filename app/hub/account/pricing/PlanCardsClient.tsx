"use client";

import { Check, X } from "lucide-react";
import { planCta, type PlanCard } from "./pricingCatalog";
import { usePlanCheckout } from "./usePlanCheckout";
import { PLAN_REFERENCE_REFRESH_PRICE_PAISE, formatPrice } from "@/lib/razorpay/pricing";
import type { PlanProduct } from "@/lib/plans";

const EYEBROW = "font-[family-name:var(--font-poppins)] font-bold uppercase text-white/40";

// embedded: dashboard offer for allowlisted (seminar) users without a plan; section + h2 instead of a page.
export default function PlanCardsClient({ plans, owned = null, embedded = false }: { plans: PlanCard[]; owned?: PlanProduct | null; embedded?: boolean }) {
  const { paying, error, choose, dialog } = usePlanCheckout(plans);

  const cta = (plan: PlanCard) => {
    const c = planCta(plan.product, owned);
    const base =
      "w-full inline-flex items-center justify-center text-center font-[family-name:var(--font-poppins)] font-semibold text-[12px] md:text-[13.5px] px-2 md:px-4";
    const box = { minHeight: 44, borderRadius: 8, paddingTop: 10, paddingBottom: 10 };
    if (c.kind === "active")
      return (
        <span className={`${base} gap-1.5 text-[#3FCB8C] border border-[#3FCB8C]/40`} style={box}>
          <Check size={15} strokeWidth={2.5} aria-hidden="true" />
          Active
          <span className="sr-only">: {plan.title} is your plan</span>
        </span>
      );
    if (c.kind === "contact")
      return (
        <a href={c.href} className={`${base} text-white border border-white/20 hover:border-white/40 transition-colors`} style={box}>
          Talk to us
          <span className="sr-only"> about {plan.title}</span>
        </a>
      );
    // The upgrade is its own product (lib/plans.ts PLAN_UPGRADE; that module is server-only).
    const buy = c.kind === "upgrade" ? "plan_upgrade_mentor" : plan.product;
    return (
      <>
        <button
          onClick={() => choose(buy)}
          disabled={paying !== null}
          className={`${base} text-white bg-[#ed1a24] hover:bg-[#c8151e] transition-colors disabled:opacity-60`}
          style={{ ...box, border: "none", cursor: paying ? "default" : "pointer" }}
        >
          {paying === buy ? "Opening payment…" : c.kind === "upgrade" ? `Upgrade for ${c.priceLabel}` : "Choose this plan"}
          {paying !== buy && <span className="sr-only">: {plan.title}{c.kind === "upgrade" ? "" : `, ${plan.priceLabel}`}</span>}
        </button>
        {error?.product === buy && (
          <p role="alert" className="font-[family-name:var(--font-poppins)]" style={{ fontSize: 12.5, color: "#ed1a24", margin: "10px 0 0", textAlign: "center" }}>
            {error.message}
          </p>
        )}
      </>
    );
  };

  // Highlighted column: the holder's plan, else the most complete one.
  const highlight: PlanProduct = owned ?? "plan_mentor";
  const col = (plan: PlanCard, edge: "" | "top" | "bottom" = "") =>
    plan.product === highlight
      ? `bg-[#ed1a24]/[0.06] border-x border-[#ed1a24]/40${edge === "top" ? " border-t" : edge === "bottom" ? " border-b" : ""}`
      : "";

  const Wrap = embedded ? "section" : "main";
  const Heading = embedded ? "h2" : "h1";
  return (
    <Wrap aria-labelledby="plans-heading">
      <div
        className={embedded ? undefined : "mx-auto px-4 md:px-6"}
        style={{ maxWidth: 1040, ...(embedded ? {} : { paddingTop: 28, paddingBottom: 40 }), display: "flex", flexDirection: "column", gap: 20 }}
      >
        <div>
          {!embedded && (
            <p className={EYEBROW} style={{ fontSize: 10.5, letterSpacing: "0.08em", margin: "0 0 6px" }}>
              Account
            </p>
          )}
          <Heading id="plans-heading" className="font-[family-name:var(--font-gabarito)] font-semibold text-white" style={{ fontSize: "1.7rem", margin: 0 }}>
            {embedded ? "Plans unlocked for you" : "Your Merito plans"}
          </Heading>
          <p className="font-[family-name:var(--font-poppins)] text-white/50" style={{ fontSize: 13.5, margin: "6px 0 0" }}>
            {embedded ? "As a Merito seminar attendee you can unlock everything with one payment." : "One payment, no expiry. Each feature can be used once."}
          </p>
        </div>

        {/* One 3-column comparison at every width; fixed layout keeps 375px from scrolling sideways. */}
        <div className="bg-[#141416] border border-white/[0.08]" style={{ borderRadius: 14, overflow: "hidden" }}>
          <table className="w-full font-[family-name:var(--font-poppins)]" style={{ borderCollapse: "collapse", tableLayout: "fixed" }}>
            <caption className="sr-only">Compare Merito plans</caption>
            <colgroup>
              <col style={{ width: "50%" }} />
              <col style={{ width: "25%" }} />
              <col style={{ width: "25%" }} />
            </colgroup>
            <thead>
              <tr className="border-b border-white/[0.08]">
                <th scope="col" className="text-left align-bottom text-white/40 font-semibold text-[11px] md:text-[12px] px-3 md:px-5" style={{ paddingTop: 18, paddingBottom: 18 }}>
                  What you get
                </th>
                {plans.map((plan) => (
                  <th key={plan.product} scope="col" className={`text-center align-bottom px-1.5 md:px-4 ${col(plan, "top")}`} style={{ paddingTop: 14, paddingBottom: 16 }}>
                    {plan.product === highlight && (
                      <span
                        className="inline-block font-semibold uppercase text-white bg-[#ed1a24] text-[9px] md:text-[10px]"
                        style={{ borderRadius: 999, padding: "2px 8px", letterSpacing: "0.06em", marginBottom: 8 }}
                      >
                        {owned ? "Your plan" : "Most complete"}
                      </span>
                    )}
                    <span className="block font-[family-name:var(--font-gabarito)] font-bold text-white text-[12.5px] md:text-[16px] leading-tight">
                      {plan.title}
                    </span>
                    <span className="block font-[family-name:var(--font-gabarito)] font-bold text-white text-[17px] md:text-[26px]" style={{ marginTop: 4 }}>
                      {plan.priceLabel}
                    </span>
                    <span className="block font-normal text-white/45 text-[10px] md:text-[11.5px]" style={{ marginTop: 2 }}>
                      one-time payment
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {plans[0].lines.map((line, i) => (
                <tr key={line.label} className="border-b border-white/[0.06] even:bg-white/[0.02]">
                  <th scope="row" className="text-left font-normal px-3 md:px-5 text-[12.5px] md:text-[13.5px]" style={{ paddingTop: 12, paddingBottom: 12 }}>
                    <span className="block text-white/85">{line.label}</span>
                    {line.helper && (
                      <span className="block text-white/50 text-[11px] md:text-[12px]" style={{ marginTop: 2 }}>
                        {line.helper}
                      </span>
                    )}
                  </th>
                  {plans.map((plan) => (
                    <td key={plan.product} className={`text-center px-1.5 md:px-4 ${col(plan)}`} style={{ paddingTop: 12, paddingBottom: 12 }}>
                      <Tick included={plan.lines[i].included} />
                    </td>
                  ))}
                </tr>
              ))}
              <tr>
                <td />
                {plans.map((plan) => (
                  <td key={plan.product} className={`text-center align-top px-1.5 md:px-4 ${col(plan, "bottom")}`} style={{ paddingTop: 16, paddingBottom: 16 }}>
                    {cta(plan)}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        {dialog}

        <p className="font-[family-name:var(--font-poppins)] text-white/50" style={{ fontSize: 12, lineHeight: 1.6, maxWidth: 640, margin: 0 }}>
          One-time payment · features never expire · application assistance and mentoring are delivered by the Merito team. Extra role reports are ₹299
          and a re-reference report is {formatPrice(PLAN_REFERENCE_REFRESH_PRICE_PAISE)}. We refer you; we can&apos;t guarantee interviews or offers.
        </p>
      </div>
    </Wrap>
  );
}

// Not colour/icon alone: the sr-only text carries the meaning.
function Tick({ included }: { included: boolean }) {
  return included ? (
    <span className="inline-flex justify-center">
      <Check size={20} strokeWidth={2.5} className="text-[#3FCB8C]" aria-hidden="true" />
      <span className="sr-only">Included</span>
    </span>
  ) : (
    <span className="inline-flex justify-center">
      <X size={20} strokeWidth={2.25} className="text-[#ed1a24]/70" aria-hidden="true" />
      <span className="sr-only">Not included</span>
    </span>
  );
}
