import { describe, it, expect, vi, beforeEach } from "vitest";

const requireAdminMock = vi.fn();
vi.mock("@/lib/adminAuth", () => ({ requireAdmin: requireAdminMock }));
const setAssistanceMock = vi.fn();
vi.mock("@/lib/planAssistance", () => ({ setAssistance: setAssistanceMock, ASSISTANCE_STATUSES: ["not_contacted", "in_progress", "done"] }));

const USER = "11111111-1111-4111-8111-111111111111";
const req = (body: unknown) => new Request("http://localhost/api/admin/assistance", { method: "PATCH", body: JSON.stringify(body) });

describe("PATCH /api/admin/assistance", () => {
  beforeEach(() => {
    requireAdminMock.mockReset().mockResolvedValue({ email: "ops@merito.ai" });
    setAssistanceMock.mockReset().mockResolvedValue(undefined);
  });

  it("saves status and trimmed companies as the admin", async () => {
    const { PATCH } = await import("../route");
    const res = await PATCH(req({ userId: USER, status: "in_progress", companies: "  Acme, Beta, Gamma " }));
    expect(res.status).toBe(200);
    expect(setAssistanceMock).toHaveBeenCalledWith(USER, "in_progress", "Acme, Beta, Gamma", "ops@merito.ai");
  });

  it("stores an empty note as null", async () => {
    const { PATCH } = await import("../route");
    await PATCH(req({ userId: USER, status: "done", companies: "   " }));
    expect(setAssistanceMock).toHaveBeenCalledWith(USER, "done", null, "ops@merito.ai");
  });

  it("rejects an unknown status", async () => {
    const { PATCH } = await import("../route");
    expect((await PATCH(req({ userId: USER, status: "referred" }))).status).toBe(400);
    expect(setAssistanceMock).not.toHaveBeenCalled();
  });

  it("returns 409 when the candidate has no active Plan 2", async () => {
    setAssistanceMock.mockRejectedValue(new Error("This candidate has no active Plan 2."));
    const { PATCH } = await import("../route");
    const res = await PATCH(req({ userId: USER, status: "done" }));
    expect(res.status).toBe(409);
    expect((await res.json()).error).toBe("This candidate has no active Plan 2.");
  });
});
