-- 0068_plan_allowlist.sql
-- Emails allowed to buy Hub plans (spec plans/2026-11-10-hub-plans-design.md).
-- Idempotent: applied by hand in the SQL editor + `supabase migration repair --status applied 0068`.
create table if not exists plan_allowlist (
  email text primary key check (email = lower(btrim(email)) and email <> ''),
  added_by text not null,
  added_at timestamptz not null default now(),
  note text
);
alter table plan_allowlist enable row level security;
-- No policies on purpose: only the server's service-role client reads/writes it.
