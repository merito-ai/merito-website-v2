import { describe, it, expect } from "vitest";
import {
  firstVisitView,
  firstName,
  reportPreviewState,
  PREVIEW_COPY,
  PREVIEW_PLACEHOLDER_LINES,
  lockedSafeReport,
  buildGuideRows,
  type GuideInput,
} from "../firstVisit";
import { GUIDE_COPY } from "../planFeatures";

describe("firstVisitView", () => {
  const plan = { orderId: "o" };
  it.each([
    [false, null, false, "n1"],
    [false, null, true, "n2"],
    [true, null, false, "s1"],
    [true, null, true, "s2"],
    [true, plan, false, "plan"],
    [false, plan, true, "plan"], // E4: removed from the allowlist after buying keeps the plan view
  ] as const)("allowlisted=%s plan=%s hasRole=%s -> %s", (allowlisted, p, hasRole, view) => {
    expect(firstVisitView({ allowlisted, plan: p, hasRole })).toBe(view);
  });
  it("refunded plan (E3) drops back to s/n by allowlist", () => {
    expect(firstVisitView({ allowlisted: true, plan: null, hasRole: true })).toBe("s2");
    expect(firstVisitView({ allowlisted: false, plan: null, hasRole: false })).toBe("n1");
  });
});

describe("firstName (E12)", () => {
  it("first word of the lead name; unknown -> null", () => {
    expect(firstName("  Sneha  Rao ")).toBe("Sneha");
    expect(firstName("")).toBeNull();
    expect(firstName(null)).toBeNull();
  });
});

describe("locked report preview", () => {
  it("state from resume_match_status (E7)", () => {
    expect(reportPreviewState("READY")).toBe("ready");
    expect(reportPreviewState("PENDING")).toBe("pending");
    expect(reportPreviewState(null)).toBe("failed");
    expect(reportPreviewState("FAILED")).toBe("failed");
    expect(PREVIEW_COPY.failed).toBe("We couldn't prepare this report. Try checking the role again or email us.");
  });
  it("placeholders are fixed copy with no digits", () => {
    for (const l of PREVIEW_PLACEHOLDER_LINES) expect(l.text).not.toMatch(/\d/);
  });
  it("locked: report body and vendor summary never reach the client", () => {
    expect(lockedSafeReport(false, { strongPoints: ["real"] }, "Real summary")).toEqual({ report: null, verdict: "" });
    expect(lockedSafeReport(true, { strongPoints: ["real"] }, "Real summary")).toEqual({ report: { strongPoints: ["real"] }, verdict: "Real summary" });
  });
});

describe("buildGuideRows", () => {
  const base: GuideInput = {
    plans: false,
    roleTitle: null,
    reportUnlocked: false,
    personality: "not_started",
    personalityUnlocked: false,
    interview: "not_started",
    references: "none",
    referencesUnlocked: false,
  };
  const role = { ...base, roleTitle: "Product Analyst", leadId: "L1" };
  const keyed = (i: GuideInput) => Object.fromEntries(buildGuideRows(i).rows.map((r) => [r.key, r]));

  it("n1: 5 steps, fitment free + Start here, the rest Paid, no links", () => {
    const { rows, done, total } = buildGuideRows(base);
    expect(rows.map((r) => r.key)).toEqual(["score", "report", "personality", "interview", "references"]);
    expect(rows[0]).toMatchObject({ marker: "Start here", state: "now", tag: { kind: "free", label: "Free" } });
    expect(rows.slice(1).every((r) => r.tag.label === "Paid" && !r.href)).toBe(true);
    expect([done, total]).toEqual([0, 5]);
  });

  it("n2: score done with the role name (not the score), report Next, rows link to their pages", () => {
    const r = keyed(role);
    expect(r.score).toMatchObject({ state: "done", line: "Product Analyst", tag: { label: "Done" } });
    expect(r.report).toMatchObject({ marker: "Next", state: "now", href: "/hub/account/report?lead=L1", line: GUIDE_COPY.report });
    expect(buildGuideRows(role).done).toBe(1);
  });

  it("E1: owned items show Done / Unlocked / In progress instead of Paid", () => {
    const r = keyed({ ...role, reportUnlocked: true, personalityUnlocked: true, interview: "invited", references: "in_progress", referencesUnlocked: true });
    expect(r.report.tag.label).toBe("Done");
    expect(r.personality.tag).toEqual({ kind: "unlocked", label: "Unlocked" });
    expect(r.interview.tag.label).toBe("In progress");
    expect(r.references.tag.label).toBe("In progress");
    expect(r.personality.marker).toBe("Next");
  });

  it("E6/E10: expired interview link, old personality result", () => {
    expect(keyed({ ...role, interview: "expired" }).interview).toMatchObject({ line: "Your interview link expired", tag: { kind: "warn" } });
    expect(keyed({ ...role, personality: "update" }).personality).toMatchObject({ line: "Take the updated test", tag: { label: "In progress" } });
  });

  it("everything done: no Next marker left", () => {
    const all = buildGuideRows({ ...role, reportUnlocked: true, personality: "ready", interview: "ready", references: "completed" });
    expect(all.rows.every((r) => r.state === "done" && !r.marker)).toBe(true);
    expect([all.done, all.total]).toEqual([5, 5]);
  });

  it("s1: what a plan includes, no score row, no markers, All plans / Mentor + Apply", () => {
    const { rows } = buildGuideRows({ ...base, plans: true });
    expect(rows.map((r) => r.key)).toEqual(["report", "personality", "interview", "references", "mentoring", "assistance"]);
    expect(rows.filter((r) => r.marker)).toEqual([]);
    expect(rows.map((r) => r.tag.label)).toEqual(["All plans", "All plans", "All plans", "All plans", "Mentor + Apply", "Mentor + Apply"]);
  });

  it("s2: score done, 3 role reports Next (this role + 2 more), merged mentoring row; 1 of 6", () => {
    const { rows, done, total } = buildGuideRows({ ...role, plans: true });
    expect(rows.map((r) => r.key)).toEqual(["score", "report", "personality", "interview", "references", "mentoring"]);
    expect(rows[1]).toMatchObject({ title: "3 role reports", line: "This role + 2 more", marker: "Next" });
    expect([done, total]).toEqual([1, 6]);
  });

  it("copy: no em-dash, no Plan 1/2, no seminar", () => {
    for (const i of [base, role, { ...base, plans: true }, { ...role, plans: true }]) {
      expect(JSON.stringify(buildGuideRows(i)) + JSON.stringify(PREVIEW_COPY) + JSON.stringify(GUIDE_COPY)).not.toMatch(/—|Plan [12]|seminar/i);
    }
  });
});
