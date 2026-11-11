import { describe, it, expect, vi, beforeEach } from "vitest";

// Any query chain resolves to `result`: fitment_leads awaits .order(),
// counselling_requests awaits .maybeSingle().
let leads: { id: string; candidate_level: string | null }[] = [];
function chain(result: unknown): unknown {
  const p = Promise.resolve(result);
  return new Proxy({}, {
    get: (_t, k) => (k === "then" ? p.then.bind(p) : () => chain(result)),
  });
}
vi.mock("@/lib/supabaseAuthServer", () => ({
  createSupabaseServerClient: async () => ({
    auth: { getUser: async () => ({ data: { user: { id: "u1" } } }) },
    from: (t: string) => chain(t === "fitment_leads" ? { data: leads } : { data: null }),
  }),
}));
const getPlanOrderMock = vi.fn();
vi.mock("@/lib/plans", () => ({ getPlanOrder: (...a: unknown[]) => getPlanOrderMock(...a) }));
vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    throw new Error(`REDIRECT:${url}`);
  },
}));

const render = async () => (await import("../page")).default({ searchParams: Promise.resolve({}) });

describe("expert page access", () => {
  beforeEach(() => {
    leads = [];
    getPlanOrderMock.mockReset();
  });

  it("Plan 2 holder with no role can still reach booking", async () => {
    getPlanOrderMock.mockResolvedValue({ orderId: "o1", product: "plan_mentor", interviewUsed: false });
    await expect(render()).resolves.toBeTruthy();
  });

  it("no role and no mentoring plan still redirects to the account page", async () => {
    getPlanOrderMock.mockResolvedValue({ orderId: "o1", product: "plan_prepare", interviewUsed: false });
    await expect(render()).rejects.toThrow("REDIRECT:/hub/account");
    getPlanOrderMock.mockResolvedValue(null);
    await expect(render()).rejects.toThrow("REDIRECT:/hub/account");
  });

  it("user with a role and no plan renders", async () => {
    leads = [{ id: "l1", candidate_level: "mid" }];
    getPlanOrderMock.mockResolvedValue(null);
    await expect(render()).resolves.toBeTruthy();
  });
});
