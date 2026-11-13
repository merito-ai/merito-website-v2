import { describe, it, expect, vi, beforeEach } from "vitest";

const selectMock = vi.fn();
const updateMock = vi.fn();
const rpcMock = vi.fn();
const updateUserByIdMock = vi.fn();
const logAdminActionMock = vi.fn();
const cvRowsMock = vi.fn();
const removeMock = vi.fn();

vi.mock("@/lib/supabase", () => ({
  getSupabaseServerClient: () => ({
    from: (table: string) => {
      if (table === "candidate_deletions") return { select: selectMock, update: updateMock };
      if (table === "fitment_leads") return { select: () => ({ eq: () => ({ not: cvRowsMock }) }) };
      throw new Error(`Unexpected table in test: ${table}`);
    },
    rpc: rpcMock,
    storage: { from: () => ({ remove: removeMock }) },
    auth: { admin: { updateUserById: updateUserByIdMock } },
  }),
}));

vi.mock("@/lib/adminAuditLog", () => ({ logAdminAction: logAdminActionMock }));

async function importModule() {
  return await import("../purgeCandidates");
}

function mockDueRows(result: { data: { user_id: string }[] | null; error: { message: string } | null }) {
  selectMock.mockReturnValue({ is: () => ({ lte: () => Promise.resolve(result) }) });
}

describe("purgeDueCandidateDeletions", () => {
  beforeEach(() => {
    selectMock.mockReset();
    updateMock.mockReset();
    updateMock.mockReturnValue({ eq: () => Promise.resolve({ error: null }) });
    rpcMock.mockReset();
    rpcMock.mockResolvedValue({ data: { fitment_leads: 2 }, error: null });
    updateUserByIdMock.mockReset();
    updateUserByIdMock.mockResolvedValue({ error: null });
    logAdminActionMock.mockReset();
    logAdminActionMock.mockResolvedValue(undefined);
    cvRowsMock.mockReset().mockResolvedValue({ data: [], error: null });
    removeMock.mockReset().mockResolvedValue({ data: [], error: null });
  });

  it("purges each due candidate: runs the RPC, scrubs the email, marks purged, and logs", async () => {
    mockDueRows({ data: [{ user_id: "user-1" }], error: null });

    const { purgeDueCandidateDeletions } = await importModule();
    const result = await purgeDueCandidateDeletions();

    expect(result).toEqual({ purgedCount: 1 });
    expect(rpcMock).toHaveBeenCalledWith("purge_candidate_data", { target_user_id: "user-1" });
    expect(updateUserByIdMock).toHaveBeenCalledWith("user-1", { email: "deleted-user-1@merito.invalid" });
    expect(updateMock).toHaveBeenCalledWith({ purged_at: expect.any(String) });
    expect(logAdminActionMock).toHaveBeenCalledWith({
      adminEmail: "system:cron",
      action: "candidate.purge",
      targetType: "candidate",
      targetId: "user-1",
      priorValue: null,
      newValue: { purgedTables: { fitment_leads: 2 }, cvFilesRemoved: 0, emailScrubbed: true },
    });
  });

  it("purges multiple due candidates in one run", async () => {
    mockDueRows({ data: [{ user_id: "user-1" }, { user_id: "user-2" }], error: null });

    const { purgeDueCandidateDeletions } = await importModule();
    const result = await purgeDueCandidateDeletions();

    expect(result).toEqual({ purgedCount: 2 });
    expect(rpcMock).toHaveBeenCalledTimes(2);
  });

  it("returns purgedCount 0 and does nothing else when nothing is due", async () => {
    mockDueRows({ data: [], error: null });

    const { purgeDueCandidateDeletions } = await importModule();
    const result = await purgeDueCandidateDeletions();

    expect(result).toEqual({ purgedCount: 0 });
    expect(rpcMock).not.toHaveBeenCalled();
    expect(updateUserByIdMock).not.toHaveBeenCalled();
  });

  it("throws when loading due deletions fails", async () => {
    mockDueRows({ data: null, error: { message: "db error" } });

    const { purgeDueCandidateDeletions } = await importModule();
    await expect(purgeDueCandidateDeletions()).rejects.toThrow("Failed to load due candidate deletions: db error");
  });

  it("throws when the purge RPC fails for a candidate, before scrubbing or logging", async () => {
    mockDueRows({ data: [{ user_id: "user-1" }], error: null });
    rpcMock.mockResolvedValue({ data: null, error: { message: "fk violation" } });

    const { purgeDueCandidateDeletions } = await importModule();
    await expect(purgeDueCandidateDeletions()).rejects.toThrow("Failed to purge candidate data for user-1: fk violation");
    expect(updateUserByIdMock).not.toHaveBeenCalled();
    expect(logAdminActionMock).not.toHaveBeenCalled();
  });

  it("throws when scrubbing the email fails, after the purge RPC already ran", async () => {
    mockDueRows({ data: [{ user_id: "user-1" }], error: null });
    updateUserByIdMock.mockResolvedValue({ error: { message: "user not found" } });

    const { purgeDueCandidateDeletions } = await importModule();
    await expect(purgeDueCandidateDeletions()).rejects.toThrow(
      "Purged data but failed to scrub email for user-1: user not found"
    );
    expect(logAdminActionMock).not.toHaveBeenCalled();
  });

  it("throws when marking the row purged fails, after purge and scrub already ran", async () => {
    mockDueRows({ data: [{ user_id: "user-1" }], error: null });
    updateMock.mockReturnValue({ eq: () => Promise.resolve({ error: { message: "constraint violation" } }) });

    const { purgeDueCandidateDeletions } = await importModule();
    await expect(purgeDueCandidateDeletions()).rejects.toThrow(
      "Purged data but failed to mark user-1 as purged: constraint violation"
    );
    expect(logAdminActionMock).not.toHaveBeenCalled();
  });

  it("removes the candidate's stored CV files before the purge RPC", async () => {
    mockDueRows({ data: [{ user_id: "user-1" }], error: null });
    cvRowsMock.mockResolvedValue({ data: [{ cv_path: "user-1/l1/cv.pdf" }, { cv_path: "anon/l2/cv.docx" }], error: null });

    const { purgeDueCandidateDeletions } = await importModule();
    await purgeDueCandidateDeletions();

    expect(removeMock).toHaveBeenCalledWith(["user-1/l1/cv.pdf", "anon/l2/cv.docx"]);
    expect(removeMock.mock.invocationCallOrder[0]).toBeLessThan(rpcMock.mock.invocationCallOrder[0]);
  });

  it("throws before the purge RPC when removing CV files fails, so the next run retries", async () => {
    mockDueRows({ data: [{ user_id: "user-1" }], error: null });
    cvRowsMock.mockResolvedValue({ data: [{ cv_path: "user-1/l1/cv.pdf" }], error: null });
    removeMock.mockResolvedValue({ data: null, error: { message: "storage down" } });

    const { purgeDueCandidateDeletions } = await importModule();
    await expect(purgeDueCandidateDeletions()).rejects.toThrow("Failed to remove stored CVs for user-1: storage down");
    expect(rpcMock).not.toHaveBeenCalled();
  });
});
