"use client";

import type { ResumeMatchReportReady } from "@/lib/intervuebox/reports";
import ResumeMatchGauge from "./ResumeMatchGauge";
import ResumeMatchCategoryCard from "./ResumeMatchCategoryCard";

export default function SampleFitmentReport({ report }: { report: ResumeMatchReportReady }) {
  const topCategories = [...report.categories].sort((a, b) => b.score - a.score).slice(0, 3);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div className="flex items-center" style={{ gap: 16 }}>
        <ResumeMatchGauge percent={report.overallScore} />
        <div>
          <p
            className="font-[family-name:var(--font-poppins)] font-bold uppercase text-white/40"
            style={{ fontSize: 10.5, letterSpacing: "0.06em", margin: "0 0 4px" }}
          >
            Overall match
          </p>
          <p className="font-[family-name:var(--font-poppins)] text-white/60" style={{ fontSize: 12.5, lineHeight: 1.6, margin: 0 }}>
            Scored across six dimensions against this job description.
          </p>
        </div>
      </div>

      <div className="bg-white/[0.04]" style={{ borderRadius: 10, padding: 14 }}>
        <p
          className="font-[family-name:var(--font-poppins)] font-bold uppercase text-white/40"
          style={{ fontSize: 10, letterSpacing: "0.06em", margin: "0 0 6px" }}
        >
          Assessment summary
        </p>
        <p className="font-[family-name:var(--font-poppins)] text-white/70" style={{ fontSize: 12.5, lineHeight: 1.65, margin: 0 }}>
          {report.summary}
        </p>
      </div>

      {topCategories.map((category) => (
        <ResumeMatchCategoryCard key={category.key} category={category} />
      ))}
    </div>
  );
}
