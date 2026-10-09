import { computeReferenceReport } from "@/lib/referenceChecks";
import type { CombinedReportData } from "@/lib/combinedReportData";
import { SAMPLE_FITMENT_REPORT } from "./fitment";
import { SAMPLE_INTERVIEW_REPORT } from "./interview";
import { SAMPLE_PERSONALITY_SCORES } from "./personality";
import { SAMPLE_REFEREES } from "./references";

// Fictional candidate (Ananya Iyer, Product Analyst) assembled from the
// per-section samples, for the public /hub/sample-report page that sales
// shares with prospects. No real candidate data, so nothing needs blurring.
const ROLE = "Product Analyst";
const NAME = "Ananya Iyer";

export const SAMPLE_COMBINED_REPORT: CombinedReportData = {
  fitment: { roleTitle: ROLE, displayName: NAME, report: SAMPLE_FITMENT_REPORT },
  personality: { scores: SAMPLE_PERSONALITY_SCORES },
  interview: { roleTitle: ROLE, report: SAMPLE_INTERVIEW_REPORT, updatedAt: "2026-09-15T10:00:00.000Z" },
  references: computeReferenceReport(SAMPLE_REFEREES),
  displayName: NAME,
  primaryRole: ROLE,
};

export const SAMPLE_REPORT_ID = "MH-SAMPLE";
