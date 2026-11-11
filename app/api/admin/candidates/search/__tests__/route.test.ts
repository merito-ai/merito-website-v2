import { describe, it, expect, vi } from "vitest";

const requireAdminMock = vi.fn().mockResolvedValue({ email: "admin@merito.in" });
vi.mock("@/lib/adminAuth", () => ({ requireAdmin: requireAdminMock }));
const searchCandidatesMock = vi.fn();
vi.mock("@/lib/adminCandidates", () => ({ searchCandidates: searchCandidatesMock }));

describe("GET /api/admin/candidates/search", () => {
  it("requires admin and returns trimmed candidate fields", async () => {
    searchCandidatesMock.mockResolvedValue([
      { userId: "u1", email: "a@example.com", name: "A", latestRoleTitle: "PM", firstSeenAt: "x", funnelStage: "fitment_started" },
    ]);
    const { GET } = await import("../route");
    const res = await GET(new Request("http://localhost/api/admin/candidates/search?q=a%40ex"));
    expect(requireAdminMock).toHaveBeenCalled();
    expect(searchCandidatesMock).toHaveBeenCalledWith("a@ex");
    expect(await res.json()).toEqual({ results: [{ userId: "u1", email: "a@example.com", name: "A", roleTitle: "PM" }] });
  });
});
