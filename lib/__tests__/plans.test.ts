import { describe, it, expect, vi, beforeEach } from "vitest";

const fromMock = vi.fn();
vi.mock("@/lib/supabase", () => ({ getSupabaseServerClient: () => ({ from: fromMock }) }));

// Chainable query: every filter returns the chain; awaiting / maybeSingle resolves `result`.
function query(result: Record<string, unknown>) {
  const chain: Record<string, ReturnType<typeof vi.fn> | unknown> = {};
  for (const m of ["select", "eq", "in", "gte", "order", "limit"]) chain[m] = vi.fn(() => chain);
  chain.maybeSingle = vi.fn(() => Promise.resolve(result));
  chain.then = (resolve: (v: unknown) => unknown) => resolve(result);
  return chain as Record<string, ReturnType<typeof vi.fn>>;
}

const isEmailAllowlistedMock = vi.hoisted(() => vi.fn());
vi.mock("@/lib/planAllowlist", () => ({ isEmailAllowlisted: isEmailAllowlistedMock }));

import { isPlanProduct, getPlanOrder, planReportCreditsLeft, getPlanState, PLAN_UPGRADE } from "@/lib/plans";
import { PRODUCT_PRICING } from "@/lib/razorpay/pricing";

describe("isPlanProduct", () => {
  it("recognises only plan products", () => {
    expect(isPlanProduct("plan_prepare")).toBe(true);
    expect(isPlanProduct("plan_mentor")).toBe(true);
    expect(isPlanProduct("bundle")).toBe(false);
    // The upgrade is not a plan of its own: no interview/report/reference credit rides on it.
    expect(isPlanProduct(PLAN_UPGRADE)).toBe(false);
    expect(isPlanProduct(undefined)).toBe(false);
  });
});

describe("PRODUCT_PRICING", () => {
  it("prices plans flat at every level", () => {
    expect(PRODUCT_PRICING.plan_prepare).toEqual({ entry: 299600, mid: 299600, senior: 299600 });
    expect(PRODUCT_PRICING.plan_mentor).toEqual({ entry: 599500, mid: 599500, senior: 599500 });
  });
  it("prices the upgrade at the plan difference", () => {
    expect(PRODUCT_PRICING.plan_upgrade_mentor).toEqual({ entry: 299900, mid: 299900, senior: 299900 });
  });
  it("leaves existing prices unchanged", () => {
    expect(PRODUCT_PRICING.report).toEqual({ entry: 29900, mid: 29900, senior: 29900 });
    expect(PRODUCT_PRICING.personality).toEqual({ entry: 29900, mid: 29900, senior: 29900 });
    expect(PRODUCT_PRICING.references).toEqual({ entry: 29900, mid: 29900, senior: 29900 });
    expect(PRODUCT_PRICING.interview).toEqual({ entry: 99900, mid: 99900, senior: 149900 });
    expect(PRODUCT_PRICING.counselling).toEqual({ entry: 199900, mid: 199900, senior: 299900 });
    expect(PRODUCT_PRICING.bundle).toEqual({ entry: 74900, mid: 74900, senior: 74900 });
  });
});

describe("getPlanOrder", () => {
  beforeEach(() => fromMock.mockReset());

  it("returns null when the user has no plan", async () => {
    fromMock.mockReturnValue(query({ data: null, error: null }));
    expect(await getPlanOrder("u1")).toBeNull();
  });

  it("maps the newest successful plan txn", async () => {
    const q = query({ data: { order_id: "o1", product: "plan_mentor", consumed_at: null }, error: null });
    fromMock.mockReturnValue(q);
    expect(await getPlanOrder("u1")).toEqual({ orderId: "o1", product: "plan_mentor", interviewUsed: false });
    expect(fromMock).toHaveBeenCalledWith("razorpay_transactions");
    expect(q.eq).toHaveBeenCalledWith("status", "success");
    expect(q.in).toHaveBeenCalledWith("product", ["plan_prepare", "plan_mentor"]);
  });

  it("a paid upgrade on Plan 1 makes the effective plan Plan 2, keeping Plan 1's order (credits)", async () => {
    const up = query({ data: { order_id: "up1" }, error: null });
    fromMock
      .mockReturnValueOnce(query({ data: { order_id: "o1", product: "plan_prepare", consumed_at: "2026-11-10T00:00:00Z", created_at: "2026-11-10T00:00:00Z" }, error: null }))
      .mockReturnValueOnce(up);
    expect(await getPlanOrder("u1")).toEqual({ orderId: "o1", product: "plan_mentor", interviewUsed: true, upgradeOrderId: "up1" });
    expect(up.eq).toHaveBeenCalledWith("product", "plan_upgrade_mentor");
    expect(up.eq).toHaveBeenCalledWith("status", "success");
    expect(up.gte).toHaveBeenCalledWith("created_at", "2026-11-10T00:00:00Z");
  });

  it("stays Plan 1 without a paid upgrade", async () => {
    fromMock
      .mockReturnValueOnce(query({ data: { order_id: "o1", product: "plan_prepare", consumed_at: null, created_at: "2026-11-10T00:00:00Z" }, error: null }))
      .mockReturnValueOnce(query({ data: null, error: null }));
    expect(await getPlanOrder("u1")).toEqual({ orderId: "o1", product: "plan_prepare", interviewUsed: false });
  });

  it("fails closed (throws) when the upgrade lookup errors", async () => {
    fromMock
      .mockReturnValueOnce(query({ data: { order_id: "o1", product: "plan_prepare", consumed_at: null, created_at: "2026-11-10T00:00:00Z" }, error: null }))
      .mockReturnValueOnce(query({ data: null, error: { message: "upgrade boom" } }));
    await expect(getPlanOrder("u1")).rejects.toThrow("upgrade boom");
  });

  it("reports a consumed interview", async () => {
    fromMock.mockReturnValue(query({ data: { order_id: "o1", product: "plan_prepare", consumed_at: "2026-11-10T00:00:00Z" }, error: null }));
    expect((await getPlanOrder("u1"))?.interviewUsed).toBe(true);
  });

  it("throws on a DB error", async () => {
    fromMock.mockReturnValue(query({ data: null, error: { message: "boom" } }));
    await expect(getPlanOrder("u1")).rejects.toThrow("boom");
  });
});

describe("planReportCreditsLeft", () => {
  beforeEach(() => fromMock.mockReset());

  it("subtracts reports spent from the plan order", async () => {
    const q = query({ count: 2, error: null });
    fromMock.mockReturnValue(q);
    expect(await planReportCreditsLeft("o1")).toBe(1);
    expect(fromMock).toHaveBeenCalledWith("report_unlocks");
    expect(q.eq).toHaveBeenCalledWith("order_id", "o1");
  });

  it("never goes below zero", async () => {
    fromMock.mockReturnValue(query({ count: 5, error: null }));
    expect(await planReportCreditsLeft("o1")).toBe(0);
  });
});

describe("getPlanState", () => {
  beforeEach(() => {
    fromMock.mockReset();
    isEmailAllowlistedMock.mockReset();
  });

  it("returns allowlisted with no plan", async () => {
    isEmailAllowlistedMock.mockResolvedValue(true);
    fromMock.mockReturnValue(query({ data: null, error: null }));
    expect(await getPlanState("u1", "a@b.co")).toEqual({ allowlisted: true, plan: null });
    expect(isEmailAllowlistedMock).toHaveBeenCalledWith("a@b.co");
  });

  it("adds report credits left to the plan", async () => {
    isEmailAllowlistedMock.mockResolvedValue(false);
    fromMock
      .mockReturnValueOnce(query({ data: { order_id: "o1", product: "plan_prepare", consumed_at: null }, error: null }))
      .mockReturnValueOnce(query({ data: null, error: null }))
      .mockReturnValueOnce(query({ count: 1, error: null }));
    expect(await getPlanState("u1", "a@b.co")).toEqual({
      allowlisted: false,
      plan: { orderId: "o1", product: "plan_prepare", interviewUsed: false, reportCreditsLeft: 2 },
    });
  });
});
