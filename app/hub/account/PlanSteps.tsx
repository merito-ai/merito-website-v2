import Link from "next/link";
import type { ReactNode } from "react";
import { Check, X, Lock } from "lucide-react";
import type { PlanPanelRow } from "@/lib/planPanel";

// The "Your plan" step list (numbered steps, one marker, live status, next action). Shared by PlanPanel and the
// no-role dashboard ("How Merito works", "What your plan includes"), so every Hub step list looks the same.
export default function PlanSteps({ id, title, sub, rows, footer }: { id: string; title: ReactNode; sub?: string; rows: PlanPanelRow[]; footer?: ReactNode }) {
  return (
    <section aria-labelledby={id} className="plan-panel bg-[#141416] border border-[#ed1a24]/30 font-[family-name:var(--font-poppins)]" style={{ borderRadius: 14, padding: "16px 18px" }}>
      <h2 id={id} className="font-[family-name:var(--font-gabarito)] font-semibold text-white" style={{ fontSize: 16, margin: sub ? "0 0 4px" : "0 0 10px" }}>
        {title}
      </h2>
      {sub && (
        <p className="text-white/65" style={{ fontSize: 12.5, lineHeight: 1.5, margin: "0 0 10px" }}>
          {sub}
        </p>
      )}
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {rows.map((r) => (
          <li key={r.key} className="flex flex-wrap items-center border-t border-white/[0.06]" style={{ gap: "6px 12px", padding: "10px 0", fontSize: 13.5 }}>
            {!r.included ? (
              <X size={15} strokeWidth={2} className="text-white/40 shrink-0" aria-hidden="true" style={{ margin: "0 5px" }} />
            ) : r.done ? (
              <span className="inline-flex items-center justify-center shrink-0 bg-[#3FCB8C]/15 text-[#3FCB8C]" style={{ width: 24, height: 24, borderRadius: "50%" }} aria-hidden="true">
                <Check size={14} strokeWidth={3} />
              </span>
            ) : r.needsRole ? (
              <span className="inline-flex items-center justify-center shrink-0 border border-white/20 text-white/60" style={{ width: 24, height: 24, borderRadius: "50%" }} aria-hidden="true">
                <Lock size={12} strokeWidth={2.2} />
              </span>
            ) : (
              <span
                className={`inline-flex items-center justify-center shrink-0 font-semibold ${r.marker ? "bg-[#ed1a24] text-white" : "border border-white/25 text-white/70"}`}
                style={{ width: 24, height: 24, borderRadius: "50%", fontSize: 12 }}
                aria-hidden="true"
              >
                {r.step}
              </span>
            )}
            <span className="sr-only">{!r.included ? "Not included:" : `Step ${r.step}${r.done ? ", done" : r.needsRole ? ", needs a role" : ""}:`}</span>
            <span className={r.included && !r.needsRole ? "text-white" : "text-white/70"} style={{ flex: "1 1 180px", minWidth: 0 }}>
              <span className="font-semibold">{r.label}</span>
              {r.marker && (
                <span className="inline-block align-middle font-semibold uppercase text-[#ed1a24] border border-[#ed1a24]/50" style={{ fontSize: 10, letterSpacing: "0.06em", borderRadius: 999, padding: "1px 8px", marginLeft: 8 }}>
                  {r.marker}
                </span>
              )}
              {r.needsRole && (
                <span aria-hidden="true" className="inline-flex items-center align-middle font-semibold text-white/70 border border-white/20" style={{ gap: 4, fontSize: 10.5, borderRadius: 999, padding: "1px 8px", marginLeft: 8 }}>
                  <Lock size={10} strokeWidth={2.2} />
                  Needs a role
                </span>
              )}
              <span className="block text-white/55" style={{ fontSize: 12, lineHeight: 1.45, margin: "1px 0 2px" }}>{r.detail}</span>
              <span className="block text-white/65" style={{ fontSize: 12.5, whiteSpace: "pre-line" }}>{!r.done ? r.status : r.status === "Completed" ? "Done" : `Done · ${r.status}`}</span>
            </span>
            {r.action &&
              (!r.action.href.startsWith("/") ? (
                <a href={r.action.href} className="font-semibold text-[#ed1a24] hover:underline" style={{ fontSize: 13, minHeight: 44, display: "inline-flex", alignItems: "center" }}>
                  {r.action.label} →
                </a>
              ) : (
                <Link href={r.action.href} className="font-semibold text-[#ed1a24] hover:underline" style={{ fontSize: 13, minHeight: 44, display: "inline-flex", alignItems: "center" }}>
                  {r.action.label} →
                </Link>
              ))}
          </li>
        ))}
      </ul>
      {footer}
    </section>
  );
}
