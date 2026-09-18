"use client";

import type { ComponentType, ReactNode } from "react";
import { Check } from "lucide-react";

export default function LockedFeatureLayout({
  icon: Icon,
  title,
  priceLabel,
  hook,
  impactPoints,
  steps,
  preview,
  modal,
}: {
  icon: ComponentType<{ size?: number; strokeWidth?: number }>;
  title: string;
  priceLabel: string;
  hook: string;
  impactPoints: string[];
  steps: string[];
  preview: ReactNode;
  modal?: ReactNode;
}) {
  return (
    <div className="bg-[#141416] border border-white/[0.08]" style={{ borderRadius: 14, overflow: "hidden" }}>
      <div style={{ padding: 24 }}>
        <div className="flex items-start justify-between flex-wrap" style={{ gap: 12, marginBottom: 14 }}>
          <div className="flex items-center" style={{ gap: 12 }}>
            <div
              className="flex items-center justify-center bg-[#ed1a24]/15 text-[#ed1a24] shrink-0"
              style={{ width: 36, height: 36, borderRadius: 10 }}
            >
              <Icon size={17} strokeWidth={2} />
            </div>
            <span className="font-[family-name:var(--font-gabarito)] font-semibold text-white" style={{ fontSize: "1.05rem" }}>
              {title}
            </span>
          </div>
          <span className="font-[family-name:var(--font-poppins)] font-semibold text-white" style={{ fontSize: 15 }}>
            {priceLabel}
          </span>
        </div>

        <p
          className="font-[family-name:var(--font-gabarito)] font-semibold text-white"
          style={{ fontSize: 17, lineHeight: 1.45, margin: "0 0 18px" }}
        >
          {hook}
        </p>

        <p
          className="font-[family-name:var(--font-poppins)] font-bold uppercase text-white/40"
          style={{ fontSize: 10.5, letterSpacing: "0.06em", margin: "0 0 10px" }}
        >
          Why this matters
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {impactPoints.map((point) => (
            <div key={point} className="flex items-start" style={{ gap: 10 }}>
              <Check size={14} strokeWidth={2.5} className="text-[#ed1a24] shrink-0" style={{ marginTop: 2 }} />
              <span className="font-[family-name:var(--font-poppins)] text-white/70" style={{ fontSize: 13, lineHeight: 1.6 }}>
                {point}
              </span>
            </div>
          ))}
        </div>
      </div>

      {preview}

      <div className="border-t border-white/[0.08]" style={{ padding: 20 }}>
        <p
          className="font-[family-name:var(--font-poppins)] font-bold uppercase text-white/40"
          style={{ fontSize: 10.5, letterSpacing: "0.06em", margin: "0 0 12px" }}
        >
          How it works
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {steps.map((step, i) => (
            <div key={step} className="flex items-start" style={{ gap: 10 }}>
              <span
                className="flex items-center justify-center shrink-0 bg-[#ed1a24]/15 text-[#ed1a24] font-[family-name:var(--font-poppins)] font-bold"
                style={{ width: 18, height: 18, borderRadius: "50%", fontSize: 10, marginTop: 1 }}
              >
                {i + 1}
              </span>
              <span className="font-[family-name:var(--font-poppins)] text-white/55" style={{ fontSize: 12.5, lineHeight: 1.6 }}>
                {step}
              </span>
            </div>
          ))}
        </div>
      </div>

      {modal}
    </div>
  );
}
