import { describe, it, expect } from "vitest";
import { getSkillDistributionTier } from "@/app/hub/account/interview/SkillDistribution";
import { SAMPLE_INTERVIEW_REPORT } from "../interview";

describe("SAMPLE_INTERVIEW_REPORT", () => {
  // InterviewScoreGauge clamps to 100 and ParameterScoreTile renders the raw
  // number with a "%" suffix, so both fields are 0-100 despite the stale
  // "0-10" comment on the type. Confirmed against a real exported report
  // showing 50% overall and 58% relevance.
  it("scores overall on the 0-100 scale the gauge expects", () => {
    expect(SAMPLE_INTERVIEW_REPORT.overallScore).toBeGreaterThanOrEqual(0);
    expect(SAMPLE_INTERVIEW_REPORT.overallScore).toBeLessThanOrEqual(100);
  });

  it("has five parameter scores, each on the 0-100 scale", () => {
    const entries = Object.entries(SAMPLE_INTERVIEW_REPORT.skillMetrics);
    expect(entries).toHaveLength(5);
    entries.forEach(([, score]) => {
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });
  });

  it("has a skill report whose scores band cleanly for the distribution chart", () => {
    const entries = Object.values(SAMPLE_INTERVIEW_REPORT.skillReport);
    expect(entries.length).toBeGreaterThanOrEqual(2);
    entries.forEach((entry) => {
      expect(getSkillDistributionTier(entry.score).label).toBeTruthy();
      expect(entry.comment.length).toBeGreaterThan(20);
    });
  });

  it("carries the withheld sections the locked state advertises", () => {
    expect(SAMPLE_INTERVIEW_REPORT.roadmap).not.toBeNull();
    expect(SAMPLE_INTERVIEW_REPORT.strengths).not.toBeNull();
    expect(SAMPLE_INTERVIEW_REPORT.areasOfImprovement).not.toBeNull();
    expect(SAMPLE_INTERVIEW_REPORT.feedbackToInterviewer).not.toBeNull();
  });

  it("carries no real candidate identifiers", () => {
    const blob = JSON.stringify(SAMPLE_INTERVIEW_REPORT).toLowerCase();
    expect(blob).not.toContain("@");
    expect(blob).not.toContain("deepak");
  });
});
