import { PLAN_UPGRADE_PRICE_LABEL } from "@/lib/razorpay/pricing";
import { PLAN_FEATURE_DETAILS, ASSISTANCE_NEXT_STEP, INTERVIEW_VALIDITY_DAYS, PLAN_REPORT_COUNT as REPORT_CREDITS, type PlanFeatureKey, type AssistanceStatus } from "@/lib/planFeatures";
import type { GuideRow } from "@/lib/firstVisit";

// "Your plan" panel rows (dashboard + pricing). Pure + client-safe: lib/plans.ts imports the service-role client.
export type PlanPanelInput = {
  product: "plan_prepare" | "plan_mentor";
  reportCreditsLeft: number;
  personality: "none" | "part2" | "update" | "done"; // update = old v1 result, culture part not taken
  interview: "unused" | "in_progress" | "expired" | "ready"; // expired = invited, link past its deadline, never started
  references: "none" | "in_progress" | "completed";
  mentoring: MentoringRow[]; // Plan 2 counselling_requests rows (session 1 + follow-up)
  hasRole?: boolean; // default true; false = bought a plan before checking any role
  reportLocked?: boolean; // the current role's detailed report is not unlocked yet
  interviewDueBy?: Date | null; // invited but not started: vendor link expiry, else invited_at + INTERVIEW_VALIDITY_DAYS
  assistance?: AssistanceStatus; // Plan 2, set by the team in /admin/assistance
  rolesChecked?: number; // distinct roles checked (E9)
  interviewRole?: string | null; // role the plan's one interview was used for
};

export type MentoringRow = { session: number; status: string; scheduled_at: string | null };
export type MentoringSession = { status: string; scheduledAt: string | null; bookable: boolean; state: string };

const date = (iso: string) => new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kolkata" });

// [session 1, follow-up]. A missing row (legacy single-row order) reads as "requested" so the session stays visible.
// The follow-up opens once session 1 is scheduled or completed (admin sets both in the counselling queue).
export function mentoringSessions(rows: MentoringRow[]): [MentoringSession, MentoringSession] {
  const at = (n: number) => rows.find((r) => r.session === n) ?? { status: "requested", scheduled_at: null };
  const [a, b] = [at(1), at(2)];
  const firstBooked = a.status === "scheduled" || a.status === "completed";
  const view = (r: typeof a, open: boolean): MentoringSession => ({
    status: r.status,
    scheduledAt: r.scheduled_at,
    bookable: open && r.status === "requested",
    state:
      r.status === "completed" ? "Completed"
      : r.status === "scheduled" ? (r.scheduled_at ? `Scheduled ${date(r.scheduled_at)}` : "Scheduled")
      : r.status === "cancelled" ? "Cancelled"
      : open ? "Not booked yet" : "Book after session 1",
  });
  return [view(a, true), view(b, firstBooked)];
}

export type PlanPanelRow = GuideRow & {
  detail: string; // long "what you get" line (pricing copy)
  included: boolean;
  step: number | null; // null = not in this plan
  done: boolean;
};

export const CONTACT_HREF = "mailto:admin@merito.ai"; // the support address the legal/contact pages already use

// Plan holder timeline ("Your plan"): every benefit with live state; one Next / Start here marker.
export function buildPlanPanelRows(i: PlanPanelInput): PlanPanelRow[] {
  const mentor = i.product === "plan_mentor";
  const noRole = i.hasRole === false;
  const left = i.reportCreditsLeft;
  const personality: Record<PlanPanelInput["personality"], Pick<PlanPanelRow, "line" | "action">> = {
    none: { line: "You can do this anytime", action: { label: "Start", href: "/hub/account/personality" } },
    part2: { line: "Part 1 done", action: { label: "Continue part 2", href: "/hub/account/personality" } },
    update: { line: "Culture part pending", action: { label: "Take the updated test", href: "/hub/account/personality" } },
    done: { line: "Completed", action: { label: "View report", href: "/hub/account/personality" } },
  };
  const used = `Interview used${i.interviewRole ? ` for ${i.interviewRole}` : ""}`;
  const interview: Record<PlanPanelInput["interview"], Pick<PlanPanelRow, "line" | "action">> = {
    unused: noRole
      ? { line: `1 interview, for any one of your roles. Your ${INTERVIEW_VALIDITY_DAYS} days start when you begin.`, action: null }
      : { line: "1 interview, for any one of your roles. Pick the role you care most about.", action: { label: "Start interview", href: "/hub/account/interview" } },
    in_progress: { line: i.interviewDueBy ? `${used} · complete by ${date(i.interviewDueBy.toISOString())}` : used, action: { label: "Open", href: "/hub/account/interview" } },
    expired: { line: "Your interview link expired", action: { label: "Email us", href: CONTACT_HREF } },
    ready: { line: used, action: { label: "View report", href: "/hub/account/interview" } },
  };
  const references: Record<PlanPanelInput["references"], Pick<PlanPanelRow, "line" | "action">> = {
    none: { line: noRole ? "Referees vouch for you for this role" : "Invite your referees", action: { label: "Invite referees", href: "/hub/account/references" } },
    in_progress: { line: "Waiting on referees", action: { label: "View", href: "/hub/account/references" } },
    completed: { line: "Completed", action: { label: "View", href: "/hub/account/references" } },
  };
  const [s1, s2] = mentoringSessions(i.mentoring);
  const mentoringDone = s1.status === "completed" && s2.status === "completed";
  const expert = "/hub/account/expert";
  const checked = i.rolesChecked ?? REPORT_CREDITS - left;

  type Base = Omit<PlanPanelRow, "step" | "marker" | "detail" | "state" | "tag"> & { key: PlanFeatureKey; needsRole?: boolean; expired?: boolean };
  const reports: Base = noRole
    ? { key: "reports", icon: "target", title: "Check a role", included: true, done: false, line: `${REPORT_CREDITS} roles included · ${left} left`, action: { label: "Check my fit for a role", href: "#check-role" } }
    : i.reportLocked && left > 0
      // A checked role's detailed report still needs one click to spend a credit; until then step 1 sends them there.
      ? { key: "reports", icon: "target", title: "Check a role", included: true, done: false, line: `Your report is ready · ${left} of ${REPORT_CREDITS} left`, action: { label: "Open my report", href: "/hub/account/report" } }
      : {
          key: "reports",
          icon: "target",
          title: "Check a role",
          included: true,
          done: true,
          line: left > 0 ? `${checked} ${checked === 1 ? "role" : "roles"} checked · ${left} left` : `All ${REPORT_CREDITS} used · extra roles ₹299`,
          action: { label: "Check another role", href: "#check-role" },
        };
  const base: Base[] = [
    reports,
    { key: "personality", icon: "brain", title: "Personality + culture", included: true, done: i.personality === "done", ...personality[i.personality] },
    { key: "interview", icon: "mic", title: "45-min AI interview", included: true, done: i.interview === "ready", needsRole: noRole, expired: i.interview === "expired", ...interview[i.interview] },
    { key: "references", icon: "users", title: "References", included: true, done: i.references !== "none", needsRole: noRole, ...references[i.references] },
    mentor
      ? {
          key: "mentoring",
          icon: "mentor",
          title: "Mentoring",
          included: true,
          done: mentoringDone,
          line: mentoringDone ? "Both sessions completed" : `Session 1: ${s1.state}\nFollow-up: ${s2.state}`,
          action: s1.bookable ? { label: "Book session 1", href: expert }
            : s2.bookable ? { label: "Book follow-up", href: expert }
            : s1.status === "scheduled" || s2.status === "scheduled" ? { label: "View", href: expert }
            : null,
        }
      // Assess + Prepare: one upsell row for both Mentor + Apply extras; the pricing table carries the checkout.
      : { key: "mentoring", icon: "mentor", title: "Mentoring + application help", included: false, done: false, line: "Add with Assess + Mentor + Apply", action: { label: `Upgrade for ${PLAN_UPGRADE_PRICE_LABEL}`, href: "/hub/account/pricing" } },
    ...(mentor
      ? [{
          key: "assistance" as const,
          icon: "briefcase" as const,
          title: "Application assistance",
          included: true,
          done: i.assistance === "done", // the team marks it in /admin/assistance; nothing for the user to finish
          line: i.assistance === "done" ? "Our team has referred you to your 3 companies"
            : i.assistance === "in_progress" ? "In progress: our team is working on your 3 companies"
            : ASSISTANCE_NEXT_STEP,
          action: { label: "Email us", href: CONTACT_HREF },
        }]
      : []),
    // The existing consolidated report + its share link; no separate profile feature.
    { key: "share", icon: "share", title: "Shareable profile", included: true, done: false, needsRole: noRole, line: noRole ? "Builds as you complete steps" : "Updates as you complete steps", action: { label: "Share my profile", href: "/hub/account/combined-report" } },
  ];
  // Rows the plan doesn't include sit last.
  const ordered = [...base.filter((r) => r.included), ...base.filter((r) => !r.included)];
  const nextKey = ordered.find((r) => r.included && !r.done && !r.needsRole && r.key !== "assistance")?.key;
  let n = 0;
  return ordered.map(({ needsRole, expired, ...r }): PlanPanelRow => ({
    ...r,
    // Locked rows carry a "Needs a role" tag only: no buttons.
    action: needsRole ? null : r.action,
    detail: PLAN_FEATURE_DETAILS[r.key],
    step: r.included ? ++n : null,
    state: r.done ? "done" : r.key === nextKey ? "now" : needsRole || !r.included ? "locked" : "todo",
    marker: r.key === nextKey ? (r.key === "reports" && noRole ? "Start here" : "Next") : null,
    tag: r.done ? { kind: "ok", label: "Done" }
      : needsRole ? { kind: "need", label: "Needs a role" }
      : !r.included ? { kind: "p2", label: "Mentor + Apply" }
      : expired ? { kind: "warn", label: "Expired" }
      : r.key === "assistance" ? { kind: "team", label: "By our team" }
      : { kind: "incl", label: "Included" },
  }));
}
