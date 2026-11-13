import { describe, it, expect, vi, beforeEach } from "vitest";

const requireAdminMock = vi.fn();
vi.mock("@/lib/adminAuth", () => ({ requireAdmin: requireAdminMock }));
const logAdminActionMock = vi.fn();
vi.mock("@/lib/adminAuditLog", () => ({ logAdminAction: logAdminActionMock }));
const getCvDownloadMock = vi.fn();
vi.mock("@/lib/cvDownload", async () => {
  const actual = await vi.importActual<typeof import("@/lib/cvDownload")>("@/lib/cvDownload");
  return { ...actual, getCvDownload: getCvDownloadMock };
});

const call = async () => {
  const { GET } = await import("../route");
  return GET(new Request("http://localhost/x?lead=l1"), { params: Promise.resolve({ userId: "u1" }) });
};

describe("GET /api/admin/candidates/[userId]/cv", () => {
  beforeEach(() => {
    requireAdminMock.mockReset().mockResolvedValue({ email: "admin@merito.in" });
    logAdminActionMock.mockReset().mockResolvedValue(undefined);
    getCvDownloadMock.mockReset().mockResolvedValue({ kind: "url", url: "https://x/signed" });
  });

  it("blocks non-admins before touching the CV", async () => {
    requireAdminMock.mockRejectedValue(new Error("NEXT_REDIRECT"));
    await expect(call()).rejects.toThrow("NEXT_REDIRECT");
    expect(getCvDownloadMock).not.toHaveBeenCalled();
  });

  it("redirects an admin to the signed URL and logs the download", async () => {
    const res = await call();
    expect(res.status).toBe(302);
    expect(res.headers.get("location")).toBe("https://x/signed");
    expect(getCvDownloadMock).toHaveBeenCalledWith("u1", "l1");
    expect(logAdminActionMock).toHaveBeenCalledWith(expect.objectContaining({ action: "candidate.cv_downloaded", targetId: "u1" }));
  });
});
