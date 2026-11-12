# Hub Plans — review follow-ups (Phase A+B, branch feat/hub-plans-ab)

Review findings left open (minor / pre-existing / accepted). Spec: `plans/2026-11-10-hub-plans-design.md`.

Fixed on branch: refund of a standalone `personality` or `bundle` no longer revokes personality a plan still covers.

Open:
- **Interview credit race (pre-existing):** `start-ai-interview` consumes a credit select-then-update without `.is("consumed_at", null)` on the update; two concurrent starts can share one credit (now also a plan's 45-min credit). Fix: guard the update and require a returned row.
- **Lead lookup after consume (pre-existing):** `start-ai-interview` returns 400 on a missing lead after the credit is consumed, without un-consuming it.
- **Double plan purchase race:** the 409 one-plan check in `initiate` only sees `success` rows; two concurrent checkouts can both be paid. `getPlanOrder` then returns only the newest plan, so the older plan's report credits are unreachable. Fix: refund by hand if seen, or a DB guard.
- **Duplicate plan mentoring row:** `applyPlanGrants` dedupes `counselling_requests` read-then-insert; concurrent webhook + verify finalize could insert two rows (same pre-existing pattern as the `counselling` product). Fix: unique `counselling_requests(order_id)` or insert + swallow 23505. RESOLVED 2026-11-11: unique `(order_id, session)` (migration 0072) + upsert ignoreDuplicates in applyPlanGrants and the counselling finalize.
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
- Expert page step list + booking card ("30 minutes, video call") still say 30 min for Plan 2 (1-hour). RESOLVED 2026-11-11: Plan 2 mentoring = two 30-min sessions (first + follow-up) on the 30-min Calendly event; see design doc "Mentoring (2026-11-11)".
- If a Plan 2 counselling request is ever cancelled, the expert button would read "Book my expert call for Included in your plan".
- Panel "Shareable consolidated profile" status is static (no "link created" state).
- Not browser-checked this pass: actual interview start (vendor call), PDF export, share page culture section, personality two-part flow (progress/resume/validation/errors), flat/unreliable culture states (unit-tested only), real Razorpay iframe completion (plan purchases finalized via signed local `payment.captured` webhook).

FIXED 2026-11-11: Plan 2 holder with no role was redirected off /hub/account/expert (page required a lead); now only users with neither a role nor Plan 2 are redirected. Note: dashboard shows no "Your plan" panel without a role; panel is still reachable via Pricing.

FIXED 2026-11-11: dashboard (no role) now shows the "Your plan" panel for plan holders; role-bound rows (personality, interview, references, Plan 1 mentoring) say "Check a role first" and open the new-role modal (#check-role). Same on Pricing. Non-plan no-role dashboard unchanged.

PM decision 2026-11-11: Plan 1 holders see the real individual expert call price (₹1,999 entry/mid, ₹2,999 senior, 30 min) — no ₹2,999 1-hour mentoring add-on product; revisit if seminar buyers ask for upgrades.

- FIXED 2026-11-11 (was Low, PM): no-role plan holder dashboard now reads "Welcome to <plan name>" / "Start with step 1: check a role." instead of "No fitment scores yet".
- (Low) Plan 1 holder with no role not browser-checked.
- (Medium, 2026-11-11) Pricing now shows only the plan comparison table to allowlisted users, plan holders included, so plan holders no longer see the per-product cards (extra ₹299 role report, ₹299 reference refresh, expert call) on /hub/account/pricing. The footer only lists the prices. Check whether those extras can still be bought from their feature pages, or add an "Extras" section under the table.
- (Low, 2026-11-11) The "Talk to us" CTA on the other plan is a mailto link (admin@merito.ai). Replace it with a real upgrade product if seminar buyers ask to switch plans.

Seminar pay-first flow (2026-11-11): allowlisted users without a plan see "Plans unlocked for you" + the plan comparison at the top of the dashboard (role or no role); "Your plan" panel is now numbered steps with one Start here / Next step marker.
- (Medium) A successful plan purchase sends the buyer NO confirmation email: lib/paymentEmails.ts only sends ops alerts (failed/mismatch/refund/stuck). Only Razorpay's own receipt (if enabled in its dashboard, unverified) reaches the buyer. Add a "Welcome to <plan>" email with the step list.
- (Low) Allowlisted no-plan user WITH a role (offer above the greeting cards) not browser-checked; QA user had no role.
- (Low) No-role offer page has an h2 ("Plans unlocked for you") but no h1.
- (Low) Steps "done" rules: references done once referees are invited; mentoring done once scheduled; share never shows done (no share state). UPDATED 2026-11-11: mentoring is now done only when both sessions are completed.

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

- Mentoring length: plan copy says 1 hour, but the Calendly fallback (`lib/hub/calendlyUrl.ts`) is the `30min` event and `/hub/account/expert` still says "30 minutes" / "Your 30-minute session" for Plan 2 holders. Detail line omits the duration until a 60-min event exists. Confirm prod `NEXT_PUBLIC_CALENDLY_URL`. RESOLVED 2026-11-11: Plan 2 mentoring = two 30-min sessions (first + follow-up) on the 30-min Calendly event; see design doc "Mentoring (2026-11-11)".
- Application assistance "3 companies you choose" is an offline promise; no code backs it (copy kept per PM spec).
- Normal-user re-reference price still ₹149 (awaiting user answer); change `REFERENCE_REFRESH_PRICE_PAISE` in `lib/razorpay/pricing.ts`. RESOLVED 2026-11-11: user decided ₹299 for normal users too; constant changed (UI reads the server price).


- (Minor, 2026-11-11) Admin counselling queue sorts by requested_at only, so legacy follow-up rows backfilled by 0072 list after all first sessions. Could sort by order then session if ops finds it confusing.
- (Minor, 2026-11-11) Calendly booking does not tell us which session the user booked; admin marks session 1 / follow-up scheduled by hand. A Calendly webhook could automate it.
## Fresh-user journey QA + edge cases (2026-11-11, local stack, Razorpay test)

Fixed in this pass (Critical/High): refunded order re-granted by a late `payment.captured` (finalize now no-ops on `refunded`); solo interview credit spent before the plan's 45-min credit; plan holder with no role could not check a first role ("Full name is required": modal now asks name + phone); step 1 read "Done" while the role's report was still locked (now "Open my report"); reused sign-in link while signed in landed on the login form, and `?error=expired` showed no message; allowlist paste stored `<a@b.com>` / quoted / trailing-dot addresses that never match a login (and DELETE couldn't remove them); admin allowlist toasted success on an expired session (redirect HTML read as 200); proxy only refreshed the session on `/hub/account`, not its subpages; SalesIQ bubble above every Hub modal; 375px top bar overflow with a role selected.

Medium:
- ~~**Share page fitment uses the latest lead**~~ FIXED 6f90a2d (lead looked up by the link's `role_title`, latest lead fallback): not the share link's role (`lib/combinedReportData.ts`): share role A, check role B, and the link shows B's fitment beside A's interview. Look up the lead by the link's `role_title`.
- ~~**v1 personality + plan:**~~ FIXED 736fec7 (v1 shows "Culture part pending" / "Take updated test" for all users, retake uses the existing unlock, no plan needed): panel shows personality "Completed" for an old v1 result, so the plan's culture part is never prompted (`PlanPanel.tsx` maps any non-part2 row to done). Map `version === 1` to "Retake for culture".
- ~~**v1 retake overwrite:**~~ FIXED 736fec7 (v1 retake sends both parts with part 2; v1 stays until v2 saves in one write; trade-off: a refresh mid-retake loses part 1): part 1 of a plan retake overwrites the v1 result at once; abandoning part 2 leaves personality incomplete everywhere (`save-personality-test`).
- **finalize CAS error ignored:** the success-flip update's `error` isn't checked, so a DB error returns `ok` (verify says unlocked, webhook 200) while the row stays `initiated` until reconcile.
- **Upgrade paid after Plan 1 refunded:** grants 2 mentoring rows + "Plan 2 active" email but `getPlanOrder` returns null. Skip email + alert ops when the upgrade has no Plan 1.
- **Double-plan race worse than above:** `getPlanOrder` picks newest by `created_at` (checkout start), so Plan 2 started first + Plan 1 second, both paid, shows Plan 1 and offers a third (upgrade) payment. Prefer `plan_mentor` when both are `success`.
- **Logged-out deep link:** `/hub/account/pricing` redirects to `/hub/login` with no `next`, and the callback only allows `/admin`; user lands on the dashboard after login.
- **Session expiry on the client:** `usePlanState` treats 401 as "no plan", so an allowlisted user sees normal ₹ prices; Pay then says "Not signed in." with no sign-in link.
- **Mail scanners** (Outlook Safe Links) can consume the one-time `token_hash` on GET before the user clicks; the user now sees "expired or already used", but a confirm-page POST would avoid it.
- **Interview paywall (plan) copy:** modal says "You'll be able to launch your AI interview ... from your dashboard, whenever you're ready" above a button that starts it now.

Low:
- Personality part 2 can be resubmitted without limit (no `culture_scores != null` 409).
- Mid-part personality answers live in memory only; a refresh mid-part loses that part (resume works at the part boundary, any device: verified).
- `unlock-report` on an already-unlocked lead with 0 credits creates a ₹299 order (no UI path).
- 409 copy "You already have Plan 2." uses internal naming; say "Assess + Mentor + Apply".
- Allowlist toast lists the words of a pasted display name ("skipped invalid: Asha, Rao").
- Welcome email after an upgrade still says "Start with step 1: check a role".
- Admin refund is always full with no warning after credits were spent.
- React dev warning: missing `key` in a list `DashboardClient` renders from `AccountPage` (allowlisted user with a role).
- Pre-existing em-dashes in Hub copy: personality page ("Part of your profile — done once", "Answer for how you actually are — not..."), report "Strongest — Education Match".
- Fitment-checker labels have no `htmlFor` (inputs unlabeled for screen readers); "Just the Report for ₹299 instead →" is a `span` (keyboard, already listed).
- Closing the Razorpay window leaves an `initiated` order; reconcile alerts ops at 24h (noise).

Not testable locally:
- Local Supabase isn't running the repo's email templates (subject "Your sign-in link", PKCE `token=` link, no confirmation step), so the real "Confirm your email" email and its `token_hash` link were simulated with `generate_link`. Check the prod templates + Redirect URLs allow-list.
- Welcome email: sent via real Resend locally but not found in the connected Gmail; delivery unconfirmed.
- Live IntervueBox interview start (local env points at the live vendor): stopped at the confirm modal.
- `/hub/share/[token]` (and every dynamic route: `/hub/references/feedback/[token]`, `/insights/[slug]`) returns 500 in the shared :3005 dev server: its static-paths jest-worker crashed ("Jest worker encountered 2 child process exceptions"). Dev-server state, not route code: `npm run build` passes. Share link with partial results + revoked link verified by code/unit test only; re-check after a dev-server restart.
- Razorpay mobile (375px) checkout popup flow; desktop netbanking test flow verified for Plan 2, Plan 1, upgrade, ₹299 report.

## Personality culture surfaces (2026-11-12, branch feat/personality-culture-surfaces)

Already done on main before this pass: Hub personality report + personality PDF (print page) render `CultureSection` (mix, fit %, adaptable/unreliable states); v1 result shows "Take the updated test" prompt and no culture section.

Fixed: admin ReportsTab personality had no culture section; combined-report page "Personality" card summary ignored culture; personality sample + public sample report had no culture. Shared one-line fit copy is now `cultureFitLine()` (reportCopy.ts).

Minor / not fixed:
- (Minor, pre-existing) `CondensedPersonalitySection` radar card uses `gridTemplateColumns: "320px 1fr"`; at 375px it overflows (page scrollWidth 518) on `/hub/sample-report` and likely `/hub/share/[token]`. Stack to one column below ~640px.
- (Minor) Recruiter-facing compact culture (combined, share link, admin uses candidate copy) shows mix only for unreliable results with no note why. Consider a short neutral line ("Fit not shown: some check answers suggest low attention").
- (Minor) `#ed1a24` 12-12.5px value text on the dark Hub cards is about 3.3:1 (under 4.5:1). Hub-wide pattern, incl. the new sample culture block.
- (Minor) v1 personality PDF has no culture and no "take the updated test" line (PDF is a record, prompt lives in the Hub).
- (Minor) Share-summary and share-link section blurbs still say only "Big Five (OCEAN) traits"; could mention work-culture preferences for v2 results.
- Browser QA 2026-11-12 (local stack): Hub personality report checked for v2 fit (98% startup, top 3 + Show all 7, desktop), v2 flat/adaptable (375), unreliable (mix + explanation, desktop + 375), v1 (update prompt, no culture, 375, no overflow). Personality PDFs checked for v2 / v1 / unreliable.
- FIXED 2026-11-12: single-page PDF export dropped its last line when the page height was fractional (scrollHeight rounded down, remainder went to dropped page 2); v2 personality PDF lost its footer. Affects every single-page export, fixed in `renderPageToPdf`.
- FIXED 2026-11-12: em-dashes in personality page header, test intro, Part 2 heading and PDF validity line.
- Browser QA 2026-11-12 (second pass): admin ReportsTab shows the full culture section (98% startup, top 3 + Show all 7, same numbers as Hub). Locked personality sample checked desktop + 375.
- FIXED 2026-11-12: locked sample crop (430px) hid half the new culture block at 375; crop now 560. Locked-state copy said 65 statements (Big Five only); now counts culture items (104) and lists culture in steps and "Also included".
- (Minor, tooling) Vitest on Windows fails every file ("Cannot read properties of undefined (reading 'config')") when started from a lowercase `d:` path; run from `D:`.
- (Minor) Desktop emulation in the devtools browser reports a 5120px viewport unless `mobile` is set; use `1280x900x1,mobile` for desktop checks.

## Founder-test prep (2026-11-12, branch feat/personality-culture-surfaces)

Done: combined/sample/share personality card and skill rows stack at 375px; interview validity (`INTERVIEW_VALIDITY_DAYS = 10`, `lib/planFeatures.ts`) shown in the paywall modal, locked-state steps, plan detail line, pricing table, welcome email, and in-progress card (falls back to invited_at + 10 days when the vendor gives no expiry); every interview by an allowlisted user or plan holder is 45 min with the 10-skill cap (`getsPlanInterviewLength`, `lib/plans.ts`); application assistance row says what happens next; mentoring card explains Scheduled/Completed; Hub em-dash sweep; login email label; report tile "Locked" instead of "Not started".

PM to confirm:
- **Interview validity is UI copy only.** The IntervueBox invite API (`POST /public/invitations/interviews/:id`, body `{candidateIds, accessMode}`) has no expiry/validity parameter in our code or the integration spec. Prod magic links so far expire 3.0 days after invite, so the vendor must be asked to set 10 days on their side, or the "10 days" copy is wrong for anyone who waits past day 3.
- **Assistance turnaround:** "within 7 working days of purchase" is a conservative default (`ASSISTANCE_NEXT_STEP`). Ops must actually call; nothing reminds them.

Medium:
- **No admin tracking for application assistance:** ops can only find Plan 2 buyers in Payments; no "contacted / companies picked / referred" status, so the user's panel row can never change. Smallest fix: a status column on the plan order in admin, shown in the panel.
- Dashboard header counts "N of 5 steps" while the plan panel shows 7 numbered steps.
- Plan names differ: pricing columns "Prepare" / "Mentor + Apply" vs panel and emails "Assess + Prepare" / "Assess + Mentor + Apply".
- Plan 2 dashboard still shows the generic "Talk to a Merito career expert / Schedule your call" guidance card next to the panel's "Book session 1" (two entry points, one says "Pick a slot in the next 48 hours").
- Panel interview row shows "In progress" with no deadline; the date is only on the interview page.

Low:
- SalesIQ chat bubble covers the panel's right-hand action links at desktop widths (e.g. personality "Start").
- Admin plan allowlist shows the literal "None" for an empty note.
- Expert page header for Plan 2 says "A 1-1 session" (plan has two).
- `/hub/share/[token]` not re-checked at 375 in this pass (same components as `/hub/sample-report`, which was).

## Batch 2 (2026-11-12)

Fixed: application assistance admin tracking (`/admin/assistance`, table `plan_assistance`, **migration 0073, apply to prod before deploy**), panel row shows In progress / Done; dashboard header no longer counts "N of 5" for plan holders; pricing columns use the full plan names; Plan 2 dashboard drops the duplicate expert card (Plan 1 keeps it as the paid upsell); panel interview row shows "complete by <date>" for an opened invite; SalesIQ teaser hidden and panel actions kept clear of the bubble; allowlist empty note shows blank, "1 email"; admin page titles are h1 (allowlist + every admin page); 409 copy names the plan; contrast `#9c9c9c` on white in PlanOnlyNotice / paywall sub-lines / counselling modal; counselling modal close 44px; fitment-checker labels linked (`htmlFor`, seniority `aria-label`); expert page subtitle for Plan 2; upgrade welcome email points at mentoring; logged-out `/hub/account/pricing` returns there after sign-in; interview paywall copy no longer says "whenever you're ready" above a start-now button.

Refund check (code read, no change needed): `markRazorpayRefunded` on a plan deletes the plan's `report_unlocks` (by order_id), revokes personality/references unless another success payment covers them, cancels open mentoring sessions (completed kept), then flips the txn to `refunded`. `getPlanOrder` only reads `status = success`, so a refunded plan disappears everywhere (panel, interview credit, `getsPlanInterviewLength`, admin assistance list). An allowlisted user still gets 45-min interviews after a refund (by design: allowlist, not plan).

Skipped (and why):
- finalize CAS error ignored, double-plan race, upgrade after Plan 1 refund: payment-path changes right before a live founder purchase; not small/safe now.
- `usePlanState` 401 = "no plan": needs a session-expired UI state; Medium, not small.
- Personality part 2 resubmit / mid-part refresh loss: test-flow changes, not small.
- 4th-report modal line, "Get this now" on included report: plan holders no longer see the per-product cards on pricing; low value.
- Allowlist toast listing display-name words, `unlock-report` 0-credit order, admin full-refund warning, Razorpay closed-window noise, Calendly session detection, admin counselling sort: Low, unchanged.
- React `key` warning on the dashboard: not reproduced in this pass.

## First-visit guide, no-role dashboard (2026-11-12)

Built per `plans/2026-11-12-hub-first-visit-guide-design.md` "Scope (2026-11-12, user)". Not fixed (Medium/Low):
- Contrast: brand red `#ed1a24` as small text on the dark Hub (PlanSteps "Start here" marker and action links, the plan/kicker chips, "See prices") is about 4.2:1, under 4.5:1. Existing Hub token, kept for consistency; the new guide buttons use `#d9161f` (5.1:1 with white). Low.
- Personality without a role (plan holders, P1): the row is saved with `role_title = "your next role"`; the personality PDF export/print route still needs a role and redirects for these users. Low.
- InterviewPaywallModal shows the generic "Ready for a real AI interview?" content for a moment while `/api/hub/plan-state` loads, then switches to the plan confirm. Low.
- Hub TopBar overflows sideways below about 366 CSS px (role switcher + icons); 375 is fine. Pre-existing. Low.
- P1 hero keeps the mockup's ghost "Start personality test" next to the panel row's "Start" link (two entry points to the same step). Decide when the panel restyle add-on lands. Low.
- Local QA fixtures `fv-n1/s1/p1/p2/e3/e4@example.test` left in the local Supabase only.

## Prod smoke test (2026-11-12, roshanrk2014, allowlisted, no plan)

Fixed: SalesIQ chat back on the Hub (admin ChromeGate re-added the script that `SalesIqWidget` keeps off /hub); dashboard plan comparison replaced by a compact "Plans unlocked for you" row that opens the shared plans popup (was a 7-row table above the score); "seminar" line gone; interrupted-interview copy rendered "Engineerended" (compiled JSX dropped the space after `{roleTitle}`; now one template literal); `formatPrice` groups thousands (₹1,999); em-dashes in sample report data.

Not covered / open (Low):
- Interview confirm dialog not checked on prod: the test account has an interrupted interview (Resume only). Re-check with an account that has no interview.
- Upgrade ₹2,999 not visible to a no-plan account; label comes from `PLAN_UPGRADE_PRICE_LABEL` (299900 paise).
- Root cause of the dropped JSX space not found (only that one spot in prod chunks). Watch for "{expr} word" text joining in new copy.
- Optional: auto-open the plans popup once on first dashboard visit for allowlisted no-plan users.
- FIXED 2026-11-12: `/hub/account/interview` crashed (Server Components error) for ready interviews whose July 2026 `report_raw` has no `answers` (4 such prod rows have `roadmap: null` too). Fixed via `readReportRaw()` (lib/intervuebox/reportRaw.ts) at every report_raw read site: defaults answers/skillReport/skillMetrics/criteriaEvaluationTable/knowledgeAnswers.
- Interview start confirm checked on prod (roshanrk2014, full stack developer, 1 paid credit): dialog opens, cancel closes, nothing started.
## Hub e2e sweep (2026-11-12)

Playwright specs in `app/hub/account/__tests__/*.e2e.test.ts` (desktop + 375px), helpers in `test/e2e/hub.ts`. Local Supabase only (asserted); the e2e dev server runs with Resend and IntervueBox disabled, a local Razorpay webhook secret and `ADMIN_EMAIL=e2e-admin@example.test` (`playwright.config.ts`). Users are `e2e-*@example.test`, reset on every run. Rerun: `npx playwright test app/hub/account/__tests__ --workers=3` (stop any other server on :3000 first).

Not fixed (Medium/Low):
- Locked fitment report page (`/hub/account/report`, `ReportLockedState`) renders the candidate's real report under a visual crop, so the full paid text (summary, strengths, category comments) is in the DOM. Intentional per the code comment, but anyone can read it in devtools. Covered by a `test.fail` in `dashboard-role.e2e.test.ts`; flip it when fixed. Medium.
- Admin pages (`/admin/plan-allowlist`, `/admin/assistance`) overflow sideways at 375px (tables). Desktop tool; covered by a mobile `test.fail` in `samples-admin.e2e.test.ts`. Low.
- Allowlist paste "Name <email>" lists the name words as skipped invalid in the toast (already noted above; e2e asserts the current documented behaviour). Low.
- Admin payments labels products "Plan 1" / "Plan 2" (`app/admin/payments/paymentStatus.ts`). Admin only. Low.
- References print page shows "—" for empty category values (`app/hub/account/references/print/page.tsx`). Low.
- Existing `switcher.e2e.test.ts` and `recruiter-preview-phase4.e2e.test.ts` need `TEST_USER_ID` / `TEST_SESSION_TOKEN` and fail without them (pre-existing, not part of this sweep). Low.

Not covered by e2e (and why): Razorpay's own checkout UI (payments are simulated through signed webhooks into the real finalize path); plan welcome email delivery (Resend disabled); live interview start/launch (live vendor); a successful referee invite (sends email; only validation is tested); Calendly booking and LinkedIn share (external); PDF file contents; role archive (no such feature).

- 2026-11-12: Dashboard logs React `Each child in a list should have a unique "key" prop` (DashboardClient, child from AccountPage) on every load; fails the e2e consoleGuard for any test that lands on /hub/account.

## Seminar-user add-ons (2026-11-12, branch feat/personality-culture-surfaces, local)

Built per `plans/2026-11-12-hub-first-visit-guide-design.md` "Later add-ons" (items 1-12), gated on `isSeminarUser` (lib/firstVisit.ts). E2E: `app/hub/account/__tests__/seminar-addons.e2e.test.ts`.

Not fixed (Medium/Low):
- E7 "report failed" is a heuristic: a lead still `PENDING` 24h after the check (`leadReportState`, lib/firstVisit.ts). The fitment check stores no failure status; add one (e.g. `FAILED` when the vendor errors) and drop the heuristic. Medium.
- E7 normal-user side: a stuck PENDING lead still shows "0.0" with an empty verdict for normal users (unchanged by design). Low.
- The plan panel's "Your report is ready · Open my report" step also shows while the report is only PENDING (pre-existing; now suppressed only once it reads as failed). Low.
- Sidebar lock icons are desktop-only: the Hub has no phone nav list to carry them. Low.
- `usePlanState` now also runs in Sidebar and RoleSwitcherMenu: several `/api/hub/plan-state` fetches per page. A shared context would make it one. Low.
- Welcome line "hides once the next step is done" for plan holders = any plan step started (report unlocked, personality done, references or interview started). Low, PM may want a different trigger.
- The S1 secondary button is now "Check my fit for a role" (was "Check a role first, free"); the "free" is still in the lead line above it. Low.
- Report/personality/references paywall modals have no Esc handling of their own (pre-existing); Esc in the plans popup on top closes only the popup. Low.
