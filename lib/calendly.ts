import { getSupabaseServerClient } from "@/lib/supabase";

// Calendly API v2 (personal access token; the free plan has no webhooks). Bookings reach counselling_requests
// two ways: the expert page posts the popup's event_scheduled message (/api/hub/counselling/[id]/booked), and
// syncCalendlyBookings reconciles on page render so a closed tab or a Calendly-side cancel/reschedule still lands.
// Each booking URL carries utm_content=<counselling_requests.id> (lib/hub/calendlyUrl.ts), which maps it to a session.

export const CALENDLY_API = "https://api.calendly.com";
const EVENTS_PREFIX = `${CALENDLY_API}/scheduled_events/`;
const TIMEOUT_MS = 3000;

export const calendlyEnabled = () => Boolean(process.env.CALENDLY_API_TOKEN);

// Only api.calendly.com event URIs: the token must never be sent anywhere else.
export const isCalendlyEventUri = (u: unknown): u is string =>
  typeof u === "string" && u.startsWith(EVENTS_PREFIX) && !u.slice(EVENTS_PREFIX.length).includes("/");

export async function calendlyGet<T>(url: string): Promise<T> {
  if (!url.startsWith(`${CALENDLY_API}/`)) throw new Error("Not a Calendly API URL");
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${process.env.CALENDLY_API_TOKEN}` },
    signal: AbortSignal.timeout(TIMEOUT_MS),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Calendly ${res.status} for ${url.split("?")[0]}`);
  return res.json() as Promise<T>;
}

export type CalendlyEvent = { uri: string; status: "active" | "canceled"; start_time: string };
type Invitee = { email: string; tracking?: { utm_content?: string | null } | null };
export type MatchedEvent = CalendlyEvent & { utmContent: string | null };
export type SyncRow = { id: string; status: string; session_at: string | null; scheduled_at: string | null; calendly_event_uri: string | null };
export type SyncPatch = { id: string; from: string; patch: Record<string, string | null> };

// Pure: which requested/scheduled rows Calendly moved. An active event tagged with the row id (or already linked
// to it) schedules it at the event's start; when the row's linked event is canceled and nothing active replaces it,
// the row goes back to requested. Rows scheduled by hand (no linked event) are never reverted.
export function reconcileBookings(rows: SyncRow[], events: MatchedEvent[], now: string): SyncPatch[] {
  const out: SyncPatch[] = [];
  for (const r of rows) {
    if (r.status !== "requested" && r.status !== "scheduled") continue;
    const mine = events.filter((e) => e.utmContent === r.id || e.uri === r.calendly_event_uri);
    const active = mine.filter((e) => e.status === "active").sort((a, b) => Date.parse(b.start_time) - Date.parse(a.start_time))[0];
    if (active) {
      const same = r.status === "scheduled" && r.calendly_event_uri === active.uri && r.session_at && Date.parse(r.session_at) === Date.parse(active.start_time);
      if (!same) {
        out.push({ id: r.id, from: r.status, patch: { status: "scheduled", scheduled_at: r.scheduled_at ?? now, session_at: active.start_time, calendly_event_uri: active.uri } });
      }
    } else if (r.status === "scheduled" && r.calendly_event_uri && mine.some((e) => e.uri === r.calendly_event_uri && e.status === "canceled")) {
      out.push({ id: r.id, from: r.status, patch: { status: "requested", scheduled_at: null, session_at: null, calendly_event_uri: null } });
    }
  }
  return out;
}

let organizerUri: string | null = null; // per server instance; /users/me never changes for one token
let warned = false;

async function eventsFor(email: string | null, knownUris: Set<string>): Promise<MatchedEvent[]> {
  organizerUri ??= (await calendlyGet<{ resource: { uri: string } }>(`${CALENDLY_API}/users/me`)).resource.uri;
  const q = new URLSearchParams({ user: organizerUri, count: "100", sort: "start_time:desc", min_start_time: new Date(Date.now() - 7 * 86_400_000).toISOString() });
  if (email) q.set("invitee_email", email);
  const { collection } = await calendlyGet<{ collection: CalendlyEvent[] }>(`${CALENDLY_API}/scheduled_events?${q}`);
  // A linked event needs no invitee lookup; others are fetched to read their utm tag.
  return Promise.all(
    collection.map(async (e) => {
      if (knownUris.has(e.uri) || !isCalendlyEventUri(e.uri)) return { ...e, utmContent: null };
      const inv = await calendlyGet<{ collection: Invitee[] }>(`${e.uri}/invitees?count=10`);
      return { ...e, utmContent: inv.collection.find((i) => i.tracking?.utm_content)?.tracking?.utm_content ?? null };
    }),
  );
}

// Lazy reconcile, called on render. Never throws, never blocks a page for long, no-op without a token.
// scope: one candidate (their rows, events filtered by their email) or "all" (admin queue).
export async function syncCalendlyBookings(scope: { userId: string; email: string | null | undefined } | "all"): Promise<boolean> {
  if (!calendlyEnabled()) return false;
  const work = async () => {
    const db = getSupabaseServerClient();
    let q = db.from("counselling_requests").select("id, status, session_at, scheduled_at, calendly_event_uri").in("status", ["requested", "scheduled"]);
    if (scope !== "all") q = q.eq("user_id", scope.userId);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    if (!rows?.length) return false;
    const known = new Set(rows.map((r) => r.calendly_event_uri).filter((u): u is string => Boolean(u)));
    const events = await eventsFor(scope === "all" ? null : scope.email ?? null, known);
    const patches = reconcileBookings(rows, events, new Date().toISOString());
    for (const p of patches) {
      // Guarded on the status we read, so a concurrent admin change wins.
      const { error: upErr } = await db.from("counselling_requests").update(p.patch).eq("id", p.id).eq("status", p.from);
      if (upErr) throw new Error(upErr.message);
    }
    return patches.length > 0;
  };
  try {
    return await Promise.race([work(), new Promise<boolean>((resolve) => setTimeout(() => resolve(false), TIMEOUT_MS + 1000))]);
  } catch (err) {
    if (!warned) {
      warned = true;
      console.error("Calendly sync failed; pages fall back to stored booking state", err instanceof Error ? err.message : err);
    }
    return false;
  }
}
