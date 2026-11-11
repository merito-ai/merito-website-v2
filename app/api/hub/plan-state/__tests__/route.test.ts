import { describe, it, expect, vi, beforeEach } from "vitest";

const getUserMock = vi.fn();
vi.mock("@/lib/supabaseAuthServer", () => ({
  createSupabaseServerClient: async () => ({ auth: { getUser: getUserMock } }),
}));
const getPlanStateMock = vi.fn();
vi.mock("@/lib/plans", () => ({ getPlanState: getPlanStateMock }));
const countUnusedInterviewCreditsMock = vi.fn();
vi.mock("@/lib/interviewCredits", () => ({ countUnusedInterviewCredits: countUnusedInterviewCreditsMock }));
const isProductUnlockedMock = vi.fn();
vi.mock("@/lib/productUnlocks", () => ({ isProductUnlocked: isProductUnlockedMock }));
const countReportUnlocksMock = vi.fn();
vi.mock("@/lib/reportUnlocks", () => ({ countReportUnlocks: countReportUnlocksMock }));

const PLAN = { orderId: "o1", product: "plan_prepare", interviewUsed: false, reportCreditsLeft: 3 };

describe("GET /api/hub/plan-state", () => {
  beforeEach(() => {
    getUserMock.mockReset();
    getPlanStateMock.mockReset();
    countUnusedInterviewCreditsMock.mockReset().mockResolvedValue(0);
    isProductUnlockedMock.mockReset().mockResolvedValue(false);
    countReportUnlocksMock.mockReset().mockResolvedValue(0);
    getUserMock.mockResolvedValue({ data: { user: { id: "u1", email: "a@b.co" } } });
  });

  it("returns 401 without a session", async () => {
    getUserMock.mockResolvedValue({ data: { user: null } });
    const { GET } = await import("../route");
    expect((await GET()).status).toBe(401);
    expect(getPlanStateMock).not.toHaveBeenCalled();
  });

  it("returns the plan state for a plan holder, without individual purchases", async () => {
    getPlanStateMock.mockResolvedValue({ allowlisted: true, plan: PLAN });
    const { GET } = await import("../route");
    const res = await GET();
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ allowlisted: true, plan: PLAN, interviewCredits: 0, ownedIndividually: null });
    expect(getPlanStateMock).toHaveBeenCalledWith("u1", "a@b.co");
    expect(isProductUnlockedMock).not.toHaveBeenCalled();
  });

  it("without a plan, includes what was bought individually (for the plan confirm note)", async () => {
    getPlanStateMock.mockResolvedValue({ allowlisted: true, plan: null });
    countUnusedInterviewCreditsMock.mockResolvedValue(1);
    isProductUnlockedMock.mockImplementation(async (_u: string, p: string) => p === "personality");
    countReportUnlocksMock.mockResolvedValue(2);
    const { GET } = await import("../route");
    expect(await (await GET()).json()).toEqual({
      allowlisted: true,
      plan: null,
      interviewCredits: 1,
      ownedIndividually: { personality: true, references: false, reportUnlocks: 2, interviewCredits: 1 },
    });
    expect(countUnusedInterviewCreditsMock).toHaveBeenCalledWith("u1");
    expect(countReportUnlocksMock).toHaveBeenCalledWith("u1");
  });
});
