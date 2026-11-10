import { describe, it, expect, vi, beforeEach } from "vitest";

const { unlockProductMock, existingMock, insertMock, fromMock } = vi.hoisted(() => {
  const existingMock = vi.fn();
  const insertMock = vi.fn();
  return {
    unlockProductMock: vi.fn(),
    existingMock,
    insertMock,
    fromMock: vi.fn((_table: string) => ({
      select: () => ({ eq: () => ({ maybeSingle: existingMock }) }),
      insert: insertMock,
    })),
  };
});
vi.mock("@/lib/productUnlocks", () => ({ unlockProduct: unlockProductMock }));
vi.mock("@/lib/supabase", () => ({ getSupabaseServerClient: () => ({ from: fromMock }) }));

import { applyPlanGrants } from "@/lib/planGrants";

describe("applyPlanGrants", () => {
  beforeEach(() => {
    unlockProductMock.mockReset();
    unlockProductMock.mockResolvedValue(undefined);
    existingMock.mockReset();
    existingMock.mockResolvedValue({ data: null, error: null });
    insertMock.mockReset();
    insertMock.mockResolvedValue({ error: null });
    fromMock.mockClear();
  });

  it("plan_prepare unlocks personality + references, no mentoring", async () => {
    await applyPlanGrants("u1", "o1", "plan_prepare");
    expect(unlockProductMock).toHaveBeenCalledWith("u1", "personality");
    expect(unlockProductMock).toHaveBeenCalledWith("u1", "references");
    expect(fromMock).not.toHaveBeenCalledWith("counselling_requests");
  });

  it("plan_mentor also records a mentoring request", async () => {
    await applyPlanGrants("u1", "o1", "plan_mentor");
    expect(unlockProductMock).toHaveBeenCalledTimes(2);
    expect(fromMock).toHaveBeenCalledWith("counselling_requests");
    expect(insertMock).toHaveBeenCalledWith({ user_id: "u1", order_id: "o1" });
  });

  it("does not insert a second mentoring request on retry", async () => {
    existingMock.mockResolvedValue({ data: { id: "c1" }, error: null });
    await applyPlanGrants("u1", "o1", "plan_mentor");
    expect(insertMock).not.toHaveBeenCalled();
  });

  it("throws when the insert fails", async () => {
    insertMock.mockResolvedValue({ error: { message: "boom" } });
    await expect(applyPlanGrants("u1", "o1", "plan_mentor")).rejects.toThrow("boom");
  });
});
