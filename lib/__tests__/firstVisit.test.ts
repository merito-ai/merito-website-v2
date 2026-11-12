import { describe, it, expect } from "vitest";
import { firstVisitView, firstName, howMeritoWorksRows, planIncludesRows, isSeminarUser, lockedNavHrefs } from "../firstVisit";
import { buildPlanPanelRows } from "../planPanel";

describe("firstVisitView", () => {
  const plan = { orderId: "o" };
  it.each([
    [false, null, false, "n1"],
    [false, null, true, "n2"],
    [true, null, false, "s1"],
    [true, null, true, "s2"],
    [true, plan, false, "plan"],
    [false, plan, false, "plan"], // E4: removed from the allowlist after buying keeps the plan view
  ] as const)("allowlisted=%s plan=%s hasRole=%s -> %s", (allowlisted, p, hasRole, view) => {
    expect(firstVisitView({ allowlisted, plan: p, hasRole })).toBe(view);
  });
  it("E3: a refunded plan (plan gone) drops back by allowlist", () => {
    expect(firstVisitView({ allowlisted: true, plan: null, hasRole: false })).toBe("s1");
    expect(firstVisitView({ allowlisted: false, plan: null, hasRole: false })).toBe("n1");
  });
});

describe("firstName (E12)", () => {
  it("first word of the name; unknown -> null", () => {
    expect(firstName("  Sneha  Rao ")).toBe("Sneha");
    expect(firstName("")).toBeNull();
    expect(firstName(undefined)).toBeNull();
  });
});

describe("no-role step lists", () => {
  it("n1: 5 steps, the free fitment check is the one Start here; the rest Paid; no buttons", () => {
    const rows = howMeritoWorksRows();
    expect(rows.map((r) => [r.label, r.status])).toEqual([
      ["Fitment score", "Free"],
      ["Detailed report", "Paid"],
      ["Personality + culture", "Paid"],
      ["Mock AI interview", "Paid"],
      ["References + shareable profile", "Paid"],
    ]);
    expect(rows.filter((r) => r.marker).map((r) => r.key)).toEqual(["score"]);
    expect(rows.every((r) => r.action === null)).toBe(true);
  });

  it("s1: what a plan includes, All plans / Mentor + Apply, no markers", () => {
    const rows = planIncludesRows();
    expect(rows.map((r) => r.status)).toEqual(["All plans", "All plans", "All plans", "All plans", "Mentor + Apply", "Mentor + Apply"]);
    expect(rows.find((r) => r.key === "interview")!.detail).toBe("For one of your roles. Scored report, 10 days to complete");
    expect(rows.some((r) => r.marker)).toBe(false);
  });

  it("copy: no em-dash, no Plan 1/2, no seminar", () => {
    const noRolePlan = buildPlanPanelRows({ product: "plan_mentor", reportCreditsLeft: 3, personality: "none", interview: "unused", references: "none", mentoring: [], hasRole: false });
    const text = JSON.stringify([howMeritoWorksRows(), planIncludesRows(), noRolePlan]);
    expect(text).not.toMatch(/—|Plan [12]\b|seminar/i);
  });
});

describe("isSeminarUser gate (normal users keep today's UI)", () => {
  it("only allowlisted users or plan holders", () => {
    expect(isSeminarUser({ allowlisted: false, plan: null })).toBe(false);
    expect(isSeminarUser(null)).toBe(false);
    expect(isSeminarUser({ allowlisted: true, plan: null })).toBe(true);
    expect(isSeminarUser({ allowlisted: false, plan: { orderId: "o" } })).toBe(true);
  });
  it("normal users: no sidebar locks, whatever they own", () => {
    expect(lockedNavHrefs({ allowlisted: false, plan: null, ownedIndividually: { personality: false, references: false, reportUnlocks: 0, interviewCredits: 0 } })).toEqual([]);
    expect(lockedNavHrefs(null)).toEqual([]);
  });
});

describe("lockedNavHrefs", () => {
  const none = { personality: false, references: false, reportUnlocks: 0, interviewCredits: 0 };
  it("allowlisted without a plan: every paid feature locked, owned ones open", () => {
    expect(lockedNavHrefs({ allowlisted: true, plan: null, ownedIndividually: none })).toEqual([
      "/hub/account/report", "/hub/account/personality", "/hub/account/interview", "/hub/account/references", "/hub/account/expert",
    ]);
    expect(lockedNavHrefs({ allowlisted: true, plan: null, interviewCredits: 1, ownedIndividually: { ...none, personality: true, reportUnlocks: 1 } })).toEqual([
      "/hub/account/references", "/hub/account/expert",
    ]);
  });
  it("plan holders: only mentoring for Assess + Prepare", () => {
    expect(lockedNavHrefs({ allowlisted: true, plan: { product: "plan_prepare" } })).toEqual(["/hub/account/expert"]);
    expect(lockedNavHrefs({ allowlisted: false, plan: { product: "plan_mentor" } })).toEqual([]);
  });
});
