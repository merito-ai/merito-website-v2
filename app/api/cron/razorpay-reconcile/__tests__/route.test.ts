import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const reconcileStuckTransactionsMock = vi.fn();
vi.mock("@/lib/razorpay/reconcile", () => ({
  reconcileStuckTransactions: reconcileStuckTransactionsMock,
}));

async function importRoute() {
  return await import("../route");
}

describe("GET /api/cron/razorpay-reconcile", () => {
  beforeEach(() => {
    reconcileStuckTransactionsMock.mockReset();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns 401 when CRON_SECRET is unset", async () => {
    const { GET } = await importRoute();
    const response = await GET(new Request("http://localhost/api/cron/razorpay-reconcile"));
    expect(response.status).toBe(401);
    expect(reconcileStuckTransactionsMock).not.toHaveBeenCalled();
  });

  it("returns 401 with a wrong bearer token", async () => {
    vi.stubEnv("CRON_SECRET", "expected-secret");
    const { GET } = await importRoute();
    const response = await GET(
      new Request("http://localhost/api/cron/razorpay-reconcile", { headers: { authorization: "Bearer nope" } })
    );
    expect(response.status).toBe(401);
    expect(reconcileStuckTransactionsMock).not.toHaveBeenCalled();
  });

  it("runs the reconcile and returns its summary when the secret matches", async () => {
    vi.stubEnv("CRON_SECRET", "expected-secret");
    reconcileStuckTransactionsMock.mockResolvedValue({ scanned: 3, recovered: 1, stale: 1, waiting: 1, errored: 0 });
    const { GET } = await importRoute();
    const response = await GET(
      new Request("http://localhost/api/cron/razorpay-reconcile", { headers: { authorization: "Bearer expected-secret" } })
    );
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ scanned: 3, recovered: 1, stale: 1, waiting: 1, errored: 0 });
  });
});
