-- 0069_plan_products.sql — Hub plans (plans/2026-11-10-hub-plans-design.md).
-- Idempotent; apply by hand + `supabase migration repair --status applied 0069`.
-- ADD VALUE can't be used in the same transaction it's added in; nothing below uses it.
alter type product_type add value if not exists 'plan_prepare';
alter type product_type add value if not exists 'plan_mentor';

-- Which paid order a report unlock was spent from. Plan report credits =
-- 3 - count(report_unlocks where order_id = plan order). NULL for every
-- existing/individual unlock.
alter table report_unlocks
  add column if not exists order_id text references razorpay_transactions(order_id) on delete set null;
create index if not exists report_unlocks_order_id_idx on report_unlocks(order_id) where order_id is not null;
