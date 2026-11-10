-- 0070_personality_v2.sql — personality + culture assessment (plans/2026-11-10-hub-plans-design.md).
-- Idempotent; apply by hand + `supabase migration repair --status applied 0070`. Never `db push`.
-- version 1 = old personality-only results (kept viewable as-is); 2 = ported psychometrics.
alter table personality_tests add column if not exists version smallint not null default 1;
alter table personality_tests add column if not exists culture_scores jsonb;
alter table personality_tests add column if not exists culture_reliable boolean;
alter table personality_tests add column if not exists culture_answers jsonb;
alter table personality_tests add column if not exists culture_completed_at timestamptz;
