# Hub Plans — review follow-ups (Phase A+B, branch feat/hub-plans-ab)

Review findings left open (minor / pre-existing / accepted). Spec: `plans/2026-11-10-hub-plans-design.md`.

Fixed on branch: refund of a standalone `personality` or `bundle` no longer revokes personality a plan still covers.

Open:
- **Interview credit race (pre-existing):** `start-ai-interview` consumes a credit select-then-update without `.is("consumed_at", null)` on the update; two concurrent starts can share one credit (now also a plan's 45-min credit). Fix: guard the update and require a returned row.
- **Lead lookup after consume (pre-existing):** `start-ai-interview` returns 400 on a missing lead after the credit is consumed, without un-consuming it.
- **Double plan purchase race:** the 409 one-plan check in `initiate` only sees `success` rows; two concurrent checkouts can both be paid. `getPlanOrder` then returns only the newest plan, so the older plan's report credits are unreachable. Fix: refund by hand if seen, or a DB guard.
- **Duplicate plan mentoring row:** `applyPlanGrants` dedupes `counselling_requests` read-then-insert; concurrent webhook + verify finalize could insert two rows (same pre-existing pattern as the `counselling` product). Fix: unique `counselling_requests(order_id)` or insert + swallow 23505.
- **Report refund on a plan-spent lead:** `revokeReportForLead` deletes by (user, lead) regardless of `order_id`; refunding a standalone report on a lead unlocked by a plan credit would hand the credit back. Should not happen in normal flow (a plan credit means no report order). Fix: scope the delete to `order_id is null`.
- **Plan bought after fitment check:** leads created before allowlisting/plan purchase keep 7 skills but get a 45-min interview (PM decision 1, accepted).
- **Allowlisted user who never buys a plan** gets 10 skills on a 30-min individual interview (vendor only analyses 7). Harmless; revisit if it matters.
- **Email verification:** the allowlist gate trusts `user.email` from Supabase auth. Confirm email confirmation is required in Supabase, otherwise someone could sign up with an allowlisted address they don't own.
- **Verify response for Plan 2** returns `{status:"unlocked"}` (not `"requested"` like counselling). Phase E UI should show the mentoring step.
- **Analytics:** `lib/analytics.ts` `PURCHASE_EVENT` has no plan entries (falls back to `"purchase"`). Add in Phase E.
- **Manual check not done:** `/admin/plan-allowlist` add/list/remove against a local DB with 0068 applied, and the B5 step-5 live 45-min agent check (needs preview deploy).
