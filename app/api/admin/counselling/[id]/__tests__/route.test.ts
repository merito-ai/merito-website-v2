import { describe, it, expect, vi, beforeEach } from "vitest";

const requireAdminMock = vi.fn();
vi.mock("@/lib/adminAuth", () => ({ requireAdmin: requireAdminMock }));

const getCounsellingRequestMock = vi.fn();
const updateCounsellingStatusMock = vi.fn();
vi.mock("@/lib/adminCounselling", async () => {
  const actual = await vi.importActual<typeof import("@/lib/adminCounselling")>("@/lib/adminCounselling");
  return {
    ...actual,
    getCounsellingRequest: getCounsellingRequestMock,
    updateCounsellingStatus: updateCounsellingStatusMock,
  };
});

const logAdminActionMock = vi.fn();
vi.mock("@/lib/adminAuditLog", () => ({ logAdminAction: logAdminActionMock }));

function buildRequest(body: unknown) {
  return new Request("http://localhost/api/admin/counselling/req-1", { method: "PATCH", body: JSON.stringify(body) });
}

const REQUEST_ROW = {
  id: "req-1",
  userId: "user-1",
  email: "candidate@example.com",
  orderId: "order-1",
  status: "requested" as const,
  requestedAt: "2026-08-01T00:00:00.000Z",
  scheduledAt: null,
  completedAt: null,
  notes: null,
  sessionAt: null,
};

describe("PATCH /api/admin/counselling/[id]", () => {
  beforeEach(() => {
    requireAdminMock.mockReset();
    requireAdminMock.mockResolvedValue({ email: "admin@merito.in" });
    getCounsellingRequestMock.mockReset();
    getCounsellingRequestMock.mockResolvedValue(REQUEST_ROW);
    updateCounsellingStatusMock.mockReset();
    updateCounsellingStatusMock.mockResolvedValue(undefined);
    logAdminActionMock.mockReset();
    logAdminActionMock.mockResolvedValue(undefined);
  });

  it("updates the status and logs the admin action", async () => {
    const { PATCH } = await import("../route");

    const response = await PATCH(buildRequest({ status: "scheduled", session_at: "2026-11-27T16:00" }), { params: Promise.resolve({ id: "req-1" }) });

    expect(response.status).toBe(200);
    // 4:00 pm IST = 10:30 UTC
    expect(updateCounsellingStatusMock).toHaveBeenCalledWith("req-1", { status: "scheduled", scheduled_at: expect.any(String), session_at: "2026-11-27T10:30:00.000Z" }, undefined);
    expect(logAdminActionMock).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "counselling.status_change",
        targetType: "counselling_request",
        targetId: "req-1",
        priorValue: { status: "requested", session_at: null },
        newValue: { status: "scheduled", notes: null, session_at: "2026-11-27T10:30:00.000Z" },
      })
    );
  });

  it("returns 404 when the request doesn't exist", async () => {
    getCounsellingRequestMock.mockResolvedValue(null);
    const { PATCH } = await import("../route");

    const response = await PATCH(buildRequest({ status: "scheduled" }), { params: Promise.resolve({ id: "missing" }) });

    expect(response.status).toBe(404);
    expect(updateCounsellingStatusMock).not.toHaveBeenCalled();
  });

  it("returns 400 for an invalid transition", async () => {
    getCounsellingRequestMock.mockResolvedValue({ ...REQUEST_ROW, status: "completed" });
    const { PATCH } = await import("../route");

    const response = await PATCH(buildRequest({ status: "scheduled" }), { params: Promise.resolve({ id: "req-1" }) });

    expect(response.status).toBe(400);
    expect(updateCounsellingStatusMock).not.toHaveBeenCalled();
  });

  it("still returns ok when logging the admin action fails", async () => {
    logAdminActionMock.mockRejectedValue(new Error("db down"));
    const { PATCH } = await import("../route");

    const response = await PATCH(buildRequest({ status: "scheduled", session_at: "2026-11-27T16:00" }), { params: Promise.resolve({ id: "req-1" }) });

    expect(response.status).toBe(200);
  });

  it("call time is optional on schedule, but must be well-formed when given", async () => {
    const { PATCH } = await import("../route");
    const malformed = await PATCH(buildRequest({ status: "scheduled", session_at: "27/11/2026" }), { params: Promise.resolve({ id: "req-1" }) });
    expect(malformed.status).toBe(400);
    expect(updateCounsellingStatusMock).not.toHaveBeenCalled();

    const without = await PATCH(buildRequest({ status: "scheduled" }), { params: Promise.resolve({ id: "req-1" }) });
    expect(without.status).toBe(200);
    expect(updateCounsellingStatusMock).toHaveBeenCalledWith("req-1", { status: "scheduled", scheduled_at: expect.any(String) }, undefined);
  });

  it("reschedules a scheduled session to a new call time", async () => {
    getCounsellingRequestMock.mockResolvedValue({ ...REQUEST_ROW, status: "scheduled", sessionAt: "2026-11-27T10:30:00.000Z" });
    const { PATCH } = await import("../route");

    const moved = await PATCH(buildRequest({ status: "scheduled", session_at: "2026-11-28T09:15" }), { params: Promise.resolve({ id: "req-1" }) });
    expect(moved.status).toBe(200);
    expect(updateCounsellingStatusMock).toHaveBeenCalledWith("req-1", { status: "scheduled", session_at: "2026-11-28T03:45:00.000Z" }, undefined);

    updateCounsellingStatusMock.mockClear();
    const noTime = await PATCH(buildRequest({ status: "scheduled" }), { params: Promise.resolve({ id: "req-1" }) });
    expect(noTime.status).toBe(400);
    expect(updateCounsellingStatusMock).not.toHaveBeenCalled();
  });
});
