import { getSupabaseServerClient } from "@/lib/supabase";
import { effectiveSessionStatus } from "@/lib/planPanel";

export type CounsellingStatus = "requested" | "scheduled" | "completed" | "cancelled";

export type StatePatch = { status: CounsellingStatus; scheduled_at?: string | null; completed_at?: string | null; session_at?: string | null };

export type CounsellingRequestRow = {
  id: string;
  userId: string;
  email: string;
  orderId: string;
  status: CounsellingStatus;
  requestedAt: string;
  scheduledAt: string | null;
  completedAt: string | null;
  notes: string | null;
  sessionLabel: string | null;
  sessionAt: string | null; // booked call time
  calendlyLinked: boolean; // booked through Calendly: reschedule/cancel there, sync would undo queue edits
  autoCompleted: boolean; // status is still "scheduled" but the call has ended
  rating: number | null;
  feedback: string | null;
  feedbackAt: string | null;
};

// datetime-local values carry no zone; the team books calls in IST.
export const istLocalToIso = (v: string) => new Date(`${v}:00+05:30`).toISOString();
export const isoToIstLocal = (iso: string) => new Date(Date.parse(iso) + 330 * 60_000).toISOString().slice(0, 16);

// Plan 2 mentoring is two rows per order (session 1 + session 2); standalone counselling is one, unlabelled.
export function mentoringSessionLabel(product: string | null | undefined, session: number): string | null {
  if (product !== "plan_mentor" && product !== "plan_upgrade_mentor") return null;
  return session === 2 ? "Session 2 of 2" : "Session 1 of 2";
}

// Many-to-one embed: PostgREST returns an object, the generated types say array; accept both.
const productOf = (t: { product: string } | { product: string }[] | null) => (Array.isArray(t) ? t[0] : t)?.product;

const COLUMNS =
  "id, user_id, order_id, status, requested_at, scheduled_at, completed_at, notes, session, session_at, calendly_event_uri, candidate_rating, candidate_feedback, feedback_at, razorpay_transactions(product)";

const ACTIVE_STATUSES: CounsellingStatus[] = ["requested", "scheduled"];

export const ALLOWED_TRANSITIONS: Record<CounsellingStatus, CounsellingStatus[]> = {
  requested: ["scheduled", "cancelled"],
  scheduled: ["completed", "cancelled", "requested"],
  completed: [],
  cancelled: [],
};

export function nextCounsellingState(current: CounsellingStatus, next: CounsellingStatus, now: string): StatePatch {
  if (!ALLOWED_TRANSITIONS[current].includes(next)) {
    throw new Error(`Invalid transition: ${current} -> ${next}`);
  }

  if (current === "requested" && next === "scheduled") {
    return { status: next, scheduled_at: now };
  }
  if (current === "scheduled" && next === "completed") {
    return { status: next, completed_at: now };
  }
  if (current === "scheduled" && next === "requested") {
    return { status: next, scheduled_at: null, session_at: null };
  }
  return { status: next };
}

type DbRow = {
  id: string;
  user_id: string;
  order_id: string;
  status: string;
  requested_at: string;
  scheduled_at: string | null;
  completed_at: string | null;
  notes: string | null;
  session: number;
  session_at: string | null;
  calendly_event_uri: string | null;
  candidate_rating: number | null;
  candidate_feedback: string | null;
  feedback_at: string | null;
  razorpay_transactions: { product: string } | { product: string }[] | null;
};

function toRow(r: DbRow, email: string | undefined): CounsellingRequestRow {
  return {
    id: r.id,
    userId: r.user_id,
    email: email ?? "—",
    orderId: r.order_id,
    status: r.status as CounsellingStatus,
    requestedAt: r.requested_at,
    scheduledAt: r.scheduled_at,
    completedAt: r.completed_at,
    notes: r.notes,
    sessionLabel: mentoringSessionLabel(productOf(r.razorpay_transactions), r.session),
    sessionAt: r.session_at,
    calendlyLinked: Boolean(r.calendly_event_uri),
    autoCompleted: r.status === "scheduled" && effectiveSessionStatus(r) === "completed",
    rating: r.candidate_rating,
    feedback: r.candidate_feedback,
    feedbackAt: r.feedback_at,
  };
}

async function emailByUserId(supabase: ReturnType<typeof getSupabaseServerClient>, userIds: string[]): Promise<Map<string, string>> {
  const { data: leadRows } = await supabase.from("fitment_leads").select("user_id, email").in("user_id", userIds);
  const emailByUser = new Map<string, string>();
  for (const lead of leadRows ?? []) {
    emailByUser.set(lead.user_id, lead.email);
  }
  return emailByUser;
}

export async function listCounsellingRequests(includeAll = false): Promise<CounsellingRequestRow[]> {
  const supabase = getSupabaseServerClient();

  let query = supabase
    .from("counselling_requests")
    .select(COLUMNS)
    .order("requested_at", { ascending: true });

  if (!includeAll) {
    query = query.in("status", ACTIVE_STATUSES);
  }

  const { data: rows } = await query;
  const emailByUser = await emailByUserId(supabase, (rows ?? []).map((r) => r.user_id));

  const out = (rows ?? []).map((r) => toRow(r, emailByUser.get(r.user_id)));
  // Ended calls drop out of the active queue; "Show all" lists them as completed (auto).
  return includeAll ? out : out.filter((r) => !r.autoCompleted);
}

export async function getCounsellingRequest(id: string): Promise<CounsellingRequestRow | null> {
  const supabase = getSupabaseServerClient();

  const { data: row } = await supabase
    .from("counselling_requests")
    .select(COLUMNS)
    .eq("id", id)
    .maybeSingle();

  if (!row) return null;

  const emailByUser = await emailByUserId(supabase, [row.user_id]);

  return toRow(row, emailByUser.get(row.user_id));
}

export async function updateCounsellingStatus(id: string, patch: StatePatch, notes?: string | null): Promise<void> {
  const supabase = getSupabaseServerClient();

  const updates = notes === undefined ? patch : { ...patch, notes };

  const { error } = await supabase.from("counselling_requests").update(updates).eq("id", id);

  if (error) {
    throw new Error(`Failed to update counselling request: ${error.message}`);
  }
}
