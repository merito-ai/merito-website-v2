import { GUIDE_COPY, PLAN_REPORT_COUNT } from "@/lib/planFeatures";
import type { InterviewStatus } from "@/app/hub/account/interviewProgress";

// Hub dashboard guide (plans/2026-11-12-hub-first-visit-guide-design.md). Pure + client-safe.

export type FirstVisitView = "n1" | "n2" | "s1" | "s2" | "plan";

// Decided from data on every load: a plan wins, then the allowlist, then whether a role was checked.
export function firstVisitView({ allowlisted, plan, hasRole }: { allowlisted: boolean; plan: unknown; hasRole: boolean }): FirstVisitView {
  if (plan) return "plan";
  if (allowlisted) return hasRole ? "s2" : "s1";
  return hasRole ? "n2" : "n1";
}

export function firstName(name: string | null | undefined): string | null {
  return name?.trim().split(/\s+/)[0] || null;
}

// Locked report preview. There is no FAILED status in the DB: anything not READY/PENDING reads as failed.
export type ReportPreviewState = "ready" | "pending" | "failed";
export function reportPreviewState(status: string | null | undefined): ReportPreviewState {
  return status === "READY" ? "ready" : status === "PENDING" ? "pending" : "failed";
}
export const PREVIEW_COPY: Record<ReportPreviewState, string> = {
  ready: "Your strengths, gaps and what to fix are ready",
  pending: "Your detailed report is being prepared",
  failed: "We couldn't prepare this report. Try checking the role again or email us.",
};
// Blur is visual only: these fixed lines are all a locked preview may ever render (never real report text or counts).
export const PREVIEW_PLACEHOLDER_LINES = [
  { tone: "good", text: "Sample strength line for this preview" },
  { tone: "good", text: "Sample strength line for this preview" },
  { tone: "gap", text: "Sample gap line for this preview" },
] as const;

// Locked report: the dashboard gets no report body and no vendor summary (they would ride the RSC payload).
export function lockedSafeReport<R>(reportUnlocked: boolean, report: R | null, verdict: string): { report: R | null; verdict: string } {
  return reportUnlocked ? { report, verdict } : { report: null, verdict: "" };
}

export type TagKind = "free" | "paid" | "incl" | "p2" | "ok" | "need" | "team" | "progress" | "unlocked" | "warn";
export type GuideIcon = "gauge" | "report" | "brain" | "mic" | "users" | "share" | "mentor" | "briefcase" | "target";
export type GuideRow = {
  key: string;
  icon: GuideIcon;
  title: string;
  line: string;
  tag: { kind: TagKind; label: string };
  state: "done" | "now" | "todo" | "locked";
  marker: "Start here" | "Next" | null;
  action: { label: string; href: string } | null; // small button, secondary rows only
  href?: string; // whole row opens its page
  tour?: string; // OnboardingTour target
};

export type GuideInput = {
  plans: boolean; // allowlisted without a plan: tags read "All plans" / "Mentor + Apply"
  roleTitle: string | null; // null = no role checked yet
  leadId?: string;
  reportUnlocked: boolean;
  personality: "not_started" | "ready" | "update";
  personalityUnlocked: boolean;
  interview: InterviewStatus | "expired";
  references: "none" | "in_progress" | "completed";
  referencesUnlocked: boolean;
};

// Normal (n1/n2) and allowlisted (s1/s2) timeline. Ownership (E1) beats the price tag.
export function buildGuideRows(i: GuideInput): { rows: GuideRow[]; done: number; total: number } {
  const hasRole = i.roleTitle !== null;
  const notOwned = i.plans ? { kind: "incl" as const, label: "All plans" } : { kind: "paid" as const, label: "Paid" };
  const lead = i.leadId ? `?lead=${encodeURIComponent(i.leadId)}` : "";
  type Base = Omit<GuideRow, "state" | "marker" | "action"> & { done: boolean; step: boolean };
  const tag = (done: boolean, progress: string | false, unlocked: boolean): GuideRow["tag"] =>
    done ? { kind: "ok", label: "Done" } : progress ? { kind: "progress", label: progress } : unlocked ? { kind: "unlocked", label: "Unlocked" } : notOwned;
  const interviewActive = i.interview === "invited" || i.interview === "processing" || i.interview === "terminated" || i.interview === "stuck";

  const base: Base[] = [];
  if (hasRole || !i.plans) {
    base.push({ key: "score", icon: "gauge", title: "Fitment score", line: i.roleTitle ?? "How well your CV fits the role", tag: hasRole ? { kind: "ok", label: "Done" } : { kind: "free", label: "Free" }, done: hasRole, step: true });
  }
  base.push(
    {
      key: "report",
      icon: "report",
      title: i.plans ? `${PLAN_REPORT_COUNT} role reports` : "Detailed report",
      line: i.plans ? (hasRole ? `This role + ${PLAN_REPORT_COUNT - 1} more` : GUIDE_COPY.reports) : GUIDE_COPY.report,
      tag: tag(i.reportUnlocked, false, false),
      done: i.reportUnlocked,
      step: true,
      href: hasRole ? `/hub/account/report${lead}` : undefined,
      tour: "pill-report",
    },
    {
      key: "personality",
      icon: "brain",
      title: "Personality + culture",
      line: i.personality === "update" ? "Take the updated test" : GUIDE_COPY.personality,
      tag: tag(i.personality === "ready", i.personality === "update" && "In progress", i.personalityUnlocked),
      done: i.personality === "ready",
      step: true,
      href: hasRole ? "/hub/account/personality" : undefined,
      tour: "pill-personality",
    },
    {
      key: "interview",
      icon: "mic",
      title: i.plans ? "45-min AI interview" : "Mock AI interview",
      line: i.interview === "expired" ? "Your interview link expired" : i.plans ? GUIDE_COPY.interview : GUIDE_COPY.interviewNormal,
      tag: i.interview === "expired" ? { kind: "warn", label: "Expired" } : tag(i.interview === "ready", interviewActive && "In progress", false),
      done: i.interview === "ready",
      step: true,
      href: hasRole ? `/hub/account/interview${lead}` : undefined,
      tour: "pill-interview",
    },
    {
      key: "references",
      icon: "share",
      title: "References + shareable profile",
      line: GUIDE_COPY.references,
      tag: tag(i.references === "completed", i.references === "in_progress" && "In progress", i.referencesUnlocked),
      done: i.references === "completed",
      step: true,
      href: hasRole ? "/hub/account/references" : undefined,
      tour: "pill-references",
    },
  );
  const p2 = { kind: "p2" as const, label: "Mentor + Apply" };
  if (i.plans && !hasRole) {
    base.push(
      { key: "mentoring", icon: "mentor", title: "Mentoring", line: GUIDE_COPY.mentoring, tag: p2, done: false, step: false },
      { key: "assistance", icon: "briefcase", title: "Application assistance", line: GUIDE_COPY.assistance, tag: p2, done: false, step: false },
    );
  } else if (i.plans) {
    base.push({ key: "mentoring", icon: "mentor", title: "Mentoring + application help", line: "2 sessions, 3 company referrals", tag: p2, done: false, step: true });
  }

  // s1 lists what a plan includes: no progress markers.
  const nextKey = !hasRole ? (i.plans ? null : "score") : base.find((r) => r.step && !r.done)?.key;
  const rows = base.map(({ done, step, ...r }): GuideRow => ({
    ...r,
    state: done ? "done" : r.key === nextKey ? "now" : "todo",
    marker: r.key === nextKey ? (hasRole ? "Next" : "Start here") : null,
    action: null,
  }));
  const steps = base.filter((r) => r.step);
  return { rows, done: steps.filter((r) => r.done).length, total: steps.length };
}
