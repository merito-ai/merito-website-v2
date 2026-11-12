-- 0073_plan_assistance.sql
-- Plan 2 application assistance progress, set by the team in /admin/assistance and shown in the
-- candidate's plan panel. One row per candidate (one plan per candidate); no row = not contacted.
-- Idempotent: applied by hand in the SQL editor + `supabase migration repair --status applied 0073`.
create table if not exists plan_assistance (
  user_id uuid primary key references auth.users (id) on delete cascade,
  status text not null default 'not_contacted' check (status in ('not_contacted', 'in_progress', 'done')),
  companies text,
  updated_by text not null,
  updated_at timestamptz not null default now()
);
alter table plan_assistance enable row level security;
-- No policies on purpose: only the server's service-role client reads/writes it.
