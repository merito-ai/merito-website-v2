import Link from "next/link";
import { Check, X } from "lucide-react";
import { getSupabaseServerClient } from "@/lib/supabase";
import { getReferenceCheckStatus } from "@/lib/referenceChecks";
import { PRODUCT_LABELS } from "@/lib/razorpay/pricing";
import type { PlanState } from "@/lib/plans";
import { buildPlanPanelRows, type PlanPanelInput } from "@/lib/planPanel";

// "Your plan": numbered steps with live state, next action and a single next-step marker (dashboard).
export default async function PlanPanel({ userId, plan, hasRole = true, reportLocked = false }: { userId: string; plan: NonNullable<PlanState["plan"]>; hasRole?: boolean; reportLocked?: boolean }) {
  const db = getSupabaseServerClient();
  const [{ data: personality }, { data: interview }, refs, { data: mentoring }] = await Promise.all([
    db.from("personality_tests").select("version, culture_scores").eq("user_id", userId).maybeSingle(),
    db.from("fitment_interviews").select("status").eq("user_id", userId).order("updated_at", { ascending: false }).limit(1).maybeSingle(),
    getReferenceCheckStatus(userId),
    db.from("counselling_requests").select("session, status, scheduled_at").eq("order_id", plan.upgradeOrderId ?? plan.orderId),
  ]);

  const input: PlanPanelInput = {
    product: plan.product,
    reportCreditsLeft: plan.reportCreditsLeft,
    personality: !personality ? "none" : personality.version === 2 && personality.culture_scores == null ? "part2" : "done",
    interview: !plan.interviewUsed ? "unused" : interview?.status === "ready" ? "ready" : "in_progress",
    references: !refs ? "none" : refs.status === "completed" ? "completed" : "in_progress",
    mentoring: mentoring ?? [],
    hasRole,
    reportLocked,
  };
  const rows = buildPlanPanelRows(input);

  return (
    <section aria-labelledby="your-plan-heading" className="bg-[#141416] border border-[#ed1a24]/30 font-[family-name:var(--font-poppins)]" style={{ borderRadius: 14, padding: "16px 18px" }}>
      <h2 id="your-plan-heading" className="font-[family-name:var(--font-gabarito)] font-semibold text-white" style={{ fontSize: 16, margin: "0 0 10px" }}>
        Your plan: {PRODUCT_LABELS[plan.product]}
      </h2>
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {rows.map((r) => (
          <li key={r.key} className="flex flex-wrap items-center border-t border-white/[0.06]" style={{ gap: "6px 12px", padding: "10px 0", fontSize: 13.5 }}>
            {!r.included ? (
              <X size={15} strokeWidth={2} className="text-white/40 shrink-0" aria-hidden="true" style={{ margin: "0 5px" }} />
            ) : r.done ? (
              <span className="inline-flex items-center justify-center shrink-0 bg-[#3FCB8C]/15 text-[#3FCB8C]" style={{ width: 24, height: 24, borderRadius: "50%" }} aria-hidden="true">
                <Check size={14} strokeWidth={3} />
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
            <span className="sr-only">{!r.included ? "Not included:" : `Step ${r.step}${r.done ? ", done" : ""}:`}</span>
            <span className={r.included ? "text-white" : "text-white/55"} style={{ flex: "1 1 180px", minWidth: 0 }}>
              <span className="font-semibold">{r.label}</span>
              {r.marker && (
                <span className="inline-block align-middle font-semibold uppercase text-[#ed1a24] border border-[#ed1a24]/50" style={{ fontSize: 10, letterSpacing: "0.06em", borderRadius: 999, padding: "1px 8px", marginLeft: 8 }}>
                  {r.marker}
                </span>
              )}
              <span className="block text-white/45" style={{ fontSize: 12, lineHeight: 1.45, margin: "1px 0 2px" }}>{r.detail}</span>
              <span className="block text-white/55" style={{ fontSize: 12.5, whiteSpace: "pre-line" }}>{!r.done ? r.status : r.status === "Completed" ? "Done" : `Done · ${r.status}`}</span>
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
    </section>
  );
}
