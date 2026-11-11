import { describe, it, expect, vi, beforeEach } from "vitest";

const calls: unknown[][] = [];
let result: unknown = { data: null, error: null };
function chain(): Record<string, unknown> {
  const b: Record<string, unknown> = {};
  for (const m of ["select", "eq", "in", "is", "order", "limit"]) {
    b[m] = (...args: unknown[]) => {
      calls.push([m, ...args]);
      return b;
    };
  }
  b.maybeSingle = () => Promise.resolve(result);
  b.then = (resolve: (v: unknown) => void) => resolve(result);
  return b;
}
vi.mock("@/lib/supabase", () => ({ getSupabaseServerClient: () => ({ from: () => chain() }) }));

describe("interviewCredits", () => {
  beforeEach(() => {
    calls.length = 0;
  });

  it("finds the oldest unused successful interview or plan credit", async () => {
    result = { data: { order_id: "order_1", product: "plan_mentor" }, error: null };
    const { findOldestUnusedInterviewCredit } = await import("../interviewCredits");
    expect(await findOldestUnusedInterviewCredit("u1")).toEqual({ orderId: "order_1", product: "plan_mentor" });
    expect(calls).toContainEqual(["in", "product", ["interview", "plan_prepare", "plan_mentor"]]);
    expect(calls).toContainEqual(["eq", "status", "success"]);
    expect(calls).toContainEqual(["is", "consumed_at", null]);
    expect(calls).toContainEqual(["order", "created_at", { ascending: true }]);
  });

  it("returns null when there is no credit and throws on a database error", async () => {
    const { findOldestUnusedInterviewCredit, countUnusedInterviewCredits } = await import("../interviewCredits");
    result = { data: null, error: null };
    expect(await findOldestUnusedInterviewCredit("u1")).toBeNull();
    result = { data: null, error: { message: "boom" } };
    await expect(findOldestUnusedInterviewCredit("u1")).rejects.toThrow(/boom/);
    result = { count: null, error: { message: "boom" } };
    await expect(countUnusedInterviewCredits("u1")).rejects.toThrow(/boom/);
  });

  it("counts unused credits", async () => {
    result = { count: 2, error: null };
    const { countUnusedInterviewCredits } = await import("../interviewCredits");
    expect(await countUnusedInterviewCredits("u1")).toBe(2);
    expect(calls).toContainEqual(["is", "consumed_at", null]);
  });
});
