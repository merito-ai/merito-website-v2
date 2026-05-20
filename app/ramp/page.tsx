import { Fragment, type CSSProperties } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import ContactTrigger from "@/components/ContactTrigger";
import { getAbsoluteUrl } from "@/lib/site";
import RampFeatureTabs from "./RampFeatureTabs";
import RevealOnScroll from "@/components/anim/RevealOnScroll";
import RampCountUp from "./RampCountUp";
import RampComparisonTabs from "./RampComparisonTabs";

export const metadata: Metadata = {
  title: "RAMP — Recruitment Activity Management Platform | Merito",
  description:
    "RAMP by Merito is the all-in-one platform for in-house TA teams — pipeline management, AI match scoring, WhatsApp comms, and client portals in one workspace.",
  openGraph: {
    title: "RAMP — Recruitment Activity Management Platform | Merito",
    description:
      "RAMP by Merito is the all-in-one platform for in-house TA teams — pipeline management, AI match scoring, WhatsApp comms, and client portals in one workspace.",
    url: getAbsoluteUrl("/ramp"),
  },
  alternates: { canonical: "/ramp" },
};

/* ─── Ticker items ─── */
const TICKER_ITEMS = [
  "Pipeline Management", "AI Resume Parsing", "Client Portal",
  "SLA Tracking", "WhatsApp Comms", "Interview Scheduling",
  "Offer Management", "Placement Tracking", "Role-Based Access", "Guarantee Tracking",
];

/* ─── Value props ─── */
const VALUE_PROPS = [
  {
    num: "01",
    title: "Built around your funnel",
    desc: "Every candidate, every stage. SLA breach alerts fire before your hiring manager has to ask.",
    icon: <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
  },
  {
    num: "02",
    title: "AI that earns its keep",
    desc: "Upload a JD, drop in CVs. RAMP extracts skills, scores fit, and surfaces who deserves a call today.",
    icon: <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>,
  },
  {
    num: "03",
    title: "Candidates as customers",
    desc: "WhatsApp, email and interview scheduling — all in one place, with templates that don't sound like templates.",
    icon: <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  },
];

/* ─── Comparison data ─── */
type CellVal = boolean | string;
const COMPARISON_ROWS: [string, CellVal, CellVal, CellVal][] = [
  ["SLA tracking on every stage",             true,       "Manual",     "Manual"],
  ["AI scoring against your JD",              true,       false,        "Limited"],
  ["WhatsApp inbox, two-way",                 true,       false,        false],
  ["Hiring-manager shortlists with one link", true,       "Email only", "Add-on"],
  ["Setup time",                              "0 min",    "Days",       "Weeks"],
  ["Built for Indian growth-stage TA",        true,       false,        "Generic"],
];

/* ─── Stats ─── */
const STATS = [
  { val: 40,  suffix: "%",  label: "Faster time-to-submit" },
  { val: 10,  suffix: "K+", label: "Placements tracked" },
  { val: 5,   suffix: " hr",label: "Saved per recruiter / week" },
  { val: 0,   suffix: "",   label: "Days to set up" },
];

/* ─── Hero Kanban Mockup ─── */
function DashboardMockup() {
  const cols = [
    { label: "Submitted", count: 14, color: "#94a3b8" },
    { label: "Screening",  count: 9,  color: "#3b82f6" },
    { label: "Interview",  count: 6,  color: "#f59e0b" },
    { label: "Offer",      count: 3,  color: "#ed1a24" },
  ];
  const cardsByCol = [
    [
      { name: "Priya Nair",  role: "Sr. Engineer",  score: 87, sla: "on"   },
      { name: "Arjun Mehta", role: "Product Mgr",   score: 74, sla: "on"   },
      { name: "Neha Singh",  role: "Data Analyst",  score: 81, sla: "on"   },
    ],
    [
      { name: "Rohit Kumar", role: "Sr. Engineer",  score: 79, sla: "on"   },
      { name: "Sara Iyer",   role: "Designer",      score: 88, sla: "due"  },
    ],
    [
      { name: "Tara Bose",   role: "Sr. Engineer",  score: 92, sla: "on"   },
      { name: "Vikram J.",   role: "Product Mgr",   score: 76, sla: "late" },
    ],
    [
      { name: "Sarah Chen",  role: "Data Analyst",  score: 91, sla: "due"  },
    ],
  ];

  return (
    <div className="relative w-full mt-8 lg:mt-0" style={{ maxWidth: 600 }}>
      {/* Radial glow behind mockup */}
      <div
        className="absolute pointer-events-none"
        style={{
          inset: "-30px -10px",
          background: "radial-gradient(50% 50% at 60% 50%, rgba(237,26,36,0.10) 0%, transparent 65%)",
          zIndex: 0,
        }}
      />

      {/* Mockup shell */}
      <div
        className="relative bg-white overflow-hidden"
        style={{
          borderRadius: 22,
          border: "1px solid rgba(0,0,0,0.08)",
          boxShadow: "0 30px 80px rgba(17,35,89,0.10), 0 8px 30px rgba(237,26,36,0.06)",
          zIndex: 1,
        }}
      >
        {/* Browser bar */}
        <div className="flex items-center gap-2 bg-[#fafafa] border-b border-black/[0.06]" style={{ padding: "12px 16px" }}>
          <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
          <span
            className="font-[family-name:var(--font-poppins)] text-[11px] text-[#94a3b8] bg-white border border-black/[0.06] rounded-[6px] flex-1"
            style={{ marginLeft: 14, padding: "4px 10px", maxWidth: 280 }}
          >
            🔒 app.merito.ai/ramp/pipeline
          </span>
          <div className="flex gap-1.5 ml-auto">
            {(["#ed1a24", "#e2e8f0", "#e2e8f0"] as const).map((c, i) => (
              <span key={i} className="h-1.5 rounded-full" style={{ width: 22, background: c }} />
            ))}
          </div>
        </div>

        {/* App body */}
        <div className="flex" style={{ minHeight: 400 }}>
          {/* Sidebar */}
          <div
            className="flex-shrink-0 border-r border-black/[0.06] bg-[#fcfcfd] flex flex-col gap-1"
            style={{ width: 152, padding: "18px 12px" }}
          >
            <div
              className="flex items-center gap-2 font-[family-name:var(--font-gabarito)] font-bold text-[#0f172a] pb-4 px-2"
              style={{ fontSize: 14, letterSpacing: "-0.01em" }}
            >
              <span className="w-3.5 h-3.5 rounded-[4px] bg-[#ed1a24]" />
              RAMP
            </div>
            {[
              { l: "Pipeline",   active: true,  badge: 32  },
              { l: "Candidates", active: false, badge: 148 },
              { l: "Jobs",       active: false, badge: 12  },
              { l: "Clients",    active: false, badge: 0   },
              { l: "Reports",    active: false, badge: 0   },
            ].map((it) => (
              <div
                key={it.l}
                className="flex items-center gap-2.5 px-2.5 py-2 rounded-[8px] font-[family-name:var(--font-poppins)] cursor-default"
                style={{
                  fontSize: 12,
                  fontWeight: it.active ? 600 : 500,
                  color: it.active ? "#ed1a24" : "#475569",
                  background: it.active ? "#fde8ea" : "transparent",
                }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{ background: it.active ? "#ed1a24" : "#cbd5e1" }}
                />
                <span className="flex-1">{it.l}</span>
                {it.badge ? (
                  <span
                    className="font-semibold rounded-[6px]"
                    style={{
                      fontSize: 10,
                      padding: "2px 6px",
                      background: it.active ? "#fff" : "#f1f5f9",
                      color: it.active ? "#ed1a24" : "#64748b",
                    }}
                  >
                    {it.badge}
                  </span>
                ) : null}
              </div>
            ))}
          </div>

          {/* Main */}
          <div className="flex-1 overflow-hidden" style={{ padding: "18px 20px" }}>
            {/* Top row */}
            <div className="flex justify-between items-end mb-4">
              <div>
                <div
                  className="font-[family-name:var(--font-gabarito)] font-semibold text-[#0f172a]"
                  style={{ fontSize: 17, letterSpacing: "-0.015em" }}
                >
                  Active Pipeline
                </div>
                <div
                  className="font-[family-name:var(--font-poppins)] text-[#94a3b8] mt-0.5"
                  style={{ fontSize: 11.5 }}
                >
                  32 candidates · 4 stages · 3 SLA alerts
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className="flex items-center gap-1.5 bg-white border border-black/[0.08] rounded-[7px] font-[family-name:var(--font-poppins)] text-[#94a3b8]"
                  style={{ padding: "6px 10px", fontSize: 11 }}
                >
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2.4"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                  Search
                </div>
                <div
                  className="bg-white border border-black/[0.08] rounded-[7px] font-[family-name:var(--font-poppins)] font-medium text-[#475569]"
                  style={{ padding: "6px 10px", fontSize: 11 }}
                >
                  Filters · 2
                </div>
                <div
                  className="bg-[#ed1a24] rounded-[7px] font-[family-name:var(--font-poppins)] font-semibold text-white"
                  style={{ padding: "6px 12px", fontSize: 11 }}
                >
                  + Add
                </div>
              </div>
            </div>

            {/* Kanban board */}
            <div className="grid grid-cols-4 gap-2.5" style={{ alignItems: "flex-start" }}>
              {cols.map((col, ci) => (
                <div
                  key={col.label}
                  className="bg-[#f8fafc] rounded-[12px]"
                  style={{ padding: 10 }}
                >
                  <div className="flex justify-between items-center px-1.5 pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: col.color }} />
                      <span
                        className="font-[family-name:var(--font-poppins)] font-semibold text-[#334155] uppercase"
                        style={{ fontSize: 11, letterSpacing: "0.04em" }}
                      >
                        {col.label}
                      </span>
                      <span
                        className="font-semibold text-[#94a3b8] bg-white rounded-[6px]"
                        style={{ fontSize: 10, padding: "1px 6px" }}
                      >
                        {col.count}
                      </span>
                    </div>
                    <span className="text-[#cbd5e1]" style={{ fontSize: 11 }}>···</span>
                  </div>

                  <div className="flex flex-col gap-2">
                    {cardsByCol[ci].map((card) => {
                      const scoreColor = card.score >= 85 ? "#16a34a" : card.score >= 75 ? "#ed1a24" : "#64748b";
                      const scoreBg   = card.score >= 85 ? "#dcfce7" : card.score >= 75 ? "#fde8ea" : "#f1f5f9";
                      const slaColor  = card.sla === "late" ? "#ed1a24" : card.sla === "due" ? "#d97706" : "#16a34a";
                      const slaText   = card.sla === "late" ? "● SLA late" : card.sla === "due" ? "● due today" : "● on track";
                      return (
                        <div
                          key={card.name}
                          className="bg-white rounded-[10px] border border-black/[0.05]"
                          style={{ padding: "11px 12px", boxShadow: "0 1px 2px rgba(0,0,0,0.03)" }}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <div
                                className="font-[family-name:var(--font-gabarito)] font-semibold text-[#0f172a]"
                                style={{ fontSize: 12.5, letterSpacing: "-0.01em" }}
                              >
                                {card.name}
                              </div>
                              <div
                                className="font-[family-name:var(--font-poppins)] text-[#94a3b8] mt-0.5"
                                style={{ fontSize: 10.5 }}
                              >
                                {card.role}
                              </div>
                            </div>
                            <span
                              className="font-[family-name:var(--font-gabarito)] font-bold rounded-[6px]"
                              style={{ fontSize: 11, padding: "2px 7px", background: scoreBg, color: scoreColor, letterSpacing: "-0.01em" }}
                            >
                              {card.score}%
                            </span>
                          </div>
                          <div className="flex items-center justify-between mt-2.5">
                            <span
                              className="font-[family-name:var(--font-poppins)] font-bold uppercase"
                              style={{ fontSize: 9.5, letterSpacing: "0.06em", color: slaColor }}
                            >
                              {slaText}
                            </span>
                            <div className="flex">
                              <span
                                className="font-[family-name:var(--font-gabarito)] font-bold text-white flex items-center justify-center bg-[#ed1a24] rounded-full"
                                style={{ width: 18, height: 18, fontSize: 9, border: "1.5px solid #fff" }}
                              >R</span>
                              <span
                                className="font-[family-name:var(--font-gabarito)] font-bold text-white flex items-center justify-center bg-[#1e293b] rounded-full"
                                style={{ width: 18, height: 18, fontSize: 9, border: "1.5px solid #fff", marginLeft: -6 }}
                              >P</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    {ci === 1 && (
                      <div
                        className="bg-[#fafafa] rounded-[10px] border border-dashed border-[#e2e8f0] flex items-center justify-center font-[family-name:var(--font-poppins)] text-[#94a3b8]"
                        style={{ fontSize: 11, padding: "14px 12px" }}
                      >
                        + Drop here
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Floating chip — top right */}
      <div
        className="absolute flex items-center gap-2 bg-white border border-[rgba(237,26,36,0.2)] rounded-full font-[family-name:var(--font-poppins)] font-semibold text-[#ed1a24]"
        style={{
          top: -16, right: -10, zIndex: 2,
          padding: "6px 14px", fontSize: 11,
          boxShadow: "0 10px 24px rgba(237,26,36,0.18)",
        }}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-[#ed1a24]" />
        Live · 32 candidates
      </div>

      {/* Floating chip — bottom left */}
      <div
        className="absolute bg-[#0a0a0a] text-white rounded-[12px] flex items-center gap-2.5 font-[family-name:var(--font-poppins)]"
        style={{
          bottom: -14, left: -14, zIndex: 2,
          padding: "10px 14px", fontSize: 11,
          boxShadow: "0 12px 24px rgba(0,0,0,0.18)",
          maxWidth: 240,
        }}
      >
        <span
          className="font-[family-name:var(--font-gabarito)] font-bold text-white bg-[#ed1a24] flex items-center justify-center rounded-[8px] flex-shrink-0"
          style={{ width: 28, height: 28, fontSize: 13 }}
        >
          R
        </span>
        <div style={{ lineHeight: 1.35 }}>
          <div className="font-semibold">3 SLA alerts cleared</div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.6)" }}>before your client noticed</div>
        </div>
      </div>
    </div>
  );
}

/* ─── Comparison cell ─── */
function ComparisonCell({ v }: { v: CellVal }) {
  if (v === true) {
    return (
      <span className="flex items-center gap-1.5 font-semibold text-[#ed1a24]">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
        Yes
      </span>
    );
  }
  if (v === false) {
    return (
      <span className="flex items-center gap-1.5 text-[#9c9c9c]">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
        </svg>
        No
      </span>
    );
  }
  return <span className="text-[#9c9c9c]">{v}</span>;
}

export default function RampPage() {
  return (
    <main>
      {/* ══════════ HERO ══════════ */}
      <section className="relative overflow-hidden bg-white pt-12 pb-14 sm:pt-20 sm:pb-[100px]">
        {/* Two-layer radial overlays */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(60% 50% at 80% 0%, rgba(237,26,36,0.12) 0%, transparent 60%), " +
              "radial-gradient(40% 30% at 0% 20%, rgba(253,248,251,1) 0%, transparent 65%)",
          }}
        />
        {/* Dot grid */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(0,0,0,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.04) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
            maskImage: "radial-gradient(ellipse 70% 60% at 50% 30%, black 30%, transparent 75%)",
          } as CSSProperties}
        />

        <div className="relative max-w-[1280px] mx-auto px-[clamp(20px,4vw,40px)]">
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] items-center gap-10 lg:gap-16">
            {/* Left: copy */}
            <div className="ramp-hero-copy">
              {/* Eyebrow pill */}
              <div
                className="inline-flex items-center gap-2 bg-[#fdeced] border border-[rgba(237,26,36,0.18)] text-[#ed1a24] font-[family-name:var(--font-poppins)] font-bold uppercase"
                style={{ fontSize: 11, letterSpacing: "0.12em", padding: "6px 14px", borderRadius: 50 }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full bg-[#ed1a24]"
                  style={{ boxShadow: "0 0 0 4px rgba(237,26,36,0.12)", animation: "ramp-pulse 1.8s ease-out infinite" }}
                />
                A Merito Platform for TA Teams
              </div>

              {/* Headline */}
              <h1
                className="font-[family-name:var(--font-gabarito)] text-[#000] font-semibold"
                style={{
                  fontSize: "clamp(2.8rem, 4.6vw, 4rem)",
                  lineHeight: 1.02,
                  letterSpacing: "-0.045em",
                  margin: "18px 0 22px",
                  textWrap: "balance" as CSSProperties["textWrap"],
                }}
              >
                Your pipeline isn&apos;t broken.
                <br />
                <span className="text-[#ed1a24]">Your tools are.</span>
              </h1>

              {/* Sub */}
              <p
                className="font-[family-name:var(--font-poppins)] text-[#4b4b4d]"
                style={{ fontSize: 17, lineHeight: 1.7, maxWidth: 480, marginBottom: 32 }}
              >
                RAMP is the recruitment activity management platform built around how growth-stage TA teams actually work — sourcing, scoring, shortlisting and shipping offers, all in one place.
              </p>

              {/* CTAs */}
              <div className="flex items-center flex-wrap" style={{ gap: 14, marginBottom: 30 }}>
                <ContactTrigger
                  className="inline-flex items-center gap-2.5 bg-[#ed1a24] text-white font-[family-name:var(--font-poppins)] font-semibold hover:bg-[#c8151e] transition-all hover:-translate-y-px h-[52px] px-[26px] text-[15px] rounded-[8px] shadow-[0px_4px_6px_rgba(236,34,40,0.3)]"
                >
                  Get Free Access
                  <span className="inline-flex items-center justify-center bg-black/90 rounded-full w-7 h-7">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                    </svg>
                  </span>
                </ContactTrigger>
              </div>

              {/* Social proof */}
              <div className="flex items-center gap-4 font-[family-name:var(--font-poppins)] text-[#5f6166]" style={{ fontSize: 13 }}>
                <div className="flex">
                  {(["#ed1a24", "#1e293b", "#475569", "#94a3b8"] as const).map((bg, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center justify-center font-[family-name:var(--font-gabarito)] font-semibold text-white rounded-full"
                      style={{
                        width: 28, height: 28, fontSize: 11,
                        background: bg,
                        border: "2px solid #fff",
                        marginLeft: i === 0 ? 0 : -10,
                      }}
                    >
                      {["R", "P", "S", "+"][i]}
                    </span>
                  ))}
                </div>
                <span>
                  Trusted by TA teams at <strong className="text-[#0f172a]">50+</strong> growth-stage startups
                </span>
              </div>
            </div>

            {/* Right: mockup — hidden on mobile */}
            <div className="hidden lg:block">
              <DashboardMockup />
            </div>
          </div>
        </div>

        {/* Keyframes */}
        <style>{`
          @keyframes ramp-pulse {
            0%   { box-shadow: 0 0 0 0 rgba(237,26,36,0.4); }
            70%  { box-shadow: 0 0 0 8px rgba(237,26,36,0); }
            100% { box-shadow: 0 0 0 0 rgba(237,26,36,0); }
          }
          @keyframes ramp-ticker {
            0%   { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
        `}</style>
      </section>

      {/* ══════════ TICKER ══════════ */}
      <div
        className="relative overflow-hidden bg-[#fdf8fb]"
        style={{ borderTop: "1px solid rgba(0,0,0,0.05)", borderBottom: "1px solid rgba(0,0,0,0.05)", padding: "22px 0" }}
      >
        <div
          className="absolute left-0 inset-y-0 w-[100px] pointer-events-none z-[2]"
          style={{ background: "linear-gradient(to right, #fdf8fb, transparent)" }}
        />
        <div
          className="absolute right-0 inset-y-0 w-[100px] pointer-events-none z-[2]"
          style={{ background: "linear-gradient(to left, #fdf8fb, transparent)" }}
        />
        <div className="flex" style={{ width: "max-content", animation: "ramp-ticker 40s linear infinite" }}>
          {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
            <div
              key={i}
              className="inline-flex items-center whitespace-nowrap"
              style={{ gap: 12, padding: "0 32px" }}
            >
              <span
                className="rounded-full bg-[#ed1a24]"
                style={{ width: 5, height: 5, opacity: 0.5 }}
              />
              <span
                className="font-[family-name:var(--font-poppins)] font-semibold text-[#4b4b4d] uppercase"
                style={{ fontSize: 13, letterSpacing: "0.06em" }}
              >
                {item}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ══════════ VALUE PROPS ══════════ */}
      <section className="bg-[#fdf8fb] py-12 sm:py-[100px]">
        <div className="max-w-[1280px] mx-auto px-[clamp(20px,4vw,40px)]">
          <RevealOnScroll>
            {/* Section eyebrow */}
            <div
              className="inline-flex items-center gap-2.5 font-[family-name:var(--font-poppins)] font-bold uppercase text-[#ed1a24]"
              style={{ fontSize: 12, letterSpacing: "0.14em", marginBottom: 14 }}
            >
              <span className="inline-block bg-[#ed1a24] rounded-[2px]" style={{ width: 18, height: 2 }} />
              Why RAMP
            </div>

            {/* Section head */}
            <div className="max-w-[720px] mb-8 sm:mb-14">
              <h2
                className="font-[family-name:var(--font-gabarito)] font-semibold text-black"
                style={{
                  fontSize: "clamp(2.2rem, 3.4vw, 3rem)",
                  letterSpacing: "-0.035em",
                  lineHeight: 1.08,
                  margin: "0 0 16px",
                  textWrap: "balance" as CSSProperties["textWrap"],
                }}
              >
                Everything your TA team needs.
                <br />
                <span className="text-[#ed1a24]">Nothing it doesn&apos;t.</span>
              </h2>
              <p
                className="font-[family-name:var(--font-poppins)] text-[#4b4b4d]"
                style={{ fontSize: 17, lineHeight: 1.65, margin: 0, maxWidth: 560 }}
              >
                One platform for every stage — no more duct-taped spreadsheets, missed follow-ups, or candidates ghosted between rounds.
              </p>
            </div>
          </RevealOnScroll>

          {/* 3-col grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3" style={{ gap: 24 }}>
            {VALUE_PROPS.map((vp, i) => (
              <RevealOnScroll key={vp.title} delay={i * 0.1}>
                <div
                  className="relative bg-white border border-black/[0.08] overflow-hidden group transition-all duration-[280ms] h-full hover:-translate-y-[6px] hover:border-[rgba(237,26,36,0.18)] hover:shadow-[0px_20px_80px_rgba(237,26,36,0.12)]"
                  style={{
                    borderRadius: 20,
                    padding: "32px 28px 30px",
                    boxShadow: "0px 18px 50px rgba(17,35,89,0.04)",
                    cursor: "default",
                  }}
                >
                  {/* Left border reveal */}
                  <div
                    className="absolute left-0 top-0 bottom-0 bg-[#ed1a24] origin-top scale-y-0 group-hover:scale-y-100 transition-transform duration-[360ms]"
                    style={{ width: 4, borderRadius: "0 4px 4px 0", transitionTimingFunction: "cubic-bezier(0.23,1,0.32,1)" }}
                  />
                  {/* Number */}
                  <div
                    className="font-[family-name:var(--font-gabarito)] font-semibold text-[#ed1a24] inline-flex items-center gap-2"
                    style={{ fontSize: 13, letterSpacing: "0.04em", marginBottom: 18 }}
                  >
                    {vp.num}
                    <span className="inline-block bg-[rgba(237,26,36,0.4)] rounded-[2px]" style={{ width: 24, height: 1 }} />
                  </div>
                  {/* Icon */}
                  <div
                    className="inline-flex items-center justify-center text-[#ed1a24] bg-[#fdeced]"
                    style={{ width: 52, height: 52, borderRadius: 12, marginBottom: 22 }}
                  >
                    {vp.icon}
                  </div>
                  {/* Title */}
                  <h3
                    className="font-[family-name:var(--font-gabarito)] font-semibold text-black"
                    style={{ fontSize: 22, letterSpacing: "-0.02em", margin: "0 0 10px" }}
                  >
                    {vp.title}
                  </h3>
                  {/* Desc */}
                  <p
                    className="font-[family-name:var(--font-poppins)] text-[#66686d]"
                    style={{ fontSize: 14.5, lineHeight: 1.65, margin: 0 }}
                  >
                    {vp.desc}
                  </p>
                </div>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ FEATURE TABS ══════════ */}
      <RampFeatureTabs />

      {/* ══════════ COMPARISON ══════════ */}
      <section className="bg-[#fdf8fb] py-12 sm:py-[100px]">
        <div className="max-w-[1280px] mx-auto px-[clamp(20px,4vw,40px)]">
          <RevealOnScroll>
            {/* Eyebrow */}
            <div
              className="inline-flex items-center gap-2.5 font-[family-name:var(--font-poppins)] font-bold uppercase text-[#ed1a24]"
              style={{ fontSize: 12, letterSpacing: "0.14em", marginBottom: 14 }}
            >
              <span className="inline-block bg-[#ed1a24] rounded-[2px]" style={{ width: 18, height: 2 }} />
              How it stacks up
            </div>

            {/* Head */}
            <div className="max-w-[720px] mb-8 sm:mb-14">
              <h2
                className="font-[family-name:var(--font-gabarito)] font-semibold text-black"
                style={{ fontSize: "clamp(2.2rem, 3.4vw, 3rem)", letterSpacing: "-0.035em", lineHeight: 1.08, margin: "0 0 16px" }}
              >
                Not another ATS.
                <br />
                <span className="text-[#ed1a24]">Not a spreadsheet, either.</span>
              </h2>
              <p className="font-[family-name:var(--font-poppins)] text-[#4b4b4d]" style={{ fontSize: 17, lineHeight: 1.65 }}>
                The honest comparison. We built RAMP for the in-house TA team that&apos;s outgrown sheets but isn&apos;t ready for a six-month ATS implementation.
              </p>
            </div>
          </RevealOnScroll>

          {/* Mobile tab switcher */}
          <div className="sm:hidden mb-0">
            <RampComparisonTabs />
          </div>

          {/* Table — desktop only (sm+) */}
          <div
            className="hidden sm:grid overflow-hidden bg-white [grid-template-columns:minmax(0,1.2fr)_repeat(3,minmax(0,1fr))]"
            style={{
              border: "1px solid rgba(0,0,0,0.08)",
              borderRadius: 22,
              boxShadow: "0px 18px 50px rgba(17,35,89,0.04)",
            }}
          >
            {/* Header row */}
            <div
              className="font-[family-name:var(--font-gabarito)] font-semibold text-black bg-[#fdf8fb]"
              style={{ padding: "16px 16px", fontSize: 14, letterSpacing: "-0.015em", borderBottom: "1px solid rgba(0,0,0,0.06)" }}
            >
              Capability
            </div>
            <div
              className="font-[family-name:var(--font-gabarito)] font-bold text-white bg-[#ed1a24] border-l border-[rgba(237,26,36,0.4)]"
              style={{ padding: "16px 16px", fontSize: 14, letterSpacing: "-0.015em", borderBottom: "1px solid rgba(0,0,0,0.06)" }}
            >
              RAMP
              <span
                className="font-[family-name:var(--font-poppins)] font-bold uppercase ml-2"
                style={{ fontSize: 8, letterSpacing: "0.12em", padding: "2px 6px", borderRadius: 999, background: "rgba(255,255,255,0.18)" }}
              >
                Best fit
              </span>
            </div>
            {(["Spreadsheets", "Legacy ATS"] as const).map((col) => (
              <div
                key={col}
                className="font-[family-name:var(--font-gabarito)] font-semibold text-black bg-[#fdf8fb]"
                style={{ padding: "16px 16px", fontSize: 14, letterSpacing: "-0.015em", borderBottom: "1px solid rgba(0,0,0,0.06)" }}
              >
                {col}
              </div>
            ))}

            {/* Data rows */}
            {COMPARISON_ROWS.map(([label, ramp, sheet, ats], ri) => {
              const isLast = ri === COMPARISON_ROWS.length - 1;
              const cellBase: CSSProperties = {
                padding: "16px 16px",
                fontFamily: "Poppins, sans-serif",
                fontSize: 13,
                color: "#4b4b4d",
                lineHeight: 1.5,
                gap: 8,
                borderBottom: isLast ? "none" : "1px solid rgba(0,0,0,0.06)",
              };
              const cellStyle: CSSProperties = { ...cellBase, display: "flex", alignItems: "center" };
              return (
                <Fragment key={label}>
                  <div style={{ ...cellStyle, fontWeight: 600, color: "#000", fontSize: 13 }}>
                    {label}
                  </div>
                  <div
                    style={{
                      ...cellStyle,
                      background: "linear-gradient(180deg, #fff5f5 0%, #ffffff 100%)",
                      borderLeft: "1px solid rgba(237,26,36,0.18)",
                    }}
                  >
                    <ComparisonCell v={ramp} />
                  </div>
                  <div style={cellStyle}><ComparisonCell v={sheet} /></div>
                  <div style={cellStyle}><ComparisonCell v={ats} /></div>
                </Fragment>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════ STATS ══════════ */}
      <section className="relative overflow-hidden bg-[#0a0a0a] py-12 sm:py-[80px]">
        {/* Radial glows */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(60% 50% at 90% 20%, rgba(237,26,36,0.22) 0%, transparent 60%), " +
              "radial-gradient(40% 60% at 10% 80%, rgba(237,26,36,0.12) 0%, transparent 60%)",
          }}
        />

        <div className="relative max-w-[1280px] mx-auto px-[clamp(20px,4vw,40px)]">
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1.2fr)] items-center gap-10 lg:gap-16">
            {/* Left: head */}
            <RevealOnScroll>
            <div>
              <div
                className="inline-flex items-center gap-2.5 font-[family-name:var(--font-poppins)] font-bold uppercase"
                style={{ fontSize: 12, letterSpacing: "0.14em", marginBottom: 14, color: "#ff6a72" }}
              >
                <span className="inline-block rounded-[2px]" style={{ width: 18, height: 2, background: "#ff6a72" }} />
                The proof
              </div>
              <h2
                className="font-[family-name:var(--font-gabarito)] font-semibold text-white"
                style={{
                  fontSize: "clamp(2rem, 3vw, 2.6rem)",
                  letterSpacing: "-0.035em",
                  lineHeight: 1.1,
                  margin: "14px 0 14px",
                  textWrap: "balance" as CSSProperties["textWrap"],
                }}
              >
                Teams running on RAMP ship
                <br />
                more hires in{" "}
                <span style={{ color: "#ff6a72" }}>less time.</span>
              </h2>
              <p
                className="font-[family-name:var(--font-poppins)]"
                style={{ fontSize: 15, lineHeight: 1.65, color: "rgba(255,255,255,0.62)", margin: 0, maxWidth: 440 }}
              >
                Numbers averaged across in-house TA teams at growth-stage Indian startups, first 90 days on the platform.
              </p>
            </div>
            </RevealOnScroll>

            {/* Right: 2×2 stat grid */}
            <div
              className="grid grid-cols-2 overflow-hidden"
              style={{
                gap: 1,
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 18,
              }}
            >
              {STATS.map((s) => (
                <div key={s.label} className="bg-[#0a0a0a]" style={{ padding: "32px 28px" }}>
                  <div
                    className="font-[family-name:var(--font-gabarito)] font-semibold text-white"
                    style={{ fontSize: "clamp(2rem, 8vw, 3.5rem)", letterSpacing: "-0.045em", lineHeight: 1 }}
                  >
                    <RampCountUp to={s.val} suffix={s.suffix} />
                  </div>
                  <div
                    className="font-[family-name:var(--font-poppins)] font-semibold uppercase"
                    style={{ fontSize: 12, letterSpacing: "0.08em", marginTop: 10, color: "rgba(255,255,255,0.55)" }}
                  >
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════ CTA ══════════ */}
      <section className="bg-white text-center py-12 sm:py-[100px]">
        <div className="max-w-[1280px] mx-auto px-[clamp(20px,4vw,40px)]">
          <RevealOnScroll>
          <div className="relative max-w-[720px] mx-auto">
            {/* Radial glow */}
            <div
              className="absolute pointer-events-none"
              style={{
                top: -60, left: "50%", transform: "translateX(-50%)",
                width: 480, height: 240,
                background: "radial-gradient(ellipse, rgba(237,26,36,0.12), transparent 65%)",
                zIndex: 0,
              }}
            />
            <div className="relative" style={{ zIndex: 1 }}>
              {/* Eyebrow pill */}
              <div
                className="inline-flex items-center gap-2 bg-[#fdeced] border border-[rgba(237,26,36,0.18)] text-[#ed1a24] font-[family-name:var(--font-poppins)] font-bold uppercase"
                style={{ fontSize: 11, letterSpacing: "0.12em", padding: "6px 14px", borderRadius: 50, marginBottom: 22 }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full bg-[#ed1a24]"
                  style={{ animation: "ramp-pulse 1.8s ease-out infinite" }}
                />
                Ready to ramp up?
              </div>

              <h2
                className="font-[family-name:var(--font-gabarito)] font-semibold text-black"
                style={{ fontSize: "clamp(2.2rem, 3.6vw, 3rem)", letterSpacing: "-0.04em", lineHeight: 1.08, margin: "14px 0 18px" }}
              >
                Stop herding spreadsheets.
                <br />
                <span className="text-[#ed1a24]">Start placing faster.</span>
              </h2>

              <p
                className="font-[family-name:var(--font-poppins)] text-[#4b4b4d] mx-auto"
                style={{ fontSize: 17, lineHeight: 1.65, maxWidth: 460, margin: "0 auto 32px" }}
              >
                Join the TA teams already running their entire funnel on RAMP — no credit card, no migration headaches, no six-month rollout.
              </p>

              <div className="inline-flex items-center flex-wrap justify-center" style={{ gap: 14 }}>
                <ContactTrigger
                  className="inline-flex items-center gap-2.5 bg-[#ed1a24] text-white font-[family-name:var(--font-poppins)] font-semibold hover:bg-[#c8151e] transition-all hover:-translate-y-px h-[52px] px-[26px] text-[15px] rounded-[8px] shadow-[0px_4px_6px_rgba(236,34,40,0.3)]"
                >
                  Get Free Access
                  <span className="inline-flex items-center justify-center bg-black/90 rounded-full w-7 h-7">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                    </svg>
                  </span>
                </ContactTrigger>
              </div>
            </div>
          </div>
          </RevealOnScroll>
        </div>
      </section>
    </main>
  );
}
