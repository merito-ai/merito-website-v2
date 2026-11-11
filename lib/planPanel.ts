// "Your plan" panel rows (dashboard + pricing). Pure + client-safe: lib/plans.ts imports the service-role client.
export type PlanPanelInput = {
  product: "plan_prepare" | "plan_mentor";
  reportCreditsLeft: number;
  personality: "none" | "part2" | "done";
  interview: "unused" | "in_progress" | "ready";
  references: "none" | "in_progress" | "completed";
  mentoring: { status: string; scheduledAt: string | null } | null;
  mentoringPriceLabel: string;
  hasRole?: boolean; // default true; false = bought a plan before checking any role
};

export type PlanPanelRow = {
  key: string;
  label: string;
  included: boolean;
  status: string;
  action: { label: string; href: string } | null;
};

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
  const mentoring: Pick<PlanPanelRow, "status" | "action"> = !mentor
    ? { status: "Not in your plan", action: { label: `Add a mentoring session — ${i.mentoringPriceLabel}`, href: "/hub/account/expert" } }
    : m?.status === "completed"
      ? { status: "Completed", action: null }
      : m?.status === "scheduled"
        ? { status: m.scheduledAt ? `Scheduled ${date(m.scheduledAt)}` : "Scheduled", action: { label: "View", href: "/hub/account/expert" } }
        : { status: "Not booked yet", action: { label: "Book session", href: "/hub/account/expert" } };

  const rows: PlanPanelRow[] = [
    {
      key: "reports",
      label: "CV reports (3 roles)",
      included: true,
      status: i.reportCreditsLeft > 0 ? `${i.reportCreditsLeft} of ${REPORT_CREDITS} left` : `All ${REPORT_CREDITS} used · extra reports ₹299`,
      action: { label: "Check a role", href: "#check-role" },
    },
    { key: "personality", label: "Personality + culture", included: true, ...personality[i.personality] },
    { key: "interview", label: "AI interview (45 min)", included: true, ...interview[i.interview] },
    { key: "references", label: "References", included: true, ...references[i.references] },
    { key: "mentoring", label: "1-hour mentoring session", included: mentor, ...mentoring },
    {
      key: "assistance",
      label: "Application assistance (3 companies)",
      included: mentor,
      status: mentor ? "Our team will contact you to choose your 3 dream companies" : "Not in your plan",
      action: mentor ? { label: "Contact us", href: CONTACT_HREF } : null,
    },
    // The existing consolidated report + its share link; no separate profile feature.
    { key: "share", label: "Shareable consolidated profile", included: true, status: "One report combining all your results", action: { label: "View & share", href: "/hub/account/combined-report" } },
  ];
  if (i.hasRole !== false) return rows;
  // These pages redirect away without a role (expert too, unless Plan 2): send to the new-role modal instead.
  const needsRole = new Set(["personality", "interview", "references", ...(mentor ? [] : ["mentoring"])]);
  return rows.map((r) => (needsRole.has(r.key) ? { ...r, action: { label: "Check a role first", href: "#check-role" } } : r));
}
