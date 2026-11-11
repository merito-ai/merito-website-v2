-- 0072_mentoring_sessions.sql — Plan 2 mentoring = two 30-min sessions (first + follow-up), one counselling_requests
-- row each, plans/2026-11-10-hub-plans-design.md "Mentoring (2026-11-11)". Standalone counselling keeps session 1 only.
-- Idempotent; apply by hand + `supabase migration repair --status applied 0072`.
alter table counselling_requests add column if not exists session smallint not null default 1;

do $$ begin
  alter table counselling_requests add constraint counselling_requests_session_check check (session in (1, 2));
exception when duplicate_object then null; end $$;

-- Non-partial on purpose: applyPlanGrants upserts onConflict (order_id, session); a partial index can't be targeted.
create unique index if not exists counselling_requests_order_session_key on counselling_requests (order_id, session);

-- Legacy Plan 2 / upgrade orders have only their first-session row: add the follow-up.
insert into counselling_requests (user_id, order_id, session)
select cr.user_id, cr.order_id, 2
from counselling_requests cr
join razorpay_transactions t on t.order_id = cr.order_id
where cr.session = 1 and t.status = 'success' and t.product in ('plan_mentor', 'plan_upgrade_mentor')
on conflict (order_id, session) do nothing;
