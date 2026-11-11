import { describe, it, expect, vi, beforeEach } from "vitest";

const getUserMock = vi.fn();
vi.mock("@/lib/supabaseAuthServer", () => ({
  createSupabaseServerClient: async () => ({ auth: { getUser: getUserMock } }),
}));
const getPlanStateMock = vi.fn();
vi.mock("@/lib/plans", () => ({ getPlanState: getPlanStateMock }));
const countUnusedInterviewCreditsMock = vi.fn();
vi.mock("@/lib/interviewCredits", () => ({ countUnusedInterviewCredits: countUnusedInterviewCreditsMock }));

describe("GET /api/hub/plan-state", () => {
  beforeEach(() => {
    getUserMock.mockReset();
    getPlanStateMock.mockReset();
    countUnusedInterviewCreditsMock.mockReset();
    countUnusedInterviewCreditsMock.mockResolvedValue(0);
  });

  it("returns 401 without a session", async () => {
    getUserMock.mockResolvedValue({ data: { user: null } });
    const { GET } = await import("../route");
    expect((await GET()).status).toBe(401);
    expect(getPlanStateMock).not.toHaveBeenCalled();
  });

  it("returns the plan state for the signed-in user", async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: "u1", email: "a@b.co" } } });
    const state = { allowlisted: true, plan: null };
    getPlanStateMock.mockResolvedValue(state);
    const { GET } = await import("../route");
    const res = await GET();
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ...state, interviewCredits: 0 });
    expect(getPlanStateMock).toHaveBeenCalledWith("u1", "a@b.co");
  });

  it("includes the unused interview credit count", async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: "u1", email: "a@b.co" } } });
    getPlanStateMock.mockResolvedValue({ allowlisted: false, plan: null });
    countUnusedInterviewCreditsMock.mockResolvedValue(1);
    const { GET } = await import("../route");
    expect(await (await GET()).json()).toEqual({ allowlisted: false, plan: null, interviewCredits: 1 });
    expect(countUnusedInterviewCreditsMock).toHaveBeenCalledWith("u1");
  });
});
