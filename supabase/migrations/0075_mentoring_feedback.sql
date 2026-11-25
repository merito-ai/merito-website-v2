-- 0075_mentoring_feedback.sql — real call time + candidate feedback per mentoring session.
-- session_at: the booked call start, captured from Calendly (lib/calendly.ts) or set by admin; scheduled_at stays
-- "when it became scheduled". calendly_event_uri links the row to its Calendly event for cancel/reschedule sync.
-- A scheduled row counts as completed once now() >= session_at + 30 min (lib/planPanel.ts effectiveSessionStatus, read-time only).
-- Feedback is written by POST /api/hub/counselling/[id]/feedback via the service role; RLS stays select-own only.
-- Idempotent; apply by hand + `supabase migration repair --status applied 0075`.
alter table counselling_requests add column if not exists session_at timestamptz;
alter table counselling_requests add column if not exists calendly_event_uri text;
alter table counselling_requests add column if not exists candidate_rating smallint check (candidate_rating between 1 and 5);
alter table counselling_requests add column if not exists candidate_feedback text;
alter table counselling_requests add column if not exists feedback_at timestamptz;
