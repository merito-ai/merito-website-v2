import { UserRound } from "lucide-react";
import ExpertBookingButton from "./ExpertBookingButton";
import MentoringFeedbackForm from "./MentoringFeedbackForm";
import { CONTACT_HREF, mentoringFooter, type MentoringSession } from "@/lib/planPanel";

const NAMES = ["Session 1", "Session 2"];

// Plan 2: the included hour as two 30-min sessions. Only the session that is open right now gets the Calendly link.
export default function PlanMentoringCard({ firstName, sessions }: { firstName: string; sessions: MentoringSession[] }) {
  const footer = mentoringFooter(sessions);
  return (
    <div className="bg-[#141416] border border-white/[0.08] font-[family-name:var(--font-poppins)]" style={{ borderRadius: 20, padding: 22 }}>
      <div className="flex items-center" style={{ gap: 16, marginBottom: 8 }}>
        <div className="flex items-center justify-center bg-[#ed1a24]/15 text-[#ed1a24] shrink-0" style={{ width: 42, height: 42, borderRadius: 10 }}>
          <UserRound size={19} strokeWidth={2} />
        </div>
        <div>
          <p className="font-semibold text-white" style={{ fontSize: 14, margin: 0 }}>
            Your mentoring with {firstName}
          </p>
          <p className="text-white/55" style={{ fontSize: 12.5, lineHeight: 1.6, margin: "4px 0 0" }}>
            Two 30-minute video calls, session 1 then session 2. He&apos;ll have read your fitment, personality and mock interview results beforehand.
          </p>
        </div>
      </div>
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {sessions.map((s, i) => (
          <li key={NAMES[i]} className="flex items-center flex-wrap border-t border-white/[0.06]" style={{ gap: 12, padding: "12px 0" }}>
            <span style={{ flex: "1 1 180px" }}>
              <span className="block font-semibold text-white" style={{ fontSize: 13.5 }}>{NAMES[i]}</span>
              <span className="block text-white/55" style={{ fontSize: 12.5 }}>{s.state}</span>
            </span>
            {s.bookable && <ExpertBookingButton priceLabel="Included in your plan" initialRequested sessionId={s.id} />}
            {s.status === "completed" && s.id && (
              s.rating ? (
                <span className="text-white/55" style={{ flex: "1 1 100%", fontSize: 12.5 }}>
                  Thanks for your feedback · You rated it {s.rating}/5
                </span>
              ) : (
                <MentoringFeedbackForm id={s.id} session={i + 1} />
              )
            )}
          </li>
        ))}
      </ul>
      <p className="text-white/55 border-t border-white/[0.06]" style={{ fontSize: 12.5, lineHeight: 1.6, margin: 0, paddingTop: 12 }}>
        {footer && `${footer} `}Questions: <a href={CONTACT_HREF} className="text-white underline">admin@merito.ai</a>
      </p>
    </div>
  );
}
