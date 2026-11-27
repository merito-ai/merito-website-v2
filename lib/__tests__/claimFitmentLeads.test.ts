import { describe, it, expect, vi, beforeEach } from "vitest";

const findIsMock = vi.fn();
const ilikeMock = vi.fn();
const findSelectMock = vi.fn();
const updateMock = vi.fn();
const inMock = vi.fn();
const updateIsMock = vi.fn();
const updateSelectMock = vi.fn();
const fromMock = vi.fn();

vi.mock("@/lib/supabase", () => ({
  getSupabaseServerClient: () => ({
    from: fromMock,
  }),
}));

describe("claimFitmentLeads", () => {
  beforeEach(() => {
    for (const m of [fromMock, findSelectMock, ilikeMock, findIsMock, updateMock, inMock, updateIsMock, updateSelectMock]) m.mockReset();

    // Find: from("fitment_leads").select("id, email").ilike("email", ...).is("user_id", null)
    // Claim: from("fitment_leads").update({...}).in("id", ids).is("user_id", null).select("id")
    fromMock.mockReturnValue({ select: findSelectMock, update: updateMock });
    findSelectMock.mockReturnValue({ ilike: ilikeMock });
    ilikeMock.mockReturnValue({ is: findIsMock });
    updateMock.mockReturnValue({ in: inMock });
    inMock.mockReturnValue({ is: updateIsMock });
    updateIsMock.mockReturnValue({ select: updateSelectMock });
  });

  it("claims every unclaimed row matching the email and returns the claimed count", async () => {
    findIsMock.mockResolvedValue({ data: [{ id: "a", email: "candidate@example.com" }, { id: "b", email: "Candidate@Example.com" }], error: null });
    updateSelectMock.mockResolvedValue({ data: [{ id: "a" }, { id: "b" }], error: null });
    const { claimFitmentLeads } = await import("../claimFitmentLeads");

    const result = await claimFitmentLeads("user-123", "candidate@example.com");

    expect(fromMock).toHaveBeenCalledWith("fitment_leads");
    expect(ilikeMock).toHaveBeenCalledWith("email", "candidate@example.com");
    expect(findIsMock).toHaveBeenCalledWith("user_id", null);
    expect(updateMock).toHaveBeenCalledWith({ user_id: "user-123" });
    expect(inMock).toHaveBeenCalledWith("id", ["a", "b"]);
    expect(updateIsMock).toHaveBeenCalledWith("user_id", null);
    expect(result).toEqual({ claimedCount: 2 });
  });

  it("matches case-insensitively", async () => {
    findIsMock.mockResolvedValue({ data: [{ id: "a", email: "john.doe@gmail.com" }], error: null });
    updateSelectMock.mockResolvedValue({ data: [{ id: "a" }], error: null });
    const { claimFitmentLeads } = await import("../claimFitmentLeads");

    await claimFitmentLeads("user-123", "John.Doe@Gmail.com");

    expect(ilikeMock).toHaveBeenCalledWith("email", "john.doe@gmail.com");
    expect(inMock).toHaveBeenCalledWith("id", ["a"]);
  });

  it("escapes like wildcards and never claims a lead that only matched a wildcard", async () => {
    // a_b would match aXb unescaped; * is a PostgREST wildcard alias that escaping can't stop.
    findIsMock.mockResolvedValue({ data: [{ id: "x", email: "aXb@x.com" }, { id: "y", email: "a_b@x.com" }], error: null });
    updateSelectMock.mockResolvedValue({ data: [{ id: "y" }], error: null });
    const { claimFitmentLeads } = await import("../claimFitmentLeads");

    await claimFitmentLeads("user-123", "a_b@x.com");

    expect(ilikeMock).toHaveBeenCalledWith("email", "a\\_b@x.com");
    expect(inMock).toHaveBeenCalledWith("id", ["y"]);
  });

  it("escapes % and backslash", async () => {
    const { escapeLike } = await import("../claimFitmentLeads");
    expect(escapeLike("a%b\\c_d")).toBe("a\\%b\\\\c\\_d");
  });

  it("returns zero without updating when nothing matches", async () => {
    findIsMock.mockResolvedValue({ data: [], error: null });
    const { claimFitmentLeads } = await import("../claimFitmentLeads");

    const result = await claimFitmentLeads("user-123", "nobody@example.com");

    expect(result).toEqual({ claimedCount: 0 });
    expect(updateMock).not.toHaveBeenCalled();
  });

  it("throws if Supabase returns an error", async () => {
    findIsMock.mockResolvedValue({ data: null, error: { message: "db error" } });
    const { claimFitmentLeads } = await import("../claimFitmentLeads");

    await expect(claimFitmentLeads("user-123", "candidate@example.com")).rejects.toThrow();
  });
});
