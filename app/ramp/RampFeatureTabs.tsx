"use client";

import { useState } from "react";

const GROW_STYLE = `
  @keyframes ramp-grow {
    from { transform: scaleX(0); }
    to   { transform: scaleX(1); }
  }
`;

/* ─── Pipeline panel ─── */
function PipelinePanel() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {[
        { label: "Applied",   pct: 100, count: 248 },
        { label: "Screened",  pct: 72,  count: 178 },
        { label: "Interview", pct: 48,  count: 119 },
        { label: "Offer",     pct: 28,  count: 69  },
        { label: "Placed",    pct: 18,  count: 44  },
      ].map((s, i) => (
        <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 80, fontFamily: "Poppins, sans-serif", fontSize: 13, fontWeight: 600, color: "#1e293b", flexShrink: 0 }}>
            {s.label}
          </div>
          <div style={{ flex: 1, height: 28, background: "#fafafa", borderRadius: 6, position: "relative", overflow: "hidden" }}>
            <div style={{
              position: "absolute", inset: 0, width: `${s.pct}%`, borderRadius: 6,
              background: i === 0
                ? "linear-gradient(90deg, rgba(237,26,36,0.95), #ed1a24)"
                : `linear-gradient(90deg, #ed1a24, rgba(237,26,36,${0.95 - i * 0.12}))`,
              transform: "scaleX(0)",
              transformOrigin: "left",
              animation: `ramp-grow 1000ms ${i * 0.1}s cubic-bezier(0.23, 1, 0.32, 1) forwards`,
            }} />
            <span style={{ position: "absolute", left: 12, top: 0, bottom: 0, display: "flex", alignItems: "center", fontFamily: "Poppins, sans-serif", fontSize: 11, fontWeight: 600, color: "#fff", zIndex: 2 }}>
              {s.count}
            </span>
            <span style={{ position: "absolute", right: 10, top: 0, bottom: 0, display: "flex", alignItems: "center", fontFamily: "Gabarito, sans-serif", fontSize: 12, fontWeight: 600, color: "#1e293b" }}>
              {s.pct}%
            </span>
          </div>
        </div>
      ))}
      <div style={{ display: "flex", gap: 12, marginTop: 14, flexWrap: "wrap" }}>
        <span style={{ background: "#fde8ea", color: "#ed1a24", padding: "6px 12px", borderRadius: 999, fontSize: 11.5, fontWeight: 600, fontFamily: "Poppins, sans-serif", display: "inline-flex", alignItems: "center", gap: 6 }}>
          <span style={{ width: 6, height: 6, borderRadius: 999, background: "#ed1a24" }} />
          3 SLA breaches cleared today
        </span>
        <span style={{ background: "#f1f5f9", color: "#475569", padding: "6px 12px", borderRadius: 999, fontSize: 11.5, fontWeight: 500, fontFamily: "Poppins, sans-serif" }}>
          Avg. time-to-submit: 6.2 hrs
        </span>
      </div>
    </div>
  );
}

/* ─── AI Score panel ─── */
function AIScorePanel() {
  const tags = [
    { t: "React",      on: true,  c: "#ed1a24" },
    { t: "TypeScript", on: true,  c: "#ed1a24" },
    { t: "Node.js",    on: true,  c: "#ed1a24" },
    { t: "AWS",        on: true,  c: "#3b82f6" },
    { t: "PostgreSQL", on: true,  c: "#3b82f6" },
    { t: "Docker",     on: true,  c: "#3b82f6" },
    { t: "Kubernetes", on: false, c: "#94a3b8" },
  ];
  return (
    <div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 22 }}>
        {tags.map(({ t, on, c }) => (
          <span key={t} style={{
            fontFamily: "Poppins, sans-serif", fontSize: 12, fontWeight: 600,
            padding: "6px 12px", borderRadius: 8,
            background: on ? `${c}14` : "#f1f5f9",
            color: on ? c : "#94a3b8",
            border: `1px solid ${on ? c + "30" : "#e2e8f0"}`,
            textDecoration: on ? "none" : "line-through",
            textDecorationColor: "#cbd5e1",
          }}>
            {t}
          </span>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,160px) 1fr", gap: 18, alignItems: "center", background: "#fef7f7", border: "1px solid rgba(237,26,36,0.18)", borderRadius: 16, padding: 22 }}>
        <div>
          <div style={{ fontFamily: "Poppins, sans-serif", fontSize: 10.5, fontWeight: 700, color: "#ed1a24", letterSpacing: "0.12em", textTransform: "uppercase" as const, marginBottom: 8 }}>JD Match Score</div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 4 }}>
            <span style={{ fontFamily: "Gabarito, sans-serif", fontSize: 64, fontWeight: 600, color: "#0f172a", lineHeight: 0.9, letterSpacing: "-0.05em" }}>87</span>
            <span style={{ fontFamily: "Gabarito, sans-serif", fontSize: 28, color: "#ed1a24", fontWeight: 600, paddingBottom: 4 }}>%</span>
          </div>
          <div style={{ marginTop: 8, fontFamily: "Poppins, sans-serif", fontSize: 12, color: "#64748b" }}>Strong match · 6 of 7 skills</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[
            { l: "Core skill alignment", v: "95%" },
            { l: "Experience depth",     v: "88%" },
            { l: "Location & comp fit",  v: "78%" },
          ].map((r) => (
            <div key={r.l} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontFamily: "Poppins, sans-serif", fontSize: 12.5 }}>
              <span style={{ color: "#475569" }}>{r.l}</span>
              <span style={{ fontFamily: "Gabarito, sans-serif", fontWeight: 700, color: "#ed1a24" }}>{r.v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Chat panel ─── */
function ChatPanel() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(0,0,0,0.06)", paddingBottom: 12, marginBottom: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ width: 36, height: 36, borderRadius: 999, background: "#ed1a24", color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontFamily: "Gabarito, sans-serif", fontWeight: 700, fontSize: 13 }}>PN</span>
          <div>
            <div style={{ fontFamily: "Gabarito, sans-serif", fontSize: 14, fontWeight: 600, color: "#0f172a" }}>Priya Nair</div>
            <div style={{ fontSize: 11, color: "#64748b", fontFamily: "Poppins, sans-serif" }}>WhatsApp · last seen 2m ago</div>
          </div>
        </div>
        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" as const, background: "#dcfce7", color: "#15803d", padding: "3px 9px", borderRadius: 999 }}>● Online</span>
      </div>
      <div style={{ alignSelf: "flex-start", maxWidth: "75%" }}>
        <div style={{ background: "#f8fafc", padding: "10px 14px", borderRadius: "14px 14px 14px 4px", fontFamily: "Poppins, sans-serif", fontSize: 13.5, color: "#1e293b", lineHeight: 1.5 }}>
          Hi! Could you share the interview details for tomorrow?
        </div>
        <div style={{ fontSize: 10.5, color: "#94a3b8", marginTop: 3, fontFamily: "Poppins, sans-serif" }}>11:42 AM</div>
      </div>
      <div style={{ alignSelf: "flex-end", maxWidth: "78%" }}>
        <div style={{ background: "#fde8ea", padding: "10px 14px", borderRadius: "14px 14px 4px 14px", border: "1px solid rgba(237,26,36,0.16)", fontFamily: "Poppins, sans-serif", fontSize: 13.5, color: "#1e293b", lineHeight: 1.5 }}>
          Hi Priya! Round 2 is at <strong>2:00 PM IST tomorrow</strong> with Anita Rao via Google Meet. Link&apos;s in your email.
        </div>
        <div style={{ fontSize: 10.5, color: "#94a3b8", marginTop: 3, fontFamily: "Poppins, sans-serif", textAlign: "right" as const }}>11:44 AM · ✓✓ Read</div>
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
        <span style={{ background: "#fff", border: "1px solid rgba(0,0,0,0.1)", padding: "6px 12px", borderRadius: 999, fontSize: 11, color: "#475569", fontFamily: "Poppins, sans-serif" }}>📎 Interview brief</span>
        <span style={{ background: "#fff", border: "1px solid rgba(0,0,0,0.1)", padding: "6px 12px", borderRadius: 999, fontSize: 11, color: "#475569", fontFamily: "Poppins, sans-serif" }}>📅 Calendar invite</span>
        <span style={{ background: "#fff", border: "1px solid rgba(237,26,36,0.3)", padding: "6px 12px", borderRadius: 999, fontSize: 11, color: "#ed1a24", fontWeight: 600, fontFamily: "Poppins, sans-serif" }}>+ Template</span>
      </div>
    </div>
  );
}

/* ─── Client portal panel ─── */
function ClientPortalPanel() {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div>
          <div style={{ fontFamily: "Gabarito, sans-serif", fontSize: 16, fontWeight: 600, color: "#0f172a" }}>Senior Engineer · Shortlist</div>
          <div style={{ fontFamily: "Poppins, sans-serif", fontSize: 12, color: "#94a3b8", marginTop: 2 }}>Shared with Anita Rao · Acme Inc. · 5 candidates</div>
        </div>
        <span style={{ fontSize: 11, fontFamily: "Poppins, sans-serif", fontWeight: 600, color: "#15803d", background: "#dcfce7", padding: "4px 10px", borderRadius: 999 }}>● 3 of 5 reviewed</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {[
          { name: "Priya Nair",  score: 87, status: "Move forward", col: "#15803d", bg: "#dcfce7", q: '"Strong systems thinking. Move to onsite."' },
          { name: "Tara Bose",   score: 92, status: "Move forward", col: "#15803d", bg: "#dcfce7", q: '"Best candidate so far."' },
          { name: "Rohit Kumar", score: 79, status: "Pass",         col: "#dc2626", bg: "#fee2e2", q: '"Solid, but not for this level."' },
          { name: "Arjun Mehta", score: 81, status: "Pending",      col: "#d97706", bg: "#fef3c7", q: null },
          { name: "Neha Singh",  score: 76, status: "Pending",      col: "#d97706", bg: "#fef3c7", q: null },
        ].map((c) => (
          <div key={c.name} style={{ border: "1px solid rgba(0,0,0,0.06)", borderRadius: 12, padding: "12px 14px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1, minWidth: 0 }}>
              <span style={{ width: 32, height: 32, borderRadius: 999, background: "#ed1a24", color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontFamily: "Gabarito, sans-serif", fontWeight: 700, fontSize: 11 }}>
                {c.name.split(" ").map((s) => s[0]).join("")}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: "Gabarito, sans-serif", fontSize: 13, fontWeight: 600, color: "#0f172a" }}>{c.name}</div>
                {c.q && <div style={{ fontFamily: "Poppins, sans-serif", fontSize: 11.5, color: "#64748b", fontStyle: "italic", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.q}</div>}
              </div>
            </div>
            <div style={{ fontFamily: "Gabarito, sans-serif", fontSize: 14, fontWeight: 700, color: "#ed1a24", flexShrink: 0 }}>{c.score}%</div>
            <span style={{ background: c.bg, color: c.col, padding: "4px 10px", borderRadius: 999, fontSize: 10.5, fontFamily: "Poppins, sans-serif", fontWeight: 600, whiteSpace: "nowrap" as const, flexShrink: 0 }}>{c.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Feature data ─── */
const FEATURES = [
  {
    num: "01",
    eyebrow: "PIPELINE MANAGEMENT",
    title: "A pipeline that moves",
    desc: "Drag candidates across stages, watch SLA timers count down, and let the leaderboard quietly do its job.",
    bullets: [
      "Stage-wise SLA timers + breach alerts",
      "Leaderboards by recruiter, role, or client",
      "Auto-archive after configurable inactivity",
    ],
    Panel: PipelinePanel,
  },
  {
    num: "02",
    eyebrow: "AI MATCH SCORING",
    title: "AI scoring you can trust",
    desc: "No black box. We show you the skills it matched, the ones it didn't, and why this candidate scored an 87.",
    bullets: [
      "JD-aware skill extraction from any CV format",
      "Transparent weighting — see what counted",
      "Bulk score 200+ CVs in under a minute",
    ],
    Panel: AIScorePanel,
  },
  {
    num: "03",
    eyebrow: "CANDIDATE COMMUNICATION",
    title: "WhatsApp & email, native",
    desc: "Templates with delivery receipts, full conversation history, and every message auto-logged to the candidate timeline.",
    bullets: [
      "Two-way WhatsApp Business API integration",
      "Shared inbox across recruiters with @mentions",
      "Smart templates with variable substitution",
    ],
    Panel: ChatPanel,
  },
  {
    num: "04",
    eyebrow: "CLIENT / STAKEHOLDER PORTAL",
    title: "Hiring managers, in the loop",
    desc: 'Share shortlists with one link. Collect structured feedback. No more "did you see the email I sent?" check-ins.',
    bullets: [
      "Branded shortlist links — no login required",
      "Structured feedback forms with ratings",
      "Auto-nudges when feedback is overdue",
    ],
    Panel: ClientPortalPanel,
  },
] as const;

export default function RampFeatureTabs() {
  const [active, setActive] = useState(0);
  const F = FEATURES[active];

  return (
    <section id="features" className="bg-white py-12 sm:py-[100px]">
      <style>{GROW_STYLE}</style>
      <div className="max-w-[1280px] mx-auto px-[clamp(20px,4vw,40px)]">
        {/* Section eyebrow */}
        <div
          className="inline-flex items-center gap-2.5 font-[family-name:var(--font-poppins)] font-bold uppercase text-[#ed1a24]"
          style={{ fontSize: 12, letterSpacing: "0.14em", marginBottom: 14 }}
        >
          <span className="inline-block bg-[#ed1a24] rounded-[2px]" style={{ width: 18, height: 2 }} />
          Built for how you work
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
              textWrap: "balance" as React.CSSProperties["textWrap"],
            }}
          >
            Four tools, one workspace.
            <br />
            <span className="text-[#ed1a24]">Zero context switching.</span>
          </h2>
          <p
            className="font-[family-name:var(--font-poppins)] text-[#4b4b4d]"
            style={{ fontSize: 17, lineHeight: 1.65, margin: 0, maxWidth: 560 }}
          >
            RAMP replaces the spreadsheet, the WhatsApp group, the ATS export, and the calendar dance — without asking you to learn a new way of working.
          </p>
        </div>

        {/* Tabs + panel */}
        <div className="flex flex-col lg:grid lg:items-stretch gap-6 lg:gap-14" style={{ gridTemplateColumns: "360px minmax(0,1fr)" }}>
          {/* Tab list */}
          <div className="flex flex-row lg:flex-col overflow-x-auto gap-3 lg:gap-[14px] pb-1 lg:pb-0 -mx-5 px-5 lg:mx-0 lg:px-0" style={{ scrollbarWidth: "none" }}>
            {FEATURES.map((f, i) => (
              <button
                key={f.num}
                type="button"
                onClick={() => setActive(i)}
                className="relative text-left w-[240px] lg:w-full flex-shrink-0 lg:flex-shrink border transition-all duration-[220ms]"
                style={{
                  borderRadius: 14,
                  padding: "14px 16px",
                  background: "#fff",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  borderColor: i === active ? "rgba(237,26,36,0.4)" : "rgba(0,0,0,0.08)",
                  boxShadow: i === active ? "0 18px 50px rgba(237,26,36,0.10)" : "none",
                }}
              >
                {/* Active left bar */}
                {i === active && (
                  <span
                    className="absolute left-0 bg-[#ed1a24] rounded-r-[4px]"
                    style={{ top: 14, bottom: 14, width: 4 }}
                  />
                )}
                <div
                  className="font-[family-name:var(--font-gabarito)] font-bold"
                  style={{
                    fontSize: 12,
                    color: i === active ? "#ed1a24" : "#9c9c9c",
                    letterSpacing: "0.04em",
                  }}
                >
                  {f.num} · {f.eyebrow}
                </div>
                <h4
                  className="font-[family-name:var(--font-gabarito)] font-semibold"
                  style={{
                    fontSize: 18,
                    color: "#0a0a0a",
                    letterSpacing: "-0.015em",
                    margin: "6px 0 6px",
                  }}
                >
                  {f.title}
                </h4>
                <p
                  className="font-[family-name:var(--font-poppins)] text-[#66686d]"
                  style={{ margin: 0, fontSize: 13, lineHeight: 1.6 }}
                >
                  {f.desc}
                </p>
              </button>
            ))}
          </div>

          {/* Active panel */}
          <div
            key={active}
            className="bg-white border border-black/[0.08] flex flex-col p-5 sm:p-9"
            style={{
              borderRadius: 20,
              boxShadow: "0 18px 60px rgba(17,35,89,0.06)",
              minHeight: 380,
            }}
          >
            {/* Panel header: eyebrow+title left, bullets right (stacks on mobile) */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6">
              <div>
                <div
                  className="font-[family-name:var(--font-poppins)] font-bold uppercase text-[#ed1a24]"
                  style={{ fontSize: 11, letterSpacing: "0.14em", marginBottom: 8 }}
                >
                  {F.eyebrow}
                </div>
                <h3
                  className="font-[family-name:var(--font-gabarito)] font-semibold text-[#0f172a]"
                  style={{ fontSize: 28, letterSpacing: "-0.025em", margin: 0 }}
                >
                  {F.title}
                </h3>
              </div>
              <div
                className="font-[family-name:var(--font-poppins)] text-[#475569] flex flex-col items-end"
                style={{ gap: 8, fontSize: 13 }}
              >
                {F.bullets.map((b) => (
                  <div key={b} className="flex items-center gap-2">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ed1a24" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    {b}
                  </div>
                ))}
              </div>
            </div>

            {/* Panel content */}
            <div style={{ flex: 1 }}>
              <F.Panel />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
