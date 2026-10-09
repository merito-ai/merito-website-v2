import type { Metadata } from "next";
import CombinedReportDocument from "../account/combined-report/print/CombinedReportDocument";
import { SAMPLE_COMBINED_REPORT, SAMPLE_REPORT_ID } from "@/lib/sampleReports/combined";

// Public, no-login sample of the consolidated report for sales to share
// with prospects. Same document the real PDF export renders, fed with the
// fictional Ananya Iyer fixtures.
export const metadata: Metadata = {
  title: "Sample consolidated report | Merito HUB",
  robots: { index: false, follow: false },
};

const ALL_INTERVIEW_SECTIONS = new Set([
  "scoreGauge",
  "overview",
  "skillReport",
  "criteriaMatch",
  "skillEvaluation",
  "strengths",
  "integrity",
  "roadmap",
]);

export default function SampleReportPage() {
  return (
    <>
      <div
        className="print:hidden"
        style={{ background: "#ed1a24", color: "#fff", textAlign: "center", padding: "10px 16px", fontSize: 13, fontWeight: 600, fontFamily: "system-ui, sans-serif" }}
      >
        Sample report · fictional candidate · <a href="/hub" style={{ color: "#fff", textDecoration: "underline" }}>Get your own on Merito HUB →</a>
      </div>
      <CombinedReportDocument data={SAMPLE_COMBINED_REPORT} interviewSections={ALL_INTERVIEW_SECTIONS} reportId={SAMPLE_REPORT_ID} showBackLink={false} />
    </>
  );
}
