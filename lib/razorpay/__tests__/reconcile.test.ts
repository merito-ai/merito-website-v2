import { describe, it, expect, vi, beforeEach } from "vitest";

const fetchOrderPaymentsMock = vi.fn();
vi.mock("@/lib/razorpay/client", () => ({
  fetchOrderPayments: fetchOrderPaymentsMock,
}));

const finalizeRazorpayOrderMock = vi.fn();
vi.mock("@/lib/razorpay/finalize", () => ({
  finalizeRazorpayOrder: finalizeRazorpayOrderMock,
}));

const sendStuckPaymentAlertMock = vi.fn();
vi.mock("@/lib/paymentEmails", () => ({
  sendStuckPaymentAlert: sendStuckPaymentAlertMock,
}));

const orderMock = vi.fn();
vi.mock("@/lib/supabase", () => ({
  getSupabaseServerClient: () => ({
    from: () => ({
      select: () => ({
        eq: () => ({
          lt: () => ({
            order: orderMock,
          }),
        }),
      }),
    }),
  }),
}));

const NOW = new Date("2026-09-10T12:00:00.000Z");
function hoursAgo(h: number): string {
  return new Date(NOW.getTime() - h * 3_600_000).toISOString();
}

describe("reconcileStuckTransactions", () => {
  let errorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    fetchOrderPaymentsMock.mockReset();
    finalizeRazorpayOrderMock.mockReset();
    finalizeRazorpayOrderMock.mockResolvedValue({ ok: true, product: "personality", userId: "u1", leadId: null });
    sendStuckPaymentAlertMock.mockReset();
    sendStuckPaymentAlertMock.mockResolvedValue(undefined);
    orderMock.mockReset();
  });

  it("returns all-zero when there are no stuck rows", async () => {
    orderMock.mockResolvedValue({ data: [], error: null });
    const { reconcileStuckTransactions } = await import("../reconcile");

    const summary = await reconcileStuckTransactions({ now: NOW });

    expect(summary).toEqual({ scanned: 0, recovered: 0, stale: 0, waiting: 0, errored: 0 });
    expect(fetchOrderPaymentsMock).not.toHaveBeenCalled();
  });

  it("returns all-zero and does not throw when the query errors", async () => {
    orderMock.mockResolvedValue({ data: null, error: { message: "boom" } });
    const { reconcileStuckTransactions } = await import("../reconcile");

    const summary = await reconcileStuckTransactions({ now: NOW });

    expect(summary).toEqual({ scanned: 0, recovered: 0, stale: 0, waiting: 0, errored: 0 });
  });

  it("finalizes a stuck row that has a captured payment, with capture guards", async () => {
    orderMock.mockResolvedValue({
      data: [{ order_id: "order_1", amount_paise: 29900, created_at: hoursAgo(1) }],
      error: null,
    });
    fetchOrderPaymentsMock.mockResolvedValue([
      { id: "pay_1", order_id: "order_1", status: "captured", amount: 29900, currency: "INR" },
    ]);
    const { reconcileStuckTransactions } = await import("../reconcile");

    const summary = await reconcileStuckTransactions({ now: NOW });

    expect(finalizeRazorpayOrderMock).toHaveBeenCalledWith("order_1", "pay_1", {
      amountPaise: 29900,
      status: "captured",
      orderId: "order_1",
    });
    expect(summary).toMatchObject({ scanned: 1, recovered: 1, stale: 0, waiting: 0, errored: 0 });
    expect(sendStuckPaymentAlertMock).not.toHaveBeenCalled();
  });

  it("counts a captured payment that finalize rejects as errored, not recovered", async () => {
    orderMock.mockResolvedValue({
      data: [{ order_id: "order_1", amount_paise: 29900, created_at: hoursAgo(1) }],
      error: null,
    });
    fetchOrderPaymentsMock.mockResolvedValue([
      { id: "pay_1", order_id: "order_1", status: "captured", amount: 100, currency: "INR" },
    ]);
    finalizeRazorpayOrderMock.mockResolvedValue({ ok: false, reason: "guard_mismatch" });
    const { reconcileStuckTransactions } = await import("../reconcile");

    const summary = await reconcileStuckTransactions({ now: NOW });

    expect(summary).toMatchObject({ scanned: 1, recovered: 0, errored: 1 });
  });

  it("just waits on a 20h-old row with no payment yet — no alert", async () => {
    orderMock.mockResolvedValue({
      data: [{ order_id: "order_1", amount_paise: 29900, created_at: hoursAgo(20) }],
      error: null,
    });
    fetchOrderPaymentsMock.mockResolvedValue([]);
    const { reconcileStuckTransactions } = await import("../reconcile");

    const summary = await reconcileStuckTransactions({ now: NOW });

    expect(summary).toMatchObject({ scanned: 1, waiting: 1, stale: 0, recovered: 0 });
    expect(sendStuckPaymentAlertMock).not.toHaveBeenCalled();
  });

  it("alerts once for a row in the 24-25h window with no payment", async () => {
    orderMock.mockResolvedValue({
      data: [{ order_id: "order_1", amount_paise: 29900, created_at: hoursAgo(24.1) }],
      error: null,
    });
    fetchOrderPaymentsMock.mockResolvedValue([]);
    const { reconcileStuckTransactions } = await import("../reconcile");

    const summary = await reconcileStuckTransactions({ now: NOW });

    expect(sendStuckPaymentAlertMock).toHaveBeenCalledWith(
      expect.objectContaining({ orderId: "order_1", amountPaise: 29900 })
    );
    expect(summary).toMatchObject({ scanned: 1, stale: 1, waiting: 0 });
  });

  it("does not re-alert a row older than 25h", async () => {
    orderMock.mockResolvedValue({
      data: [{ order_id: "order_1", amount_paise: 29900, created_at: hoursAgo(30) }],
      error: null,
    });
    fetchOrderPaymentsMock.mockResolvedValue([]);
    const { reconcileStuckTransactions } = await import("../reconcile");

    const summary = await reconcileStuckTransactions({ now: NOW });

    expect(sendStuckPaymentAlertMock).not.toHaveBeenCalled();
    expect(summary).toMatchObject({ scanned: 1, stale: 1 });
  });

  it("tallies a fetchOrderPayments failure as errored and still processes the other rows", async () => {
    orderMock.mockResolvedValue({
      data: [
        { order_id: "order_bad", amount_paise: 29900, created_at: hoursAgo(1) },
        { order_id: "order_ok", amount_paise: 29900, created_at: hoursAgo(1) },
      ],
      error: null,
    });
    fetchOrderPaymentsMock.mockImplementation(async (orderId: string) => {
      if (orderId === "order_bad") throw new Error("razorpay 500");
      return [{ id: "pay_ok", order_id: "order_ok", status: "captured", amount: 29900, currency: "INR" }];
    });
    const { reconcileStuckTransactions } = await import("../reconcile");

    const summary = await reconcileStuckTransactions({ now: NOW });

    expect(summary).toMatchObject({ scanned: 2, recovered: 1, errored: 1 });
    expect(finalizeRazorpayOrderMock).toHaveBeenCalledWith("order_ok", "pay_ok", expect.objectContaining({ orderId: "order_ok" }));
  });
});
