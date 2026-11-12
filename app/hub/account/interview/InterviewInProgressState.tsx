"use client";

import { useState } from "react";
import { Mic, Clock, Play, Volume2, Wifi, Mail } from "lucide-react";
import { CONTACT_HREF } from "@/lib/planPanel";
import InterviewResumeWarning from "./InterviewResumeWarning";
import { interviewDeadline } from "@/lib/planFeatures";

const CHECKLIST = [
  { icon: Volume2, text: "Find a quiet space with no interruptions" },
  { icon: Wifi, text: "Check your network connection and keep your device on power" },
  { icon: Clock, text: "Set aside about 30–45 minutes, uninterrupted" },
];

// Renders for fitment_interviews.status === "invited" with ib_interview_status
// not "APPEARED" -- payment already happened and a magic-link invite was
// already sent. The button below launches that link directly instead of
// relying on the candidate finding IntervueBox's email.
// expired (seminar users, E6): the link is past its 10 days, so no dead Start; the team can reinvite.
export default function InterviewInProgressState({ roleTitle, leadId, deadline, invitedAt, expired = false }: { roleTitle: string; leadId: string; deadline?: string | null; invitedAt?: string | null; expired?: boolean }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const due = interviewDeadline(deadline, invitedAt);
  const deadlineLabel = due
    ? due.toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric", timeZone: "Asia/Kolkata" })
    : null;

  async function handleStart() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/hub/interview/launch-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Couldn't start the interview. Please try again.");
        setLoading(false);
        return;
      }
      window.location.href = data.url;
    } catch {
      setError("Couldn't start the interview. Please try again.");
      setLoading(false);
    }
  }

  if (expired) {
    return (
      <div className="bg-[#141416] border border-white/[0.08] font-[family-name:var(--font-poppins)]" style={{ borderRadius: 14, padding: 24 }}>
        <div className="flex items-center" style={{ gap: 12, marginBottom: 10 }}>
          <div className="flex items-center justify-center bg-[#ed1a24]/15 text-[#ed1a24] shrink-0" style={{ width: 36, height: 36, borderRadius: 10 }}>
            <Clock size={17} strokeWidth={2} aria-hidden="true" />
          </div>
          <h2 className="font-[family-name:var(--font-gabarito)] font-semibold text-white" style={{ fontSize: "1.05rem", margin: 0 }}>
            Your interview link expired
          </h2>
        </div>
        <p className="text-white/70" style={{ fontSize: 13, lineHeight: 1.65, margin: "0 0 16px" }}>
          Your interview for {roleTitle} wasn&apos;t started within its {deadlineLabel ? `window (it closed on ${deadlineLabel})` : "window"}. Email us and our team will send you a new link.
        </p>
        <a
          href={CONTACT_HREF}
          className="inline-flex items-center font-semibold text-white bg-[#d9161f] hover:bg-[#c8151e] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          style={{ gap: 8, minHeight: 44, padding: "0 20px", borderRadius: 8, fontSize: 14 }}
        >
          <Mail size={15} strokeWidth={2} aria-hidden="true" />
          Email us
        </a>
      </div>
    );
  }

  return (
    <div className="bg-[#141416] border border-white/[0.08]" style={{ borderRadius: 14, padding: 24 }}>
      <div className="flex items-center" style={{ gap: 12, marginBottom: 14 }}>
        <div className="flex items-center justify-center bg-[#ed1a24]/15 text-[#ed1a24] shrink-0" style={{ width: 36, height: 36, borderRadius: 10 }}>
          <Mic size={17} strokeWidth={2} />
        </div>
        <span className="font-[family-name:var(--font-gabarito)] font-semibold text-white" style={{ fontSize: "1.05rem" }}>
          Mock AI interview for {roleTitle}
        </span>
      </div>
      <p className="font-[family-name:var(--font-poppins)] text-white/60" style={{ fontSize: 13, lineHeight: 1.65, margin: "0 0 16px" }}>
        Your AI interview for {roleTitle} is ready whenever you are. This page updates automatically once your scored report is ready.
      </p>
      {deadlineLabel && (
        <div className="flex items-center bg-[#ed1a24]/10" style={{ gap: 8, borderRadius: 10, padding: "10px 12px", marginBottom: 16 }}>
          <Clock size={14} strokeWidth={2} className="text-[#ed1a24] shrink-0" />
          <span className="font-[family-name:var(--font-poppins)] font-semibold text-[#ed1a24]" style={{ fontSize: 12.5 }}>
            Complete this interview by {deadlineLabel}
          </span>
        </div>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
        {CHECKLIST.map(({ icon: Icon, text }) => (
          <div key={text} className="flex items-center bg-white/[0.04]" style={{ gap: 10, borderRadius: 10, padding: "10px 12px" }}>
            <Icon size={14} strokeWidth={2} className="text-white/40 shrink-0" />
            <span className="font-[family-name:var(--font-poppins)] text-white/60" style={{ fontSize: 12.5 }}>
              {text}
            </span>
          </div>
        ))}
      </div>
      <InterviewResumeWarning />
      <button
        type="button"
        onClick={handleStart}
        disabled={loading}
        className="flex items-center font-[family-name:var(--font-poppins)] font-semibold text-white bg-[#ed1a24] hover:bg-[#c8151e] transition-colors disabled:opacity-60"
        style={{ gap: 8, height: 44, padding: "0 20px", borderRadius: 8, fontSize: 14, border: "none", cursor: loading ? "default" : "pointer" }}
      >
        <Play size={15} strokeWidth={2} />
        {loading ? "Starting…" : "Start Interview"}
      </button>
      {error && (
        <p role="alert" className="font-[family-name:var(--font-poppins)]" style={{ color: "#E8798F", fontSize: 12.5, margin: "10px 0 0" }}>
          {error}
        </p>
      )}
    </div>
  );
}
