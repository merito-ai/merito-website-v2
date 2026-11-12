import { describe, it, expect } from "vitest";
import { buildPlanPanelRows, mentoringSessions, planDashboardView, CONTACT_HREF, type PlanPanelInput } from "../planPanel";
import { ASSISTANCE_NEXT_STEP } from "../planFeatures";

const base: PlanPanelInput = {
  product: "plan_prepare",
  reportCreditsLeft: 3,
  personality: "none",
  interview: "unused",
  references: "none",
  mentoring: [],
};
const s = (session: number, status: string, scheduled_at: string | null = null) => ({ session, status, scheduled_at });
const row = (input: PlanPanelInput, key: string) => buildPlanPanelRows(input).find((r) => r.key === key)!;

describe("buildPlanPanelRows", () => {
  it("lists every benefit in step order", () => {
    expect(buildPlanPanelRows(base).map((r) => r.key)).toEqual(["reports", "personality", "references", "interview", "mentoring", "assistance", "share"]);
  });

  it("reports: remaining count, check-a-role action; spent shows ₹299 extras", () => {
    expect(row(base, "reports")).toMatchObject({ status: "3 of 3 left", action: { label: "Check a role", href: "#check-role" } });
    expect(row({ ...base, reportCreditsLeft: 0 }, "reports").status).toBe("All 3 used · extra reports ₹299");
  });

  it("personality: start / continue part 2 / view report", () => {
    expect(row(base, "personality").action!.label).toBe("Start");
    expect(row({ ...base, personality: "part2" }, "personality").action!.label).toBe("Continue part 2");
    expect(row({ ...base, personality: "done" }, "personality")).toMatchObject({ status: "Completed", action: { label: "View report" } });
    // old v1 result: not done, prompts the culture part
    expect(row({ ...base, personality: "update" }, "personality")).toMatchObject({ done: false, status: "Culture part pending", action: { label: "Take the updated test" } });
  });

  it("interview: start / in progress / view report", () => {
    expect(row(base, "interview").action!.label).toBe("Start");
    expect(row({ ...base, interview: "in_progress" }, "interview")).toMatchObject({ status: "In progress", action: { label: "Open" } });
    expect(row({ ...base, interview: "ready" }, "interview").action!.label).toBe("View report");
  });

  it("references: invite / in progress / completed", () => {
    expect(row(base, "references").action!.label).toBe("Invite referees");
    expect(row({ ...base, references: "in_progress" }, "references").status).toBe("Waiting on referees");
    expect(row({ ...base, references: "completed" }, "references").status).toBe("Completed");
  });

  it("shareable profile is the existing consolidated report", () => {
    expect(row(base, "share")).toMatchObject({ label: "Share consolidated profile", action: { label: "View & share", href: "/hub/account/combined-report" } });
  });

  it("Plan 1: mentoring + assistance not included, both offer the ₹2,999 upgrade", () => {
    const upgrade = { label: "Upgrade to unlock for ₹2,999", href: "/hub/account/pricing" };
    expect(row(base, "mentoring")).toMatchObject({ included: false, action: upgrade });
    expect(row(base, "assistance")).toMatchObject({ included: false, action: upgrade });
  });

  it("Plan 2: session 1 bookable first; follow-up waits for session 1; assistance contact", () => {
    const p2 = { ...base, product: "plan_mentor" as const };
    const fresh = row({ ...p2, mentoring: [s(1, "requested"), s(2, "requested")] }, "mentoring");
    expect(fresh).toMatchObject({ included: true, done: false, status: "Session 1: Not booked yet\nFollow-up: Book after session 1", action: { label: "Book session 1", href: "/hub/account/expert" } });
    const s1Sched = row({ ...p2, mentoring: [s(1, "scheduled", "2026-11-20T10:00:00Z"), s(2, "requested")] }, "mentoring");
    expect(s1Sched).toMatchObject({ done: false, status: "Session 1: Scheduled 20 Nov 2026\nFollow-up: Not booked yet", action: { label: "Book follow-up" } });
    const bothSched = row({ ...p2, mentoring: [s(1, "completed"), s(2, "scheduled")] }, "mentoring");
    expect(bothSched).toMatchObject({ done: false, status: "Session 1: Completed\nFollow-up: Scheduled", action: { label: "View" } });
    expect(row({ ...p2, mentoring: [s(1, "completed"), s(2, "completed")] }, "mentoring")).toMatchObject({ done: true, status: "Both sessions completed", action: null });
    expect(row(p2, "assistance")).toMatchObject({ included: true, action: { href: "mailto:admin@merito.ai" } });
  });

  it("no role yet: role-bound rows point to check-a-role; mentoring/upgrade + share keep their pages", () => {
    const noRole = { ...base, hasRole: false };
    for (const k of ["reports", "personality", "interview", "references"]) {
      expect(row(noRole, k).action!.href).toBe("#check-role");
    }
    expect(row(noRole, "mentoring").action!.href).toBe("/hub/account/pricing");
    expect(row({ ...noRole, product: "plan_mentor" }, "mentoring").action!.href).toBe("/hub/account/expert");
    expect(row(noRole, "share").action!.href).toBe("/hub/account/combined-report");
    expect(row(base, "interview").action!.href).toBe("/hub/account/interview");
  });
});

describe("plan steps", () => {
  const p2: PlanPanelInput = { ...base, product: "plan_mentor" };
  const marked = (input: PlanPanelInput) => buildPlanPanelRows(input).filter((r) => r.marker);

  it("Plan 2 numbers all 7 steps 1-7", () => {
    expect(buildPlanPanelRows(p2).map((r) => r.step)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it("Plan 1: Plan-2-only rows have no number; share is step 5", () => {
    expect(buildPlanPanelRows(base).map((r) => r.step)).toEqual([1, 2, 3, 4, null, null, 5]);
  });

  it("no role: single Start here marker on step 1", () => {
    expect(marked({ ...base, hasRole: false })).toEqual([expect.objectContaining({ key: "reports", marker: "Start here", done: false })]);
  });

  it("role checked but its report not opened yet: step 1 points to the report and keeps the marker", () => {
    const r = row({ ...base, reportLocked: true }, "reports");
    expect(r).toMatchObject({ done: false, status: "Your report is ready · 3 of 3 left", action: { label: "Open my report", href: "/hub/account/report" } });
    expect(marked({ ...base, reportLocked: true })).toEqual([expect.objectContaining({ key: "reports", marker: "Next step" })]);
    // no credits left: the ₹299 report is optional, so step 1 still counts as done
    expect(row({ ...base, reportLocked: true, reportCreditsLeft: 0 }, "reports").done).toBe(true);
  });

  it("role checked: step 1 done, Next step on personality", () => {
    expect(row(base, "reports").done).toBe(true);
    expect(marked(base)).toEqual([expect.objectContaining({ key: "personality", marker: "Next step" })]);
  });

  it("walks the order: personality done -> references; invited -> interview; interview ready -> mentoring (Plan 2)", () => {
    const a = { ...p2, personality: "done" as const };
    expect(marked(a)[0].key).toBe("references");
    const b = { ...a, references: "in_progress" as const };
    expect(row(b, "references").done).toBe(true);
    expect(marked(b)[0].key).toBe("interview");
    const c = { ...b, interview: "in_progress" as const };
    expect(marked(c)[0].key).toBe("interview");
    const d = { ...b, interview: "ready" as const };
    expect(marked(d)[0].key).toBe("mentoring");
  });

  it("mentoring keeps the marker until BOTH sessions are completed", () => {
    const all = { ...p2, personality: "done" as const, references: "completed" as const, interview: "ready" as const };
    expect(marked({ ...all, mentoring: [s(1, "completed"), s(2, "scheduled")] })[0].key).toBe("mentoring");
    expect(marked({ ...all, mentoring: [s(1, "scheduled"), s(2, "requested")] })[0].key).toBe("mentoring");
  });

  it("assistance is informational: never marked, never done; completed mentoring skips to share", () => {
    const all = { ...p2, personality: "done" as const, references: "completed" as const, interview: "ready" as const, mentoring: [s(1, "completed"), s(2, "completed")] };
    expect(row(all, "mentoring").done).toBe(true);
    expect(row(all, "assistance")).toMatchObject({ done: false, marker: null, status: ASSISTANCE_NEXT_STEP, action: { label: "Email us", href: CONTACT_HREF } });
    expect(marked(all)).toEqual([expect.objectContaining({ key: "share", marker: "Next step" })]);
  });

  it("Plan 1 skips not-included mentoring for the marker", () => {
    const all = { ...base, personality: "done" as const, references: "completed" as const, interview: "ready" as const };
    expect(marked(all)[0].key).toBe("share");
  });
});

describe("mentoringSessions", () => {
  it("follow-up is bookable only once session 1 is scheduled or completed", () => {
    expect(mentoringSessions([s(1, "requested"), s(2, "requested")]).map((x) => x.bookable)).toEqual([true, false]);
    expect(mentoringSessions([s(1, "scheduled"), s(2, "requested")]).map((x) => x.bookable)).toEqual([false, true]);
    expect(mentoringSessions([s(1, "completed"), s(2, "requested")]).map((x) => x.bookable)).toEqual([false, true]);
    expect(mentoringSessions([s(1, "completed"), s(2, "scheduled")]).map((x) => x.bookable)).toEqual([false, false]);
  });
  it("legacy order with only the first-session row: follow-up reads as not booked (gated on session 1)", () => {
    expect(mentoringSessions([s(1, "scheduled")])[1]).toMatchObject({ status: "requested", bookable: true, state: "Not booked yet" });
    expect(mentoringSessions([s(1, "requested")])[1]).toMatchObject({ bookable: false, state: "Book after session 1" });
  });
  it("row order does not matter; cancelled sessions are not bookable", () => {
    expect(mentoringSessions([s(2, "requested"), s(1, "completed")]).map((x) => x.status)).toEqual(["completed", "requested"]);
    expect(mentoringSessions([s(1, "cancelled"), s(2, "cancelled")]).map((x) => [x.bookable, x.state])).toEqual([[false, "Cancelled"], [false, "Cancelled"]]);
  });
});

describe("planDashboardView", () => {
  const plan = { orderId: "o", product: "plan_prepare" as const, interviewUsed: false, reportCreditsLeft: 3 };
  it("plan holder -> panel; allowlisted without plan -> offer; everyone else -> none", () => {
    expect(planDashboardView({ allowlisted: true, plan })).toBe("panel");
    expect(planDashboardView({ allowlisted: true, plan: null })).toBe("offer");
    expect(planDashboardView({ allowlisted: false, plan: null })).toBe("none");
  });
});
