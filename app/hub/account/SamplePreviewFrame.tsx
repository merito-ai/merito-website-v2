"use client";

import type { ReactNode } from "react";
import { Lock } from "lucide-react";

const CARD_BG = "#141416";

export default function SamplePreviewFrame({
  cropHeight,
  alsoIncluded,
  cta,
  isRealData = false,
  children,
}: {
  cropHeight: number;
  alsoIncluded: string[];
  cta: ReactNode;
  isRealData?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="border-t border-white/[0.08] bg-white/[0.02]" style={{ padding: 20 }}>
      <p
        className="font-[family-name:var(--font-poppins)] font-bold uppercase text-white/40"
        style={{ fontSize: 10.5, letterSpacing: "0.06em", margin: "0 0 4px" }}
      >
        {isRealData ? "Your report" : "Sample report"}
      </p>
      <p className="font-[family-name:var(--font-poppins)] text-white/35" style={{ fontSize: 11.5, margin: "0 0 14px" }}>
        {isRealData
          ? "Generated from your CV. You're seeing the top of it."
          : "Sample data — not your results."}
      </p>

      <div style={{ position: "relative" }}>
        <div
          aria-hidden={!isRealData}
          style={{ maxHeight: cropHeight, overflow: "hidden", pointerEvents: "none" }}
        >
          {children}
        </div>
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            height: 160,
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
            paddingBottom: 4,
            background: `linear-gradient(to bottom, rgba(20,20,22,0) 0%, ${CARD_BG} 62%, ${CARD_BG} 100%)`,
          }}
        >
          {cta}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 18 }}>
        <p
          className="font-[family-name:var(--font-poppins)] font-bold uppercase text-white/40"
          style={{ fontSize: 10.5, letterSpacing: "0.06em", margin: 0 }}
        >
          Also included
        </p>
        {alsoIncluded.map((item) => (
          <div key={item} className="flex items-center" style={{ gap: 8 }}>
            <Lock size={12} strokeWidth={2} className="text-white/25 shrink-0" />
            <span className="font-[family-name:var(--font-poppins)] text-white/55" style={{ fontSize: 12.5 }}>
              {item}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
