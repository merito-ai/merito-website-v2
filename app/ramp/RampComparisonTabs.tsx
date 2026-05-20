"use client";

import { useState } from "react";

type TabId = "ramp" | "spreadsheets" | "legacy";
type CellVal = boolean | string;
type ValType = "yes" | "no" | "highlight" | "neutral";

const TABS: { id: TabId; label: string; sublabel?: string }[] = [
  { id: "ramp",         label: "RAMP",         sublabel: "BEST FIT" },
  { id: "spreadsheets", label: "Spreadsheets" },
  { id: "legacy",       label: "Legacy ATS" },
];

const ROWS: { name: string; ramp: CellVal; spreadsheets: CellVal; legacy: CellVal }[] = [
  { name: "SLA tracking on every stage",             ramp: true,      spreadsheets: "Manual",     legacy: "Manual"  },
  { name: "AI scoring against your JD",              ramp: true,      spreadsheets: false,        legacy: "Limited" },
  { name: "WhatsApp inbox, two-way",                 ramp: true,      spreadsheets: false,        legacy: false     },
  { name: "Hiring-manager shortlists with one link", ramp: true,      spreadsheets: "Email only", legacy: "Add-on"  },
  { name: "Setup time",                              ramp: "0 min",   spreadsheets: "Days",       legacy: "Weeks"   },
  { name: "Built for Indian growth-stage TA",        ramp: true,      spreadsheets: false,        legacy: "Generic" },
];

function getType(v: CellVal): ValType {
  if (v === true) return "yes";
  if (v === false) return "no";
  if (v === "0 min") return "highlight";
  return "neutral";
}

function CellValue({ v }: { v: CellVal }) {
  const type = getType(v);
  if (type === "yes") {
    return (
      <span className="flex items-center gap-1.5 font-bold text-[#ed1a24] whitespace-nowrap">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M2 7L5.5 10.5L12 4" stroke="#ed1a24" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Yes
      </span>
    );
  }
  if (type === "no") {
    return (
      <span className="flex items-center gap-1.5 text-[#6b7280] whitespace-nowrap">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M2 2L10 10M10 2L2 10" stroke="#6b7280" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
        No
      </span>
    );
  }
  if (type === "highlight") {
    return <span className="font-black text-white text-lg whitespace-nowrap">0 min</span>;
  }
  return <span className="text-[#6b7280] whitespace-nowrap">{v as string}</span>;
}

export default function RampComparisonTabs() {
  const [active, setActive] = useState<TabId>("ramp");

  return (
    <div className="flex flex-col overflow-hidden" style={{ maxWidth: 420, margin: "0 auto" }}>
      {/* Tab bar */}
      <div
        className="flex bg-white rounded-xl p-1 gap-1 mb-4"
        style={{ border: "1px solid rgba(0,0,0,0.07)", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}
      >
        {TABS.map((tab) => {
          const isActive = active === tab.id;
          const isRamp = tab.id === "ramp";
          return (
            <button
              key={tab.id}
              onClick={() => setActive(tab.id)}
              className="flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-lg transition-all duration-200"
              style={{
                fontSize: 12,
                fontWeight: 700,
                fontFamily: "var(--font-poppins), sans-serif",
                background: isActive && isRamp ? "#ed1a24" : isActive ? "#1e293b" : "transparent",
                color: isActive ? "#fff" : "#6b7280",
                boxShadow: isActive ? "0 2px 8px rgba(0,0,0,0.15)" : "none",
              }}
            >
              <span style={{ lineHeight: 1.2 }}>{tab.label}</span>
              {tab.sublabel && (
                <span
                  style={{
                    fontSize: 8,
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                    marginTop: 1,
                    color: isActive ? "rgba(255,255,255,0.85)" : "#ed1a24",
                  }}
                >
                  {tab.sublabel}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Card list */}
      <div className="flex flex-col gap-2">
        {ROWS.map((row) => {
          const val = row[active];
          const type = getType(val);
          const isRampTab = active === "ramp";
          const isSetupTime = row.name === "Setup time";

          let cardBg = "#fff";
          let borderColor = "rgba(0,0,0,0.07)";
          let shadow = "none";

          if (isRampTab && type === "yes") {
            cardBg = "#fff";
            borderColor = "rgba(237,26,36,0.18)";
            shadow = "0 1px 4px rgba(0,0,0,0.05)";
          } else if (isRampTab && type === "highlight") {
            cardBg = "#ed1a24";
            borderColor = "#ed1a24";
            shadow = "0 4px 16px rgba(237,26,36,0.25)";
          } else if (!isRampTab && isSetupTime) {
            cardBg = "#f3f4f6";
            borderColor = "#e5e7eb";
          }

          return (
            <div
              key={row.name}
              className="flex items-center justify-between rounded-xl transition-all"
              style={{
                padding: "14px 16px",
                background: cardBg,
                border: `1px solid ${borderColor}`,
                boxShadow: shadow,
              }}
            >
              <span
                className="font-semibold leading-snug pr-3"
                style={{
                  fontSize: 13,
                  fontFamily: "var(--font-poppins), sans-serif",
                  color: isRampTab && type === "highlight" ? "#fff" : "#1f2937",
                }}
              >
                {row.name}
              </span>
              <div className="shrink-0">
                <CellValue v={val} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
