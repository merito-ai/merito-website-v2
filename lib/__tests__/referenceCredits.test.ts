import { describe, it, expect, vi, beforeEach } from "vitest";

const fromMock = vi.fn();
const bypassMock = vi.fn();

vi.mock("@/lib/supabase", () => ({
  getSupabaseServerClient: () => ({ from: fromMock }),
}));
vi.mock("@/lib/paymentsBypass", () => ({ arePaymentsBypassed: () => bypassMock() }));

// Chainable count query: every filter returns the chain; awaiting it resolves the count.
function countQuery(count: number) {
  const chain: Record<string, unknown> = {};
  for (const m of ["select", "eq", "in", "neq"]) chain[m] = vi.fn(() => chain);
  chain.then = (resolve: (v: unknown) => unknown) => resolve({ count, error: null });
  return chain;
}

describe("referenceRefreshNeedsPayment", () => {
  beforeEach(() => {
    fromMock.mockReset();
    bypassMock.mockReturnValue(false);
  });

  it("needs payment when every paid check has been completed", async () => {
    fromMock.mockImplementation((t: string) => countQuery(t === "reference_checks" ? 1 : 1));
    const { referenceRefreshNeedsPayment } = await import("../referenceCredits");
    await expect(referenceRefreshNeedsPayment("u1")).resolves.toBe(true);
  });

  it("is free when a paid refresh has not been used yet", async () => {
    fromMock.mockImplementation((t: string) => countQuery(t === "reference_checks" ? 1 : 2));
    const { referenceRefreshNeedsPayment } = await import("../referenceCredits");
    await expect(referenceRefreshNeedsPayment("u1")).resolves.toBe(false);
  });

  it("is free while payments are bypassed", async () => {
    bypassMock.mockReturnValue(true);
    const { referenceRefreshNeedsPayment } = await import("../referenceCredits");
    await expect(referenceRefreshNeedsPayment("u1")).resolves.toBe(false);
    expect(fromMock).not.toHaveBeenCalled();
  });
});

describe("countReferenceCredits", () => {
  beforeEach(() => fromMock.mockReset());

  it("excludes the refunded order when asked", async () => {
    const q = countQuery(0);
    fromMock.mockReturnValue(q);
    const { countReferenceCredits } = await import("../referenceCredits");
    await countReferenceCredits("u1", "order_x");
    expect(q.neq).toHaveBeenCalledWith("order_id", "order_x");
    expect(q.in).toHaveBeenCalledWith("product", ["references", "bundle"]);
  });
});
