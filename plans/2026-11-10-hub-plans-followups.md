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

## Phase E (integrated on `feat/hub-plans`)

- **Deploy order (blocking):** `/hub/account/pricing` now calls `getPlanState` for every signed-in user, which reads `plan_allowlist` (0068) and plan products (0069) and throws on DB error. Deploying before 0068/0069 are applied breaks the pricing page for everyone, not just allowlisted users.
- **Analytics:** added `plan_prepare_purchase` / `plan_mentor_purchase` to `PURCHASE_EVENT`. Marketing must map them in GTM.
- **Manual checks not done** (E2 step 4, E3 step 6): needs local DB with 0068/0069 and Razorpay test keys. Allowlisted-without-plan sees only plans + "See plans" on every paywall; plan holder spends report credits with no checkout, 4th report ₹299, interview starts with no checkout at 45 min; normal user unchanged.
- **Code review** (E3 step 7) not run in this session.
- Each paywall modal / promo card fetches `/api/hub/plan-state` on mount (3 DB reads). Fine at current traffic; lift into a context if the dashboard ends up mounting several at once.
- Free-report tile ("Use 1 of your N plan reports — free") still shows the "One-time payment · UPI, card & netbanking" sub-line.
- Plan interview start: on failure, `startInterview`'s fallback text says "Payment succeeded, but starting the interview failed" even though no payment happened on the plan path.
- `45-min` is a literal in `InterviewPaywallModal` because `lib/plans.ts` imports the service-role client and can't go in a client bundle. Move plan constants to a client-safe module if they change.
- Plan 2 "mentoring" after purchase: banner says "book it from Expert"; no dedicated mentoring step in the plan purchase flow (verify returns `unlocked`).
- ~~`canRetakeV2` is UI-only~~ FIXED: `save-personality-test` now returns 409 for part 1 over a complete v2, or over a v1 unless the user has a plan.
- Pre-existing lint error: `app/hub/account/pricing/PricingCardsClient.tsx:256` unescaped `'` (not from this phase).

## Code review follow-ups (Low, deferred)

- **Second paid plan order:** `finalize` has no guard when a second plan order is paid (the concurrent-checkout race above). Add an auto-refund, or flag it for admin.
- **Allowlisted users can still POST individual products** to `initiate` (the UI only shows plans). Accepted per PM decision 7.

## Browser QA follow-ups (2026-11-10, local stack, Minor)

- Report page card CTA still reads "Unlock full report for ₹299" for a plan holder with credits; only the modal says "Use 1 of your 3 plan reports — free". Label the card CTA from plan state too.
- Interview page card CTA reads "Start my mock interview for ₹999" for a plan holder; modal briefly shows a disabled "Pay ₹999" while `/api/hub/plan-state` loads. Show the plan wording on the card and a neutral label while loading.
- After buying a plan, `/hub/account/pricing` (no lead) shows the plan banner above the full normal catalog, incl. ₹749 bundle and ₹299 personality the user already owns. Consider hiding owned/plan-covered items.
- Culture fit can show "100% fit" (r≈0.99 rounds up). Consider capping display (e.g. 95%) so it doesn't read as certainty.
- Admin refund of a test-mode netbanking payment fails at Razorpay (400 "invalid request sent", even a plain refund without `speed`) — test-account side, not plan code. Grant reversal verified via signed `refund.processed` webhook instead. Re-check a real refund on prod/live before launch.
- Local dev: Windows reserves TCP 54285-54484, so `supabase start` fails on 5433x ports. QA remapped to 5633x temporarily.
