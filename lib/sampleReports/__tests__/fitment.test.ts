import { describe, it, expect } from "vitest";
import { SAMPLE_FITMENT_REPORT } from "../fitment";

describe("SAMPLE_FITMENT_REPORT", () => {
  it("covers all six scored dimensions", () => {
    expect(SAMPLE_FITMENT_REPORT.categories).toHaveLength(6);
    expect(new Set(SAMPLE_FITMENT_REPORT.categories.map((c) => c.key)).size).toBe(6);
  });

  it("keeps every dimension score inside the 0-100 range the gauge expects", () => {
    SAMPLE_FITMENT_REPORT.categories.forEach((c) => {
      expect(c.score).toBeGreaterThanOrEqual(0);
      expect(c.score).toBeLessThanOrEqual(100);
    });
    expect(SAMPLE_FITMENT_REPORT.overallScore).toBeGreaterThanOrEqual(0);
    expect(SAMPLE_FITMENT_REPORT.overallScore).toBeLessThanOrEqual(100);
  });

  it("gives every dimension a non-empty explanation, since the card renders one", () => {
    SAMPLE_FITMENT_REPORT.categories.forEach((c) => {
      expect(c.comment.length).toBeGreaterThan(20);
      expect(c.label.length).toBeGreaterThan(0);
    });
  });

  it("has both strong and weak points so the withheld sections are real", () => {
    expect(SAMPLE_FITMENT_REPORT.strongPoints.length).toBeGreaterThanOrEqual(3);
    expect(SAMPLE_FITMENT_REPORT.weakPoints.length).toBeGreaterThanOrEqual(3);
  });

  it("carries no real candidate identifiers", () => {
    const blob = JSON.stringify(SAMPLE_FITMENT_REPORT).toLowerCase();
    expect(blob).not.toContain("@");
    expect(blob).not.toContain("deepak");
  });
});
