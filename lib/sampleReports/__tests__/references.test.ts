import { describe, it, expect } from "vitest";
import { computeReferenceReport, REFERENCE_CATEGORIES } from "@/lib/referenceChecks";
import { SAMPLE_REFEREES } from "../references";

describe("SAMPLE_REFEREES", () => {
  it("has at least three completed referees, matching the product minimum", () => {
    const completed = SAMPLE_REFEREES.filter((r) => r.status === "completed");
    expect(completed.length).toBeGreaterThanOrEqual(3);
  });

  it("rates every category, so no row renders as a zero bar", () => {
    const report = computeReferenceReport(SAMPLE_REFEREES);
    expect(report.categoryScores).toHaveLength(REFERENCE_CATEGORIES.length);
    report.categoryScores.forEach((c) => {
      expect(c.value).toBeGreaterThan(0);
      expect(c.value).toBeLessThanOrEqual(5);
      expect(c.values.length).toBeGreaterThanOrEqual(3);
    });
  });

  it("produces an overall score in the 1-5 range the gauge expects", () => {
    const report = computeReferenceReport(SAMPLE_REFEREES);
    expect(report.overallScore).toBeGreaterThan(0);
    expect(report.overallScore).toBeLessThanOrEqual(5);
  });

  it("gives every completed referee written feedback to quote", () => {
    const report = computeReferenceReport(SAMPLE_REFEREES);
    report.referees.forEach((r) => {
      expect(r.overallFeedback).toBeTruthy();
      expect((r.overallFeedback ?? "").length).toBeGreaterThan(20);
    });
  });

  it("carries no real referee identifiers", () => {
    const blob = JSON.stringify(SAMPLE_REFEREES).toLowerCase();
    expect(blob).not.toContain("aalok");
    expect(blob).not.toContain("dhruv");
  });
});
