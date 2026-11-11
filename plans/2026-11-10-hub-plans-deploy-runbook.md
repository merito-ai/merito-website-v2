# Hub Plans — prod deploy runbook (branch `feat/hub-plans`)

Do these steps in this order. Do not skip ahead.

## Why order matters

- **Before 0069**, `product_type` has no `plan_prepare` / `plan_mentor`. `getPlanOrder` filters `product IN (plan_*)`, so that query errors. It runs in unlock-report, start-ai-interview, referenceCredits and refunds, so those break for **all** users, not only plan users.
- **Before 0070**, `personality_tests` has no `version` / culture columns. The seven personality readers select them, so they error and quietly drop existing results (dashboard, exports, share, admin, recruiter preview).
- **Before 0071**, `product_type` has no `plan_upgrade_mentor`. `getPlanOrder` looks it up for every Plan 1 holder, so their plan lookup errors (dashboard, pricing, unlock-report, interview).
- **Before 0068**, `plan_allowlist` is missing, so `/hub/account/pricing` (`getPlanState`) throws for every signed-in user.

## Steps

1. **Apply SQL by hand.** In the prod Supabase SQL editor, run these files one at a time, in order:
   - `supabase/migrations/0068_plan_allowlist.sql`
   - `supabase/migrations/0069_plan_products.sql`
   - `supabase/migrations/0070_personality_v2.sql`
   - `supabase/migrations/0071_plan_upgrade.sql`

   All four can be re-run safely. **NEVER run `supabase db push`.** The prod migration ledger is out of sync with the real schema (it has a phantom 0050), so `db push` would try to re-apply old migrations.
2. **Repair the ledger:** `supabase migration repair --status applied 0068 0069 0070 0071` (linked to prod).
3. **Check the schema:** `npm run verify:schema` (linked to prod) must print a **pass**. A **SKIP** (no CLI, or not linked) is not a pass: fix the link and run it again. Any failure means stop.
4. **Only then** merge `feat/hub-plans` and deploy.
5. **Check the deploy:** the Vercel deployment status must be **Ready** (`vercel ls` or the dashboard). A local build passing does not prove this.
6. **Smoke checks on prod:**
   - Normal (non-allowlisted) user: unlocking a report works (checkout, then unlocked).
   - Normal user: starting an interview works.
   - Existing v1 personality user: the personality export still shows their result.
   - Allowlisted user: the pricing page shows only the plans.
   - Plan 1 holder: Plan 2 column reads "Upgrade for ₹2,999"; dashboard mentoring/assistance rows read "Upgrade to unlock for ₹2,999".

## Before launch (not code)

- **GTM:** marketing must map the new `plan_prepare_purchase` and `plan_mentor_purchase` events.
- **Supabase Auth → "Confirm email" must be ON.** The allowlist trusts the auth email. Without confirmation, anyone could sign up with an allowlisted address they don't own and get plan pricing.
