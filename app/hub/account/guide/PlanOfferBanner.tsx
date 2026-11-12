import UnlockPlansButton from "./UnlockPlansButton";
import { buildPlanCards } from "../pricing/pricingCatalog";
import { FONT_HEAD, FONT_BODY } from "./ui";

// Allowlisted users without a plan: one compact row on the role dashboard; the full comparison lives in the shared popup.
export default function PlanOfferBanner() {
  const [prepare] = buildPlanCards();
  return (
    <section
      aria-labelledby="plan-offer-heading"
      className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5 bg-[#ed1a24]/[0.06] border border-[#ed1a24]/40"
      style={{ borderRadius: 14, padding: "16px 18px" }}
    >
      <div className="flex-1 min-w-0">
        <h2 id="plan-offer-heading" className={`${FONT_HEAD} font-semibold text-white`} style={{ fontSize: "1.1rem", margin: 0 }}>
          Plans unlocked for you
        </h2>
        <p className={`${FONT_BODY} text-white/60`} style={{ fontSize: 13, margin: "4px 0 0" }}>
          Unlock everything with one payment, from {prepare.priceLabel}.
        </p>
      </div>
      <UnlockPlansButton label="See plans" />
    </section>
  );
}
