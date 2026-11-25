import { describe, it, expect, vi, beforeEach } from "vitest";

const getUserMock = vi.fn();
vi.mock("@/lib/supabaseAuthServer", () => ({
  createSupabaseServerClient: async () => ({ auth: { getUser: getUserMock } }),
}));

let row: Record<string, unknown> | null = null;
let updatedRows: { id: string }[] = [{ id: "x" }];
const updateCalls: { patch: Record<string, unknown>; filters: string[] }[] = [];
vi.mock("@/lib/supabase", () => ({
  getSupabaseServerClient: () => ({
    from: () => ({
      select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: row }) }) }),
      update: (patch: Record<string, unknown>) => {
        const call = { patch, filters: [] as string[] };
        updateCalls.push(call);
        const c = {
          eq: (k: string) => (call.filters.push(`eq:${k}`), c),
          is: (k: string) => (call.filters.push(`is:${k}`), c),
          select: async () => ({ data: updatedRows, error: null }),
        };
        return c;
      },
    }),
  }),
}));

const ID = "11111111-2222-3333-4444-555555555555";
const post = async (body: unknown, id = ID) => {
  const { POST } = await import("../route");
  return POST(new Request(`http://localhost/api/hub/counselling/${id}/feedback`, { method: "POST", body: JSON.stringify(body) }), { params: Promise.resolve({ id }) });
};
const PAST = "2026-01-01T10:00:00Z";

describe("POST /api/hub/counselling/[id]/feedback", () => {
  beforeEach(() => {
    getUserMock.mockReset().mockResolvedValue({ data: { user: { id: "u1" } } });
    row = { user_id: "u1", status: "completed", session_at: null, feedback_at: null };
    updatedRows = [{ id: ID }];
    updateCalls.length = 0;
  });

  it("401 without a session", async () => {
    getUserMock.mockResolvedValue({ data: { user: null } });
    expect((await post({ rating: 4 })).status).toBe(401);
  });

  it("400 for a rating outside 1-5, a fraction, or a comment over 1000 chars", async () => {
    for (const body of [{ rating: 0 }, { rating: 6 }, { rating: 3.5 }, { rating: "4" }, {}, { rating: 4, comment: "x".repeat(1001) }]) {
      expect((await post(body)).status).toBe(400);
    }
    expect(updateCalls).toEqual([]);
  });

  it("404 for a non-uuid id, a missing row, or someone else's session", async () => {
    expect((await post({ rating: 4 }, "abc")).status).toBe(404);
    row = null;
    expect((await post({ rating: 4 })).status).toBe(404);
    row = { user_id: "other", status: "completed", session_at: null, feedback_at: null };
    expect((await post({ rating: 4 })).status).toBe(404);
    expect(updateCalls).toEqual([]);
  });

  it("403 until the session is completed; a scheduled call counts once it has passed", async () => {
    row = { user_id: "u1", status: "scheduled", session_at: "2999-01-01T10:00:00Z", feedback_at: null };
    expect((await post({ rating: 4 })).status).toBe(403);
    row = { user_id: "u1", status: "requested", session_at: null, feedback_at: null };
    expect((await post({ rating: 4 })).status).toBe(403);
    row = { user_id: "u1", status: "scheduled", session_at: PAST, feedback_at: null };
    expect((await post({ rating: 4 })).status).toBe(200);
  });

  it("409 when feedback already exists, including a lost race on the guarded update", async () => {
    row = { user_id: "u1", status: "completed", session_at: null, feedback_at: PAST };
    expect((await post({ rating: 4 })).status).toBe(409);
    row = { user_id: "u1", status: "completed", session_at: null, feedback_at: null };
    updatedRows = [];
    expect((await post({ rating: 4 })).status).toBe(409);
  });

  it("saves rating + trimmed comment (blank -> null), scoped to the user and unrated rows", async () => {
    expect((await post({ rating: 5, comment: "  Very useful  " })).status).toBe(200);
    expect(updateCalls[0].patch).toMatchObject({ candidate_rating: 5, candidate_feedback: "Very useful", feedback_at: expect.any(String) });
    expect(updateCalls[0].filters).toEqual(["eq:id", "eq:user_id", "is:feedback_at"]);
    await post({ rating: 3, comment: "   " });
    expect(updateCalls[1].patch).toMatchObject({ candidate_rating: 3, candidate_feedback: null });
  });
});
