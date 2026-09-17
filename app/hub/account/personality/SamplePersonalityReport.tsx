"use client";

import {
  TRAITS,
  TRAIT_NAME,
  TRAIT_MEANING,
  TRAIT_WORK_IMPLICATION,
  BANDS,
  traitLevel,
} from "@/lib/personality";
import { SAMPLE_PERSONALITY_SCORES, SAMPLE_PERSONALITY_NAME } from "@/lib/sampleReports/personality";

const TRAIT_COLORS: Record<string, string> = {
  E: "#F59E0B",
  A: "#22C55E",
  C: "#ed1a24",
  ES: "#3B82F6",
  O: "#A855F7",
};

export default function SamplePersonalityReport() {
  const firstTrait = TRAITS[0];
  const firstScore = SAMPLE_PERSONALITY_SCORES[firstTrait];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {TRAITS.map((trait) => {
          const { pct, band } = SAMPLE_PERSONALITY_SCORES[trait];
          return (
            <div key={trait}>
              <div className="flex items-center justify-between" style={{ marginBottom: 6 }}>
                <span className="font-[family-name:var(--font-poppins)] font-semibold text-white" style={{ fontSize: 12.5 }}>
                  {TRAIT_NAME[trait]}
                </span>
                <span
                  className="font-[family-name:var(--font-poppins)] font-semibold"
                  style={{ fontSize: 12, color: TRAIT_COLORS[trait] }}
                >
                  {pct}% · {BANDS[band]}
                </span>
              </div>
              <div className="bg-white/[0.08] overflow-hidden" style={{ height: 7, borderRadius: 6 }}>
                <div className="h-full" style={{ borderRadius: 6, width: `${pct}%`, background: TRAIT_COLORS[trait] }} />
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white/[0.04]" style={{ borderRadius: 10, padding: 14 }}>
        <div className="flex items-center justify-between" style={{ marginBottom: 8 }}>
          <span className="font-[family-name:var(--font-poppins)] font-semibold text-white" style={{ fontSize: 13 }}>
            {TRAIT_NAME[firstTrait]}
          </span>
          <span
            className="font-[family-name:var(--font-poppins)] font-semibold"
            style={{ fontSize: 13, color: TRAIT_COLORS[firstTrait] }}
          >
            {firstScore.pct}%
          </span>
        </div>
        <p className="font-[family-name:var(--font-poppins)] text-white/55" style={{ fontSize: 12, lineHeight: 1.65, margin: "0 0 8px" }}>
          <span className="font-semibold text-white/40" style={{ fontSize: 10, letterSpacing: "0.05em" }}>
            WHAT IT MEASURES{" "}
          </span>
          {TRAIT_MEANING[firstTrait]}
        </p>
        <p className="font-[family-name:var(--font-poppins)] text-white/55" style={{ fontSize: 12, lineHeight: 1.65, margin: 0 }}>
          <span className="font-semibold text-white/40" style={{ fontSize: 10, letterSpacing: "0.05em" }}>
            AT WORK{" "}
          </span>
          {TRAIT_WORK_IMPLICATION[firstTrait][traitLevel(firstScore.pct)](SAMPLE_PERSONALITY_NAME)}
        </p>
      </div>
    </div>
  );
}
