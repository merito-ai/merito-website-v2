import { PLAN_UPGRADE_PRICE_LABEL } from "@/lib/razorpay/pricing";
import { PLAN_FEATURE_DETAILS, ASSISTANCE_NEXT_STEP, INTERVIEW_VALIDITY_DAYS, CHECK_FIT_LABEL, type PlanFeatureKey, type AssistanceStatus } from "@/lib/planFeatures";

// "Your plan" panel rows (dashboard + pricing). Pure + client-safe: lib/plans.ts imports the service-role client.
export type PlanPanelInput = {
  product: "plan_prepare" | "plan_mentor";
  reportCreditsLeft: number;
  personality: "none" | "part2" | "update" | "done"; // update = old v1 result, culture part not taken
  interview: "unused" | "in_progress" | "ready";
  references: "none" | "in_progress" | "completed";
  mentoring: MentoringRow[]; // Plan 2 counselling_requests rows (session 1 + follow-up)
  hasRole?: boolean; // default true; false = bought a plan before checking any role
  reportLocked?: boolean; // the current role's detailed report is not unlocked yet
  interviewDueBy?: Date | null; // invited but not started: vendor link expiry, else invited_at + INTERVIEW_VALIDITY_DAYS
  assistance?: AssistanceStatus; // Plan 2, set by the team in /admin/assistance
  interviewRole?: string | null; // role the plan's one interview was used for
  rolesChecked?: number; // E9: distinct roles checked so far
  interviewExpired?: boolean; // E6: invited, never started, link past its 10 days
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
  // E16: session 1 first; the follow-up says when it unlocks.
  const view = (r: typeof a, open: boolean, n: number): MentoringSession => ({
    status: r.status,
    scheduledAt: r.scheduled_at,
    bookable: open && r.status === "requested",
    state:
      r.status === "completed" ? "Completed"
      : r.status === "scheduled" ? (r.scheduled_at ? `Scheduled ${date(r.scheduled_at)}` : "Scheduled")
      : r.status === "cancelled" ? "Cancelled"
      : !open ? "Book after session 1"
      : n === 2 ? "Unlocked, not booked yet" : "Not booked yet",
  });
  return [view(a, true, 1), view(b, firstBooked, 2)];
}

export type PlanPanelRow = {
  key: string;
  label: string;
  detail: string;
  included: boolean;
  status: string;
  action: { label: string; href: string } | null;
  step: number | null; // null = not in this plan
  done: boolean;
  marker: "Start here" | "Next step" | null; // only on the first incomplete step
  needsRole?: boolean; // no role checked yet: the row's page can't open, so no action
};

// Dashboard plan slot: holders get the panel, allowlisted (seminar) users without a plan get the plan offer.
export function planDashboardView(s: { allowlisted: boolean; plan: unknown }): "panel" | "offer" | "none" {
  return s.plan ? "panel" : s.allowlisted ? "offer" : "none";
}

const REPORT_CREDITS = 3; // mirrors PLAN_REPORT_CREDITS in lib/plans.ts
export const CONTACT_HREF = "mailto:admin@merito.ai"; // the support address the legal/contact pages already use

export function buildPlanPanelRows(i: PlanPanelInput): PlanPanelRow[] {
  const mentor = i.product === "plan_mentor";
  const personality: Record<PlanPanelInput["personality"], Pick<PlanPanelRow, "status" | "action">> = {
    none: { status: "Not started", action: { label: "Start", href: "/hub/account/personality" } },
    part2: { status: "Part 1 done", action: { label: "Continue part 2", href: "/hub/account/personality" } },
    update: { status: "Culture part pending", action: { label: "Take the updated test", href: "/hub/account/personality" } },
    done: { status: "Completed", action: { label: "View report", href: "/hub/account/personality" } },
  };
  // One interview per plan, for one role: say so before it starts, and name the role after.
  const used = `Interview used${i.interviewRole ? ` for ${i.interviewRole}` : ""}`;
  const interview: Record<PlanPanelInput["interview"], Pick<PlanPanelRow, "status" | "action">> = {
    unused: { status: "1 interview, for any one of your roles. Pick the role you care most about.", action: { label: "Start", href: "/hub/account/interview" } },
    // E6: no dead Start once the link expired; the team can reinvite.
    in_progress: i.interviewExpired
      ? { status: `${used} · Your interview link expired`, action: { label: "Email us", href: CONTACT_HREF } }
      : { status: i.interviewDueBy ? `${used} · complete by ${date(i.interviewDueBy.toISOString())}` : used, action: { label: "Open", href: "/hub/account/interview" } },
    ready: { status: used, action: { label: "View report", href: "/hub/account/interview" } },
  };
  const references: Record<PlanPanelInput["references"], Pick<PlanPanelRow, "status" | "action">> = {
    none: { status: "Not started", action: { label: "Invite referees", href: "/hub/account/references" } },
    in_progress: { status: "Waiting on referees", action: { label: "View", href: "/hub/account/references" } },
    completed: { status: "Completed", action: { label: "View", href: "/hub/account/references" } },
  };
  const [s1, s2] = mentoringSessions(i.mentoring);
  const mentoringDone = s1.status === "completed" && s2.status === "completed";
  const expert = "/hub/account/expert";
  // Plan 1's Plan-2-only rows sell the upgrade; the pricing table carries the checkout.
  const upgrade = { label: `Upgrade to unlock for ${PLAN_UPGRADE_PRICE_LABEL}`, href: "/hub/account/pricing" };
  const mentoring: Pick<PlanPanelRow, "status" | "action"> = !mentor
    ? { status: "Not in your plan", action: upgrade }
    : {
        status: mentoringDone ? "Both sessions completed" : `Session 1: ${s1.state}\nFollow-up: ${s2.state}`,
        action: s1.bookable ? { label: "Book session 1", href: expert }
          : s2.bookable ? { label: "Book follow-up", href: expert }
          : s1.status === "scheduled" || s2.status === "scheduled" ? { label: "View", href: expert }
          : null,
      };

  type Base = Omit<PlanPanelRow, "step" | "done" | "marker" | "detail"> & { key: PlanFeatureKey; done: boolean };
  const base: Base[] = [
    // A checked role's detailed report still needs one click to spend a credit; until then step 1 sends them there.
    i.hasRole !== false && i.reportLocked && i.reportCreditsLeft > 0
      ? {
          key: "reports",
          label: "Check my fit for a role",
          included: true,
          done: false,
          status: `Your report is ready · ${i.reportCreditsLeft} of ${REPORT_CREDITS} left`,
          action: { label: "Open my report", href: "/hub/account/report" },
        }
      : {
          key: "reports",
          label: "Check my fit for a role",
          included: true,
          done: i.hasRole !== false,
          status: i.reportCreditsLeft === 0 ? `All ${REPORT_CREDITS} used · extra roles ₹299`
            : i.rolesChecked ? `${i.rolesChecked} ${i.rolesChecked === 1 ? "role" : "roles"} checked · ${i.reportCreditsLeft} left`
            : `${i.reportCreditsLeft} of ${REPORT_CREDITS} left`,
          action: { label: CHECK_FIT_LABEL, href: "#check-role" },
        },
    { key: "personality", label: "Personality + culture", included: true, done: i.personality === "done", ...personality[i.personality] },
    { key: "references", label: "Invite referees", included: true, done: i.references !== "none", ...references[i.references] },
    { key: "interview", label: "AI interview (45 min)", included: true, done: i.interview === "ready", ...interview[i.interview] },
    { key: "mentoring", label: "Mentoring (two 30-min sessions)", included: mentor, done: mentor && mentoringDone, ...mentoring },
    {
      key: "assistance",
      label: "Application assistance (3 companies)",
      included: mentor,
      done: mentor && i.assistance === "done", // the team marks it in /admin/assistance; nothing for the user to finish
      status: !mentor ? "Not in your plan"
        : i.assistance === "done" ? "Our team has referred you to your 3 companies"
        : i.assistance === "in_progress" ? "In progress: our team is working on your 3 companies"
        : `Not contacted yet. ${ASSISTANCE_NEXT_STEP}`,
      action: mentor ? { label: "Email us", href: CONTACT_HREF } : upgrade,
    },
    // The existing consolidated report + its share link; no separate profile feature.
    { key: "share", label: "Share consolidated profile", included: true, done: false, status: "Updates as you complete steps", action: { label: "View & share", href: "/hub/account/combined-report" } },
  ];
  let n = 0;
  // E11: every step done -> the profile is the one thing left, and sharing it is the next action.
  const share = base.find((r) => r.key === "share")!;
  if (base.every((r) => !r.included || r.done || r.key === "share" || r.key === "assistance")) {
    Object.assign(share, { status: "Everything is done. Your profile is ready to share.", action: { label: "Share my profile", href: share.action!.href } });
  }
  const nextKey = base.find((r) => r.included && !r.done && r.key !== "assistance")?.key;
  const rows: PlanPanelRow[] = base.map((r) => ({
    ...r,
    detail: PLAN_FEATURE_DETAILS[r.key],
    step: r.included ? ++n : null,
    marker: r.key === nextKey ? (r.key === "reports" && i.hasRole === false ? "Start here" : "Next step") : null,
  }));
  if (i.hasRole !== false) return rows;
  // No role yet: step 1 is the dashboard's main button, so no second one here. Personality works without a role;
  // interview, references and the shareable profile are built around one: a "Needs a role" state, no dead link.
  const needsRole = new Set(["interview", "references", "share"]);
  return rows.map((r) =>
    r.key === "reports" ? { ...r, action: null }
    : r.key === "personality" && i.personality === "none" ? { ...r, status: "You can do this anytime" }
    : !needsRole.has(r.key) ? r
    : { ...r, action: null, needsRole: true, status: r.key === "interview" ? `1 interview, for any one of your roles. Your ${INTERVIEW_VALIDITY_DAYS} days start when you begin.` : r.status },
  );
}
