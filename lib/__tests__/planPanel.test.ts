import { describe, it, expect } from "vitest";
import { buildPlanPanelRows, mentoringSessions, CONTACT_HREF, type PlanPanelInput } from "../planPanel";
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
  const p2: PlanPanelInput = { ...base, product: "plan_mentor" };
  const marked = (input: PlanPanelInput) => buildPlanPanelRows(input).filter((r) => r.marker);

  it("timeline order; Assess + Prepare merges both Mentor + Apply extras into one upsell row, last", () => {
    expect(buildPlanPanelRows(p2).map((r) => r.key)).toEqual(["reports", "personality", "interview", "references", "mentoring", "assistance", "share"]);
    expect(buildPlanPanelRows(base).map((r) => r.key)).toEqual(["reports", "personality", "interview", "references", "share", "mentoring"]);
    expect(row(base, "mentoring")).toMatchObject({
      included: false,
      state: "locked",
      title: "Mentoring + application help",
      tag: { label: "Mentor + Apply" },
      action: { label: "Upgrade for ₹2,999", href: "/hub/account/pricing" },
    });
  });

  it("steps: included rows numbered, upsell row unnumbered", () => {
    expect(buildPlanPanelRows(p2).map((r) => r.step)).toEqual([1, 2, 3, 4, 5, 6, 7]);
    expect(buildPlanPanelRows(base).map((r) => r.step)).toEqual([1, 2, 3, 4, 5, null]);
  });

  it("reports: roles checked + left (E9); all used shows ₹299 extra roles (E8)", () => {
    expect(row({ ...base, reportCreditsLeft: 1, rolesChecked: 2 }, "reports")).toMatchObject({ done: true, line: "2 roles checked · 1 left", action: { href: "#check-role" } });
    expect(row({ ...base, reportCreditsLeft: 0, rolesChecked: 3 }, "reports").line).toBe("All 3 used · extra roles ₹299");
  });

  it("role checked but its report not opened: step 1 points to the report and keeps the marker", () => {
    expect(row({ ...base, reportLocked: true }, "reports")).toMatchObject({ done: false, line: "Your report is ready · 3 of 3 left", action: { label: "Open my report" } });
    expect(marked({ ...base, reportLocked: true }).map((r) => [r.key, r.marker])).toEqual([["reports", "Next"]]);
    expect(row({ ...base, reportLocked: true, reportCreditsLeft: 0 }, "reports").done).toBe(true);
  });

  it("personality: available anytime, part 2 / updated test states (E10)", () => {
    expect(row(base, "personality")).toMatchObject({ line: "You can do this anytime", action: { label: "Start" } });
    expect(row({ ...base, hasRole: false }, "personality")).toMatchObject({ state: "todo", action: { href: "/hub/account/personality" } });
    expect(row({ ...base, personality: "part2" }, "personality").action!.label).toBe("Continue part 2");
    expect(row({ ...base, personality: "update" }, "personality")).toMatchObject({ done: false, action: { label: "Take the updated test" } });
    expect(row({ ...base, personality: "done" }, "personality")).toMatchObject({ done: true, tag: { kind: "ok", label: "Done" } });
  });

  it("interview: one per plan, used-for-role after start, expired link (E6)", () => {
    expect(row(base, "interview").line).toBe("1 interview, for any one of your roles. Pick the role you care most about.");
    expect(row({ ...base, interview: "in_progress", interviewRole: "Product Analyst", interviewDueBy: new Date("2026-11-22T06:00:00Z") }, "interview").line).toBe(
      "Interview used for Product Analyst · complete by 22 Nov 2026",
    );
    expect(row({ ...base, interview: "ready", interviewRole: "Product Analyst" }, "interview")).toMatchObject({ done: true, line: "Interview used for Product Analyst", action: { label: "View report" } });
    expect(row({ ...base, interview: "expired" }, "interview")).toMatchObject({ done: false, line: "Your interview link expired", tag: { kind: "warn" }, action: { label: "Email us", href: CONTACT_HREF } });
  });

  it("no role yet (P1): Start here on step 1; interview, references, share locked with a tag only", () => {
    const noRole = { ...p2, hasRole: false };
    expect(marked(noRole).map((r) => [r.key, r.marker])).toEqual([["reports", "Start here"]]);
    expect(row(noRole, "reports").line).toBe("3 roles included · 3 left");
    for (const k of ["interview", "references", "share"]) {
      expect(row(noRole, k)).toMatchObject({ state: "locked", action: null, tag: { kind: "need", label: "Needs a role" } });
    }
    expect(row(noRole, "interview").line).toBe("1 interview, for any one of your roles. Your 10 days start when you begin.");
    expect(row(noRole, "mentoring").action!.href).toBe("/hub/account/expert");
  });

  it("walks the order: personality -> interview -> references -> mentoring (Mentor + Apply)", () => {
    expect(marked(p2)[0].key).toBe("personality");
    const a = { ...p2, personality: "done" as const };
    expect(marked(a)[0].key).toBe("interview");
    const b = { ...a, interview: "ready" as const };
    expect(marked(b)[0].key).toBe("references");
    expect(marked({ ...b, references: "in_progress" as const })[0].key).toBe("mentoring");
  });

  it("mentoring keeps the marker until both sessions complete; session states unchanged (E16)", () => {
    const all = { ...p2, personality: "done" as const, references: "completed" as const, interview: "ready" as const };
    expect(row({ ...all, mentoring: [s(1, "requested"), s(2, "requested")] }, "mentoring")).toMatchObject({ line: "Session 1: Not booked yet\nFollow-up: Book after session 1", action: { label: "Book session 1" } });
    expect(marked({ ...all, mentoring: [s(1, "completed"), s(2, "scheduled")] })[0].key).toBe("mentoring");
    expect(row({ ...all, mentoring: [s(1, "completed"), s(2, "completed")] }, "mentoring")).toMatchObject({ done: true, action: null });
  });

  it("everything done (E11): share is the only Next, with Share my profile", () => {
    const all = { ...p2, personality: "done" as const, references: "completed" as const, interview: "ready" as const, mentoring: [s(1, "completed"), s(2, "completed")] };
    expect(marked(all)).toEqual([expect.objectContaining({ key: "share", marker: "Next", action: { label: "Share my profile", href: "/hub/account/combined-report" } })]);
    expect(row(all, "assistance")).toMatchObject({ marker: null, line: ASSISTANCE_NEXT_STEP, tag: { label: "By our team" } });
  });

  it("assistance shows the team's status (E16)", () => {
    expect(row({ ...p2, assistance: "in_progress" }, "assistance").line).toBe("In progress: our team is working on your 3 companies");
    expect(row({ ...p2, assistance: "done" }, "assistance")).toMatchObject({ done: true, line: "Our team has referred you to your 3 companies" });
  });

  it("copy: no em-dash, no Plan 1/2, no seminar", () => {
    for (const input of [base, p2, { ...p2, hasRole: false }, { ...base, interview: "expired" as const }]) {
      const text = JSON.stringify(buildPlanPanelRows(input));
      expect(text).not.toMatch(/—|Plan [12]|seminar/i);
    }
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

