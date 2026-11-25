import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabaseAuthServer";
import { getSupabaseServerClient } from "@/lib/supabase";
import { effectiveSessionStatus } from "@/lib/planPanel";

const FeedbackSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().max(1000).optional(),
});

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type RouteContext = { params: Promise<{ id: string }> };

// Candidate rates one completed mentoring session, once. The table is select-own under RLS,
// so the write goes through the service role after the ownership check.
export async function POST(request: Request, { params }: RouteContext) {
  const auth = await createSupabaseServerClient();
  const {
    data: { user },
  } = await auth.auth.getUser();
  if (!user) {
    return Response.json({ error: "Not signed in." }, { status: 401 });
  }

  const parsed = FeedbackSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ error: "Rating must be a whole number from 1 to 5; comment up to 1000 characters." }, { status: 400 });
  }

  const { id } = await params;
  const notFound = Response.json({ error: "Session not found." }, { status: 404 });
  if (!UUID.test(id)) return notFound;

  const db = getSupabaseServerClient();
  const { data: row } = await db
    .from("counselling_requests")
    .select("user_id, status, session_at, feedback_at")
    .eq("id", id)
    .maybeSingle();
  if (!row || row.user_id !== user.id) return notFound;
  if (row.feedback_at) {
    return Response.json({ error: "You already rated this session." }, { status: 409 });
  }
  if (effectiveSessionStatus(row) !== "completed") {
    return Response.json({ error: "You can rate a session once it is completed." }, { status: 403 });
  }

  // The feedback_at guard makes "once" atomic against a double submit.
  const { data: updated, error } = await db
    .from("counselling_requests")
    .update({ candidate_rating: parsed.data.rating, candidate_feedback: parsed.data.comment || null, feedback_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", user.id)
    .is("feedback_at", null)
    .select("id");
  if (error) {
    console.error("Failed to save mentoring feedback", { id, error });
    return Response.json({ error: "Could not save your feedback, try again." }, { status: 500 });
  }
  if (!updated?.length) {
    return Response.json({ error: "You already rated this session." }, { status: 409 });
  }
  return Response.json({ ok: true });
}
