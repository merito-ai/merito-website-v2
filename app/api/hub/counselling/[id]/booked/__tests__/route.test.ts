import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const getUserMock = vi.fn();
vi.mock("@/lib/supabaseAuthServer", () => ({
  createSupabaseServerClient: async () => ({ auth: { getUser: getUserMock } }),
}));

// rows by session number; the route reads its own row by id, and session 1 by (order_id, session).
let rows: Record<number, Record<string, unknown> | null> = {};
let target = 1;
const updateCalls: Record<string, unknown>[] = [];
vi.mock("@/lib/supabase", () => ({
  getSupabaseServerClient: () => ({
    from: () => ({
      select: () => {
        let session = target;
        const c = {
          eq: (k: string, v: unknown) => ((k === "session" ? (session = v as number) : null), c),
          maybeSingle: async () => ({ data: rows[session] ?? null }),
        };
        return c;
      },
      update: (patch: Record<string, unknown>) => {
        updateCalls.push(patch);
        const c = { eq: () => c, then: (r: (v: unknown) => unknown) => Promise.resolve({ error: null }).then(r) };
        return c;
      },
    }),
  }),
}));

const calendlyGetMock = vi.fn();
vi.mock("@/lib/calendly", async () => {
  const actual = await vi.importActual<typeof import("@/lib/calendly")>("@/lib/calendly");
  return { ...actual, calendlyGet: (u: string) => calendlyGetMock(u) };
});

const ID = "11111111-2222-3333-4444-555555555555";
const EVENT = "https://api.calendly.com/scheduled_events/ev1";
const INVITEE = `${EVENT}/invitees/inv1`;
const post = async (body: unknown, id = ID) => {
  const { POST } = await import("../route");
  return POST(new Request(`http://localhost/api/hub/counselling/${id}/booked`, { method: "POST", body: JSON.stringify(body) }), { params: Promise.resolve({ id }) });
};
const good = { event_uri: EVENT, invitee_uri: INVITEE };
const calendly = (utm: string | null, email = "other@x.com", status = "active") =>
  calendlyGetMock.mockImplementation(async (u: string) =>
    u === EVENT ? { resource: { uri: EVENT, status, start_time: "2026-11-27T10:30:00.000000Z" } } : { resource: { email, tracking: { utm_content: utm } } },
  );

describe("POST /api/hub/counselling/[id]/booked", () => {
  beforeEach(() => {
    vi.stubEnv("CALENDLY_API_TOKEN", "tok");
    getUserMock.mockReset().mockResolvedValue({ data: { user: { id: "u1", email: "me@x.com" } } });
    target = 1;
    rows = { 1: { user_id: "u1", order_id: "o1", session: 1, status: "requested", scheduled_at: null, calendly_event_uri: null, session_at: null } };
    updateCalls.length = 0;
    calendlyGetMock.mockReset();
    calendly(ID);
  });
  afterEach(() => vi.unstubAllEnvs());

  it("401 without a session", async () => {
    getUserMock.mockResolvedValue({ data: { user: null } });
    expect((await post(good)).status).toBe(401);
  });

  it("400 for URIs that are not Calendly's, so the token is never sent elsewhere", async () => {
    expect((await post({ event_uri: "https://evil.example/scheduled_events/ev1", invitee_uri: INVITEE })).status).toBe(400);
    expect((await post({ event_uri: EVENT, invitee_uri: "https://api.calendly.com/scheduled_events/other/invitees/x" })).status).toBe(400);
    expect(calendlyGetMock).not.toHaveBeenCalled();
  });

  it("503 without a token (falls back to the team confirming by hand)", async () => {
    vi.stubEnv("CALENDLY_API_TOKEN", "");
    expect((await post(good)).status).toBe(503);
  });

  it("404 for someone else's session", async () => {
    rows[1] = { ...rows[1]!, user_id: "other" };
    expect((await post(good)).status).toBe(404);
    expect(calendlyGetMock).not.toHaveBeenCalled();
  });

  it("403 for session 2 while session 1 is not booked", async () => {
    target = 2;
    rows[2] = { user_id: "u1", order_id: "o1", session: 2, status: "requested", scheduled_at: null, calendly_event_uri: null };
    expect((await post(good)).status).toBe(403);
    rows[1] = { ...rows[1]!, status: "scheduled", session_at: "2026-11-26T10:00:00Z" };
    expect((await post(good)).status).toBe(200);
  });

  it("403 when the invitee is neither tagged with this session nor the user's email, or the event is canceled", async () => {
    calendly("someone-else");
    expect((await post(good)).status).toBe(403);
    calendly(ID, "me@x.com", "canceled");
    expect((await post(good)).status).toBe(403);
    expect(updateCalls).toEqual([]);
  });

  it("schedules the session at the Calendly start time (tag match or same email)", async () => {
    expect((await post(good)).status).toBe(200);
    expect(updateCalls[0]).toMatchObject({ status: "scheduled", session_at: "2026-11-27T10:30:00.000000Z", calendly_event_uri: EVENT, scheduled_at: expect.any(String) });
    calendly(null, "ME@x.com");
    expect((await post(good)).status).toBe(200);
  });

  it("idempotent replay: already scheduled on this event -> ok, no Calendly call, no write", async () => {
    rows[1] = { ...rows[1]!, status: "scheduled", calendly_event_uri: EVENT };
    expect((await post(good)).status).toBe(200);
    expect(calendlyGetMock).not.toHaveBeenCalled();
    expect(updateCalls).toEqual([]);
  });

  it("409 for a completed or cancelled session", async () => {
    rows[1] = { ...rows[1]!, status: "cancelled" };
    expect((await post(good)).status).toBe(409);
  });
});
