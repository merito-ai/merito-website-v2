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

## UX audit follow-ups (2026-11-11, local stack, Medium/Low — not fixed)

Fixed in this pass: plan-covered prices on report/interview/personality/references cards, pricing page owned items + bundle, culture fit capped 1-99%, 375px top-bar overflow (clipped every Hub modal), "Payment succeeded" copy on plan interview start, Plan 2 expert page price, new-role modal ₹299 for plan holders, plan comparison table, "Your plan" panel (dashboard + pricing).

Medium:
- **Plan holder with no lead** (bought before any fitment check): dashboard shows "No fitment scores yet"; `/hub/account/expert` redirects to `/hub/account`, so the panel's "Book session" (Plan 2) is a dead end. The panel only shows on pricing for them. Let expert/personality work without a lead, or show the panel on the empty dashboard.
- **Mentoring add-on price (PM call):** PM asked for "Add a mentoring session — ₹2,999" for Plan 1; there is no such product. The panel uses the real counselling price (₹1,999 entry/mid, ₹2,999 senior) for a **30-min** call, while the plan sells a **1-hour** session. Decide the add-on product/price.
- **Contrast:** `rgba(255,255,255,0.4)` text on the dark cards (culture "Show all 7", benchmark basis lines, pricing footnotes) and `#9c9c9c` on white (PlanOnlyNotice, "One-time payment" sub-lines) are under 4.5:1.
- **Keyboard:** `PriceOptionTiles` bundle tile (`div onClick`) and "…instead →" (`span onClick`) aren't focusable (pre-existing).
- **Admin allowlist:** no page `<h1>`; "1 emails"; duplicate emails get no explicit "already on the list" feedback (only the toast count).
- **Deploy order:** the dashboard now also calls `getPlanState` (throws on DB error), so 0068/0069 must be applied before deploy for the dashboard too, not just pricing.

Low:
- Pricing card CTA on an included report still reads "Get this now →"; "Use a plan report →" would be clearer.
- 4th-report modal shows ₹299 with no "You've used your 3 plan reports" line.
- Admin payments shows a level ("entry") on plan rows; plans are flat.
- Expert page step list + booking card ("30 minutes, video call") still say 30 min for Plan 2 (1-hour).
- If a Plan 2 counselling request is ever cancelled, the expert button would read "Book my expert call for Included in your plan".
- Panel "Shareable consolidated profile" status is static (no "link created" state).
- Not browser-checked this pass: actual interview start (vendor call), PDF export, share page culture section, personality two-part flow (progress/resume/validation/errors), flat/unreliable culture states (unit-tested only), real Razorpay iframe completion (plan purchases finalized via signed local `payment.captured` webhook).

FIXED 2026-11-11: Plan 2 holder with no role was redirected off /hub/account/expert (page required a lead); now only users with neither a role nor Plan 2 are redirected. Note: dashboard shows no "Your plan" panel without a role; panel is still reachable via Pricing.

FIXED 2026-11-11: dashboard (no role) now shows the "Your plan" panel for plan holders; role-bound rows (personality, interview, references, Plan 1 mentoring) say "Check a role first" and open the new-role modal (#check-role). Same on Pricing. Non-plan no-role dashboard unchanged.

PM decision 2026-11-11: Plan 1 holders see the real individual expert call price (₹1,999 entry/mid, ₹2,999 senior, 30 min) — no ₹2,999 1-hour mentoring add-on product; revisit if seminar buyers ask for upgrades.

- FIXED 2026-11-11 (was Low, PM): no-role plan holder dashboard now reads "Welcome to <plan name>" / "Start with step 1: check a role." instead of "No fitment scores yet".
- (Low) Plan 1 holder with no role not browser-checked.
- (Medium, 2026-11-11) Pricing now shows only the plan comparison table to allowlisted users, plan holders included, so plan holders no longer see the per-product cards (extra ₹299 role report, ₹149 reference refresh, expert call) on /hub/account/pricing. The footer only lists the prices. Check whether those extras can still be bought from their feature pages, or add an "Extras" section under the table.
- (Low, 2026-11-11) The "Talk to us" CTA on the other plan is a mailto link (admin@merito.ai). Replace it with a real upgrade product if seminar buyers ask to switch plans.

Seminar pay-first flow (2026-11-11): allowlisted users without a plan see "Plans unlocked for you" + the plan comparison at the top of the dashboard (role or no role); "Your plan" panel is now numbered steps with one Start here / Next step marker.
- (Medium) A successful plan purchase sends the buyer NO confirmation email: lib/paymentEmails.ts only sends ops alerts (failed/mismatch/refund/stuck). Only Razorpay's own receipt (if enabled in its dashboard, unverified) reaches the buyer. Add a "Welcome to <plan>" email with the step list.
- (Low) Allowlisted no-plan user WITH a role (offer above the greeting cards) not browser-checked; QA user had no role.
- (Low) No-role offer page has an h2 ("Plans unlocked for you") but no h1.
- (Low) Steps "done" rules: references done once referees are invited; mentoring done once scheduled; share never shows done (no share state).

Upgrade + welcome email (2026-11-11):
- FIXED: the (Medium) "no confirmation email" item above: plan purchases and upgrades now send a welcome email.
- FIXED: the (Low) "Talk to us" item above for Plan 1 holders: Plan 2 column is now "Upgrade for ₹2,999". Plan 2 holders still see "Talk to us" on Plan 1 (no downgrade).
- (Low) Panel "Upgrade to unlock" links to /hub/account/pricing (one extra click) instead of opening checkout in place. A Plan 1 holder who is NOT allowlisted (admin comp) lands on the normal per-product pricing page with no upgrade button.
- (Low) Admin comp grants (plan or upgrade) send no welcome email.
- (Low) Plan 1 refund while an upgrade is paid only logs a console.error; consider an ops email alert (like sendRefundFailedAlert).
- (Low) Double-pay: two upgrade checkouts opened in parallel can both be paid (same as plans). Second payment grants nothing new; refund by hand.
- (Low) Welcome email is plain HTML like the ops alerts (no branded template, not admin-editable in emailTemplates).
- (Low) Em-dash sweep changed IM_FLAG copy; v2 personality results already stored keep the old flag string with the em-dash.
- (Low) Pre-existing em-dash not on this branch: app/hub/account/combined-report/CombinedReportActions.tsx "Caption copied — paste it..." (rule says sweep branch changes only).
- (Low) Upgrade refund path verified by unit tests only, not on the local stack.
- (Ops) Seminar attendee message (team WhatsApp/email) should say the first email from Merito is titled "Confirm your email to sign in to Merito" and they must click its button to sign in.

## Feature details copy follow-ups (2026-11-11, PM call needed)

- Mentoring length: plan copy says 1 hour, but the Calendly fallback (`lib/hub/calendlyUrl.ts`) is the `30min` event and `/hub/account/expert` still says "30 minutes" / "Your 30-minute session" for Plan 2 holders. Detail line omits the duration until a 60-min event exists. Confirm prod `NEXT_PUBLIC_CALENDLY_URL`.
- Application assistance "3 companies you choose" is an offline promise; no code backs it (copy kept per PM spec).
- Normal-user re-reference price still ₹149 (awaiting user answer); change `REFERENCE_REFRESH_PRICE_PAISE` in `lib/razorpay/pricing.ts`.
