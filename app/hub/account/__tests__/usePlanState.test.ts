import { describe, it, expect, vi, afterEach } from "vitest";
import { loadPlanState, isPlanOnly, freePlanReports, hasUnusedPlanInterview, hasUnusedInterviewCredit, planCardLabel } from "../usePlanState";
import type { PlanState } from "@/lib/plans";

const plan = (over: Partial<NonNullable<PlanState["plan"]>> = {}): PlanState => ({
  allowlisted: true,
  plan: { orderId: "o1", product: "plan_prepare", interviewUsed: false, reportCreditsLeft: 2, ...over },
});

describe("plan paywall helpers", () => {
  it("plan-only = allowlisted without a plan; null state is a normal user", () => {
    expect(isPlanOnly({ allowlisted: true, plan: null })).toBe(true);
    expect(isPlanOnly({ allowlisted: false, plan: null })).toBe(false);
    expect(isPlanOnly(plan())).toBe(false);
    expect(isPlanOnly(null)).toBe(false);
  });

  it("free plan reports only apply to the report product", () => {
    expect(freePlanReports(plan(), "report")).toBe(2);
    expect(freePlanReports(plan(), "personality")).toBe(0);
    expect(freePlanReports(plan({ reportCreditsLeft: 0 }), "report")).toBe(0);
    expect(freePlanReports(null, "report")).toBe(0);
  });

  it("unused plan interview", () => {
    expect(hasUnusedPlanInterview(plan())).toBe(true);
    expect(hasUnusedPlanInterview(plan({ interviewUsed: true }))).toBe(false);
    expect(hasUnusedPlanInterview({ allowlisted: true, plan: null })).toBe(false);
    expect(hasUnusedPlanInterview(null)).toBe(false);
  });

  it("any unused interview credit (paid or plan) counts, and a paid one shows as ready to start", () => {
    expect(hasUnusedInterviewCredit(plan())).toBe(true);
    expect(hasUnusedInterviewCredit({ allowlisted: false, plan: null, interviewCredits: 1 })).toBe(true);
    expect(hasUnusedInterviewCredit({ allowlisted: false, plan: null, interviewCredits: 0 })).toBe(false);
    expect(hasUnusedInterviewCredit(null)).toBe(false);
    expect(planCardLabel({ allowlisted: true, plan: null, interviewCredits: 1 }, "interview")).toBe("Paid, ready to start");
    expect(planCardLabel({ ...plan(), interviewCredits: 1 }, "interview")).toBe("Included in your plan");
  });

  it("card label replaces the price only where the plan covers it", () => {
    expect(planCardLabel(plan(), "report")).toBe("Included in your plan · 2 left");
    expect(planCardLabel(plan({ reportCreditsLeft: 1 }), "report")).toBe("Included in your plan · 1 left");
    expect(planCardLabel(plan({ reportCreditsLeft: 0 }), "report")).toBeNull();
    expect(planCardLabel(plan(), "interview")).toBe("Included in your plan");
    expect(planCardLabel(plan({ interviewUsed: true }), "interview")).toBeNull();
    expect(planCardLabel({ allowlisted: true, plan: null }, "report")).toBe("Available with a plan");
    expect(planCardLabel(null, "interview")).toBeNull();
    expect(planCardLabel(plan({ reportCreditsLeft: 0, interviewUsed: true }), "personality")).toBe("Included in your plan");
    expect(planCardLabel({ allowlisted: true, plan: null }, "references")).toBe("Available with a plan");
    expect(planCardLabel(null, "references")).toBeNull();
  });
});

describe("loadPlanState", () => {
  afterEach(() => vi.unstubAllGlobals());
  const respond = (status: number, body: unknown = {}) => vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify(body), { status })));

  it("401 is an expired session: stays loading (no prices) and flags expired", async () => {
    respond(401, { error: "Not signed in." });
    expect(await loadPlanState()).toEqual({ loading: true, state: null, expired: true });
  });

  it("200 returns the plan state", async () => {
    respond(200, { allowlisted: true, plan: null });
    expect(await loadPlanState()).toEqual({ loading: false, state: { allowlisted: true, plan: null }, expired: false });
  });

  it("other errors fall back to a normal user, not expired", async () => {
    respond(500);
    expect(await loadPlanState()).toEqual({ loading: false, state: null, expired: false });
    vi.stubGlobal("fetch", vi.fn(async () => { throw new Error("offline"); }));
    expect(await loadPlanState()).toEqual({ loading: false, state: null, expired: false });
  });
});
