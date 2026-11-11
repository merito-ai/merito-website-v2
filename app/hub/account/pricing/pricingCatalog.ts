import { PRODUCT_PRICING, PRODUCT_LABELS, PLAN_UPGRADE_PRICE_LABEL, formatPrice, type CandidateLevel } from "@/lib/razorpay/pricing";
import { MIN_REFERENCES } from "@/lib/referenceChecks";
import type { PlanProduct, PlanState } from "@/lib/plans";
import { CONTACT_HREF } from "@/lib/planPanel";
import { PLAN_FEATURE_DETAILS } from "@/lib/planFeatures";

export type PricingCardKey = "report" | "personality" | "references" | "interview" | "counselling";

const CARD_ORDER: PricingCardKey[] = ["report", "personality", "references", "interview", "counselling"];

// Only report/personality/references are ever bought as the bundle -- interview
// and counselling are always solo purchases. Mirrors PriceOptionTiles.tsx /
// BundlePromoCard.tsx, which apply the same split.
const IN_BUNDLE: Record<PricingCardKey, boolean> = {
  report: true,
  personality: true,
  references: true,
  interview: false,
  counselling: false,
};

// Short, factual descriptions grounded in what each product actually does in
// this codebase (not the mockup's copy, which describes things this build
// doesn't have -- e.g. a fixed-length interview, or exactly 2 references).
const DESCRIPTIONS: Record<PricingCardKey, string> = {
  report: "A detailed breakdown of your fitment score, skill gaps, and CV fixes for this role.",
  personality: "A Big Five (OCEAN) questionnaire mapping how you think, work, and relate to others, matched to your role.",
  references: `We verify at least ${MIN_REFERENCES} professional references you provide and compile their feedback into your profile.`,
  interview: "An AI-run mock interview matched to your role, with a scored performance report you can practise against.",
  counselling: "A Merito career expert reviews your fitment, personality, and interview results, then gives you a straight, personalised plan.",
};

export type PricingCard = {
  key: PricingCardKey;
  label: string;
  description: string;
  price: number;
  priceLabel: string;
  bundlePrice: number | null;
  bundlePriceLabel: string | null;
  inBundle: boolean;
};

// Personality is the only product whose price actually changes inside the
// bundle (report/references stay at solo price either way -- see the bundle
// total's own comment in lib/razorpay/pricing.ts). Its bundle-rate isn't
// stored on its own; it's the remainder once report+references are subtracted
// from the bundle total, same arithmetic PriceOptionTiles/BundlePromoCard use
// for the savings figure, just solved for the one varying term instead.
export function getPersonalityBundleRate(level: CandidateLevel): number {
  return PRODUCT_PRICING.bundle[level] - PRODUCT_PRICING.report[level] - PRODUCT_PRICING.references[level];
}

export function buildPricingCards(level: CandidateLevel): PricingCard[] {
  return CARD_ORDER.map((key) => {
    const price = PRODUCT_PRICING[key][level];
    const bundlePrice = key === "personality" ? getPersonalityBundleRate(level) : null;
    return {
      key,
      label: PRODUCT_LABELS[key],
      description: DESCRIPTIONS[key],
      price,
      priceLabel: formatPrice(price),
      bundlePrice,
      bundlePriceLabel: bundlePrice != null ? formatPrice(bundlePrice) : null,
      inBundle: IN_BUNDLE[key],
    };
  });
}

// Plan holders: never price what the plan already covers. Spent credits / a used interview keep the normal price (extras).
export function applyPlanToCards(cards: PricingCard[], plan: PlanState["plan"]): PricingCard[] {
  if (!plan) return cards;
  const included: Record<PricingCardKey, string | null> = {
    report: plan.reportCreditsLeft > 0 ? `Included · ${plan.reportCreditsLeft} left` : null,
    personality: "Included in your plan",
    references: "Included in your plan",
    interview: plan.interviewUsed ? null : "Included in your plan",
    counselling: plan.product === "plan_mentor" ? "Included in your plan" : null,
  };
  return cards.map((c) => ({ ...c, priceLabel: included[c.key] ?? c.priceLabel, inBundle: false, bundlePrice: null, bundlePriceLabel: null }));
}

export type BundleSummary = {
  bundlePrice: number;
  bundlePriceLabel: string;
  soloTotal: number;
  soloTotalLabel: string;
  savings: number;
  savingsLabel: string;
};

export function buildBundleSummary(level: CandidateLevel): BundleSummary {
  const bundlePrice = PRODUCT_PRICING.bundle[level];
  const soloTotal = PRODUCT_PRICING.report[level] + PRODUCT_PRICING.personality[level] + PRODUCT_PRICING.references[level];
  const savings = soloTotal - bundlePrice;
  return {
    bundlePrice,
    bundlePriceLabel: formatPrice(bundlePrice),
    soloTotal,
    soloTotalLabel: formatPrice(soloTotal),
    savings,
    savingsLabel: formatPrice(savings),
  };
}

type PlanLine = { label: string; helper: string | null; prepare: boolean; mentor: boolean };
// Plan comparison rows, in the order the PM set (2026-11-11). Offline rows carry a one-line helper.
const PLAN_LINES: PlanLine[] = [
  { label: "CV analysis with detailed report (3 roles)", helper: null, prepare: true, mentor: true },
  { label: "Personality + culture assessment", helper: null, prepare: true, mentor: true },
  { label: "Mock AI interview (45 min)", helper: null, prepare: true, mentor: true },
  { label: "References module", helper: null, prepare: true, mentor: true },
  { label: "1-hour mentoring session", helper: PLAN_FEATURE_DETAILS.mentoring, prepare: false, mentor: true },
  { label: "Application assistance (3 companies, via Merito's network)", helper: PLAN_FEATURE_DETAILS.assistance, prepare: false, mentor: true },
  { label: "Shareable consolidated profile", helper: PLAN_FEATURE_DETAILS.share, prepare: true, mentor: true },
];

export type PlanCard = {
  product: PlanProduct;
  title: string;
  price: number;
  priceLabel: string;
  lines: { label: string; helper: string | null; included: boolean }[];
};

export function buildPlanCards(): PlanCard[] {
  return (["plan_prepare", "plan_mentor"] as const).map((product) => {
    const price = PRODUCT_PRICING[product].entry; // flat across levels
    return {
      product,
      title: PRODUCT_LABELS[product],
      price,
      priceLabel: `₹${(price / 100).toLocaleString("en-IN")}`,
      lines: PLAN_LINES.map((l) => ({ label: l.label, helper: l.helper, included: product === "plan_mentor" ? l.mentor : l.prepare })),
    };
  });
}

export type PlanCta = { kind: "buy" } | { kind: "active" } | { kind: "upgrade"; priceLabel: string } | { kind: "contact"; href: string };
// Plan 1 holders upgrade to Plan 2 for the difference; there is no downgrade, so Plan 2's other column routes to support.
export function planCta(product: PlanProduct, owned: PlanProduct | null): PlanCta {
  if (!owned) return { kind: "buy" };
  if (product === owned) return { kind: "active" };
  return owned === "plan_prepare" ? { kind: "upgrade", priceLabel: PLAN_UPGRADE_PRICE_LABEL } : { kind: "contact", href: CONTACT_HREF };
}
