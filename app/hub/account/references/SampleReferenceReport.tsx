"use client";

import { Quote } from "lucide-react";
import { computeReferenceReport } from "@/lib/referenceChecks";
import { SAMPLE_REFEREES } from "@/lib/sampleReports/references";
import ReferenceScoreGauge from "./ReferenceScoreGauge";

const report = computeReferenceReport(SAMPLE_REFEREES);

export default function SampleReferenceReport() {
  const visibleCategories = report.categoryScores.slice(0, 3);
  const visibleReferees = report.referees.slice(0, 2);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div className="flex items-center" style={{ gap: 16 }}>
        <ReferenceScoreGauge score={report.overallScore} />
        <div>
          <p
            className="font-[family-name:var(--font-poppins)] font-bold uppercase text-white/40"
            style={{ fontSize: 10.5, letterSpacing: "0.06em", margin: "0 0 4px" }}
          >
            Overall rating
          </p>
          <p className="font-[family-name:var(--font-poppins)] text-white/60" style={{ fontSize: 12.5, lineHeight: 1.6, margin: 0 }}>
            {report.overallScore} / 5 from {report.referees.length} references.
          </p>
        </div>
      </div>

      {visibleReferees.map((referee) => (
        <div key={referee.name} className="bg-white/[0.04]" style={{ borderRadius: 10, padding: 14 }}>
          <Quote size={13} strokeWidth={2} className="text-white/25" style={{ marginBottom: 6 }} />
          <p
            className="font-[family-name:var(--font-poppins)] italic text-white/70"
            style={{ fontSize: 12.5, lineHeight: 1.65, margin: "0 0 8px" }}
          >
            {referee.overallFeedback}
          </p>
          <p className="font-[family-name:var(--font-poppins)] font-semibold text-white/45" style={{ fontSize: 11.5, margin: 0 }}>
            {referee.name} · {referee.organization}
          </p>
        </div>
      ))}

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {visibleCategories.map((category) => (
          <div key={category.category}>
            <div className="flex items-center justify-between" style={{ marginBottom: 5 }}>
              <span className="font-[family-name:var(--font-poppins)] text-white/60" style={{ fontSize: 12.5 }}>
                {category.label}
              </span>
              <span className="font-[family-name:var(--font-poppins)] font-semibold text-white" style={{ fontSize: 12.5 }}>
                {category.value}
              </span>
            </div>
            <div className="bg-white/[0.08] overflow-hidden" style={{ height: 6, borderRadius: 6 }}>
              <div className="bg-[#ed1a24] h-full" style={{ borderRadius: 6, width: `${(category.value / 5) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
