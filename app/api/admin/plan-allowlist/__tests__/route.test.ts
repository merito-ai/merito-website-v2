import { describe, it, expect, vi, beforeEach } from "vitest";

const requireAdminMock = vi.fn();
vi.mock("@/lib/adminAuth", () => ({ requireAdmin: requireAdminMock }));

const enforceAdminRateLimitMock = vi.fn();
vi.mock("@/lib/adminRateLimit", async () => {
  const actual = await vi.importActual<typeof import("@/lib/adminRateLimit")>("@/lib/adminRateLimit");
  return { ...actual, enforceAdminRateLimit: enforceAdminRateLimitMock };
});

const addToAllowlistMock = vi.fn();
const removeFromAllowlistMock = vi.fn();
vi.mock("@/lib/planAllowlist", async () => {
  const actual = await vi.importActual<typeof import("@/lib/planAllowlist")>("@/lib/planAllowlist");
  return { ...actual, addToAllowlist: addToAllowlistMock, removeFromAllowlist: removeFromAllowlistMock };
});

function req(method: string, body: unknown) {
  return new Request("http://localhost/api/admin/plan-allowlist", { method, body: JSON.stringify(body) });
}

describe("/api/admin/plan-allowlist", () => {
  beforeEach(() => {
    requireAdminMock.mockReset();
    requireAdminMock.mockResolvedValue({ email: "admin@merito.in" });
    enforceAdminRateLimitMock.mockReset();
    enforceAdminRateLimitMock.mockResolvedValue(undefined);
    addToAllowlistMock.mockReset();
    addToAllowlistMock.mockResolvedValue(1);
    removeFromAllowlistMock.mockReset();
    removeFromAllowlistMock.mockResolvedValue(undefined);
  });

  it("POST adds valid emails and reports invalid ones", async () => {
    const { POST } = await import("../route");
    const res = await POST(req("POST", { emails: "A@x.com, bad", note: "Pune seminar 2026-11" }));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ added: 1, invalid: ["bad"] });
    expect(addToAllowlistMock).toHaveBeenCalledWith(["a@x.com"], "Pune seminar 2026-11", "admin@merito.in");
  });

  it("POST with empty emails → 400", async () => {
    const { POST } = await import("../route");
    const res = await POST(req("POST", { emails: "" }));
    expect(res.status).toBe(400);
    expect(addToAllowlistMock).not.toHaveBeenCalled();
  });

  it("DELETE removes an email", async () => {
    const { DELETE } = await import("../route");
    const res = await DELETE(req("DELETE", { email: "a@x.com" }));
    expect(res.status).toBe(200);
    expect(removeFromAllowlistMock).toHaveBeenCalledWith("a@x.com", "admin@merito.in");
  });

  it("DELETE removes a malformed row stored by an older parser", async () => {
    const { DELETE } = await import("../route");
    const res = await DELETE(req("DELETE", { email: "<a@x.com>" }));
    expect(res.status).toBe(200);
    expect(removeFromAllowlistMock).toHaveBeenCalledWith("<a@x.com>", "admin@merito.in");
  });

  it("DELETE with no email → 400", async () => {
    const { DELETE } = await import("../route");
    const res = await DELETE(req("DELETE", { email: "  " }));
    expect(res.status).toBe(400);
    expect(removeFromAllowlistMock).not.toHaveBeenCalled();
  });
});
