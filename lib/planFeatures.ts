import { PRODUCT_PRICING, PLAN_REFERENCE_REFRESH_PRICE_PAISE, formatPrice } from "@/lib/razorpay/pricing";
import { ITEMS, IMPRESSION_ITEMS } from "@/lib/personality";
import { CULTURE_ITEMS } from "@/lib/psychometrics/cultureItems";
import { MIN_REFERENCES, MAX_REFEREES } from "@/lib/referenceChecks";

// One-line "what it is / what you get" per plan feature: dashboard panel, feature pages, comparison table. Client-safe.
const QUESTIONS = ITEMS.length + IMPRESSION_ITEMS.length + CULTURE_ITEMS.length;
const PLAN_INTERVIEW_SKILLS = 10; // = MAX_SKILLS_BY_DURATION[PLAN_INTERVIEW_MINUTES]; jobs.ts is server-only, test pins it

// Days a candidate has to finish an interview once started (PM 2026-11-12). The real cutoff is the vendor's magic-link expiry.
export const INTERVIEW_VALIDITY_DAYS = 10;
export const INTERVIEW_VALIDITY_NOTE = `Once you start, you have ${INTERVIEW_VALIDITY_DAYS} days to complete it.`;

// The vendor's magic-link expiry is the real cutoff; without one, show our stated validity from the invite.
export function interviewDeadline(deadline: string | null | undefined, invitedAt: string | null | undefined): Date | null {
  if (deadline) return new Date(deadline);
  return invitedAt ? new Date(new Date(invitedAt).getTime() + INTERVIEW_VALIDITY_DAYS * 86_400_000) : null;
}

// Application assistance is offline (no workflow): what happens next. Turnaround is a PM default (2026-11-12), not yet confirmed.
// Admin-set progress (table plan_assistance, migration 0073). Client-safe so the admin form can use it.
export type AssistanceStatus = "not_contacted" | "in_progress" | "done";
export const ASSISTANCE_LABEL: Record<AssistanceStatus, string> = { not_contacted: "Not contacted", in_progress: "In progress", done: "Done" };

export const ASSISTANCE_NEXT_STEP = "Our team will call or email you within 7 working days of purchase to pick your 3 companies.";

export const PLAN_FEATURE_DETAILS = {
  reports: `Detailed fitment report for each role you check. Extra roles ${formatPrice(PRODUCT_PRICING.report.entry)} each.`,
  personality: `${QUESTIONS} questions in two parts. Report on your traits and the work cultures that suit you.`,
  interview: `45-min mock interview on up to ${PLAN_INTERVIEW_SKILLS} skills from your target role, with a scored report. ${INTERVIEW_VALIDITY_NOTE}`,
  references: `Invite up to ${MAX_REFEREES} referees; ${MIN_REFERENCES} responses give you a verified reference report. Re-reference ${formatPrice(PLAN_REFERENCE_REFRESH_PRICE_PAISE)}.`,
  mentoring: "A first session and a follow-up with a Merito expert",
  assistance: "Our team refers you to 3 companies you choose.",
  share: "One report combining all your results, shareable by link.",
} as const;

// Plan 2 comparison-table row (also the welcome email benefit line).
export const PLAN_MENTORING_LABEL = "Mentoring: 1 hour as two 30-min sessions";

export type PlanFeatureKey = keyof typeof PLAN_FEATURE_DETAILS;
