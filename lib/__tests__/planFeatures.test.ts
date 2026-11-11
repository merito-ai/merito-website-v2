import { describe, it, expect } from "vitest";
import { PLAN_FEATURE_DETAILS, PLAN_MENTORING_LABEL } from "../planFeatures";
import { referenceRefreshPricePaise, PRODUCT_PRICING } from "../razorpay/pricing";
import { MAX_SKILLS_BY_DURATION } from "../intervuebox/jobs";
import { PLAN_INTERVIEW_MINUTES } from "../plans";
import { buildPlanPanelRows } from "../planPanel";

describe("referenceRefreshPricePaise", () => {
  it("charges plan holders ₹299", () => expect(referenceRefreshPricePaise(true)).toBe(29900));
  it("charges normal users ₹299 too (was ₹149)", () => expect(referenceRefreshPricePaise(false)).toBe(29900));
});

describe("PLAN_FEATURE_DETAILS (facts must match code)", () => {
  it("personality: 60 + 5 personality items and 36 + 3 culture items", () => {
    expect(PLAN_FEATURE_DETAILS.personality).toMatch(/^104 questions in two parts\./);
  });
  it("interview: skill cap matches the 45-min plan interview", () => {
    expect(PLAN_FEATURE_DETAILS.interview).toContain(`up to ${MAX_SKILLS_BY_DURATION[PLAN_INTERVIEW_MINUTES]} skills`);
  });
  it("prices: extra report and plan re-reference", () => {
    expect(PLAN_FEATURE_DETAILS.reports).toContain(`₹${PRODUCT_PRICING.report.entry / 100}`);
    expect(PLAN_FEATURE_DETAILS.references).toContain("Re-reference ₹299");
  });
  it("mentoring: Plan 2's hour is two 30-min sessions", () => {
    expect(PLAN_MENTORING_LABEL).toBe("Mentoring: 1 hour as two 30-min sessions");
    expect(PLAN_FEATURE_DETAILS.mentoring).toBe("A first session and a follow-up with a Merito expert");
  });
  it("no em-dashes in user-facing copy", () => {
    for (const s of Object.values(PLAN_FEATURE_DETAILS)) expect(s).not.toContain("—");
  });
  it("every panel row carries its detail line", () => {
    const rows = buildPlanPanelRows({ product: "plan_mentor", reportCreditsLeft: 3, personality: "none", interview: "unused", references: "none", mentoring: [] });
    for (const r of rows) expect(r.detail).toBe(PLAN_FEATURE_DETAILS[r.key as keyof typeof PLAN_FEATURE_DETAILS]);
  });
});
