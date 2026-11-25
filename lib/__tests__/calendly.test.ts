import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const updates: { patch: unknown; eqs: [string, unknown][] }[] = [];
let rows: unknown[] = [];
vi.mock("@/lib/supabase", () => ({
  getSupabaseServerClient: () => ({
    from: () => {
      const q = {
        select: () => q,
        in: () => q,
        eq: () => q,
        then: (r: (v: unknown) => unknown) => Promise.resolve({ data: rows, error: null }).then(r),
        update: (patch: unknown) => {
          const u = { patch, eqs: [] as [string, unknown][] };
          updates.push(u);
          const c = { eq: (k: string, v: unknown) => (u.eqs.push([k, v]), c), then: (r: (v: unknown) => unknown) => Promise.resolve({ error: null }).then(r) };
          return c;
        },
      };
      return q;
    },
  }),
}));

import { reconcileBookings, isCalendlyEventUri, syncCalendlyBookings, type SyncRow, type MatchedEvent } from "../calendly";

const EV = "https://api.calendly.com/scheduled_events/";
const row = (id: string, status: string, extra: Partial<SyncRow> = {}): SyncRow => ({ id, status, session_at: null, scheduled_at: null, calendly_event_uri: null, ...extra });
const ev = (uuid: string, status: "active" | "canceled", start: string, utm: string | null): MatchedEvent => ({ uri: EV + uuid, status, start_time: start, utmContent: utm });
const NOW = "2026-11-25T12:00:00.000Z";

describe("reconcileBookings", () => {
  it("an active event tagged with the row id schedules it at the event start", () => {
    expect(reconcileBookings([row("r1", "requested")], [ev("e1", "active", "2026-11-27T10:30:00.000000Z", "r1")], NOW)).toEqual([
      { id: "r1", from: "requested", patch: { status: "scheduled", scheduled_at: NOW, session_at: "2026-11-27T10:30:00.000000Z", calendly_event_uri: EV + "e1" } },
    ]);
  });

  it("ignores events tagged for other sessions and leaves an in-sync row alone", () => {
    expect(reconcileBookings([row("r1", "requested")], [ev("e1", "active", "2026-11-27T10:30:00Z", "r2")], NOW)).toEqual([]);
    const synced = row("r1", "scheduled", { session_at: "2026-11-27T10:30:00+00:00", calendly_event_uri: EV + "e1", scheduled_at: "2026-11-25T00:00:00Z" });
    expect(reconcileBookings([synced], [ev("e1", "active", "2026-11-27T10:30:00.000000Z", null)], NOW)).toEqual([]);
  });

  it("reschedule: old event canceled, new tagged event active -> moves to the new time, keeps scheduled_at", () => {
    const r = row("r1", "scheduled", { session_at: "2026-11-27T10:30:00Z", calendly_event_uri: EV + "old", scheduled_at: "2026-11-25T00:00:00Z" });
    const out = reconcileBookings([r], [ev("old", "canceled", "2026-11-27T10:30:00Z", null), ev("new", "active", "2026-11-28T05:00:00Z", "r1")], NOW);
    expect(out).toEqual([{ id: "r1", from: "scheduled", patch: { status: "scheduled", scheduled_at: "2026-11-25T00:00:00Z", session_at: "2026-11-28T05:00:00Z", calendly_event_uri: EV + "new" } }]);
  });

  it("cancel: the linked event canceled with nothing active -> back to requested, call time cleared", () => {
    const r = row("r1", "scheduled", { session_at: "2026-11-27T10:30:00Z", calendly_event_uri: EV + "e1", scheduled_at: "2026-11-25T00:00:00Z" });
    expect(reconcileBookings([r], [ev("e1", "canceled", "2026-11-27T10:30:00Z", null)], NOW)).toEqual([
      { id: "r1", from: "scheduled", patch: { status: "requested", scheduled_at: null, session_at: null, calendly_event_uri: null } },
    ]);
  });

  it("a call that has already ended is final: no revert on a late Calendly cancel", () => {
    const done = row("r1", "scheduled", { session_at: "2026-11-20T10:30:00Z", calendly_event_uri: EV + "e1", scheduled_at: "2026-11-19T00:00:00Z" });
    expect(reconcileBookings([done], [ev("e1", "canceled", "2026-11-20T10:30:00Z", "r1")], NOW)).toEqual([]);
  });

  it("never touches hand-scheduled, completed or cancelled rows", () => {
    const manual = row("r1", "scheduled", { scheduled_at: "2026-11-25T00:00:00Z" });
    expect(reconcileBookings([manual], [ev("x", "canceled", "2026-11-27T10:30:00Z", "r1")], NOW)).toEqual([]);
    expect(reconcileBookings([row("r2", "completed"), row("r3", "cancelled")], [ev("y", "active", "2026-11-27T10:30:00Z", "r2"), ev("z", "active", "2026-11-27T10:30:00Z", "r3")], NOW)).toEqual([]);
  });
});

describe("isCalendlyEventUri", () => {
  it("accepts only api.calendly.com event URIs, so the token never leaves for another host", () => {
    expect(isCalendlyEventUri(EV + "abc")).toBe(true);
    expect(isCalendlyEventUri(EV + "abc/invitees/x")).toBe(false);
    expect(isCalendlyEventUri("https://evil.example/scheduled_events/abc")).toBe(false);
    expect(isCalendlyEventUri(undefined)).toBe(false);
  });
});

describe("syncCalendlyBookings", () => {
  const fetchMock = vi.fn();
  beforeEach(() => {
    updates.length = 0;
    rows = [row("r1", "requested")];
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it("no token: no Calendly calls, no writes", async () => {
    vi.stubEnv("CALENDLY_API_TOKEN", "");
    expect(await syncCalendlyBookings({ userId: "u1", email: "a@b.c" })).toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("reads the utm tag from the event's invitees and writes the booking, guarded on the status it read", async () => {
    vi.stubEnv("CALENDLY_API_TOKEN", "tok");
    const json = (body: unknown) => ({ ok: true, json: async () => body });
    fetchMock.mockImplementation(async (url: string) => {
      if (url.endsWith("/users/me")) return json({ resource: { uri: "https://api.calendly.com/users/me1" } });
      if (url.includes("/scheduled_events?")) return json({ collection: [{ uri: EV + "e1", status: "active", start_time: "2026-11-27T10:30:00Z" }] });
      if (url.startsWith(EV + "e1/invitees")) return json({ collection: [{ email: "a@b.c", tracking: { utm_content: "r1" } }] });
      throw new Error(`unexpected ${url}`);
    });
    expect(await syncCalendlyBookings({ userId: "u1", email: "a@b.c" })).toBe(true);
    const listUrl = fetchMock.mock.calls.map((c) => c[0] as string).find((u) => u.includes("/scheduled_events?"))!;
    expect(new URL(listUrl).searchParams.get("invitee_email")).toBe("a@b.c");
    expect(updates).toEqual([{ patch: expect.objectContaining({ status: "scheduled", session_at: "2026-11-27T10:30:00Z", calendly_event_uri: EV + "e1" }), eqs: [["id", "r1"], ["status", "requested"]] }]);
  });

  it("only finished sessions: no Calendly calls at all", async () => {
    vi.stubEnv("CALENDLY_API_TOKEN", "tok");
    rows = [row("r1", "scheduled", { session_at: "2020-01-01T00:00:00Z" }), row("r2", "completed")];
    expect(await syncCalendlyBookings({ userId: "u1", email: "a@b.c" })).toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("Calendly down: returns false instead of throwing", async () => {
    vi.stubEnv("CALENDLY_API_TOKEN", "tok");
    fetchMock.mockResolvedValue({ ok: false, status: 500, json: async () => ({}) });
    vi.spyOn(console, "error").mockImplementation(() => {});
    await expect(syncCalendlyBookings({ userId: "u1", email: "a@b.c" })).resolves.toBe(false);
  });
});
