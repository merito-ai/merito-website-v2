import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabaseAuthServer";
import { getSupabaseServerClient } from "@/lib/supabase";
import { effectiveSessionStatus } from "@/lib/planPanel";
import { calendlyEnabled, calendlyGet, isCalendlyEventUri, type CalendlyEvent } from "@/lib/calendly";

const BookedSchema = z.object({ event_uri: z.string(), invitee_uri: z.string() });
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type RouteContext = { params: Promise<{ id: string }> };

// The expert page posts Calendly's calendly.event_scheduled message here. The browser's URIs are only a pointer:
// the event time and the session tag are read back from the Calendly API before the row changes.
export async function POST(request: Request, { params }: RouteContext) {
  const auth = await createSupabaseServerClient();
  const {
    data: { user },
  } = await auth.auth.getUser();
  if (!user) return Response.json({ error: "Not signed in." }, { status: 401 });

  const parsed = BookedSchema.safeParse(await request.json().catch(() => null));
  const eventUri = parsed.data?.event_uri;
  const inviteeUri = parsed.data?.invitee_uri;
  if (!isCalendlyEventUri(eventUri) || !inviteeUri?.startsWith(`${eventUri}/invitees/`)) {
    return Response.json({ error: "Not a Calendly booking." }, { status: 400 });
  }
  // No token: the team confirms by hand, as before.
  if (!calendlyEnabled()) return Response.json({ error: "Booking sync is not set up." }, { status: 503 });

  const { id } = await params;
  const notFound = Response.json({ error: "Session not found." }, { status: 404 });
  if (!UUID.test(id)) return notFound;

  const db = getSupabaseServerClient();
  const { data: row } = await db
    .from("counselling_requests")
    .select("user_id, order_id, session, status, scheduled_at, calendly_event_uri")
    .eq("id", id)
    .maybeSingle();
  if (!row || row.user_id !== user.id) return notFound;
  if (row.status === "scheduled" && row.calendly_event_uri === eventUri) return Response.json({ ok: true }); // replay
  if (row.status !== "requested" && row.status !== "scheduled") {
    return Response.json({ error: "This session can't be booked." }, { status: 409 });
  }
  if (row.session === 2) {
    const { data: first } = await db.from("counselling_requests").select("status, session_at").eq("order_id", row.order_id).eq("session", 1).maybeSingle();
    if (!first || !["scheduled", "completed"].includes(effectiveSessionStatus(first))) {
      return Response.json({ error: "Session 2 opens once session 1 is booked." }, { status: 403 });
    }
  }

  let event: CalendlyEvent;
  let invitee: { email: string; tracking?: { utm_content?: string | null } | null };
  try {
    [{ resource: event }, { resource: invitee }] = await Promise.all([
      calendlyGet<{ resource: CalendlyEvent }>(eventUri),
      calendlyGet<{ resource: typeof invitee }>(inviteeUri),
    ]);
  } catch (err) {
    console.error("Calendly booking lookup failed", { id, err: err instanceof Error ? err.message : err });
    return Response.json({ error: "Could not confirm the booking with Calendly yet." }, { status: 502 });
  }
  const tagged = invitee.tracking?.utm_content === id;
  const sameEmail = !!user.email && invitee.email?.toLowerCase() === user.email.toLowerCase();
  if (event.status !== "active" || !(tagged || sameEmail)) {
    return Response.json({ error: "This booking doesn't match your session." }, { status: 403 });
  }

  const { error } = await db
    .from("counselling_requests")
    .update({ status: "scheduled", scheduled_at: row.scheduled_at ?? new Date().toISOString(), session_at: event.start_time, calendly_event_uri: eventUri })
    .eq("id", id)
    .eq("status", row.status);
  if (error) {
    console.error("Failed to save Calendly booking", { id, error });
    return Response.json({ error: "Could not save your booking." }, { status: 500 });
  }
  return Response.json({ ok: true });
}
