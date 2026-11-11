-- 0071_plan_upgrade.sql — self-serve Plan 1 -> Plan 2 upgrade (₹2,999), plans/2026-11-10-hub-plans-design.md "Upgrade (2026-11-11)".
-- Idempotent; apply by hand + `supabase migration repair --status applied 0071`.
alter type product_type add value if not exists 'plan_upgrade_mentor';
