import { describe, it, expect, vi, beforeEach } from "vitest";

const fromMock = vi.hoisted(() => vi.fn());
const getUserByIdMock = vi.hoisted(() => vi.fn());
vi.mock("@/lib/supabase", () => ({ getSupabaseServerClient: () => ({ from: fromMock, auth: { admin: { getUserById: getUserByIdMock } } }) }));
const getPlanOrderMock = vi.hoisted(() => vi.fn());
vi.mock("@/lib/plans", () => ({ getPlanOrder: getPlanOrderMock }));
const logAdminActionMock = vi.hoisted(() => vi.fn().mockResolvedValue(undefined));
vi.mock("@/lib/adminAuditLog", () => ({ logAdminAction: logAdminActionMock }));

function query(result: Record<string, unknown>) {
  const chain: Record<string, unknown> = {};
  for (const m of ["select", "eq", "in", "order", "upsert"]) chain[m] = vi.fn(() => chain);
  chain.maybeSingle = vi.fn(() => Promise.resolve(result));
  chain.then = (resolve: (v: unknown) => unknown) => resolve(result);
  return chain;
}

import { listAssistance, setAssistance, getAssistanceStatus } from "../planAssistance";

describe("planAssistance", () => {
  beforeEach(() => {
    fromMock.mockReset();
    getPlanOrderMock.mockReset();
    getUserByIdMock.mockReset();
  });

  it("lists only effective Plan 2 holders, not contacted first", async () => {
    const tables: Record<string, unknown> = {
      razorpay_transactions: query({ data: [{ user_id: "a", created_at: "2026-11-01" }, { user_id: "b", created_at: "2026-11-02" }, { user_id: "c", created_at: "2026-11-03" }], error: null }),
      plan_assistance: query({ data: [{ user_id: "a", status: "done", companies: "X, Y, Z", updated_at: "2026-11-05" }], error: null }),
      fitment_leads: query({ data: [{ user_id: "a", email: "a@x.test" }], error: null }),
    };
    fromMock.mockImplementation((t: string) => tables[t]);
    // b was refunded back to nothing; c has Plan 2 but no fitment lead yet
    getPlanOrderMock.mockImplementation(async (id: string) => (id === "b" ? null : { product: "plan_mentor" }));
    getUserByIdMock.mockResolvedValue({ data: { user: { email: "c@x.test" } } });

    const rows = await listAssistance();
    expect(rows.map((r) => [r.email, r.status])).toEqual([["c@x.test", "not_contacted"], ["a@x.test", "done"]]);
    expect(rows[1].companies).toBe("X, Y, Z");
  });

  it("refuses to set status for someone without an active Plan 2", async () => {
    getPlanOrderMock.mockResolvedValue({ product: "plan_prepare" });
    await expect(setAssistance("u1", "done", null, "ops@merito.ai")).rejects.toThrow("no active Plan 2");
    expect(fromMock).not.toHaveBeenCalled();
  });

  it("upserts on user_id and logs the change", async () => {
    getPlanOrderMock.mockResolvedValue({ product: "plan_mentor" });
    const q = query({ data: null, error: null });
    fromMock.mockReturnValue(q);
    await setAssistance("u1", "in_progress", "Acme", "ops@merito.ai");
    expect(q.upsert).toHaveBeenCalledWith(expect.objectContaining({ user_id: "u1", status: "in_progress", companies: "Acme", updated_by: "ops@merito.ai" }), { onConflict: "user_id" });
    expect(logAdminActionMock).toHaveBeenCalledWith(expect.objectContaining({ action: "assistance.status_change", targetId: "u1" }));
  });

  it("defaults to not contacted when no row exists", async () => {
    fromMock.mockReturnValue(query({ data: null, error: null }));
    expect(await getAssistanceStatus("u1")).toBe("not_contacted");
  });
});
