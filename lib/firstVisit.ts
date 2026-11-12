import { GUIDE_COPY, PLAN_REPORT_COUNT } from "@/lib/planFeatures";
import type { PlanPanelRow } from "@/lib/planPanel";

// Hub dashboard when the user has no role yet (plans/2026-11-12-hub-first-visit-guide-design.md, Scope). Pure + client-safe.

export type FirstVisitView = "n1" | "n2" | "s1" | "s2" | "plan";

// Decided from data on every load: a plan wins, then the allowlist, then whether a role was checked.
export function firstVisitView({ allowlisted, plan, hasRole }: { allowlisted: boolean; plan: unknown; hasRole: boolean }): FirstVisitView {
  if (plan) return "plan";
  if (allowlisted) return hasRole ? "s2" : "s1";
  return hasRole ? "n2" : "n1";
}

// E12: unknown name -> null, the caller falls back to "Welcome to Merito HUB".
export function firstName(name: string | null | undefined): string | null {
  return name?.trim().split(/\s+/)[0] || null;
}

type Step = { key: string; label: string; detail: string; status: string };
const row = (s: Step, i: number, marker: PlanPanelRow["marker"] = null): PlanPanelRow => ({ ...s, included: true, action: null, step: i + 1, done: false, marker });

// n1 "How Merito works": the free check first, then the paid steps. Rendered by the existing plan step list.
export function howMeritoWorksRows(): PlanPanelRow[] {
  const steps: Step[] = [
    { key: "score", label: "Fitment score", detail: "How well your CV fits the role", status: "Free" },
    { key: "report", label: "Detailed report", detail: GUIDE_COPY.report, status: "Paid" },
    { key: "personality", label: "Personality + culture", detail: GUIDE_COPY.personality, status: "Paid" },
    { key: "interview", label: "Mock AI interview", detail: GUIDE_COPY.interviewNormal, status: "Paid" },
    { key: "references", label: "References + shareable profile", detail: GUIDE_COPY.references, status: "Paid" },
  ];
  return steps.map((s, i) => row(s, i, i === 0 ? "Start here" : null));
}

// s1 "What your plan includes": no progress, no markers.
export function planIncludesRows(): PlanPanelRow[] {
  const all = "All plans";
  const top = "Mentor + Apply";
  const steps: Step[] = [
    { key: "reports", label: `${PLAN_REPORT_COUNT} role reports`, detail: GUIDE_COPY.reports, status: all },
    { key: "personality", label: "Personality + culture", detail: GUIDE_COPY.personality, status: all },
    { key: "interview", label: "45-min AI interview", detail: GUIDE_COPY.interview, status: all },
    { key: "references", label: "References + shareable profile", detail: GUIDE_COPY.references, status: all },
    { key: "mentoring", label: "Mentoring", detail: GUIDE_COPY.mentoring, status: top },
    { key: "assistance", label: "Application assistance", detail: GUIDE_COPY.assistance, status: top },
  ];
  return steps.map((s, i) => row(s, i));
}

// Seminar users (allowlisted or plan holders) get the "Later add-ons"; everyone else keeps today's Hub exactly.
export function isSeminarUser(s: { allowlisted: boolean; plan: unknown } | null | undefined): boolean {
  return Boolean(s?.allowlisted || s?.plan);
}

type NavPlanState = {
  allowlisted: boolean;
  plan: { product: string } | null;
  interviewCredits?: number;
  ownedIndividually?: { personality: boolean; references: boolean; reportUnlocks: number; interviewCredits: number } | null;
};

// Sidebar hrefs that get a lock icon: features the seminar user has not unlocked yet. Normal users: none.
export function lockedNavHrefs(s: NavPlanState | null | undefined): string[] {
  if (!s || !isSeminarUser(s)) return [];
  if (s.plan) return s.plan.product === "plan_mentor" ? [] : ["/hub/account/expert"];
  const owned = s.ownedIndividually;
  return [
    !owned?.reportUnlocks && "/hub/account/report",
    !owned?.personality && "/hub/account/personality",
    !(s.interviewCredits ?? owned?.interviewCredits) && "/hub/account/interview",
    !owned?.references && "/hub/account/references",
    "/hub/account/expert", // mentoring is plan-only for allowlisted users
  ].filter((h): h is string => Boolean(h));
}

// shortcut: there is no FAILED status (the vendor only says PENDING/READY), so a report still PENDING a day after the
// check counts as failed (E7). Upgrade when the fitment check stores a real failure status.
export const REPORT_FAILED_AFTER_MS = 24 * 3_600_000;
export function leadReportState(status: string | null, createdAt: string, now = Date.now()): "ready" | "pending" | "failed" {
  if (status === "READY") return "ready";
  return now - Date.parse(createdAt) > REPORT_FAILED_AFTER_MS ? "failed" : "pending";
}
