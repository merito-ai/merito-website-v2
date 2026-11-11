import { describe, it, expect } from "vitest";
import { buildPlanPanelRows, planDashboardView, type PlanPanelInput } from "../planPanel";

const base: PlanPanelInput = {
  product: "plan_prepare",
  reportCreditsLeft: 3,
  personality: "none",
  interview: "unused",
  references: "none",
  mentoring: null,
  mentoringPriceLabel: "₹1999",
};
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

  it("Plan 1: mentoring + assistance not included, mentoring sold individually", () => {
    expect(row(base, "mentoring")).toMatchObject({ included: false, action: { label: "Add a mentoring session — ₹1999", href: "/hub/account/expert" } });
    expect(row(base, "assistance")).toMatchObject({ included: false, action: null });
  });

  it("Plan 2: mentoring book / scheduled / completed; assistance contact", () => {
    const p2 = { ...base, product: "plan_mentor" as const };
    expect(row({ ...p2, mentoring: { status: "requested", scheduledAt: null } }, "mentoring")).toMatchObject({ included: true, action: { label: "Book session" } });
    expect(row({ ...p2, mentoring: { status: "scheduled", scheduledAt: "2026-11-20T10:00:00Z" } }, "mentoring").status).toBe("Scheduled 20 Nov 2026");
    expect(row({ ...p2, mentoring: { status: "completed", scheduledAt: null } }, "mentoring")).toMatchObject({ status: "Completed", action: null });
    expect(row(p2, "assistance")).toMatchObject({ included: true, action: { href: "mailto:admin@merito.ai" } });
  });

  it("no role yet: role-bound rows point to check-a-role; Plan 2 mentoring + share keep their pages", () => {
    const noRole = { ...base, hasRole: false };
    for (const k of ["reports", "personality", "interview", "references", "mentoring"]) {
      expect(row(noRole, k).action!.href).toBe("#check-role");
    }
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

  it("assistance is informational: never marked, never done; booked mentoring skips to share", () => {
    const all = { ...p2, personality: "done" as const, references: "completed" as const, interview: "ready" as const, mentoring: { status: "scheduled", scheduledAt: null } };
    expect(row(all, "mentoring").done).toBe(true);
    expect(row(all, "assistance")).toMatchObject({ done: false, marker: null, status: "Our team will call you about your 3 dream companies" });
    expect(marked(all)).toEqual([expect.objectContaining({ key: "share", marker: "Next step" })]);
  });

  it("Plan 1 skips not-included mentoring for the marker", () => {
    const all = { ...base, personality: "done" as const, references: "completed" as const, interview: "ready" as const };
    expect(marked(all)[0].key).toBe("share");
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
