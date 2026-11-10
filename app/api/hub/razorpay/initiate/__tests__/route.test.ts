import { describe, it, expect, vi, beforeEach } from "vitest";

const getUserMock = vi.fn();
const leadMaybeSingleMock = vi.fn();
const leadLimitMock = vi.fn().mockReturnValue({ maybeSingle: leadMaybeSingleMock });
const leadOrderMock = vi.fn().mockReturnValue({ limit: leadLimitMock });
const leadEqMock = vi.fn().mockReturnValue({ order: leadOrderMock });
const leadSelectMock = vi.fn().mockReturnValue({ eq: leadEqMock });
const sessionFromMock = vi.fn().mockReturnValue({ select: leadSelectMock });

vi.mock("@/lib/supabaseAuthServer", () => ({
  createSupabaseServerClient: async () => ({
    auth: { getUser: getUserMock },
    from: sessionFromMock,
  }),
}));

const createOrderMock = vi.fn();
// First-time buyer: references not yet owned, so full price applies.
vi.mock("@/lib/productUnlocks", () => ({
  isProductUnlocked: vi.fn().mockResolvedValue(false),
}));
vi.mock("@/lib/referenceCredits", () => ({
  REFERENCE_REFRESH_PRICE_PAISE: 14900,
  referenceRefreshNeedsPayment: vi.fn().mockResolvedValue(true),
}));

vi.mock("@/lib/razorpay/client", () => ({
  createOrder: createOrderMock,
}));

const isEmailAllowlistedMock = vi.fn();
vi.mock("@/lib/planAllowlist", () => ({ isEmailAllowlisted: isEmailAllowlistedMock }));
const getPlanOrderMock = vi.fn();
vi.mock("@/lib/plans", async () => {
  const actual = await vi.importActual<typeof import("@/lib/plans")>("@/lib/plans");
  return { ...actual, getPlanOrder: getPlanOrderMock };
});

const insertMock = vi.fn();
const adminFromMock = vi.fn().mockReturnValue({ insert: insertMock });
vi.mock("@/lib/supabase", () => ({
  getSupabaseServerClient: () => ({ from: adminFromMock }),
}));

async function importRoute() {
  return await import("../route");
}

function buildRequest(body: unknown) {
  return new Request("http://localhost/api/hub/razorpay/initiate", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

describe("POST /api/hub/razorpay/initiate", () => {
  beforeEach(() => {
    process.env.RAZORPAY_KEY_ID = "rzp_test_key";
    getUserMock.mockReset();
    leadMaybeSingleMock.mockReset();
    leadMaybeSingleMock.mockResolvedValue({ data: { candidate_level: "senior" }, error: null });
    createOrderMock.mockReset();
    createOrderMock.mockResolvedValue({ orderId: "order_ABC123" });
    insertMock.mockReset();
    insertMock.mockResolvedValue({ error: null });
    isEmailAllowlistedMock.mockReset();
    isEmailAllowlistedMock.mockResolvedValue(true);
    getPlanOrderMock.mockReset();
    getPlanOrderMock.mockResolvedValue(null);
  });

  it("returns 401 when there is no session", async () => {
    getUserMock.mockResolvedValue({ data: { user: null } });
    const { POST } = await importRoute();
    const response = await POST(buildRequest({ product: "counselling" }));
    expect(response.status).toBe(401);
  });

  it("returns 400 for an unknown product", async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: "user-1", email: "rushi@example.com" } } });
    const { POST } = await importRoute();
    const response = await POST(buildRequest({ product: "not-a-product" }));
    expect(response.status).toBe(400);
    expect(createOrderMock).not.toHaveBeenCalled();
  });

  it("returns 400 for report (report has its own dedicated route, not this generic one)", async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: "user-1", email: "rushi@example.com" } } });
    const { POST } = await importRoute();
    const response = await POST(buildRequest({ product: "report" }));
    expect(response.status).toBe(400);
  });

  it("creates an order priced by the candidate's most recent level and returns checkout details", async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: "user-1", email: "rushi@example.com" } } });
    const { POST } = await importRoute();
    const response = await POST(buildRequest({ product: "counselling" }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.status).toBe("checkout");
    expect(body.orderId).toBe("order_ABC123");
    expect(body.amountPaise).toBe(299900); // counselling @ senior level
    expect(body.currency).toBe("INR");
    expect(body.keyId).toBe("rzp_test_key");
    expect(leadEqMock).toHaveBeenCalledWith("user_id", "user-1");
    expect(createOrderMock).toHaveBeenCalledWith(expect.objectContaining({ amountPaise: 299900, currency: "INR" }));
    expect(insertMock).toHaveBeenCalledWith(
      expect.objectContaining({
        order_id: "order_ABC123",
        user_id: "user-1",
        product: "counselling",
        level: "senior",
        lead_id: null,
        amount_paise: 299900,
        status: "initiated",
      })
    );
  });

  it("falls back to the default (entry) level when the candidate has no fitment_leads row yet", async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: "user-1", email: "rushi@example.com" } } });
    leadMaybeSingleMock.mockResolvedValue({ data: null, error: null });
    const { POST } = await importRoute();
    const response = await POST(buildRequest({ product: "counselling" }));
    const body = await response.json();

    expect(body.amountPaise).toBe(199900); // counselling @ entry level (default)
  });

  it("accepts personality as an initiatable product", async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: "user-1", email: "rushi@example.com" } } });
    const { POST } = await importRoute();
    const response = await POST(buildRequest({ product: "personality" }));
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.status).toBe("checkout");
  });

  it("accepts references as an initiatable product", async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: "user-1", email: "rushi@example.com" } } });
    const { POST } = await importRoute();
    const response = await POST(buildRequest({ product: "references" }));
    expect(response.status).toBe(200);
  });

  it("charges the loyalty refresh price when references are already owned", async () => {
    const { isProductUnlocked } = await import("@/lib/productUnlocks");
    vi.mocked(isProductUnlocked).mockResolvedValueOnce(true);
    getUserMock.mockResolvedValue({ data: { user: { id: "user-1", email: "rushi@example.com" } } });
    const { POST } = await importRoute();
    const response = await POST(buildRequest({ product: "references" }));
    expect(response.status).toBe(200);
    expect((await response.json()).amountPaise).toBe(14900);
  });

  it("refuses a refresh purchase while an unused reference credit remains", async () => {
    const { isProductUnlocked } = await import("@/lib/productUnlocks");
    const { referenceRefreshNeedsPayment } = await import("@/lib/referenceCredits");
    vi.mocked(isProductUnlocked).mockResolvedValueOnce(true);
    vi.mocked(referenceRefreshNeedsPayment).mockResolvedValueOnce(false);
    getUserMock.mockResolvedValue({ data: { user: { id: "user-1", email: "rushi@example.com" } } });
    const { POST } = await importRoute();
    const response = await POST(buildRequest({ product: "references" }));
    expect(response.status).toBe(409);
  });

  it("accepts interview as an initiatable product", async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: "user-1", email: "rushi@example.com" } } });
    const { POST } = await importRoute();
    const response = await POST(buildRequest({ product: "interview" }));
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.status).toBe("checkout");
  });

  it("returns 500 when the pending transaction insert fails", async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: "user-1", email: "rushi@example.com" } } });
    insertMock.mockResolvedValue({ error: { message: "db error" } });
    const { POST } = await importRoute();
    const response = await POST(buildRequest({ product: "counselling" }));
    expect(response.status).toBe(500);
  });
  describe("plans", () => {
    beforeEach(() => {
      getUserMock.mockResolvedValue({ data: { user: { id: "user-1", email: "Seminar@Example.com" } } });
    });

    it("creates a flat-price plan_prepare order for an allowlisted user", async () => {
      leadMaybeSingleMock.mockResolvedValue({ data: { candidate_level: "entry" }, error: null });
      const { POST } = await importRoute();
      const response = await POST(buildRequest({ product: "plan_prepare" }));
      expect(response.status).toBe(200);
      expect((await response.json()).amountPaise).toBe(299600);
      expect(isEmailAllowlistedMock).toHaveBeenCalledWith("Seminar@Example.com");
      expect(insertMock).toHaveBeenCalledWith(expect.objectContaining({ product: "plan_prepare", lead_id: null, amount_paise: 299600 }));
    });

    it("prices plan_mentor flat even for a senior lead", async () => {
      const { POST } = await importRoute();
      const response = await POST(buildRequest({ product: "plan_mentor" }));
      expect(response.status).toBe(200);
      expect((await response.json()).amountPaise).toBe(599500);
    });

    it("refuses a plan to a user not on the allowlist", async () => {
      isEmailAllowlistedMock.mockResolvedValue(false);
      const { POST } = await importRoute();
      const response = await POST(buildRequest({ product: "plan_prepare" }));
      expect(response.status).toBe(403);
      expect(await response.json()).toEqual({ error: "Plans aren't available on this account." });
      expect(createOrderMock).not.toHaveBeenCalled();
    });

    it("refuses a second plan", async () => {
      getPlanOrderMock.mockResolvedValue({ orderId: "o1", product: "plan_prepare", interviewUsed: false });
      const { POST } = await importRoute();
      const response = await POST(buildRequest({ product: "plan_mentor" }));
      expect(response.status).toBe(409);
      expect(createOrderMock).not.toHaveBeenCalled();
    });

    it("fails closed when the allowlist check errors", async () => {
      isEmailAllowlistedMock.mockRejectedValue(new Error("boom"));
      const { POST } = await importRoute();
      const response = await POST(buildRequest({ product: "plan_prepare" }));
      expect(response.status).toBe(500);
      expect(createOrderMock).not.toHaveBeenCalled();
    });

    it("never checks the allowlist for individual products", async () => {
      const { POST } = await importRoute();
      await POST(buildRequest({ product: "personality" }));
      expect(isEmailAllowlistedMock).not.toHaveBeenCalled();
    });
  });
});
