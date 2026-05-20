"use client";

import React, { useEffect, useRef, useState } from "react";
import type { ReactNode, CSSProperties } from "react";
import RevealOnScroll from "@/components/anim/RevealOnScroll";

// ─── Keyframes ────────────────────────────────────────────────────────────────
const KEYFRAMES = `
@keyframes te-pulse {
  0%,100% { box-shadow: 0 0 0 0 rgba(237,26,36,.32); }
  50%     { box-shadow: 0 0 0 6px rgba(237,26,36,0); }
}
@keyframes te-livepulse {
  0%   { box-shadow: 0 0 0 0   rgba(34,197,94,.5); }
  100% { box-shadow: 0 0 0 8px rgba(34,197,94,0); }
}
@keyframes te-breathe {
  0%,100% { transform:scale(1);    box-shadow:0 18px 40px rgba(237,26,36,.45),0 0 0 8px  rgba(237,26,36,.08); }
  50%     { transform:scale(1.04); box-shadow:0 22px 50px rgba(237,26,36,.55),0 0 0 14px rgba(237,26,36,.04); }
}
@keyframes te-spin { to { transform: rotate(360deg); } }
.te-plus-btn {
  position:relative; width:92px; height:92px; border-radius:50%;
  background:#ed1a24; color:#fff; display:flex; align-items:center;
  justify-content:center; font-size:64px; font-weight:700; line-height:1;
  animation: te-breathe 3.6s ease-in-out infinite; z-index:2; flex-shrink:0;
}
.te-plus-btn::before {
  content:''; position:absolute; inset:-28px; border-radius:50%;
  border:1px dashed rgba(237,26,36,.32);
  animation: te-spin 28s linear infinite;
}
.te-equals-box::after {
  content:''; position:absolute; inset:0; border-radius:inherit;
  background: radial-gradient(circle at 50% 120%, rgba(237,26,36,.45), transparent 60%);
  pointer-events:none;
}
.te-outcome-panel::after {
  content:''; position:absolute; inset:0; border-radius:inherit;
  background:
    radial-gradient(circle at 100% 0%, rgba(237,26,36,.22), transparent 50%),
    radial-gradient(circle at 0%   100%, rgba(237,26,36,.10), transparent 40%);
  pointer-events:none;
}
`;

// ─── Icons ────────────────────────────────────────────────────────────────────
const IconBolt = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M13 2 4 14h7l-1 8 9-12h-7l1-8z"/></svg>;
const IconBars = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="13" width="4" height="8" rx="1"/><rect x="10" y="8" width="4" height="13" rx="1"/><rect x="17" y="3" width="4" height="18" rx="1"/></svg>;
const IconChat = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M4 5a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3h-5l-5 4v-4H7a3 3 0 0 1-3-3V5z"/></svg>;
const IconVideo = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><rect x="2" y="6" width="14" height="12" rx="2"/><path d="M22 7v10l-5-3V10l5-3z"/></svg>;
const IconBriefcase = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" stroke="white" strokeWidth="2" fill="none"/></svg>;
const IconEye = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3" fill="white"/></svg>;
const IconChatBubble = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M4 4h16a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-9l-5 4v-4H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"/></svg>;
const IconHandshake = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M3 11l4-4 3 2 4-4 4 4 3-1v6l-4 4-3-2-4 3-3-2-4 1V11z"/></svg>;

// ─── FeatureRow ───────────────────────────────────────────────────────────────
interface FeatureRowProps {
  icon: ReactNode;
  label: string;
  sub: string;
  meta: string;
  dark?: boolean;
  isLast?: boolean;
}
function FeatureRow({ icon, label, sub, meta, dark, isLast }: FeatureRowProps) {
  const borderColor = dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)";
  const rowStyle: CSSProperties = {
    display: "grid",
    gridTemplateColumns: "36px 1fr auto",
    alignItems: "center",
    gap: 12,
    padding: "12px 0",
    borderTop: `1px solid ${borderColor}`,
    borderBottom: isLast ? `1px solid ${borderColor}` : undefined,
  };
  return (
    <li style={rowStyle}>
      <div style={{ width: 36, height: 36, borderRadius: 9, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: dark ? "#0d1427" : "#ed1a24", color: "#fff" }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.3, color: dark ? "rgba(255,255,255,0.92)" : "#000" }}>{label}</div>
        <div style={{ fontSize: 12, marginTop: 2, fontWeight: 500, color: dark ? "rgba(255,255,255,0.48)" : "#66686d" }}>{sub}</div>
      </div>
      <div style={{ fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", color: dark ? "rgba(255,255,255,0.5)" : "#66686d", fontFamily: "var(--font-gabarito), sans-serif" }}>
        {meta}
      </div>
    </li>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function TalentEquationSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [aiCount, setAiCount] = useState(1247829);
  const [humanCount, setHumanCount] = useState(86421);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let timer: ReturnType<typeof setInterval> | null = null;
    const tick = () => {
      setAiCount((n) => n + Math.floor(Math.random() * 9) + 2);
      setHumanCount((n) => n + (Math.random() > 0.6 ? 1 : 0));
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) { if (!timer) timer = setInterval(tick, 1400); }
          else { if (timer) { clearInterval(timer); timer = null; } }
        });
      },
      { threshold: 0.05 }
    );
    observer.observe(el);
    return () => { observer.disconnect(); if (timer) clearInterval(timer); };
  }, []);

  const fmt = (n: number) => n.toLocaleString("en-IN");

  const cardBase: CSSProperties = {
    borderRadius: 24, boxShadow: "0 18px 50px rgba(17,35,89,0.05)",
    padding: "24px 20px 22px",
  };

  return (
    <section ref={sectionRef} className="bg-white py-14 sm:py-24">
      <style>{KEYFRAMES}</style>
      <div style={{ maxWidth: 1340, margin: "0 auto", padding: "0 clamp(16px,4vw,24px)" }}>

        {/* ── HEADER ── */}
        <RevealOnScroll>
          <div className="text-center" style={{ maxWidth: 980, margin: "0 auto 40px" }}>
            <span className="inline-flex items-center rounded-full bg-[#ed1a24] px-4 py-2 text-[12px] font-bold uppercase tracking-[0.04em] text-white shadow-[0_8px_24px_rgba(237,26,36,0.22)]">
              MERITO&apos;S APPROACH
            </span>
            <h2
              className="font-[family-name:var(--font-gabarito)] text-black"
              style={{ fontSize: "clamp(2.1rem,5vw,4rem)", lineHeight: 1.04, fontWeight: 600, letterSpacing: "-0.035em", margin: "28px 0 24px", textWrap: "balance" as CSSProperties["textWrap"] }}
            >
              A new math for hiring:{" "}
              <span className="text-[#ed1a24]">AI speed</span>{" "}
              <span style={{ color: "#c4c4c4" }}>+</span>{" "}
              <span className="text-[#ed1a24]">human judgement</span>
            </h2>
            <p
              className="font-[family-name:var(--font-poppins)] text-[#4b4b4d] mx-auto"
              style={{ fontSize: "clamp(15px,2vw,19px)", lineHeight: 1.6, fontWeight: 500, maxWidth: 760 }}
            >
              Most platforms make you pick a side. Merito runs both — algorithmic horsepower paired with two decades of recruiter craft, working the same shortlist, in real time.
            </p>
          </div>
        </RevealOnScroll>

        {/* ── EQUATION ROW ── */}
        <RevealOnScroll delay={0.1}>
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_92px_1fr]" style={{ alignItems: "stretch" }}>

            {/* LEFT: dark AI card */}
            <article
              className="font-[family-name:var(--font-poppins)]"
              style={{ ...cardBase, background: "#0a0a0a", color: "#fff", border: "1px solid rgba(255,255,255,0.06)" }}
            >
              <span style={{ display: "inline-flex", alignItems: "center", gap: 8, borderRadius: 50, border: "1px solid rgba(237,26,36,0.3)", background: "rgba(237,26,36,0.14)", padding: "6px 14px", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#ff8a92" }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#ed1a24", animation: "te-pulse 1.6s ease-in-out infinite", flexShrink: 0, display: "inline-block" }} />
                Artificial Intelligence
              </span>
              <h3 className="font-[family-name:var(--font-gabarito)] text-white" style={{ fontSize: "clamp(22px,2.5vw,32px)", lineHeight: 1.1, fontWeight: 600, letterSpacing: "-0.025em", margin: "18px 0 14px", textWrap: "balance" as CSSProperties["textWrap"] }}>
                The horsepower of a million resumes.
              </h3>
              <p style={{ fontSize: 15, lineHeight: 1.65, fontWeight: 500, color: "rgba(255,255,255,0.66)", margin: "0 0 28px" }}>
                Proprietary models trained on millions of profiles, conversations and outcomes — sourcing, screening and ranking 24×7, without bias or fatigue.
              </p>
              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 24px" }}>
                <FeatureRow dark icon={<IconBolt />}  label="Multi-channel sourcing"   sub="LinkedIn · Naukri · Job boards · Referrals" meta="~9 sec / profile" />
                <FeatureRow dark icon={<IconBars />}  label="Context-aware ranking"    sub="Skills · trajectory · intent · fit"         meta="200+ signals" />
                <FeatureRow dark icon={<IconChat />}  label="AI agent screening"        sub="Voice + chat, structured & scored"          meta="24×7" />
                <FeatureRow dark icon={<IconVideo />} label="Async video interviews"    sub="Auto-transcribed and rubric-scored"         meta="Verified" isLast />
              </ul>
              <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 12.5, fontWeight: 600, color: "rgba(255,255,255,0.62)" }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e", flexShrink: 0, animation: "te-livepulse 1.4s ease-out infinite", display: "inline-block" }} />
                <span>
                  <span style={{ fontFamily: "var(--font-gabarito), sans-serif", color: "#fff", fontWeight: 600 }}>{fmt(aiCount)}</span>
                  {" "}profiles processed this month
                </span>
              </div>
            </article>

            {/* CENTER: + operator */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "20px 0" }}>
              <div className="te-plus-btn font-[family-name:var(--font-gabarito)]" aria-hidden="true">+</div>
            </div>

            {/* RIGHT: light human card */}
            <article
              className="font-[family-name:var(--font-poppins)]"
              style={{ ...cardBase, background: "#fff", color: "#000", border: "1px solid rgba(0,0,0,0.08)" }}
            >
              <span style={{ display: "inline-flex", alignItems: "center", gap: 8, borderRadius: 50, border: "1px solid rgba(237,26,36,0.22)", background: "#fdeced", padding: "6px 14px", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#ed1a24" }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#ed1a24", animation: "te-pulse 1.6s ease-in-out infinite", flexShrink: 0, display: "inline-block" }} />
                Acquired Intelligence
              </span>
              <h3 className="font-[family-name:var(--font-gabarito)] text-black" style={{ fontSize: "clamp(22px,2.5vw,32px)", lineHeight: 1.1, fontWeight: 600, letterSpacing: "-0.025em", margin: "18px 0 14px", textWrap: "balance" as CSSProperties["textWrap"] }}>
                The instinct of 20 years on the floor.
              </h3>
              <p style={{ fontSize: 15, lineHeight: 1.65, fontWeight: 500, color: "#4b4b4d", margin: "0 0 28px" }}>
                Senior recruiters who&apos;ve placed in fintech, SaaS, retail and beyond — calibrating briefs, reading between resumes, and closing the candidate.
              </p>
              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 24px" }}>
                <FeatureRow icon={<IconBriefcase />}  label="Calibration brief"          sub="Hiring manager sync · must-haves · red flags"  meta="Day 1" />
                <FeatureRow icon={<IconEye />}         label="Human shortlist review"     sub="Every AI shortlist, gut-checked"                meta="100%" />
                <FeatureRow icon={<IconChatBubble />}  label="Candidate advocacy"         sub="Counter-offer coaching · expectation setting"   meta="Pre-close" />
                <FeatureRow icon={<IconHandshake />}   label="Offer-to-join shepherding"  sub="Doc collection · backchannel · day-zero"       meta="Until D-30" isLast />
              </ul>
              <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 12.5, fontWeight: 600, color: "#5f6166" }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e", flexShrink: 0, animation: "te-livepulse 1.4s ease-out infinite", display: "inline-block" }} />
                <span>
                  <span style={{ fontFamily: "var(--font-gabarito), sans-serif", color: "#000", fontWeight: 600 }}>{fmt(humanCount)}</span>
                  {" "}recruiter touchpoints logged
                </span>
              </div>
            </article>
          </div>
        </RevealOnScroll>

        {/* ── OUTCOME STRIP ── */}
        <RevealOnScroll delay={0.15}>
          <div className="mt-9 grid grid-cols-1 lg:grid-cols-[92px_1fr]" style={{ gap: 16 }}>

            {/* = box — desktop only */}
            <div
              className="te-equals-box font-[family-name:var(--font-gabarito)] text-white hidden lg:flex"
              style={{ background: "#0a0a0a", borderRadius: 24, alignItems: "center", justifyContent: "center", fontSize: 56, fontWeight: 700, lineHeight: 1, position: "relative", overflow: "hidden" }}
              aria-hidden="true"
            >=</div>

            {/* Outcome panel */}
            <div
              className="te-outcome-panel font-[family-name:var(--font-poppins)]"
              style={{
                background: "#0a0a0a", borderRadius: 24,
                padding: "24px 28px",
                color: "#fff",
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* Headline — full width */}
              <div style={{ position: "relative", zIndex: 1, maxWidth: 860 }}>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "#ed1a24", marginBottom: 12 }}>
                  Compounding Outcome
                </div>
                <div className="font-[family-name:var(--font-gabarito)]" style={{ fontSize: "clamp(22px,3vw,40px)", fontWeight: 600, lineHeight: 1.1, letterSpacing: "-0.025em", textWrap: "balance" as CSSProperties["textWrap"] }}>
                  Shortlists that <span style={{ color: "#ed1a24" }}>arrive in hours</span>{" "}
                  and <span style={{ color: "#ed1a24" }}>join in weeks</span>.
                </div>
              </div>
            </div>

          </div>
        </RevealOnScroll>

      </div>
    </section>
  );
}
