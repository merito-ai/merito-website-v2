"use client";

import { motion, AnimatePresence } from "motion/react";
import { useEffect, useState } from "react";

type AgentId = "scout" | "raven" | "vox" | "lens" | "brief" | "ping";

interface Agent {
  id: AgentId;
  code: string;
  codename: string;
  name: string;
  blurb: string;
  status: string;
  statusColor: string;
  streamPrefix: string;
  feed: string[];
  metric: { value: string; label: string };
}

const AGENTS: Agent[] = [
  {
    id: "scout",
    code: "01",
    codename: "SCOUT",
    name: "Multi-Channel Sourcing",
    blurb: "Finds the right candidates before your competitors do.",
    status: "SCANNING",
    statusColor: "#22c55e",
    streamPrefix: "github.com/",
    feed: [
      "matched a Staff Eng at Razorpay (8y, payments)",
      "pulled 412 profiles from LinkedIn ‹Sr PM, fintech›",
      "flagged silent leaver: VP Eng, Cred",
      "cross-checked 38 GitHub commit graphs",
      "detected new posting at competitor — Slice",
    ],
    metric: { value: "1,247", label: "profiles / hr" },
  },
  {
    id: "raven",
    code: "02",
    codename: "RAVEN",
    name: "AI Resume Sourcing",
    blurb: "Reads 300 resumes so your team reads three.",
    status: "READING",
    statusColor: "#3b82f6",
    streamPrefix: "resume → ",
    feed: [
      "Arun Kumar · 87% fit · shortlisted",
      "Priya Mehta · 91% fit · shortlisted",
      "Swathi Killi · 94% fit · shortlisted",
      "Mahesh Rao · 99% fit · ★ exceptional",
      "rejected 218 below threshold",
    ],
    metric: { value: "94%", label: "top-shortlist precision" },
  },
  {
    id: "vox",
    code: "03",
    codename: "VOX",
    name: "AI Agent Screening",
    blurb: "Calls, follows up & books — 24/7. Outreach that never sleeps.",
    status: "ON A CALL",
    statusColor: "#ed1a24",
    streamPrefix: "+91 ",
    feed: [
      "98••• Stephen Rogs — interview confirmed 10AM",
      "76••• Akash Naidu — rescheduled to Thu",
      "93••• Riya Singh — voicemail dropped",
      "88••• Vivek Iyer — booked screening",
      "70••• 14 callbacks queued",
    ],
    metric: { value: "02:34", label: "avg. call length" },
  },
  {
    id: "lens",
    code: "04",
    codename: "LENS",
    name: "AI Video Interview",
    blurb: "Runs hundreds of technical interviews — without a single interviewer.",
    status: "LISTENING",
    statusColor: "#a855f7",
    streamPrefix: "live → ",
    feed: [
      "Adarsh V · technical depth 100%",
      "Adarsh V · problem solving 86%",
      "Adarsh V · communication 92%",
      "follow-up: \"explain garbage collection\"",
      "transcript saved · 38 min",
    ],
    metric: { value: "12", label: "interviews running" },
  },
  {
    id: "brief",
    code: "05",
    codename: "BRIEF",
    name: "Candidate Brief",
    blurb: "Your sharpest interviewer, now with an AI whispering in their ear.",
    status: "DRAFTING",
    statusColor: "#f59e0b",
    streamPrefix: "brief #",
    feed: [
      "0421 · Priya M. · Big-5 + sourcing 84/100",
      "0422 · Arun K. · risk: comp gap 18%",
      "0423 · Mahesh R. · culture: ★★★★★",
      "0424 · ready for hiring panel review",
      "0425 · ★ exec summary, 1 page",
    ],
    metric: { value: "84/100", label: "sourcing score" },
  },
  {
    id: "ping",
    code: "06",
    codename: "PING",
    name: "WhatsApp Engagement",
    blurb: "Candidates don't check email. They check WhatsApp — so we do too.",
    status: "TYPING",
    statusColor: "#10b981",
    streamPrefix: "wa → ",
    feed: [
      "Akash: \"Yes, tell me more!\"",
      "sent: role at TechCorp · 26–35 LPA",
      "Akash: \"Remote-first?\"",
      "sent: yes — share your resume?",
      "37 active threads · 0 unread",
    ],
    metric: { value: "11s", label: "median reply time" },
  },
];

function StatusDot({ color, size = 8 }: { color: string; size?: number }) {
  return (
    <span className="relative inline-block" style={{ width: size, height: size }}>
      <span
        className="absolute inset-0 rounded-full"
        style={{ background: color, animation: "merito-pulse 1.6s ease-out infinite", color }}
      />
      <span className="relative block rounded-full" style={{ width: size, height: size, background: color }} />
    </span>
  );
}

function useTicker<T>(items: T[], delay = 2400): T {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((x) => (x + 1) % items.length), delay);
    return () => clearInterval(t);
  }, [items.length, delay]);
  return items[i];
}

function AgentPortrait({ agent, size = 172 }: { agent: Agent; size?: number }) {
  switch (agent.id) {
    case "scout":
      return (
        <svg viewBox="0 0 200 200" width={size} height={size}>
          <defs>
            <radialGradient id={`apg-${agent.id}`} cx="50%" cy="50%" r="60%">
              <stop offset="0%" stopColor="#ed1a24" stopOpacity=".25" />
              <stop offset="100%" stopColor="#ed1a24" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="200" height="200" fill="#0a0a0a" />
          <circle cx="100" cy="100" r="92" fill={`url(#apg-${agent.id})`} />
          {[20, 38, 58, 78].map((r, i) => (
            <circle key={i} cx="100" cy="100" r={r} fill="none" stroke="#ffffff" strokeOpacity={0.18 + i * 0.04} />
          ))}
          <g style={{ transformOrigin: "100px 100px", animation: "ap-sweep 4s linear infinite" }}>
            <path d="M100 100 L100 8 A92 92 0 0 1 188 130 Z" fill="#ed1a24" fillOpacity=".18" />
            <line x1="100" y1="100" x2="100" y2="8" stroke="#ed1a24" strokeWidth="1.5" />
          </g>
          <circle cx="148" cy="68" r="2.5" fill="#ed1a24" />
          <circle cx="64" cy="142" r="2.5" fill="#ffffff" />
          <circle cx="130" cy="148" r="2.5" fill="#ffffff" fillOpacity=".6" />
          <circle cx="70" cy="74" r="2" fill="#ed1a24" fillOpacity=".7" />
          <circle cx="100" cy="100" r="3" fill="#ffffff" />
        </svg>
      );
    case "raven":
      return (
        <svg viewBox="0 0 200 200" width={size} height={size}>
          <rect width="200" height="200" fill="#0a0a0a" />
          <g transform="translate(36 28)">
            {Array.from({ length: 11 }).map((_, i) => {
              const isHit = i === 5;
              return (
                <g key={i}>
                  <rect
                    x="0" y={i * 13}
                    width={isHit ? 128 : 100 + (i % 3) * 14}
                    height={isHit ? 9 : 4}
                    rx={isHit ? 2 : 1.5}
                    fill={isHit ? "#ed1a24" : "#ffffff"}
                    opacity={isHit ? 1 : 0.18 + (i % 4) * 0.08}
                  />
                  {isHit && (
                    <text x={134} y={i * 13 + 8} fontFamily="Gabarito" fontSize="11" fill="#ed1a24" fontWeight="700">
                      99%
                    </text>
                  )}
                </g>
              );
            })}
          </g>
          <rect x="30" y="92" width="140" height="18" rx="3" fill="none" stroke="#ed1a24" strokeWidth="1.2" strokeDasharray="3 3" />
        </svg>
      );
    case "vox": {
      const bars = [10, 24, 38, 50, 32, 60, 44, 22, 56, 40, 28, 48, 18, 32, 26, 44, 30, 18, 36, 22];
      return (
        <svg viewBox="0 0 200 200" width={size} height={size}>
          <rect width="200" height="200" fill="#0a0a0a" />
          <g transform="translate(12 100)">
            {bars.map((h, i) => (
              <rect
                key={i} x={i * 9} y={-h / 2} width="4" height={h} rx="2"
                fill={i === 5 || i === 13 ? "#ed1a24" : "#ffffff"}
                opacity={i === 5 || i === 13 ? 1 : 0.7}
              >
                <animate
                  attributeName="height"
                  values={`${h};${h * 0.4};${h};${h * 1.3};${h}`}
                  dur={`${1.4 + (i % 4) * 0.2}s`}
                  repeatCount="indefinite"
                />
              </rect>
            ))}
          </g>
          <text x="20" y="40" fontFamily="Gabarito" fontSize="11" fill="#ffffff" opacity=".6" letterSpacing="2">+91 98••• ••••</text>
          <text x="20" y="172" fontFamily="Gabarito" fontSize="11" fill="#ed1a24" fontWeight="700" letterSpacing="1">● LIVE · 02:34</text>
        </svg>
      );
    }
    case "lens":
      return (
        <svg viewBox="0 0 200 200" width={size} height={size}>
          <rect width="200" height="200" fill="#0a0a0a" />
          <g transform="translate(100 100)">
            {[0, 60, 120, 180, 240, 300].map((deg, i) => (
              <g key={i} transform={`rotate(${deg})`}>
                <path d="M 0 -70 L 60 -10 L 0 0 Z" fill={i === 0 ? "#ed1a24" : "#ffffff"} fillOpacity={i === 0 ? 0.9 : 0.12 + i * 0.04} />
              </g>
            ))}
            <circle r="14" fill="#0a0a0a" />
            <circle r="14" fill="none" stroke="#ed1a24" strokeWidth="1.5" />
            <circle r="3" fill="#ed1a24">
              <animate attributeName="r" values="3;5;3" dur="2s" repeatCount="indefinite" />
            </circle>
          </g>
          <text x="14" y="190" fontFamily="Gabarito" fontSize="10" fill="#ffffff" opacity=".5" letterSpacing="2">REC · 00:38:14</text>
        </svg>
      );
    case "brief":
      return (
        <svg viewBox="0 0 200 200" width={size} height={size}>
          <rect width="200" height="200" fill="#0a0a0a" />
          <g transform="translate(22 140)">
            {[60, 92, 44, 76, 30, 88, 52].map((h, i) => (
              <rect
                key={i} x={i * 16} y={-h} width="10" height={h} rx="2"
                fill={i === 1 || i === 5 ? "#ed1a24" : "#ffffff"}
                opacity={i === 1 || i === 5 ? 1 : 0.25 + (i % 3) * 0.1}
              />
            ))}
          </g>
          <g transform="translate(155 60)">
            <polygon points="0,-32 28,-10 22,24 -22,24 -28,-10" fill="none" stroke="#ffffff" strokeOpacity=".3" />
            <polygon points="0,-22 20,-6 14,18 -16,16 -22,-4" fill="#ed1a24" fillOpacity=".45" stroke="#ed1a24" />
          </g>
          <text x="22" y="32" fontFamily="Gabarito" fontSize="11" fill="#ed1a24" fontWeight="700" letterSpacing="1">SCORE 84/100</text>
        </svg>
      );
    case "ping":
      return (
        <svg viewBox="0 0 200 200" width={size} height={size}>
          <rect width="200" height="200" fill="#0a0a0a" />
          <g transform="translate(168 46)" stroke="#10b981" fill="none">
            <path d="M -16 0 A 16 16 0 0 1 0 -16" strokeOpacity=".4" />
            <path d="M -26 0 A 26 26 0 0 1 0 -26" strokeOpacity=".7" />
            <path d="M -36 0 A 36 36 0 0 1 0 -36" />
          </g>
          <g transform="translate(16 72)">
            <rect width="158" height="30" rx="14" fill="#ffffff" opacity=".08" />
            <text x="12" y="20" fontFamily="Gabarito" fontSize="9.5" fill="#ffffff" opacity=".85">Senior Dev role · 26–35 LPA</text>
          </g>
          <g transform="translate(38 116)">
            <rect width="128" height="30" rx="14" fill="#10b981" opacity=".18" />
            <rect width="128" height="30" rx="14" fill="none" stroke="#10b981" strokeOpacity=".5" />
            <text x="14" y="20" fontFamily="Gabarito" fontSize="9.5" fill="#10b981">Yes — tell me more!</text>
          </g>
          <text x="16" y="182" fontFamily="Gabarito" fontSize="10" fill="#ed1a24" fontWeight="700" letterSpacing="1">● 37 ACTIVE THREADS</text>
        </svg>
      );
    default:
      return null;
  }
}

function AgentCard({ agent }: { agent: Agent }) {
  const line = useTicker(agent.feed, 2400 + (parseInt(agent.code) % 5) * 120);

  return (
    <motion.article
      whileHover={{ y: -6 }}
      transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
      className="group relative overflow-hidden rounded-[16px] sm:rounded-[22px] bg-white border border-black/[0.06] shadow-[0_18px_50px_rgba(17,35,89,0.04)] hover:shadow-[0_28px_70px_rgba(237,26,36,0.10),0_8px_18px_rgba(0,0,0,0.05)] transition-shadow duration-300"
    >
      <div className="relative h-[180px] sm:h-[232px] bg-[#0a0a0a] flex items-center justify-center overflow-hidden">
        <div className="absolute top-0 right-0 border-t-[28px] sm:border-t-[36px] border-t-[#ed1a24] border-l-[28px] sm:border-l-[36px] border-l-transparent z-10" />

        <div className="absolute top-3 left-3 right-3 sm:top-3.5 sm:left-3.5 sm:right-3.5 z-20 flex justify-between items-center text-white font-[family-name:var(--font-gabarito)] text-[10px] sm:text-[11px] tracking-[0.18em] sm:tracking-[0.22em] font-semibold">
          <span className="bg-white/[0.08] border border-white/[0.18] px-2 py-0.5 sm:px-2.5 sm:py-1 rounded">
            AGENT · {agent.code}
          </span>
          <span className="inline-flex items-center gap-1 sm:gap-1.5 bg-black/55 backdrop-blur-sm px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full">
            <StatusDot color={agent.statusColor} size={6} />
            <span style={{ color: agent.statusColor }}>{agent.status}</span>
          </span>
        </div>

        <div className="transition-transform duration-500 group-hover:scale-105">
          <AgentPortrait agent={agent} size={172} />
        </div>

        <div
          className="pointer-events-none absolute inset-0 mix-blend-screen"
          style={{ background: "linear-gradient(180deg, transparent 30%, rgba(255,255,255,0.04) 50%, transparent 70%)" }}
        />
      </div>

      <div className="px-4 py-4 sm:px-6 sm:py-5">
        <div className="font-[family-name:var(--font-gabarito)] text-[10px] sm:text-xs tracking-[0.22em] text-[#9c9c9c] font-bold">
          {agent.codename}
        </div>
        <h3 className="font-[family-name:var(--font-gabarito)] text-[18px] sm:text-[24px] font-semibold tracking-[-0.015em] mt-1 sm:mt-1.5 mb-1.5 sm:mb-2 text-[#0a0a0a]">
          {agent.name}
        </h3>
        <p className="text-[#4b4b4d] text-[13px] sm:text-[14.5px] leading-[1.5] sm:leading-[1.55] m-0">{agent.blurb}</p>

        <div className="mt-3 sm:mt-4 px-3 py-2.5 sm:px-3.5 sm:py-3 bg-[#fafafa] border border-black/[0.05] rounded-xl flex gap-2 sm:gap-2.5 items-start min-h-[48px] sm:min-h-[56px]">
          <div className="flex-none w-1 self-stretch rounded-sm mt-0.5" style={{ background: agent.statusColor }} />
          <div className="flex-1 font-[family-name:var(--font-gabarito)] text-[11.5px] sm:text-[12.5px] text-[#0a0a0a]">
            <div className="text-[9px] sm:text-[9.5px] tracking-[0.22em] text-[#9c9c9c] font-bold mb-1">NOW</div>
            <AnimatePresence mode="wait">
              <motion.div
                key={line}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.3 }}
              >
                {line}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-dashed border-black/10 flex items-baseline gap-2 sm:gap-2.5">
          <span className="font-[family-name:var(--font-gabarito)] text-[22px] sm:text-[28px] font-semibold tracking-[-0.02em] text-[#0a0a0a]">
            {agent.metric.value}
          </span>
          <span className="text-[11px] sm:text-xs text-[#9c9c9c] font-medium">{agent.metric.label}</span>
        </div>
      </div>
    </motion.article>
  );
}

export default function AgentsSection() {
  return (
    <section className="bg-[#fdf8fb] py-10 sm:py-[72px] font-[family-name:var(--font-poppins)] text-[#0a0a0a]">
      <style>{`
        @keyframes ap-sweep { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes merito-pulse {
          0%   { box-shadow: 0 0 0 0 currentColor; opacity: .8 }
          70%  { box-shadow: 0 0 0 8px transparent; opacity: 0 }
          100% { box-shadow: 0 0 0 0 transparent; opacity: 0 }
        }
      `}</style>

      <div className="max-w-[1340px] mx-auto px-5 sm:px-8">
        <div className="flex justify-center mb-6">
          <span className="inline-flex items-center gap-2 bg-[#ed1a24] text-white px-4 py-2 rounded-full text-[11px] font-bold tracking-[0.14em] whitespace-nowrap font-[family-name:var(--font-gabarito)]">
            <span className="w-1.5 h-1.5 rounded-full bg-white inline-block" />
            AI Automation
          </span>
        </div>

        <h2 className="font-[family-name:var(--font-gabarito)] text-[32px] sm:text-[48px] lg:text-[64px] leading-[1.04] font-semibold tracking-[-0.04em] m-0 text-center max-w-[980px] mx-auto">
          Meet the six agents who keep the lights on while your{" "}
          <span className="text-[#ed1a24]">experts focus</span>.
        </h2>

        <p className="text-center max-w-[720px] mx-auto mt-5 text-[#4b4b4d] text-[15px] sm:text-[17px] leading-[1.6]">
          Each one runs a single job, brilliantly. Together they&apos;re the back office that lets your team
          spend their hours on judgement — not busywork.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3.5 mt-5 sm:mt-7 text-[#4b4b4d] text-[12px] sm:text-[13px] tracking-[0.08em] font-semibold">
          <StatusDot color="#22c55e" size={8} />
          <span>6 / 6 ONLINE</span>
          <span className="text-[#dcdcdc]">·</span>
          <span>SHIFT: 24/7</span>
          <span className="text-[#dcdcdc]">·</span>
          <span>UPTIME 99.94%</span>
        </div>

        <div className="mt-8 sm:mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-7">
          {AGENTS.map((a) => (
            <AgentCard key={a.id} agent={a} />
          ))}
        </div>
      </div>
    </section>
  );
}
