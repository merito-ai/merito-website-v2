"use client";

import {
  TRAITS,
  TRAIT_NAME,
  TRAIT_MEANING,
  TRAIT_WORK_IMPLICATION,
  TRAIT_COLOR,
  BANDS,
  traitLevel,
} from "@/lib/personality";
import { CULTURES } from "@/lib/psychometrics/cultureItems";
import { cultureFit } from "@/lib/psychometrics/cultureFit";
import { CULTURE_LABEL, SHARE_CULTURE_HEADING, cultureFitLine } from "@/lib/psychometrics/reportCopy";
import { SAMPLE_PERSONALITY_SCORES, SAMPLE_PERSONALITY_NAME, SAMPLE_PERSONALITY_CULTURE } from "@/lib/sampleReports/personality";

const cultureLine = cultureFitLine(cultureFit(SAMPLE_PERSONALITY_CULTURE, true));

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
                  style={{ fontSize: 12, color: TRAIT_COLOR[trait] }}
                >
                  {pct}% · {BANDS[band]}
                </span>
              </div>
              <div className="bg-white/[0.08] overflow-hidden" style={{ height: 7, borderRadius: 6 }}>
                <div className="h-full" style={{ borderRadius: 6, width: `${pct}%`, background: TRAIT_COLOR[trait] }} />
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white/[0.04]" style={{ borderRadius: 10, padding: 14 }}>
        <p className="font-[family-name:var(--font-poppins)] font-semibold text-white" style={{ fontSize: 13, margin: "0 0 10px" }}>
          {SHARE_CULTURE_HEADING}
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {CULTURES.map((k) => (
            <div key={k}>
              <div className="flex items-center justify-between font-[family-name:var(--font-poppins)]" style={{ marginBottom: 4, fontSize: 12 }}>
                <span className="text-white/80">{CULTURE_LABEL[k]}</span>
                <span className="font-semibold text-[#ed1a24]">{SAMPLE_PERSONALITY_CULTURE[k]}/100</span>
              </div>
              <div className="bg-white/[0.08] overflow-hidden" style={{ height: 6, borderRadius: 6 }}>
                <div className="h-full bg-[#ed1a24]" style={{ borderRadius: 6, width: `${SAMPLE_PERSONALITY_CULTURE[k]}%` }} />
              </div>
            </div>
          ))}
        </div>
        {cultureLine && (
          <p className="font-[family-name:var(--font-poppins)] text-white/70" style={{ fontSize: 12, lineHeight: 1.6, margin: "10px 0 0" }}>
            {cultureLine}
          </p>
        )}
      </div>

      <div className="bg-white/[0.04]" style={{ borderRadius: 10, padding: 14 }}>
        <div className="flex items-center justify-between" style={{ marginBottom: 8 }}>
          <span className="font-[family-name:var(--font-poppins)] font-semibold text-white" style={{ fontSize: 13 }}>
            {TRAIT_NAME[firstTrait]}
          </span>
          <span
            className="font-[family-name:var(--font-poppins)] font-semibold"
            style={{ fontSize: 13, color: TRAIT_COLOR[firstTrait] }}
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
