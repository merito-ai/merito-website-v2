import { Clock, AlertTriangle, Target, Mail } from "lucide-react";
import { CONTACT_HREF } from "@/lib/planPanel";
import { CHECK_FIT_LABEL } from "@/lib/planFeatures";

const LINK = "inline-flex items-center font-semibold text-[#ff7a80] hover:underline focus-visible:outline-2 focus-visible:outline-white";

// Seminar users: one line under the score for a report that is still being prepared or failed (E7).
export default function ScoreNote({ state }: { state: "pending" | "failed" }) {
  if (state === "pending") {
    return (
      <p role="status" className="inline-flex items-center text-white/70" style={{ gap: 6, fontSize: 13, margin: "10px 0 0" }}>
        <Clock size={14} strokeWidth={2} aria-hidden="true" />
        Your detailed report is being prepared.
      </p>
    );
  }
  return (
    <div role="status" style={{ marginTop: 10 }}>
      <p className="flex items-start text-white/80" style={{ gap: 6, fontSize: 13, lineHeight: 1.55, margin: 0 }}>
        <AlertTriangle size={14} strokeWidth={2} aria-hidden="true" className="text-[#ff7a80] shrink-0" style={{ marginTop: 3 }} />
        We couldn&apos;t prepare this report. Try checking the role again or email us.
      </p>
      <span className="flex flex-wrap" style={{ gap: "0 16px", fontSize: 13 }}>
        <a href="#check-role" className={LINK} style={{ gap: 6, minHeight: 44 }}>
          <Target size={14} strokeWidth={2} aria-hidden="true" />
          {CHECK_FIT_LABEL}
        </a>
        <a href={CONTACT_HREF} className={LINK} style={{ gap: 6, minHeight: 44 }}>
          <Mail size={14} strokeWidth={2} aria-hidden="true" />
          Email us
        </a>
      </span>
    </div>
  );
}
