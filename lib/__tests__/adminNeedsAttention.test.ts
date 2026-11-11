import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const listUnresolvedPipelineFailuresMock = vi.fn();
const listCounsellingRequestsMock = vi.fn();
const listUnpaidUnlocksMock = vi.fn();
vi.mock("@/lib/pipelineFailures", () => ({ listUnresolvedPipelineFailures: listUnresolvedPipelineFailuresMock }));
vi.mock("@/lib/adminCounselling", () => ({ listCounsellingRequests: listCounsellingRequestsMock }));
vi.mock("@/lib/adminPayments", () => ({ listUnpaidUnlocks: listUnpaidUnlocksMock }));

type Call = [string, ...unknown[]];
let tables: Record<string, (calls: Call[]) => unknown[]> = {};

// Chainable query builder: records filter calls, resolves to rows chosen by the test per table + calls.
function builder(table: string) {
  const calls: Call[] = [];
  const b: Record<string, unknown> = {};
  for (const m of ["select", "eq", "in", "is", "not", "lt", "gte", "order"]) {
    b[m] = (...args: unknown[]) => {
      calls.push([m, ...args]);
      return b;
    };
  }
  b.then = (resolve: (v: unknown) => void) => resolve({ data: tables[table]?.(calls) ?? [] });
  return b;
}

vi.mock("@/lib/supabase", () => ({ getSupabaseServerClient: () => ({ from: (t: string) => builder(t) }) }));

const has = (calls: Call[], method: string, ...args: unknown[]) =>
  calls.some(([m, ...a]) => m === method && args.every((x, i) => JSON.stringify(a[i]) === JSON.stringify(x)));

describe("getNeedsAttention", () => {
  beforeEach(() => {
    listUnresolvedPipelineFailuresMock.mockResolvedValue([{ userId: "u1" }, { userId: "staff" }]);
    listCounsellingRequestsMock.mockResolvedValue([
      { status: "requested", email: "a@example.com" },
      { status: "scheduled", email: "b@example.com" },
    ]);
    listUnpaidUnlocksMock.mockResolvedValue([]);
    tables = {
      fitment_leads: () => [
        { user_id: "u1", email: "a@example.com" },
        { user_id: "u2", email: "b@example.com" },
        { user_id: "staff", email: "team@merito.in" },
      ],
      fitment_interviews: () => [{ user_id: "u2" }],
      razorpay_transactions: (calls) => {
        if (has(calls, "is", "consumed_at", null)) return [{ user_id: "u1" }, { user_id: "u1" }, { user_id: "staff" }];
        if (has(calls, "eq", "status", "initiated")) return [{ user_id: "staff" }];
        if (has(calls, "eq", "product", "plan_mentor")) return [];
        return [];
      },
    };
  });
  afterEach(() => vi.unstubAllEnvs());

  it("returns only non-zero items, with people links where there is no list page", async () => {
    const { getNeedsAttention } = await import("../adminAnalytics");
    const items = await getNeedsAttention(true);
    const byKey = Object.fromEntries(items.map((i) => [i.key, i]));

    expect(byKey.pipeline.count).toBe(2);
    expect(byKey.counselling.count).toBe(1);
    expect(byKey.stuck).toMatchObject({ count: 1, people: [{ userId: "u2", email: "b@example.com" }] });
    expect(byKey.credits.count).toBe(3);
    expect(byKey.credits.people).toHaveLength(2);
    expect(byKey.abandoned.count).toBe(1);
    expect(byKey.unpaid).toBeUndefined();
    expect(byKey.plan2).toBeUndefined();
  });

  it("excludes internal accounts unless asked to include them", async () => {
    vi.stubEnv("ADMIN_INTERNAL_EMAILS", "@merito.in");
    const { getNeedsAttention } = await import("../adminAnalytics");
    const byKey = Object.fromEntries((await getNeedsAttention()).map((i) => [i.key, i]));

    expect(byKey.pipeline.count).toBe(1);
    expect(byKey.credits.count).toBe(2);
    expect(byKey.abandoned).toBeUndefined();
  });

  it("asks only for unconsumed successful interview or plan credits older than 7 days", async () => {
    let creditCalls: Call[] = [];
    tables.razorpay_transactions = (calls) => {
      if (has(calls, "is", "consumed_at", null)) creditCalls = calls;
      return [];
    };
    const { getNeedsAttention } = await import("../adminAnalytics");
    await getNeedsAttention(true);

    expect(has(creditCalls, "in", "product", ["interview", "plan_prepare", "plan_mentor"])).toBe(true);
    expect(has(creditCalls, "eq", "status", "success")).toBe(true);
    expect(creditCalls.some(([m, col]) => m === "lt" && col === "created_at")).toBe(true);
  });
});
