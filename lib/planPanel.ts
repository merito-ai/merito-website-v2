import { PLAN_UPGRADE_PRICE_LABEL } from "@/lib/razorpay/pricing";
import { PLAN_FEATURE_DETAILS, type PlanFeatureKey } from "@/lib/planFeatures";

// "Your plan" panel rows (dashboard + pricing). Pure + client-safe: lib/plans.ts imports the service-role client.
export type PlanPanelInput = {
  product: "plan_prepare" | "plan_mentor";
  reportCreditsLeft: number;
  personality: "none" | "part2" | "done";
  interview: "unused" | "in_progress" | "ready";
  references: "none" | "in_progress" | "completed";
  mentoring: { status: string; scheduledAt: string | null } | null;
  hasRole?: boolean; // default true; false = bought a plan before checking any role
};

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
};

// Dashboard plan slot: holders get the panel, allowlisted (seminar) users without a plan get the plan offer.
export function planDashboardView(s: { allowlisted: boolean; plan: unknown }): "panel" | "offer" | "none" {
  return s.plan ? "panel" : s.allowlisted ? "offer" : "none";
}

const REPORT_CREDITS = 3; // mirrors PLAN_REPORT_CREDITS in lib/plans.ts
export const CONTACT_HREF = "mailto:admin@merito.ai"; // the support address the legal/contact pages already use

const date = (iso: string) => new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kolkata" });

export function buildPlanPanelRows(i: PlanPanelInput): PlanPanelRow[] {
  const mentor = i.product === "plan_mentor";
  const personality: Record<PlanPanelInput["personality"], Pick<PlanPanelRow, "status" | "action">> = {
    none: { status: "Not started", action: { label: "Start", href: "/hub/account/personality" } },
    part2: { status: "Part 1 done", action: { label: "Continue part 2", href: "/hub/account/personality" } },
    done: { status: "Completed", action: { label: "View report", href: "/hub/account/personality" } },
  };
  const interview: Record<PlanPanelInput["interview"], Pick<PlanPanelRow, "status" | "action">> = {
    unused: { status: "Ready to start", action: { label: "Start", href: "/hub/account/interview" } },
    in_progress: { status: "In progress", action: { label: "Open", href: "/hub/account/interview" } },
    ready: { status: "Completed", action: { label: "View report", href: "/hub/account/interview" } },
  };
  const references: Record<PlanPanelInput["references"], Pick<PlanPanelRow, "status" | "action">> = {
    none: { status: "Not started", action: { label: "Invite referees", href: "/hub/account/references" } },
    in_progress: { status: "Waiting on referees", action: { label: "View", href: "/hub/account/references" } },
    completed: { status: "Completed", action: { label: "View", href: "/hub/account/references" } },
  };
  const m = i.mentoring;
  // Plan 1's Plan-2-only rows sell the upgrade; the pricing table carries the checkout.
  const upgrade = { label: `Upgrade to unlock for ${PLAN_UPGRADE_PRICE_LABEL}`, href: "/hub/account/pricing" };
  const mentoring: Pick<PlanPanelRow, "status" | "action"> = !mentor
    ? { status: "Not in your plan", action: upgrade }
    : m?.status === "completed"
      ? { status: "Completed", action: null }
      : m?.status === "scheduled"
        ? { status: m.scheduledAt ? `Scheduled ${date(m.scheduledAt)}` : "Scheduled", action: { label: "View", href: "/hub/account/expert" } }
        : { status: "Not booked yet", action: { label: "Book session", href: "/hub/account/expert" } };

  type Base = Omit<PlanPanelRow, "step" | "done" | "marker" | "detail"> & { key: PlanFeatureKey; done: boolean };
  const base: Base[] = [
    {
      key: "reports",
      label: "Check a role (CV report)",
      included: true,
      done: i.hasRole !== false,
      status: i.reportCreditsLeft > 0 ? `${i.reportCreditsLeft} of ${REPORT_CREDITS} left` : `All ${REPORT_CREDITS} used · extra reports ₹299`,
      action: { label: "Check a role", href: "#check-role" },
    },
    { key: "personality", label: "Personality + culture", included: true, done: i.personality === "done", ...personality[i.personality] },
    { key: "references", label: "Invite referees", included: true, done: i.references !== "none", ...references[i.references] },
    { key: "interview", label: "AI interview (45 min)", included: true, done: i.interview === "ready", ...interview[i.interview] },
    { key: "mentoring", label: "Book mentoring (1 hour)", included: mentor, done: mentor && (m?.status === "scheduled" || m?.status === "completed"), ...mentoring },
    {
      key: "assistance",
      label: "Application assistance (3 companies)",
      included: mentor,
      done: false, // informational: the team calls, nothing for the user to finish
      status: mentor ? "Our team will call you about your 3 dream companies" : "Not in your plan",
      action: mentor ? { label: "Contact us", href: CONTACT_HREF } : upgrade,
    },
    // The existing consolidated report + its share link; no separate profile feature.
    { key: "share", label: "Share consolidated profile", included: true, done: false, status: "Updates as you complete steps", action: { label: "View & share", href: "/hub/account/combined-report" } },
  ];
  let n = 0;
  const nextKey = base.find((r) => r.included && !r.done && r.key !== "assistance")?.key;
  const rows: PlanPanelRow[] = base.map((r) => ({
    ...r,
    detail: PLAN_FEATURE_DETAILS[r.key],
    step: r.included ? ++n : null,
    marker: r.key === nextKey ? (r.key === "reports" ? "Start here" : "Next step") : null,
  }));
  if (i.hasRole !== false) return rows;
  // These pages redirect away without a role: send to the new-role modal instead (expert/pricing don't need one).
  const needsRole = new Set(["personality", "interview", "references"]);
  return rows.map((r) => (needsRole.has(r.key) ? { ...r, action: { label: "Check a role first", href: "#check-role" } } : r));
}
