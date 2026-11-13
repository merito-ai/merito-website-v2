import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const unlockReportMock = vi.fn();
vi.mock("@/lib/reportUnlocks", () => ({
  unlockReport: unlockReportMock,
}));

const unlockProductMock = vi.fn();
const revokeProductMock = vi.fn();
vi.mock("@/lib/productUnlocks", () => ({
  unlockProduct: unlockProductMock,
  revokeProduct: revokeProductMock,
}));

const nextCounsellingStateMock = vi.fn();
const updateCounsellingStatusMock = vi.fn();
// No other paid references purchase, so a references refund revokes access.
vi.mock("@/lib/referenceCredits", () => ({
  countReferenceCredits: vi.fn().mockResolvedValue(0),
}));

vi.mock("@/lib/adminCounselling", () => ({
  nextCounsellingState: nextCounsellingStateMock,
  updateCounsellingStatus: updateCounsellingStatusMock,
}));

const applyPlanGrantsMock = vi.fn();
vi.mock("@/lib/planGrants", () => ({ applyPlanGrants: applyPlanGrantsMock }));

const sendPlanWelcomeEmailMock = vi.fn();
const sendOrphanedUpgradeAlertMock = vi.fn();
vi.mock("@/lib/paymentEmails", () => ({ sendPlanWelcomeEmail: sendPlanWelcomeEmailMock, sendOrphanedUpgradeAlert: sendOrphanedUpgradeAlertMock }));

// Success flip is a compare-and-set: .eq(order).neq(status, success).select() -> rows actually flipped.
let flippedRows: unknown[] = [{ order_id: "order_1" }];
const casTail = () => ({ neq: () => ({ select: () => Promise.resolve({ data: flippedRows, error: null }) }) });

const txnSelectMock = vi.fn();
const txnEqMock = vi.fn();
const txnMaybeSingleMock = vi.fn();
const updateMock = vi.fn();
const updateEqMock = vi.fn();
const insertMock = vi.fn();
const fromMock = vi.fn();

vi.mock("@/lib/supabase", () => ({
  getSupabaseServerClient: () => ({ from: fromMock }),
}));

describe("finalizeRazorpayOrder", () => {
  let errorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    unlockReportMock.mockReset();
    unlockReportMock.mockResolvedValue(undefined);
    unlockProductMock.mockReset();
    unlockProductMock.mockResolvedValue(undefined);
    fromMock.mockReset();
    txnSelectMock.mockReset();
    txnEqMock.mockReset();
    txnMaybeSingleMock.mockReset();
    updateMock.mockReset();
    updateEqMock.mockReset();
    updateEqMock.mockImplementation(casTail);
    updateMock.mockReturnValue({ eq: updateEqMock });
    insertMock.mockReset();
    insertMock.mockResolvedValue({ error: null });
    fromMock.mockImplementation((table: string) => {
      if (table === "counselling_requests") return { upsert: insertMock };
      if (table === "fitment_leads") {
        return {
          select: () => ({
            eq: () => ({ maybeSingle: () => Promise.resolve({ data: { role_title: "Senior Product Manager" }, error: null }) }),
          }),
        };
      }
      return { select: txnSelectMock, update: updateMock };
    });
    txnSelectMock.mockReturnValue({ eq: txnEqMock });
    txnEqMock.mockReturnValue({ maybeSingle: txnMaybeSingleMock });
  });

  afterEach(() => {
    errorSpy.mockRestore();
  });

  it("rejects with unknown_order when no razorpay_transactions row matches", async () => {
    txnMaybeSingleMock.mockResolvedValue({ data: null, error: null });
    const { finalizeRazorpayOrder } = await import("../finalize");

    const result = await finalizeRazorpayOrder("order_1", "pay_1");

    expect(result).toEqual({ ok: false, reason: "unknown_order" });
    expect(unlockReportMock).not.toHaveBeenCalled();
  });

  it("unlocks personality and marks success", async () => {
    txnMaybeSingleMock.mockResolvedValue({
      data: { user_id: "user-1", product: "personality", lead_id: null, status: "initiated" },
      error: null,
    });
    const { finalizeRazorpayOrder } = await import("../finalize");

    const result = await finalizeRazorpayOrder("order_1", "pay_1");

    expect(result).toEqual({ ok: true, product: "personality", userId: "user-1", leadId: null });
    expect(unlockProductMock).toHaveBeenCalledWith("user-1", "personality");
    expect(updateMock).toHaveBeenCalledWith({ status: "success", payment_id: "pay_1" });
  });

  it("unlocks references and marks success", async () => {
    txnMaybeSingleMock.mockResolvedValue({
      data: { user_id: "user-1", product: "references", lead_id: null, status: "initiated" },
      error: null,
    });
    const { finalizeRazorpayOrder } = await import("../finalize");

    const result = await finalizeRazorpayOrder("order_1", "pay_1");

    expect(result).toEqual({ ok: true, product: "references", userId: "user-1", leadId: null });
    expect(unlockProductMock).toHaveBeenCalledWith("user-1", "references");
  });

  it("unlocks the report, personality, and references for a bundle order", async () => {
    txnMaybeSingleMock.mockResolvedValue({
      data: { user_id: "user-1", product: "bundle", lead_id: "lead-1", status: "initiated" },
      error: null,
    });
    const { finalizeRazorpayOrder } = await import("../finalize");

    const result = await finalizeRazorpayOrder("order_1", "pay_1");

    expect(result).toEqual({ ok: true, product: "bundle", userId: "user-1", leadId: "lead-1" });
    expect(unlockReportMock).toHaveBeenCalledWith("user-1", "lead-1", "Senior Product Manager");
    expect(unlockProductMock).toHaveBeenCalledWith("user-1", "personality");
    expect(unlockProductMock).toHaveBeenCalledWith("user-1", "references");
    expect(updateMock).toHaveBeenCalledWith({ status: "success", payment_id: "pay_1" });
  });

  it("skips the report unlock when a report order has no lead_id", async () => {
    txnMaybeSingleMock.mockResolvedValue({
      data: { user_id: "user-1", product: "report", lead_id: null, status: "initiated" },
      error: null,
    });
    const { finalizeRazorpayOrder } = await import("../finalize");

    const result = await finalizeRazorpayOrder("order_1", "pay_1");

    expect(result).toEqual({ ok: true, product: "report", userId: "user-1", leadId: null });
    expect(unlockReportMock).not.toHaveBeenCalled();
    expect(errorSpy).toHaveBeenCalledWith(
      "finalize: report order resolved no lead for report unlock",
      { orderId: "order_1", leadId: null, roleTitle: null },
    );
    expect(updateMock).toHaveBeenCalledWith({ status: "success", payment_id: "pay_1" });
  });

  it("skips the report unlock for a bundle order with no lead_id but still applies personality and references", async () => {
    txnMaybeSingleMock.mockResolvedValue({
      data: { user_id: "user-1", product: "bundle", lead_id: null, status: "initiated" },
      error: null,
    });
    const { finalizeRazorpayOrder } = await import("../finalize");

    const result = await finalizeRazorpayOrder("order_1", "pay_1");

    expect(result).toEqual({ ok: true, product: "bundle", userId: "user-1", leadId: null });
    expect(unlockReportMock).not.toHaveBeenCalled();
    expect(errorSpy).toHaveBeenCalledWith(
      "finalize: bundle order resolved no lead for report unlock",
      { orderId: "order_1", leadId: null, roleTitle: null },
    );
    expect(unlockProductMock).toHaveBeenCalledWith("user-1", "personality");
    expect(unlockProductMock).toHaveBeenCalledWith("user-1", "references");
  });

  it("marks an interview transaction success (the credit becomes available to consume later)", async () => {
    txnMaybeSingleMock.mockResolvedValue({
      data: { user_id: "user-1", product: "interview", lead_id: null, status: "initiated" },
      error: null,
    });
    const { finalizeRazorpayOrder } = await import("../finalize");

    const result = await finalizeRazorpayOrder("order_1", "pay_1");

    expect(result).toEqual({ ok: true, product: "interview", userId: "user-1", leadId: null });
    expect(updateMock).toHaveBeenCalledWith({ status: "success", payment_id: "pay_1" });
    expect(unlockReportMock).not.toHaveBeenCalled();
    expect(unlockProductMock).not.toHaveBeenCalled();
  });

  it("unlocks the report before marking the transaction success (retry-safety)", async () => {
    txnMaybeSingleMock.mockResolvedValue({
      data: { user_id: "user-1", product: "report", lead_id: "lead-1", status: "initiated" },
      error: null,
    });
    const callOrder: string[] = [];
    unlockReportMock.mockImplementation(async () => {
      callOrder.push("unlock");
    });
    updateMock.mockImplementation((payload) => {
      if (payload.status === "success") callOrder.push("markSuccess");
      return { eq: updateEqMock };
    });

    const { finalizeRazorpayOrder } = await import("../finalize");
    const result = await finalizeRazorpayOrder("order_1", "pay_1");

    expect(result).toEqual({ ok: true, product: "report", userId: "user-1", leadId: "lead-1" });
    expect(unlockReportMock).toHaveBeenCalledWith("user-1", "lead-1", "Senior Product Manager");
    expect(updateMock).toHaveBeenCalledWith({ status: "success", payment_id: "pay_1" });
    expect(callOrder).toEqual(["unlock", "markSuccess"]);
  });

  it("does not mark the transaction success if unlockReport throws (retry-safety)", async () => {
    txnMaybeSingleMock.mockResolvedValue({
      data: { user_id: "user-1", product: "report", lead_id: "lead-1", status: "initiated" },
      error: null,
    });
    unlockReportMock.mockRejectedValue(new Error("db blip"));

    const { finalizeRazorpayOrder } = await import("../finalize");

    await expect(finalizeRazorpayOrder("order_1", "pay_1")).rejects.toThrow("db blip");
    expect(updateMock).not.toHaveBeenCalled();
  });

  it("is idempotent — a second call for an already-success transaction doesn't re-unlock", async () => {
    txnMaybeSingleMock.mockResolvedValue({
      data: { user_id: "user-1", product: "report", lead_id: "lead-1", status: "success" },
      error: null,
    });
    const { finalizeRazorpayOrder } = await import("../finalize");

    const result = await finalizeRazorpayOrder("order_1", "pay_1");

    expect(result).toEqual({ ok: true, product: "report", userId: "user-1", leadId: "lead-1" });
    expect(unlockReportMock).not.toHaveBeenCalled();
    expect(updateMock).not.toHaveBeenCalled();
  });

  it("records a counselling_requests row and marks success for a counselling order", async () => {
    txnMaybeSingleMock.mockResolvedValue({
      data: { user_id: "user-1", product: "counselling", lead_id: null, status: "initiated" },
      error: null,
    });
    const { finalizeRazorpayOrder } = await import("../finalize");

    const result = await finalizeRazorpayOrder("order_1", "pay_1");

    expect(result).toEqual({ ok: true, product: "counselling", userId: "user-1", leadId: null });
    // verify/webhook race: the (order_id, session) unique index turns a second insert into a no-op
    expect(insertMock).toHaveBeenCalledWith({ user_id: "user-1", order_id: "order_1" }, { onConflict: "order_id,session", ignoreDuplicates: true });
    expect(unlockReportMock).not.toHaveBeenCalled();
    expect(updateMock).toHaveBeenCalledWith({ status: "success", payment_id: "pay_1" });
  });

  it("throws and does not mark success when the counselling_requests insert fails", async () => {
    txnMaybeSingleMock.mockResolvedValue({
      data: { user_id: "user-1", product: "counselling", lead_id: null, status: "initiated" },
      error: null,
    });
    insertMock.mockResolvedValue({ error: { message: "db error" } });
    const { finalizeRazorpayOrder } = await import("../finalize");

    await expect(finalizeRazorpayOrder("order_1", "pay_1")).rejects.toThrow("Failed to record counselling request");
    expect(updateMock).not.toHaveBeenCalled();
  });

  describe("payment guards", () => {
    beforeEach(() => {
      txnMaybeSingleMock.mockResolvedValue({
        data: { user_id: "user-1", product: "personality", lead_id: null, status: "initiated", amount_paise: 29900 },
        error: null,
      });
    });

    it("proceeds when the guard matches (captured, same order, exact amount)", async () => {
      const { finalizeRazorpayOrder } = await import("../finalize");
      const result = await finalizeRazorpayOrder("order_1", "pay_1", {
        amountPaise: 29900,
        status: "captured",
        orderId: "order_1",
      });

      expect(result).toEqual({ ok: true, product: "personality", userId: "user-1", leadId: null });
      expect(unlockProductMock).toHaveBeenCalledWith("user-1", "personality");
      expect(updateMock).toHaveBeenCalledWith({ status: "success", payment_id: "pay_1" });
    });

    it("rejects with guard_mismatch on an amount mismatch — no effect, row not marked success", async () => {
      const { finalizeRazorpayOrder } = await import("../finalize");
      const result = await finalizeRazorpayOrder("order_1", "pay_1", {
        amountPaise: 100,
        status: "captured",
        orderId: "order_1",
      });

      expect(result).toEqual({ ok: false, reason: "guard_mismatch" });
      expect(unlockProductMock).not.toHaveBeenCalled();
      expect(updateMock).not.toHaveBeenCalled();
    });

    it("rejects when the payment is only authorized, not captured", async () => {
      const { finalizeRazorpayOrder } = await import("../finalize");
      const result = await finalizeRazorpayOrder("order_1", "pay_1", {
        amountPaise: 29900,
        status: "authorized",
        orderId: "order_1",
      });

      expect(result).toEqual({ ok: false, reason: "guard_mismatch" });
      expect(unlockProductMock).not.toHaveBeenCalled();
    });

    it("rejects when the guard's order id doesn't match the finalize order id", async () => {
      const { finalizeRazorpayOrder } = await import("../finalize");
      const result = await finalizeRazorpayOrder("order_1", "pay_1", {
        amountPaise: 29900,
        status: "captured",
        orderId: "order_OTHER",
      });

      expect(result).toEqual({ ok: false, reason: "guard_mismatch" });
      expect(unlockProductMock).not.toHaveBeenCalled();
    });

    it("is unchanged when no guards are passed (existing call sites stay valid)", async () => {
      const { finalizeRazorpayOrder } = await import("../finalize");
      const result = await finalizeRazorpayOrder("order_1", "pay_1");

      expect(result).toEqual({ ok: true, product: "personality", userId: "user-1", leadId: null });
      expect(unlockProductMock).toHaveBeenCalledWith("user-1", "personality");
    });

    it("does not re-check the guard for an already-success transaction (idempotent)", async () => {
      txnMaybeSingleMock.mockResolvedValue({
        data: { user_id: "user-1", product: "personality", lead_id: null, status: "success", amount_paise: 29900 },
        error: null,
      });
      const { finalizeRazorpayOrder } = await import("../finalize");
      const result = await finalizeRazorpayOrder("order_1", "pay_1", {
        amountPaise: 100,
        status: "authorized",
        orderId: "order_OTHER",
      });

      expect(result).toEqual({ ok: true, product: "personality", userId: "user-1", leadId: null });
      expect(unlockProductMock).not.toHaveBeenCalled();
      expect(updateMock).not.toHaveBeenCalled();
    });
  });
});

describe("markRazorpayPaymentFailed", () => {
  beforeEach(() => {
    fromMock.mockReset();
    txnSelectMock.mockReset();
    txnEqMock.mockReset();
    txnMaybeSingleMock.mockReset();
    updateMock.mockReset();
    updateEqMock.mockReset();
    updateEqMock.mockResolvedValue({ error: null });
    updateMock.mockReturnValue({ eq: updateEqMock });
    fromMock.mockReturnValue({ select: txnSelectMock, update: updateMock });
    txnSelectMock.mockReturnValue({ eq: txnEqMock });
    txnEqMock.mockReturnValue({ maybeSingle: txnMaybeSingleMock });
  });

  it("rejects with unknown_order when no transaction matches", async () => {
    txnMaybeSingleMock.mockResolvedValue({ data: null, error: null });
    const { markRazorpayPaymentFailed } = await import("../finalize");

    const result = await markRazorpayPaymentFailed("order_1");

    expect(result).toEqual({ ok: false, reason: "unknown_order" });
  });

  it("marks a still-initiated transaction failed", async () => {
    txnMaybeSingleMock.mockResolvedValue({ data: { status: "initiated", amount_paise: 29900 }, error: null });
    const { markRazorpayPaymentFailed } = await import("../finalize");

    const result = await markRazorpayPaymentFailed("order_1");

    expect(result).toEqual({ ok: true, alreadyProcessed: false, orderId: "order_1", amountPaise: 29900 });
    expect(updateMock).toHaveBeenCalledWith({ status: "failed" });
    expect(updateEqMock).toHaveBeenCalledWith("order_id", "order_1");
  });

  it("is idempotent — a transaction already marked failed is not updated again", async () => {
    txnMaybeSingleMock.mockResolvedValue({ data: { status: "failed", amount_paise: 29900 }, error: null });
    const { markRazorpayPaymentFailed } = await import("../finalize");

    const result = await markRazorpayPaymentFailed("order_1");

    expect(result).toEqual({ ok: true, alreadyProcessed: true, orderId: "order_1", amountPaise: 29900 });
    expect(updateMock).not.toHaveBeenCalled();
  });

  it("does not touch an already-success transaction (a late failure webhook after success)", async () => {
    txnMaybeSingleMock.mockResolvedValue({ data: { status: "success", amount_paise: 29900 }, error: null });
    const { markRazorpayPaymentFailed } = await import("../finalize");

    const result = await markRazorpayPaymentFailed("order_1");

    expect(result).toEqual({ ok: true, alreadyProcessed: true, orderId: "order_1", amountPaise: 29900 });
    expect(updateMock).not.toHaveBeenCalled();
  });
});

describe("markRazorpayRefunded", () => {
  let otherPersonalityPurchases = 0;
  const deleteIsMock = vi.fn();
  const deleteEq2Mock = vi.fn().mockReturnValue({ is: deleteIsMock });
  const deleteEq1Mock = vi.fn().mockReturnValue({ eq: deleteEq2Mock });
  const deleteMock = vi.fn().mockReturnValue({ eq: deleteEq1Mock });
  const counsellingEqMock = vi.fn();

  beforeEach(() => {
    fromMock.mockReset();
    txnSelectMock.mockReset();
    txnEqMock.mockReset();
    txnMaybeSingleMock.mockReset();
    updateMock.mockReset();
    updateEqMock.mockReset();
    updateEqMock.mockResolvedValue({ error: null });
    updateMock.mockReturnValue({ eq: updateEqMock });
    deleteMock.mockClear();
    deleteEq1Mock.mockClear();
    deleteEq2Mock.mockClear();
    deleteIsMock.mockReset();
    deleteIsMock.mockResolvedValue({ error: null });
    revokeProductMock.mockReset();
    revokeProductMock.mockResolvedValue(undefined);
    nextCounsellingStateMock.mockReset();
    updateCounsellingStatusMock.mockReset();
    updateCounsellingStatusMock.mockResolvedValue(undefined);
    counsellingEqMock.mockReset();
    fromMock.mockImplementation((table: string) => {
      if (table === "report_unlocks") return { delete: deleteMock };
      if (table === "fitment_leads") {
        return {
          select: () => ({
            eq: () => ({ maybeSingle: () => Promise.resolve({ data: { role_title: "Senior Product Manager" }, error: null }) }),
          }),
        };
      }
      if (table === "counselling_requests") {
        return { select: () => ({ eq: counsellingEqMock }) };
      }
      return { select: txnSelectMock, update: updateMock };
    });
    txnSelectMock.mockReturnValue({ eq: txnEqMock });
    otherPersonalityPurchases = 0;
    // The "other personality purchase" count query chains eq/eq/in/neq off the same select.
    const countChain: Record<string, unknown> = {};
    for (const m of ["eq", "in", "neq"]) countChain[m] = () => countChain;
    countChain.then = (resolve: (v: unknown) => unknown) => resolve({ count: otherPersonalityPurchases, error: null });
    txnEqMock.mockReturnValue({ ...countChain, maybeSingle: txnMaybeSingleMock });
  });

  it("rejects with unknown_order when no transaction matches", async () => {
    txnMaybeSingleMock.mockResolvedValue({ data: null, error: null });
    const { markRazorpayRefunded } = await import("../finalize");

    const result = await markRazorpayRefunded("order_1");

    expect(result).toEqual({ ok: false, reason: "unknown_order" });
  });

  it("revokes the report unlock and marks the transaction refunded when it was success", async () => {
    txnMaybeSingleMock.mockResolvedValue({
      data: { status: "success", product: "report", user_id: "user-1", lead_id: "lead-1" },
      error: null,
    });
    const { markRazorpayRefunded } = await import("../finalize");

    const result = await markRazorpayRefunded("order_1");

    expect(result).toEqual({ ok: true, alreadyProcessed: false });
    expect(deleteEq1Mock).toHaveBeenCalledWith("user_id", "user-1");
    expect(deleteEq2Mock).toHaveBeenCalledWith("lead_id", "lead-1");
    expect(deleteEq2Mock).toHaveBeenCalledWith("role_title", "Senior Product Manager");
    expect(deleteIsMock).toHaveBeenCalledWith("lead_id", null);
    expect(updateMock).toHaveBeenCalledWith({ status: "refunded" });
  });

  it("is idempotent — an already-refunded transaction is not revoked again", async () => {
    txnMaybeSingleMock.mockResolvedValue({
      data: { status: "refunded", product: "report", user_id: "user-1", lead_id: "lead-1" },
      error: null,
    });
    const { markRazorpayRefunded } = await import("../finalize");

    const result = await markRazorpayRefunded("order_1");

    expect(result).toEqual({ ok: true, alreadyProcessed: true });
    expect(deleteMock).not.toHaveBeenCalled();
    expect(updateMock).not.toHaveBeenCalled();
  });

  it("flips an interview transaction to refunded (closes the free-interview double-dip)", async () => {
    txnMaybeSingleMock.mockResolvedValue({
      data: { status: "success", product: "interview", user_id: "user-1", lead_id: null },
      error: null,
    });
    const { markRazorpayRefunded } = await import("../finalize");

    const result = await markRazorpayRefunded("order_1");

    expect(result).toEqual({ ok: true, alreadyProcessed: false });
    expect(updateMock).toHaveBeenCalledWith({ status: "refunded" });
    expect(deleteMock).not.toHaveBeenCalled();
  });

  it("does not revoke a transaction that was never actually successful", async () => {
    txnMaybeSingleMock.mockResolvedValue({
      data: { status: "initiated", product: "report", user_id: "user-1", lead_id: "lead-1" },
      error: null,
    });
    const { markRazorpayRefunded } = await import("../finalize");

    const result = await markRazorpayRefunded("order_1");

    expect(result).toEqual({ ok: true, alreadyProcessed: true });
    expect(deleteMock).not.toHaveBeenCalled();
  });

  it("revokes personality access on refund", async () => {
    txnMaybeSingleMock.mockResolvedValue({
      data: { status: "success", product: "personality", user_id: "user-1", lead_id: null },
      error: null,
    });
    const { markRazorpayRefunded } = await import("../finalize");

    const result = await markRazorpayRefunded("order_1");

    expect(revokeProductMock).toHaveBeenCalledWith("user-1", "personality");
    expect(updateMock).toHaveBeenCalledWith({ status: "refunded" });
    expect(result).toEqual({ ok: true, alreadyProcessed: false });
  });

  it("keeps personality on a personality refund when a plan/bundle still covers it", async () => {
    otherPersonalityPurchases = 1;
    txnMaybeSingleMock.mockResolvedValue({
      data: { status: "success", product: "personality", user_id: "user-1", lead_id: null },
      error: null,
    });
    const { markRazorpayRefunded } = await import("../finalize");

    await markRazorpayRefunded("order_1");

    expect(revokeProductMock).not.toHaveBeenCalledWith("user-1", "personality");
    expect(updateMock).toHaveBeenCalledWith({ status: "refunded" });
  });

  it("revokes references access on refund", async () => {
    txnMaybeSingleMock.mockResolvedValue({
      data: { status: "success", product: "references", user_id: "user-1", lead_id: null },
      error: null,
    });
    const { markRazorpayRefunded } = await import("../finalize");

    await markRazorpayRefunded("order_1");

    expect(revokeProductMock).toHaveBeenCalledWith("user-1", "references");
  });

  it("revokes the report and both product grants on a bundle refund", async () => {
    txnMaybeSingleMock.mockResolvedValue({
      data: { status: "success", product: "bundle", user_id: "user-1", lead_id: "lead-1" },
      error: null,
    });
    const { markRazorpayRefunded } = await import("../finalize");

    await markRazorpayRefunded("order_1");

    expect(deleteEq1Mock).toHaveBeenCalledWith("user_id", "user-1");
    expect(deleteEq2Mock).toHaveBeenCalledWith("lead_id", "lead-1");
    expect(deleteEq2Mock).toHaveBeenCalledWith("role_title", "Senior Product Manager");
    expect(deleteIsMock).toHaveBeenCalledWith("lead_id", null);
    expect(revokeProductMock).toHaveBeenCalledWith("user-1", "personality");
    expect(revokeProductMock).toHaveBeenCalledWith("user-1", "references");
  });

  it("cancels an active counselling request on refund", async () => {
    counsellingEqMock.mockResolvedValue({ data: [{ id: "req-1", status: "requested" }], error: null });
    nextCounsellingStateMock.mockReturnValue({ status: "cancelled" });
    txnMaybeSingleMock.mockResolvedValue({
      data: { status: "success", product: "counselling", user_id: "user-1", lead_id: null },
      error: null,
    });
    const { markRazorpayRefunded } = await import("../finalize");

    await markRazorpayRefunded("order_1");

    expect(nextCounsellingStateMock).toHaveBeenCalledWith("requested", "cancelled", expect.any(String));
    expect(updateCounsellingStatusMock).toHaveBeenCalledWith("req-1", { status: "cancelled" });
  });

  it("does not try to cancel an already-completed counselling session", async () => {
    counsellingEqMock.mockResolvedValue({ data: [{ id: "req-1", status: "completed" }], error: null });
    txnMaybeSingleMock.mockResolvedValue({
      data: { status: "success", product: "counselling", user_id: "user-1", lead_id: null },
      error: null,
    });
    const { markRazorpayRefunded } = await import("../finalize");

    await markRazorpayRefunded("order_1");

    expect(nextCounsellingStateMock).not.toHaveBeenCalled();
    expect(updateCounsellingStatusMock).not.toHaveBeenCalled();
  });
});

describe("plan orders", () => {
  // Chainable query: every filter returns the chain; awaiting resolves `result`.
  function chain(result: Record<string, unknown>) {
    const c: Record<string, unknown> = {};
    for (const m of ["select", "eq", "in", "neq", "delete"]) c[m] = vi.fn(() => c);
    c.maybeSingle = vi.fn(() => Promise.resolve(result));
    c.then = (resolve: (v: unknown) => unknown) => resolve(result);
    return c as Record<string, ReturnType<typeof vi.fn>>;
  }

  let txnRow: Record<string, unknown>;
  let otherPersonalityCount: number;
  let txnQuery: Record<string, ReturnType<typeof vi.fn>>;
  let countQuery: Record<string, ReturnType<typeof vi.fn>>;
  let unlocksQuery: Record<string, ReturnType<typeof vi.fn>>;
  let counsellingQuery: Record<string, ReturnType<typeof vi.fn>>;

  beforeEach(() => {
    applyPlanGrantsMock.mockReset();
    applyPlanGrantsMock.mockResolvedValue(undefined);
    unlockReportMock.mockReset();
    revokeProductMock.mockReset();
    revokeProductMock.mockResolvedValue(undefined);
    updateCounsellingStatusMock.mockReset();
    nextCounsellingStateMock.mockReset();
    nextCounsellingStateMock.mockReturnValue({ status: "cancelled" });
    updateMock.mockReset();
    updateEqMock.mockReset();
    // CAS chain for the success flip; also awaitable for the refunded flip.
    updateEqMock.mockImplementation(() => ({ ...casTail(), then: (r: (v: unknown) => unknown) => r({ error: null }) }));
    updateMock.mockReturnValue({ eq: updateEqMock });
    flippedRows = [{ order_id: "order_p" }];
    sendPlanWelcomeEmailMock.mockReset();
    sendPlanWelcomeEmailMock.mockResolvedValue(undefined);
    sendOrphanedUpgradeAlertMock.mockReset();
    sendOrphanedUpgradeAlertMock.mockResolvedValue(undefined);
    otherPersonalityCount = 0;
    unlocksQuery = chain({ error: null });
    counsellingQuery = chain({ data: [{ id: "c1", status: "requested" }, { id: "c2", status: "requested" }], error: null });
    let txnCalls = 0;
    fromMock.mockReset();
    fromMock.mockImplementation((table: string) => {
      if (table === "report_unlocks") return unlocksQuery;
      if (table === "counselling_requests") return counsellingQuery;
      // 1st razorpay_transactions call = the order lookup; later ones = the "other personality purchase" count.
      txnCalls += 1;
      if (txnCalls === 1) {
        txnQuery = chain({ data: txnRow, error: null });
        return { ...txnQuery, update: updateMock };
      }
      if (txnCalls === 2) countQuery = chain({ count: otherPersonalityCount, error: null });
      return { ...countQuery, update: updateMock };
    });
  });

  it("applies plan grants then marks success", async () => {
    txnRow = { user_id: "user-1", product: "plan_mentor", lead_id: null, status: "initiated" };
    const { finalizeRazorpayOrder } = await import("../finalize");
    const result = await finalizeRazorpayOrder("order_p", "pay_1");
    expect(result).toEqual({ ok: true, product: "plan_mentor", userId: "user-1", leadId: null });
    expect(applyPlanGrantsMock).toHaveBeenCalledWith("user-1", "order_p", "plan_mentor");
    expect(unlockReportMock).not.toHaveBeenCalled();
    expect(updateMock).toHaveBeenCalledWith({ status: "success", payment_id: "pay_1" });
  });

  it("emails the buyer once, for the plan bought", async () => {
    txnRow = { user_id: "user-1", product: "plan_prepare", lead_id: null, status: "initiated" };
    const { finalizeRazorpayOrder } = await import("../finalize");
    await finalizeRazorpayOrder("order_p", "pay_1");
    expect(sendPlanWelcomeEmailMock).toHaveBeenCalledTimes(1);
    expect(sendPlanWelcomeEmailMock).toHaveBeenCalledWith("user-1", "plan_prepare", false);
  });

  it("does not email when another finalize path already flipped the order (verify/webhook race)", async () => {
    txnRow = { user_id: "user-1", product: "plan_mentor", lead_id: null, status: "initiated" };
    flippedRows = [];
    const { finalizeRazorpayOrder } = await import("../finalize");
    const result = await finalizeRazorpayOrder("order_p", "pay_1");
    expect(result.ok).toBe(true);
    expect(sendPlanWelcomeEmailMock).not.toHaveBeenCalled();
  });

  it("does not re-grant or re-email a refunded order (late payment.captured redelivery)", async () => {
    txnRow = { user_id: "user-1", product: "plan_mentor", lead_id: null, status: "refunded", amount_paise: 499900 };
    const { finalizeRazorpayOrder } = await import("../finalize");
    const result = await finalizeRazorpayOrder("order_p", "pay_1", { amountPaise: 499900, status: "captured", orderId: "order_p" });
    expect(result).toEqual({ ok: false, reason: "refunded" });
    expect(applyPlanGrantsMock).not.toHaveBeenCalled();
    expect(updateMock).not.toHaveBeenCalled();
    expect(sendPlanWelcomeEmailMock).not.toHaveBeenCalled();
  });

  it("does not email on a replay of an already-successful order", async () => {
    txnRow = { user_id: "user-1", product: "plan_mentor", lead_id: null, status: "success" };
    const { finalizeRazorpayOrder } = await import("../finalize");
    await finalizeRazorpayOrder("order_p", "pay_1");
    expect(sendPlanWelcomeEmailMock).not.toHaveBeenCalled();
  });

  it("a failed welcome email never fails finalize", async () => {
    txnRow = { user_id: "user-1", product: "plan_mentor", lead_id: null, status: "initiated" };
    sendPlanWelcomeEmailMock.mockRejectedValue(new Error("resend down"));
    const { finalizeRazorpayOrder } = await import("../finalize");
    expect((await finalizeRazorpayOrder("order_p", "pay_1")).ok).toBe(true);
  });

  it("upgrade: grants Plan 2 extras on the upgrade order and emails the Plan 2 welcome", async () => {
    txnRow = { user_id: "user-1", product: "plan_upgrade_mentor", lead_id: null, status: "initiated" };
    const { finalizeRazorpayOrder } = await import("../finalize");
    const result = await finalizeRazorpayOrder("order_p", "pay_1");
    expect(result).toEqual({ ok: true, product: "plan_upgrade_mentor", userId: "user-1", leadId: null });
    expect(applyPlanGrantsMock).toHaveBeenCalledWith("user-1", "order_p", "plan_upgrade_mentor");
    expect(sendPlanWelcomeEmailMock).toHaveBeenCalledWith("user-1", "plan_mentor", true);
  });

  it("upgrade refund reverses only the mentoring request (Plan 1 items untouched)", async () => {
    txnRow = { status: "success", product: "plan_upgrade_mentor", user_id: "user-1", lead_id: null };
    const { markRazorpayRefunded } = await import("../finalize");
    expect(await markRazorpayRefunded("order_p")).toEqual({ ok: true, alreadyProcessed: false });
    expect(counsellingQuery.eq).toHaveBeenCalledWith("order_id", "order_p");
    expect(updateCounsellingStatusMock).toHaveBeenCalledWith("c1", { status: "cancelled" });
    expect(updateCounsellingStatusMock).toHaveBeenCalledWith("c2", { status: "cancelled" });
    expect(unlocksQuery.delete).not.toHaveBeenCalled();
    expect(revokeProductMock).not.toHaveBeenCalled();
    expect(updateMock).toHaveBeenCalledWith({ status: "refunded" });
  });

  it("Plan 2 refund: cancels both open sessions (scheduled included), keeps a completed one", async () => {
    txnRow = { status: "success", product: "plan_mentor", user_id: "user-1", lead_id: null };
    counsellingQuery = chain({ data: [{ id: "s1", status: "completed" }, { id: "s2", status: "scheduled" }], error: null });
    const { markRazorpayRefunded } = await import("../finalize");
    await markRazorpayRefunded("order_p");
    expect(nextCounsellingStateMock).toHaveBeenCalledTimes(1);
    expect(nextCounsellingStateMock).toHaveBeenCalledWith("scheduled", "cancelled", expect.any(String));
    expect(updateCounsellingStatusMock).toHaveBeenCalledTimes(1);
    expect(updateCounsellingStatusMock).toHaveBeenCalledWith("s2", { status: "cancelled" });
    expect(updateMock).toHaveBeenCalledWith({ status: "refunded" });
  });

  it("Plan 1 refund with a paid upgrade: revokes Plan 1 as usual and flags the orphan upgrade for ops", async () => {
    txnRow = { status: "success", product: "plan_prepare", user_id: "user-1", lead_id: null };
    otherPersonalityCount = 1; // the count query also answers the orphan-upgrade lookup
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const { markRazorpayRefunded } = await import("../finalize");
    await markRazorpayRefunded("order_p");
    expect(unlocksQuery.delete).toHaveBeenCalled();
    expect(countQuery.eq).toHaveBeenCalledWith("product", "plan_upgrade_mentor");
    expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining("upgrade"), expect.anything());
    expect(sendOrphanedUpgradeAlertMock).toHaveBeenCalledWith({ userId: "user-1", refundedOrderId: "order_p" });
    expect(updateMock).toHaveBeenCalledWith({ status: "refunded" });
    errorSpy.mockRestore();
  });

  it("Plan 1 refund still completes when the orphan-upgrade alert email fails", async () => {
    txnRow = { status: "success", product: "plan_prepare", user_id: "user-1", lead_id: null };
    otherPersonalityCount = 1;
    sendOrphanedUpgradeAlertMock.mockRejectedValueOnce(new Error("resend down"));
    const { markRazorpayRefunded } = await import("../finalize");
    expect(await markRazorpayRefunded("order_p")).toEqual({ ok: true, alreadyProcessed: false });
    expect(updateMock).toHaveBeenCalledWith({ status: "refunded" });
  });

  it("Plan 1 refund without an upgrade sends no alert", async () => {
    txnRow = { status: "success", product: "plan_prepare", user_id: "user-1", lead_id: null };
    const { markRazorpayRefunded } = await import("../finalize");
    await markRazorpayRefunded("order_p");
    expect(sendOrphanedUpgradeAlertMock).not.toHaveBeenCalled();
  });

  it("leaves the txn initiated when plan grants throw (retry is real)", async () => {
    txnRow = { user_id: "user-1", product: "plan_prepare", lead_id: null, status: "initiated" };
    applyPlanGrantsMock.mockRejectedValue(new Error("db down"));
    const { finalizeRazorpayOrder } = await import("../finalize");
    await expect(finalizeRazorpayOrder("order_p", "pay_1")).rejects.toThrow("db down");
    expect(updateMock).not.toHaveBeenCalled();
  });

  it("does not re-grant an already-successful plan (replay idempotent)", async () => {
    txnRow = { user_id: "user-1", product: "plan_prepare", lead_id: null, status: "success" };
    const { finalizeRazorpayOrder } = await import("../finalize");
    await finalizeRazorpayOrder("order_p", "pay_1");
    expect(applyPlanGrantsMock).not.toHaveBeenCalled();
  });

  it("refund reverses plan reports, personality, references and mentoring", async () => {
    txnRow = { status: "success", product: "plan_mentor", user_id: "user-1", lead_id: null };
    const { markRazorpayRefunded } = await import("../finalize");
    const result = await markRazorpayRefunded("order_p");
    expect(result).toEqual({ ok: true, alreadyProcessed: false });
    expect(unlocksQuery.delete).toHaveBeenCalled();
    expect(unlocksQuery.eq).toHaveBeenCalledWith("order_id", "order_p");
    expect(countQuery.in).toHaveBeenCalledWith("product", ["personality", "bundle", "plan_prepare", "plan_mentor"]);
    expect(countQuery.neq).toHaveBeenCalledWith("order_id", "order_p");
    expect(revokeProductMock).toHaveBeenCalledWith("user-1", "personality");
    expect(revokeProductMock).toHaveBeenCalledWith("user-1", "references");
    expect(updateCounsellingStatusMock).toHaveBeenCalledWith("c1", { status: "cancelled" });
    expect(updateMock).toHaveBeenCalledWith({ status: "refunded" });
  });

  it("refund keeps personality bought separately", async () => {
    txnRow = { status: "success", product: "plan_prepare", user_id: "user-1", lead_id: null };
    otherPersonalityCount = 1;
    const { markRazorpayRefunded } = await import("../finalize");
    await markRazorpayRefunded("order_p");
    expect(revokeProductMock).not.toHaveBeenCalledWith("user-1", "personality");
    expect(updateMock).toHaveBeenCalledWith({ status: "refunded" });
  });
});
