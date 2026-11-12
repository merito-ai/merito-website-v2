import { getSupabaseServerClient } from "@/lib/supabase";
import { getReferenceCheckStatus } from "@/lib/referenceChecks";
import { PRODUCT_LABELS } from "@/lib/razorpay/pricing";
import type { PlanState } from "@/lib/plans";
import { buildPlanPanelRows, type PlanPanelInput } from "@/lib/planPanel";
import { needsUpdatedTest } from "@/lib/psychometrics/testFlow";
import { interviewDeadline } from "@/lib/planFeatures";
import { getAssistanceStatus } from "@/lib/planAssistance";
import PlanSteps from "./PlanSteps";

// "Your plan": numbered steps with live state, next action and a single next-step marker (dashboard).
export default async function PlanPanel({ userId, plan, hasRole = true, reportLocked = false }: { userId: string; plan: NonNullable<PlanState["plan"]>; hasRole?: boolean; reportLocked?: boolean }) {
  const db = getSupabaseServerClient();
  const [{ data: personality }, { data: interview }, refs, { data: mentoring }, assistance] = await Promise.all([
    db.from("personality_tests").select("version, culture_scores").eq("user_id", userId).maybeSingle(),
    db.from("fitment_interviews").select("role_title, status, ib_interview_status, invited_at, magic_link_expires_at").eq("user_id", userId).order("updated_at", { ascending: false }).limit(1).maybeSingle(),
    getReferenceCheckStatus(userId),
    db.from("counselling_requests").select("session, status, scheduled_at").eq("order_id", plan.upgradeOrderId ?? plan.orderId),
    // Not fatal: before migration 0073 (or on a read error) the row just shows the default next step.
    plan.product === "plan_mentor" ? getAssistanceStatus(userId).catch(() => "not_contacted" as const) : Promise.resolve("not_contacted" as const),
  ]);

  const input: PlanPanelInput = {
    product: plan.product,
    reportCreditsLeft: plan.reportCreditsLeft,
    personality: !personality ? "none" : needsUpdatedTest(personality) ? "update" : personality.version === 2 && personality.culture_scores == null ? "part2" : "done",
    interview: !plan.interviewUsed ? "unused" : interview?.status === "ready" ? "ready" : "in_progress",
    references: !refs ? "none" : refs.status === "completed" ? "completed" : "in_progress",
    mentoring: mentoring ?? [],
    hasRole,
    reportLocked,
    // Only an invite not yet opened has a "complete by" date (same rule as the interview page's invited state).
    interviewDueBy: interview?.status === "invited" && interview.ib_interview_status !== "APPEARED" ? interviewDeadline(interview.magic_link_expires_at, interview.invited_at) : null,
    assistance,
    interviewRole: interview?.role_title ?? null,
  };
  const rows = buildPlanPanelRows(input);

  return (
    <PlanSteps
      id="your-plan-heading"
      title={`Your plan: ${PRODUCT_LABELS[plan.product]}`}
      sub={hasRole ? undefined : "Your interview and references are built around a role, so check one first."}
      rows={rows}
    />
  );
}
