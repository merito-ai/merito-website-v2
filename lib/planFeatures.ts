import { PRODUCT_PRICING, PLAN_REFERENCE_REFRESH_PRICE_PAISE, formatPrice } from "@/lib/razorpay/pricing";
import { ITEMS, IMPRESSION_ITEMS } from "@/lib/personality";
import { CULTURE_ITEMS } from "@/lib/psychometrics/cultureItems";
import { MIN_REFERENCES, MAX_REFEREES } from "@/lib/referenceChecks";

// One-line "what it is / what you get" per plan feature: dashboard panel, feature pages, comparison table. Client-safe.
const QUESTIONS = ITEMS.length + IMPRESSION_ITEMS.length + CULTURE_ITEMS.length;
const PLAN_INTERVIEW_SKILLS = 10; // = MAX_SKILLS_BY_DURATION[PLAN_INTERVIEW_MINUTES]; jobs.ts is server-only, test pins it

export const PLAN_FEATURE_DETAILS = {
  reports: `Detailed fitment report for each role you check. Extra roles ${formatPrice(PRODUCT_PRICING.report.entry)} each.`,
  personality: `${QUESTIONS} questions in two parts. Report on your traits and the work cultures that suit you.`,
  interview: `Mock interview on up to ${PLAN_INTERVIEW_SKILLS} skills from your target role, with a scored report.`,
  references: `Invite up to ${MAX_REFEREES} referees; ${MIN_REFERENCES} responses give you a verified reference report. Re-reference ${formatPrice(PLAN_REFERENCE_REFRESH_PRICE_PAISE)}.`,
  mentoring: "A first session and a follow-up with a Merito expert",
  assistance: "Our team refers you to 3 companies you choose.",
  share: "One report combining all your results, shareable by link.",
} as const;

// Plan 2 comparison-table row (also the welcome email benefit line).
export const PLAN_MENTORING_LABEL = "Mentoring: 1 hour as two 30-min sessions";

export type PlanFeatureKey = keyof typeof PLAN_FEATURE_DETAILS;
