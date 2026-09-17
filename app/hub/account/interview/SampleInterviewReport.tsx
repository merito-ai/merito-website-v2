"use client";

import InterviewScoreGauge from "./InterviewScoreGauge";
import ParameterScoreTile from "./ParameterScoreTile";
import SkillDistribution from "./SkillDistribution";
import { SAMPLE_INTERVIEW_REPORT } from "@/lib/sampleReports/interview";

export default function SampleInterviewReport() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div className="flex items-center" style={{ gap: 16 }}>
        <InterviewScoreGauge score={SAMPLE_INTERVIEW_REPORT.overallScore} />
        <div>
          <p
            className="font-[family-name:var(--font-poppins)] font-bold uppercase text-white/40"
            style={{ fontSize: 10.5, letterSpacing: "0.06em", margin: "0 0 4px" }}
          >
            Overall score
          </p>
          <p className="font-[family-name:var(--font-poppins)] text-white/60" style={{ fontSize: 12.5, lineHeight: 1.6, margin: 0 }}>
            {SAMPLE_INTERVIEW_REPORT.approxDurationMinutes} minutes, scored across five parameters.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3" style={{ gap: 8 }}>
        {Object.entries(SAMPLE_INTERVIEW_REPORT.skillMetrics).map(([skill, score]) => (
          <ParameterScoreTile key={skill} skill={skill} score={score} />
        ))}
      </div>

      <SkillDistribution skillReport={SAMPLE_INTERVIEW_REPORT.skillReport} />

      <div className="bg-white/[0.04]" style={{ borderRadius: 10, padding: 14 }}>
        <p
          className="font-[family-name:var(--font-poppins)] font-bold uppercase text-white/40"
          style={{ fontSize: 10, letterSpacing: "0.06em", margin: "0 0 6px" }}
        >
          AI overview
        </p>
        <p className="font-[family-name:var(--font-poppins)] text-white/70" style={{ fontSize: 12.5, lineHeight: 1.65, margin: 0 }}>
          {SAMPLE_INTERVIEW_REPORT.overallSummary}
        </p>
      </div>
    </div>
  );
}
