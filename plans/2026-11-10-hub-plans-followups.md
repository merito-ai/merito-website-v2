# Hub Plans: open follow-ups

Spec: `plans/2026-11-10-hub-plans-design.md`. Cleaned up 2026-11-13 (branch `fix/hub-backlog-a`): every earlier item was re-checked against the code. Fixed, accepted, by-design and one-off QA notes were dropped; git history has the old list (`git log -p -- plans/2026-11-10-hub-plans-followups.md`).

## Fixed in this cleanup's batch

- FIXED 2d1a911: logged-out `/hub/account/*` deep links come back after sign-in (`lib/safeNext.ts` guard in `proxy.ts` and `/hub/auth/callback`).
- FIXED de64a06: expired session (plan-state 401) shows "Your session expired. Sign in again" instead of normal prices.
- FIXED 26248f0: Assess + Prepare refund with a paid upgrade left emails ops (`sendOrphanedUpgradeAlert`).
- FIXED 95f6985: admin pages fit 375px (sidebar stacks, tables scroll in their own box); admin payments labels say "Assess + Prepare" / "Assess + Mentor + Apply" / "Upgrade".
- FIXED a1df111: `samples-admin.e2e` admin tests no longer race on one shared admin login (one admin per viewport, serial).

Also confirmed fixed earlier: PURCHASE_EVENT plan entries (63ef9fc), free-report tile sub-line and plan CTAs (e4f2cd5), culture fit capped (740d88a), no-lead plan holder dead end (901d0ba, 778cabf), allowlist h1 / "1 email" / 409 copy / upgrade welcome copy / interview paywall copy / fitment labels (ffc3462), Plan 2 mentoring banner (1cf5da0, 65f7b97), assistance tracking (51e2f37), locked report leak (a419d89), references print "Not provided" (f88696f), personality/report/combined em-dashes (a70d3d3, 973979f), CondensedPersonalitySection at 375 (9426631), v1 retake keeps Part 1 across a refresh (691ff9a), personality PDF without a role (ca5da7c), compact culture explains a hidden fit (1358102).

## Medium

- **Interview credit race (pre-existing):** `app/api/hub/start-ai-interview/route.ts` consumes a credit with an update on `order_id` only, no `.is("consumed_at", null)` and no returned-row check; two concurrent starts can share one credit.
- **Lead lookup after consume (pre-existing):** same route returns 400 on a missing lead after the credit is consumed, without un-consuming it.
- **Double plan purchase race:** `initiate`'s one-plan check only sees `success` rows, so two concurrent checkouts can both be paid, and `finalize` has no guard for a second paid plan. Refund by hand if seen, or add a DB guard / ops alert.
- **getPlanOrder picks newest `created_at`** (`lib/plans.ts`): Plan 2 started first + Plan 1 second, both paid, shows Plan 1 and offers an upgrade payment. Prefer `plan_mentor` when both are `success`.
- **finalize CAS error ignored:** the success-flip update's `error` is never read (`lib/razorpay/finalize.ts`), so a DB error returns ok while the row stays `initiated` until reconcile.
- **Upgrade paid after Assess + Prepare was refunded:** `applyPlanGrants` still inserts mentoring and the welcome email still goes out, but `getPlanOrder` returns null. Skip the email and alert ops when the upgrade has no live base plan.
- **Mail scanners** (Outlook Safe Links) can consume the one-time `token_hash` on GET before the user clicks; a confirm-page POST would avoid it.
- **Pricing hides extras from plan holders:** `/hub/account/pricing` shows only the plan table to allowlisted users, so the extra ₹299 role report, ₹299 reference refresh and expert call are not listed there. Check they are buyable from feature pages, or add an "Extras" section.
- **Contrast:** `rgba(255,255,255,0.4)` / `text-white/40` text on dark Hub cards (e.g. `CultureSection.tsx`) is under 4.5:1.
- **Keyboard:** `PriceOptionTiles` bundle tile (`div onClick`) and "...instead" (`span onClick`) are not focusable.
- **Admin allowlist duplicates:** pasting an email already on the list gives no "already on the list" feedback (API returns only `{added, invalid}`).
- **Report "failed" is a heuristic:** a lead still `PENDING` 24h after the check reads as failed (`leadReportState`, `lib/firstVisit.ts`). Store a real `FAILED` status when the vendor errors: design in "Proposal" below, not built.

## Low

- `revokeReportForLead` deletes by (user, lead) regardless of `order_id`; refunding a standalone report on a plan-credit lead would hand the credit back. Scope to `order_id is null`.
- Each `usePlanState` caller fetches `/api/hub/plan-state` on mount (13 files, several per page incl. Sidebar, RoleSwitcherMenu, AppShell). A shared context would make it one.
- `45-min` is a literal in `InterviewPaywallModal`; `PLAN_INTERVIEW_MINUTES` lives in the server-only `lib/plans.ts`. Move it to client-safe `lib/planFeatures.ts` if it changes.
- 4th-report modal shows ₹299 with no "You've used your 3 plan reports" line (`PriceOptionTiles`).
- Admin candidate activity feed still shows a level ("entry") on plan rows (`app/admin/candidates/[userId]/ActivityFeed.tsx`); plans are flat.
- Panel "Shareable consolidated profile" row never shows done (`lib/planPanel.ts`, no share state).
- Panel "Upgrade to unlock" links to pricing instead of opening checkout; a non-allowlisted Assess + Prepare holder (admin comp) gets no upgrade button.
- Admin comp grants (plan or upgrade) send no welcome email.
- Upgrade double-pay: two parallel upgrade checkouts can both be paid; refund by hand.
- Welcome email is plain HTML, not a branded/admin-editable template.
- Personality part 2 can be resubmitted without limit (no `culture_scores != null` 409).
- Mid-part personality answers live in memory only; a refresh mid-part loses that part.
- `unlock-report` on an already-unlocked lead with 0 credits creates a ₹299 order (no UI path).
- Allowlist toast lists the words of a pasted display name ("skipped invalid: Asha, Verma"); e2e asserts this.
- Admin refund is always full with no warning after credits were spent.
- Closing the Razorpay window leaves an `initiated` order; reconcile alerts ops at 24h (noise).
- Admin counselling queue sorts by `requested_at` only; legacy follow-up rows list after all first sessions.
- Calendly booking does not tell us which session was booked; admin marks it by hand (a Calendly webhook could).
- Share-summary / share-link / combined PDF blurbs say only "Big Five (OCEAN) traits".
- Brand red `#ed1a24` as small text on the dark Hub is about 3.3-4.2:1 (Hub-wide token).
- `InterviewPaywallModal` shows the generic content while plan-state loads, then switches to the plan confirm.
- Hub TopBar overflows sideways below about 366 CSS px (375 is fine).
- P1 hero "Start personality test" duplicates the panel row's "Start" (PM decision pending).
- Panel "Your report is ready" step also shows while the report is only `PENDING`.
- Sidebar lock icons are desktop-only (no phone nav).
- No-role S1 lead line still says "Start with a free role check".
- Report / personality / references / counselling paywall modals have no Esc handling (only the interview modal does).
- React key warning on the dashboard (`DashboardClient`): logged 2026-11-12, no fix commit, not reproduced by code read; re-check in a browser.
- Pre-existing lint error: `app/hub/account/pricing/PricingCardsClient.tsx` unescaped `'` ("what's left").
- `switcher.e2e.test.ts` and `recruiter-preview-phase4.e2e.test.ts` need `TEST_USER_ID` / `TEST_SESSION_TOKEN` and fail without them.
- Self-hosted fonts cover latin + Latin Extended-A + ₹ only; other scripts fall back to Arial/Times.

## Waiting on PM / ops / manual check

- Supabase "Confirm email" must be on (the allowlist trusts `user.email`); paste `supabase/templates` into prod.
- GTM mapping for `plan_prepare_purchase` / `plan_mentor_purchase`.
- Interview validity "10 days" is UI copy: vendor setting changed 2026-11-12; verify on the next real invite (`magic_link_expires_at - invited_at`).
- Assistance "within 7 working days" (`ASSISTANCE_NEXT_STEP`) to confirm.
- First real refund on prod/live (test-mode netbanking refunds fail at Razorpay); upgrade refund verified by unit tests only.
- Seminar attendee message should name the "Confirm your email to sign in to Merito" email.

## Proposal: real "report failed" status (2026-11-13, design only, not built)

Today `leadReportState` (lib/firstVisit.ts) calls a fitment report "failed" when `fitment_leads.resume_match_status` is still `PENDING` 24h after the check. The column only allows `PENDING | READY` (migration 0007 check constraint), and `getResumeMatchReport` errors at check time are swallowed as PENDING (app/api/hub/fitment-check/route.ts). So a vendor error shows "being prepared" for a day, and a slow-but-fine report flips to "failed" at 24h.

Proposal: add `FAILED` to the status plus when/why columns.

```sql
-- 00xx_resume_match_failed.sql (draft, not applied)
alter table fitment_leads drop constraint if exists fitment_leads_resume_match_status_check;
alter table fitment_leads
  add constraint fitment_leads_resume_match_status_check check (resume_match_status in ('PENDING', 'READY', 'FAILED')),
  add column if not exists resume_match_failed_at timestamptz,
  add column if not exists resume_match_error text;
-- optional one-off backfill of today's inferred failures:
-- update fitment_leads set resume_match_status = 'FAILED', resume_match_failed_at = now(), resume_match_error = 'backfill: pending > 24h'
--   where resume_match_status = 'PENDING' and created_at < now() - interval '24 hours';
```

Where it is set:
- `interview-sweep` cron (already runs): leads `PENDING` past a timeout (24h, same as now) after one last `getResumeMatchReport` try become `FAILED`, plus a `pipeline_failures` row (kind `resume_match_failed`) so admin sees it.
- Dashboard refresh (app/hub/account/page.tsx, PENDING branch) and admin `retry-resume-match`: a non-transient vendor error (4xx, report not found) sets `FAILED` at once; network/5xx stays `PENDING`.
- Any later READY (refresh, admin retry) overwrites `FAILED` and clears the two columns.

Readers: `leadReportState` returns `failed` only for `FAILED` (drop the time inference once the backfill runs). Check every `resume_match_status` reader before the constraint change: lib/adminAnalytics.ts, adminCandidates.ts, adminPayments.ts, combinedReportData.ts, completeReportUnlock.ts, prospectConversion.ts, recruiterPreviewSections.ts, vendor-compare route, and regenerate lib/database.types.ts. Deploy order: migration first (writers fail the check constraint otherwise).

## Interview report vs IntervueBox PDF (2026-11-13)

IntervueBox's own PDF is the source of truth. Done: headline = vendor `overallSkillScore`, strict tier cutoffs, `*` bullets, Training Needs.
- Nice to have: headline band words ("Strong / Developing / Needs work", `getScoreBand` 70/40) are ours; vendor shows a tier (e.g. PROFICIENT). Swap to the tier label on the in-app gauge, combined and shared reports.
- Nice to have: tier cutoffs 35 and 15 are inferred (only 60 and 45 confirmed against one vendor PDF). Confirm with a low-scoring vendor PDF.

## Prod recheck of plan-user flow after 5009e02 (2026-11-13)

Live merito.ai, desktop 1280 + 375px, read-only (writes blocked). PASS: S1 screen (welcome line, dismiss persists after reload, Unlock plans, Check my fit for a role), plans popup (focus in, Tab trapped, Esc closes, focus returns, bottom sheet at 375), confirm dialog (10 days, 45 min), role dashboard (one offer row, ", locked" on References + Expert guidance), report/references/mentoring paywalls end in the shared popup, locked report DOM shows only "Unlock the full report to read this." placeholders, no em-dash / Plan 1/2 / seminar on any page, logged-out /hub unchanged and /hub/account redirects to login.
- Minor: paywall modals (report, references, mentoring) first render the old single price ("Continue to payment for ₹299", disabled) for about 1-2s while each modal re-fetches /api/hub/plan-state, then swap to "Unlock plans". Show a neutral loading state instead, or pass the page's plan state down (one dashboard load fetches plan-state 3-5 times).
- Minor, to recheck locally: on the 375px role dashboard the popup sheet measured 26px taller than the viewport after tabbing to its end (S1 measured exact); "Compare all features" sits on the bottom edge with no padding.
- Not checked on prod (this account owns them or has no data): personality and interview paywalls, all plan-holder states (E6-E16), normal user with no role (N1).

## Preview E2E of the IIMA seminar flow (2026-11-23)

Preview `merito-website-v2-git-preview-...vercel.app` (main becc3d0), Razorpay test keys + IntervueBox staging on Preview, prod Supabase. Test users `roshanrk2014+seminar1` (allowlisted) and `+notlisted1` (not). PASS: allowlisted user sees plans only; Plan 1 netbanking failure then success on the same order (no duplicate, one success row); grants (personality + references unlocks, 3 report credits); report credit unlock (no Razorpay, report_unlocks row on the plan order); credits 2-3 spent, 4th role asks ₹299; 45-min interview created on IB staging (job has 10 skills); Plan 2 upgrade ₹2,999 by test card (two mentoring sessions requested, follow-up gated on session 1); non-allowlisted user sees normal pricing and initiate returns 403 for plan_prepare and plan_upgrade_mentor.
- FIXED 4d09dda (retested on preview): after a plan purchase the sidebar kept its locks until a manual reload. `usePlanState` fetches once on mount and `router.refresh()` (usePlanCheckout.tsx onPaid) does not refetch it; about 12 components share the hook. Fix: full reload after payment, or refetch the hook on refresh.
- FIXED 4d09dda (retested on preview): "Use 1 of your 3 plan reports, free" closed the modal but the report page stays locked until a manual reload (credit is spent correctly).
- DONE 4d09dda (unit-tested; IB public API can't read complexity back): plan interviews are medium difficulty for every level (seminar users are mid/senior; senior gets `hard` today via complexityForLevel). Smallest fix: start-ai-interview passes "mid" as the level to createInterviewAgent when planMinutes is set. Entry plan users would also get medium.
- Kept as is (PM 2026-11-23: plan users get 45 min + medium either way): the add-role modal (ChangeRoleModal) asks for a seniority level, but rescore-role deliberately overwrites it with the first role's level (21225a7, tested). Either hide the dropdown for 2nd+ roles or let the chosen level win. The first-role form saves the chosen level correctly.
- Minor: after the first role check the modal closed and the dashboard did not show the score until a reload (once, may be timing).
- Not tested: personality questionnaire completion, referee invite, refund path (needs an admin login), welcome email delivery.

## Multi-role + full-feature pass (2026-11-23, preview, account +seminar1 with 4 roles)

PASS: per-role fitment reports (3 plan credits on roles 1-3, 4th asks ₹299); interview is one per plan, a second role offers "Pay ₹999 for a 45-min interview"; personality test completed in UI (104 statements, 8 pages) and shows on every role; 3 referees invited, 3 referee forms submitted, report "Based on 3 completed references" on every role, re-reference ₹299; consolidated report per role (3 of 4 sections), public share link renders the right role, PDF export 200 (420 KB); mentoring: admin sets session 1 Scheduled (confirm step), follow-up unlocks for the user; application assistance: admin In progress + companies, dashboard shows it; Resend delivered sign-in, plan-active (Plan 1 + upgrade) and referee invite emails.
- FIXED e53810d: sidebar "Consolidated report" link passes ?lead=, page only read ?role= and fell back to the newest role (a multi-role user saw the wrong, often locked, role). Personality copy named the newest role for the same reason.
- Minor (admin): after Save on /admin/assistance the row badge stays "Not contacted" until reload (value is saved).
- Not tested (needs a human): completing the AI interview itself and its scored report (voice interview on IntervueBox), booking a real Calendly slot, mobile layout of these pages.

## Mentoring: Session 2 naming, auto-complete, Calendly sync, feedback (2026-11-25, branch feat/mentoring-feedback)

Built: "Follow-up" renamed "Session 2" everywhere; migration 0075 (session_at, calendly_event_uri, candidate_rating/feedback, feedback_at); `effectiveSessionStatus` (scheduled + now >= session_at + 30 min = completed, read-time only) used by expert page, plan panel, session-2 gating, allowlist progress, admin queue and the feedback API; Calendly popup + POST /api/hub/counselling/[id]/booked + lazy `syncCalendlyBookings` on render (lib/calendly.ts); candidate rating per completed session, shown in /admin/counselling. Needs CALENDLY_API_TOKEN on Vercel; without it the team confirms bookings by hand as before.
- Verify with a live Calendly booking: popup message -> booked route, cancel in Calendly -> back to requested, reschedule in Calendly -> new time. If a Calendly reschedule does not carry `utm_content` to the new invitee, the session reverts to requested instead of moving (sync could follow the canceled invitee's `new_invitee`).
- Minor: admin counselling `formatDate` has no IST timeZone (dates near midnight can show a day off); call times use IST.
- Minor: admin list sync("all") fetches invitees for every untagged Calendly event in the last 7 days on each load (standalone/non-hub bookings). Fine at current volume.
- Nice to have: standalone (non-plan) counselling bookings are not captured from Calendly (no session id in the link); dashboard step 5 has no "Rate your sessions" action once both are done.
