import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabaseAuthServer";
import { isReportUnlocked } from "@/lib/reportUnlocks";
import { getReferenceCheckStatus } from "@/lib/referenceChecks";
import DashboardClient from "./DashboardClient";
import type { InterviewStatus } from "./interviewProgress";
import type { PersonalityStatus } from "./ProgressRail";
import { getResumeMatchReport, scoreOutOfTen, type ResumeMatchReportReady } from "@/lib/intervuebox/reports";
import { getInterviewReport } from "@/lib/intervuebox/interviewReports";
import { buildReportRaw } from "@/lib/intervuebox/reportRaw";
import { getSupabaseServerClient } from "@/lib/supabase";
import { PRODUCT_PRICING, PRODUCT_LABELS, DEFAULT_LEVEL, formatPrice, type CandidateLevel } from "@/lib/razorpay/pricing";
import { isProductUnlocked } from "@/lib/productUnlocks";
import { getRecruiterViewCount } from "@/lib/recruiterActivity";
import RecruiterActivityPanel from "./RecruiterActivityPanel";
import { RECRUITER_PREVIEW_ENABLED } from "@/lib/featureFlags";
import { resolveActiveLead } from "@/lib/activeLead";
import { leadIdOrRoleTitleFilter } from "@/lib/postgrestIdentityFilter";
import { isPersonalityComplete, needsUpdatedTest } from "@/lib/psychometrics/testFlow";
import { getPlanState } from "@/lib/plans";
import PlanPanel from "./PlanPanel";
import PlanOfferBanner from "./guide/PlanOfferBanner";
import { planDashboardView } from "@/lib/planPanel";
import { firstVisitView, firstName, howMeritoWorksRows, planIncludesRows, isSeminarUser } from "@/lib/firstVisit";
import NoRoleDashboard from "./guide/NoRoleDashboard";
import WelcomeLine from "./guide/WelcomeLine";
import PlanSteps from "./PlanSteps";
import { PLAN_REPORT_COUNT } from "@/lib/planFeatures";
import Link from "next/link";

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ lead?: string }>;
}) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/hub/login");
  }

  const { data: leads } = await supabase
    .from("fitment_leads")
    .select("id, role_title, name, score, verdict, resume_match_status, resume_match_raw, ib_applied_job_id, created_at, candidate_level")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (!leads || leads.length === 0) {
    // Signed in directly, no role yet (spec Scope): n1 normal, s1 allowlisted without a plan, plan holder.
    // Plan buyers often pay before checking a role: they get their plan panel with role-bound steps marked.
    const planState = await getPlanState(user.id, user.email);
    const { plan } = planState;
    const view = firstVisitView({ allowlisted: planState.allowlisted, plan, hasRole: false });
    const meta = user.user_metadata as { full_name?: string; name?: string } | undefined;
    const name = firstName(meta?.full_name ?? meta?.name);
    if (plan) {
      const { data: personalityRow } = await supabase.from("personality_tests").select("version, culture_scores").eq("user_id", user.id).maybeSingle();
      const personality = !personalityRow
        ? { label: "Start personality test", href: "/hub/account/personality" }
        : needsUpdatedTest(personalityRow)
          ? { label: "Take the updated test", href: "/hub/account/personality" }
          : isPersonalityComplete(personalityRow)
            ? null
            : { label: "Continue part 2", href: "/hub/account/personality" };
      return (
        <NoRoleDashboard
          view="plan"
          name={name}
          planLabel={PRODUCT_LABELS[plan.product]}
          personality={personality}
          panel={<PlanPanel userId={user.id} plan={plan} hasRole={false} />}
        />
      );
    }
    return (
      <NoRoleDashboard
        view={view === "s1" ? "s1" : "n1"}
        name={name}
        panel={
          view === "s1" ? (
            <PlanSteps id="plan-includes" title="What your plan includes" sub="Assess + Mentor + Apply adds mentoring and application help." rows={planIncludesRows()} />
          ) : (
            <PlanSteps
              id="how-merito-works"
              title="How Merito works"
              sub="Build a profile recruiters trust, one step at a time."
              rows={howMeritoWorksRows()}
              footer={
                <Link href="/hub/account/pricing" className="inline-flex items-center font-semibold text-[#ed1a24] hover:underline" style={{ fontSize: 13, minHeight: 44 }}>
                  See prices →
                </Link>
              }
            />
          )
        }
      />
    );
  }

  const { lead: requestedLeadId } = await searchParams;
  const current = resolveActiveLead(leads, requestedLeadId);
  if (!current) {
    redirect("/hub/account");
  }
  const currentIndex = leads.indexOf(current);
  const prevForSameRole = leads.find((l, i) => i > currentIndex && l.role_title === current.role_title);

  // These two chains each do their own external-API self-heal call
  // (IntervueBox) and used to run strictly sequentially, one full round-trip
  // after the other. They touch disjoint rows (fitment_leads vs
  // fitment_interviews) so nothing here depends on the other -- run them,
  // and every other independent per-user lookup, concurrently instead.
  const resolveReport = async () => {
    const reportUnlocked = await isReportUnlocked(user.id, current.id, current.role_title);

    let score = current.score;
    let verdict = current.verdict;
    let resumeMatchStatus = current.resume_match_status;
    let resumeMatchRaw = current.resume_match_raw;

    if (resumeMatchStatus === "PENDING") {
      try {
        const report = await getResumeMatchReport(current.ib_applied_job_id);
        if (report.status === "READY") {
          const freshRaw = {
            overallScore: report.overallScore,
            rank: report.rank,
            categories: report.categories,
            summary: report.summary,
            strongPoints: report.strongPoints,
            weakPoints: report.weakPoints,
          };
          // IntervueBox can return a null summary on an otherwise-READY report
          // (live-confirmed) -- verdict is NOT NULL, so a bare pass-through
          // 500s this update even though the score itself is valid.
          const freshVerdict = report.summary || "No summary available.";
          const admin = getSupabaseServerClient();
          await admin
            .from("fitment_leads")
            .update({
              score: scoreOutOfTen(report.overallScore),
              verdict: freshVerdict,
              resume_match_status: "READY",
              resume_match_score: report.overallScore,
              resume_match_raw: freshRaw,
            })
            .eq("id", current.id);

          score = scoreOutOfTen(report.overallScore);
          verdict = freshVerdict;
          resumeMatchStatus = "READY";
          resumeMatchRaw = freshRaw;
        }
      } catch (err) {
        console.error("getResumeMatchReport failed on dashboard read, falling back to stale values", err);
      }
    }

    return { reportUnlocked, score, verdict, resumeMatchStatus, resumeMatchRaw };
  };

  const resolveInterview = async () => {
    const { data: interviewRow } = await supabase
      .from("fitment_interviews")
      .select("id, status, ib_agent_id, ib_candidate_id, ib_interview_status, invited_at, stuck_at")
      .eq("user_id", user.id)
      .or(leadIdOrRoleTitleFilter(current.id, current.role_title))
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    // A genuinely-ready row always wins over a stale stuck_at flag (mirrors
    // resolveInterviewViewState.ts's priority -- see the Critical fix in
    // docs/superpowers/specs/2026-08-19-interview-stuck-state-design.md), so
    // "ready" is checked before "stuck" here too.
    let interviewStatus: InterviewStatus = !interviewRow
      ? "not_started"
      : interviewRow.status === "ready"
        ? "ready"
        : interviewRow.stuck_at
          ? "stuck"
          : interviewRow.status === "terminated"
            ? "terminated"
            : interviewRow.ib_interview_status === "EVALUATING" || interviewRow.ib_interview_status === "EVALUATED"
              ? "processing"
              : "invited";

    // The DB row only flips to "ready" via IntervueBox's webhook -- if that
    // delivery is ever missed, nothing else updates it. Self-heal the same
    // way the resume-match report above does: re-check IntervueBox directly
    // whenever we're about to show a stale "invited" (processing) or "stuck"
    // state -- a stuck row can still have a real report waiting at the vendor
    // if the interview actually completed just before the failed resume call
    // set stuck_at (see the Critical fix referenced above).
    if (interviewRow && (interviewStatus === "invited" || interviewStatus === "processing" || interviewStatus === "stuck")) {
      try {
        const interviewReport = await getInterviewReport(interviewRow.ib_agent_id, interviewRow.ib_candidate_id);
        if (interviewReport.status === "READY") {
          const admin = getSupabaseServerClient();
          await admin
            .from("fitment_interviews")
            .update({
              status: "ready",
              // A row that self-resolves here may have had stuck_at set by a
              // doomed resume/launch call racing the report's real arrival --
              // clear it so the admin "Interview stuck" count doesn't keep
              // counting a row that no longer needs help.
              stuck_at: null,
              report_raw: buildReportRaw(interviewReport),
              updated_at: new Date().toISOString(),
            })
            .eq("id", interviewRow.id);
          interviewStatus = "ready";
        }
      } catch (err) {
        console.error("Interview self-heal check failed, leaving status as-is", err);
      }
    }

    return { interviewStatus };
  };

  const [
    { reportUnlocked, score, verdict, resumeMatchStatus, resumeMatchRaw },
    { interviewStatus },
    referenceCheck,
    { data: personalityRow },
    { data: counsellingRequest },
    recruiterViewCount,
    [personalityUnlocked, referencesUnlocked],
    planState,
  ] = await Promise.all([
    resolveReport(),
    resolveInterview(),
    getReferenceCheckStatus(user.id),
    supabase.from("personality_tests").select("role_title, version, culture_scores").eq("user_id", user.id).maybeSingle(),
    supabase.from("counselling_requests").select("id").eq("user_id", user.id).neq("status", "cancelled").limit(1).maybeSingle(),
    getRecruiterViewCount(user.id),
    Promise.all([isProductUnlocked(user.id, "personality"), isProductUnlocked(user.id, "references")]),
    getPlanState(user.id, user.email),
  ]);

  const report: ResumeMatchReportReady | null =
    reportUnlocked && resumeMatchStatus === "READY" && resumeMatchRaw
      ? (resumeMatchRaw as ResumeMatchReportReady)
      : null;

  const referenceCheckStatus: "none" | "in_progress" | "completed" =
    !referenceCheck ? "none" : referenceCheck.status === "completed" ? "completed" : "in_progress";

  // A v2 row with only Part 1 saved is not done; the personality page resumes it at Part 2.
  const personalityStatus: PersonalityStatus = needsUpdatedTest(personalityRow) ? "update" : isPersonalityComplete(personalityRow) ? "ready" : "not_started";

  const level = (current.candidate_level as CandidateLevel | null) ?? DEFAULT_LEVEL;
  const counsellingPriceLabel = formatPrice(PRODUCT_PRICING.counselling[level]);

  const userName = current.name || user.email?.split("@")[0] || "there";

  // Seminar users only: a one-time welcome line; hidden once their next step is done (a plan bought / a plan step started).
  const welcome = !isSeminarUser(planState) ? null : planState.plan ? (
    <WelcomeLine
      storageKey="plan"
      done={reportUnlocked || personalityStatus === "ready" || referenceCheckStatus !== "none" || interviewStatus !== "not_started"}
    >
      Your {PRODUCT_LABELS[planState.plan.product]} plan is active. Each step below is included.
    </WelcomeLine>
  ) : (
    <WelcomeLine storageKey="seminar">Your {current.role_title} report is 1 of the {PLAN_REPORT_COUNT} included in every plan.</WelcomeLine>
  );

  return (
    <DashboardClient
      leadId={current.id}
      roleTitle={current.role_title}
      level={level}
      personalityUnlocked={personalityUnlocked}
      referencesUnlocked={referencesUnlocked}
      userName={userName}
      score={score}
      prevScore={prevForSameRole ? prevForSameRole.score : null}
      verdict={verdict}
      initialReportUnlocked={reportUnlocked}
      initialReport={report}
      initialInterviewStatus={interviewStatus}
      referenceCheckStatus={referenceCheckStatus}
      personalityStatus={personalityStatus}
      counsellingPriceLabel={counsellingPriceLabel}
      initialCounsellingRequested={Boolean(counsellingRequest)}
      applications={leads.map((l) => ({ id: l.id, roleTitle: l.role_title, score: l.score, createdAt: l.created_at }))}
      planPanel={planState.plan ? <PlanPanel userId={user.id} plan={planState.plan} reportLocked={!reportUnlocked} /> : null}
      planOffer={planDashboardView(planState) === "offer" ? <PlanOfferBanner /> : null}
      recruiterActivity={RECRUITER_PREVIEW_ENABLED ? <RecruiterActivityPanel viewCount={recruiterViewCount} /> : null}
      mentoringInPlan={planState.plan?.product === "plan_mentor"}
      welcome={welcome}
    />
  );
}
