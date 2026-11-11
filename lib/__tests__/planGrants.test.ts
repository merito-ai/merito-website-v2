import { describe, it, expect, vi, beforeEach } from "vitest";

const { unlockProductMock, upsertMock, fromMock } = vi.hoisted(() => {
  const upsertMock = vi.fn();
  return {
    unlockProductMock: vi.fn(),
    upsertMock,
    fromMock: vi.fn((_table: string) => ({ upsert: upsertMock })),
  };
});
vi.mock("@/lib/productUnlocks", () => ({ unlockProduct: unlockProductMock }));
vi.mock("@/lib/supabase", () => ({ getSupabaseServerClient: () => ({ from: fromMock }) }));

import { applyPlanGrants } from "@/lib/planGrants";

const twoSessions = (orderId: string) => [
  { user_id: "u1", order_id: orderId, session: 1 },
  { user_id: "u1", order_id: orderId, session: 2 },
];
const IDEMPOTENT = { onConflict: "order_id,session", ignoreDuplicates: true };

describe("applyPlanGrants", () => {
  beforeEach(() => {
    unlockProductMock.mockReset();
    unlockProductMock.mockResolvedValue(undefined);
    upsertMock.mockReset();
    upsertMock.mockResolvedValue({ error: null });
    fromMock.mockClear();
  });

  it("plan_prepare unlocks personality + references, no mentoring", async () => {
    await applyPlanGrants("u1", "o1", "plan_prepare");
    expect(unlockProductMock).toHaveBeenCalledWith("u1", "personality");
    expect(unlockProductMock).toHaveBeenCalledWith("u1", "references");
    expect(fromMock).not.toHaveBeenCalledWith("counselling_requests");
  });

  it("plan_mentor grants two mentoring sessions (first + follow-up)", async () => {
    await applyPlanGrants("u1", "o1", "plan_mentor");
    expect(unlockProductMock).toHaveBeenCalledTimes(2);
    expect(fromMock).toHaveBeenCalledWith("counselling_requests");
    expect(upsertMock).toHaveBeenCalledWith(twoSessions("o1"), IDEMPOTENT);
  });

  it("the upgrade grants both sessions on the upgrade order (no re-grant of Plan 1 items)", async () => {
    await applyPlanGrants("u1", "up1", "plan_upgrade_mentor");
    expect(unlockProductMock).not.toHaveBeenCalled();
    expect(upsertMock).toHaveBeenCalledWith(twoSessions("up1"), IDEMPOTENT);
  });

  it("replays are idempotent: upsert ignores existing (order_id, session) rows, so a legacy 1-row order only gains the follow-up", async () => {
    await applyPlanGrants("u1", "o1", "plan_mentor");
    await applyPlanGrants("u1", "o1", "plan_mentor");
    for (const call of upsertMock.mock.calls) expect(call[1]).toEqual(IDEMPOTENT);
  });

  it("throws when the write fails", async () => {
    upsertMock.mockResolvedValue({ error: { message: "boom" } });
    await expect(applyPlanGrants("u1", "o1", "plan_mentor")).rejects.toThrow("boom");
  });
});
