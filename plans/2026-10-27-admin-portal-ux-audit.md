# Admin Portal UX Audit — 2026-10-27

Scope: every page under `app/admin/` (code read, not live-browser). Goal: admin opens portal, knows in 10 seconds what needs action and what they are looking at.

## Verdict

Portal is a set of features bolted on one by one, not shaped around admin jobs. 15 flat sidebar links, home page is an analytics dump, most pages have no title or explanation, raw JSON and internal keys are shown to the admin. Nothing tells admin "this needs you today".

## What admin actually needs (4 jobs)

1. **Is anything broken or waiting on me?** — failed pipelines, stuck/terminated interviews, counselling to schedule, unlocks without payment, failed payments.
2. **Find one candidate and fix their problem** — search, see status at a glance, act (resync, override, refund, notify).
3. **Money** — what came in, refunds, mismatches.
4. **Is the business growing?** — funnel, weekly trend, revenue. Look weekly, not daily.

Everything else (webhook logs, learned skills, audit logs, data-quality counters) is engineering/maintenance and should be out of the main path.

## Findings (ranked)

### High

| # | Where | Problem |
|---|---|---|
| H1 | Sidebar ([AdminSidebar.tsx](../app/admin/_components/AdminSidebar.tsx)) | 15 flat links, no grouping. Daily ops (Counselling, Pipeline Failures), dev tools (Webhook Events, Learned Skills) and audit logs (Activity, Recruiter Activity, Contact Requests) all look equal. |
| H2 | Home ([page.tsx](../app/admin/page.tsx)) | No "needs attention" block. Stuck/terminated interviews buried in "Detail (side branches)" with no links. Pipeline failures, counselling queue, unpaid unlocks not on home at all. |
| H3 | Home | 8 analytics sections, jargon: "side branches", "skillReport", "category breakdown", "Extension-lookup path", correlation `r =`. Data-quality block is dev telemetry. |
| H4 | Candidate detail ([candidates/[userId]/page.tsx](../app/admin/candidates/[userId]/page.tsx)) | Lands on "Overview" tab that opens with **Account actions (ban/delete/merge)** then "Send notification" then profile-override form. No summary of who this candidate is: stage, roles, scores, paid amount, flags. Danger zone first, info never. |
| H5 | 11 of 15 pages | No page title, no one-line "what is this": Overview, Activity, Candidates, Recruiters, Contact Requests, Payments, Counselling, Extension, Pipeline Failures, Learned Skills, Email Templates. Layout shows no header either. |
| H6 | Raw data shown to admin | Activity "Change" column = `JSON.stringify` → `JSON`; Recruiter Activity "Detail" = raw JSON; Pipeline Failures = `<pre>` JSON dump; action names raw keys; Target = `candidate:<uuid>`. |
| H7 | **Bug** — Home score histogram ([adminAnalytics.ts:304](../lib/adminAnalytics.ts#L304)) | Interview scores are 0-100 (see `InterviewScoreGauge` clamp 0-100), but histogram buckets 0-10 and clamps → every score >10 lands in "9-10". Chart labelled "(0-10)". Chart is wrong today. |

### Medium

| # | Where | Problem |
|---|---|---|
| M1 | Candidates list | No filter by stage, no search box on page (only in sidebar), no total count, no "paid" or "last active" column. |
| M2 | Candidate Reports tab ([ReportsTab.tsx](../app/admin/candidates/[userId]/ReportsTab.tsx)) | Reuses full candidate-facing report (gauges, tiles, roadmap, full transcript) with override forms + vendor-compare + retry buttons mixed in. Very long scroll; admin controls hard to find. Admin actions should sit in one bar at top of each report. |
| M3 | Payments ([payments/page.tsx](../app/admin/payments/page.tsx)) | Grant form sits above the list. No status/product filter. Email not linked to candidate page. "Level" column unexplained. "Unlocked without payment" + Reconcile has no explanation of what reconcile does. |
| M4 | Pipeline Failures | Card shows label + JSON; no candidate name/email/link, no age ("since 3 days"). |
| M5 | Overview "Interview started (not yet ready)" | Counts `status = invited` — invited ≠ started. Label misleads. |
| M6 | Recruiter pages split 4 ways | Recruiters, Recruiter Activity, Contact Requests, Extension — plus "Recruiter engagement" on Home. Same audience, 5 places. Contact Requests page itself says "no approval step to action here" → it is a log, not a nav item. |
| M7 | Recruiters list | Only email/company/verified/banned. No lookups count, last active, reveals. |
| M8 | Counselling list | Shows `orderId` (useless to admin); no role or phone. Active-queue default is good. |
| M9 | Extension page | One stat line + list of candidate emails, no recruiter shown. Overlaps Home recruiter block. |

### Low (nice to have)

- L1 Date formats inconsistent: `toLocaleString()` with no locale on Email Templates vs `en-IN` elsewhere.
- L2 Email Templates list shows internal `key`, not human name/when-it-is-sent.
- L3 Duplicates page: long paragraph explanation; fine but rarely used — move under tools.
- L4 Sidebar fixed 240px, no mobile collapse.
- L5 Funnel stage key `interview_ready` labelled "Interview completed" — fine, but other screens say "ready"; pick one word.
- L6 "Recently viewed" in sidebar is useful — keep.

## Candidate tracking accuracy (verified against prod DB, read-only, 2026-10-27)

Prod snapshot: 30 candidates (60 leads, 11 users with >1 role), 86 transactions (65 success, 18 initiated, 3 refunded), 28 report unlocks, 40 product unlocks, 23 interview rows.

| # | Problem | Evidence | Root cause |
|---|---|---|---|
| T1 | **Candidates pay for interview again while holding an unused paid credit** (money bug, not just admin) | 35 successful interview payments, 16 never consumed. One candidate: 6 payments, 1 interview. Real-looking candidates affected: `abn…@gmail.com`, `e19…@iimidr.ac.in`, `shr…@gmail.com` | Hub `InterviewPaywallModal` always takes payment; nothing in `app/hub` checks for an unconsumed `razorpay_transactions` interview row. [start-ai-interview](../app/api/hub/start-ai-interview/route.ts#L97) consumes oldest credit, so extras pile up |
| T2 | Admin shows no "paid" or "credit balance" per candidate | Candidates list has no payment column; detail page shows payments only inside Activity feed | Never built. Paid status = 5 separate tables, never joined |
| T3 | Funnel stage is one linear label for parallel products | Stage order report → interview → personality → references; products bought independently. 1 user paid ₹999 interview shown as "Fitment check started" | [computeFunnelStage](../lib/adminCandidates.ts#L41) ignores payments, interview purchases, counselling; treats independent products as a ladder |
| T4 | Stage is per user, not per role | 11 of 30 users have >1 role; report unlock on role A marks whole user "Report unlocked"; list shows only latest role | `fetchAllCandidates` builds user-level sets from `report_unlocks.user_id` |
| T5 | Test/team accounts mixed into all numbers | `@merito.in` and team gmail accounts hold most unused credits and many payments; prod still on Razorpay test keys, so all "revenue" is test money | No internal/test-account flag anywhere |
| T6 | "Unlocked without payment" can't tell why | 6 report + 2 product unlocks flagged; likely bypass-era / test accounts, no way to see | `findUnpaidUnlocks` only checks Razorpay; no record of bypass or admin comps outside txn table |
| T7 | Abandoned checkouts listed as normal rows | 18 `initiated` txns all older than 1 day | Payments list shows every status equally, no "abandoned" label |
| T8 | `findUnpaidUnlocks` treats a bundle as covering every role's report | Not hit in prod today (0 rows) but wrong: bundle unlocks only its own `lead_id` ([finalize.ts:96](../lib/razorpay/finalize.ts#L96)) | [adminPayments.ts:43](../lib/adminPayments.ts#L43) `bundleCoveredUsers` keyed by user, not user+lead |
| T9 | Interview score chart wrong (= H7) | 14 of 16 interview scores > 10 (max 76) all land in "9-10" bucket | 0-10 buckets on 0-100 data |

### Fix direction

- T1: hub checks unused credit before paywall ("You have 1 interview credit — start now"); initiate route refuses new interview order while credit unused. Admin: show unused credits + refund action. **Highest priority: real money once live keys go in.**
- T2-T4: one per-candidate "Products" table (per role): Report / Interview / Personality / References / Counselling, each = Not bought · Paid ₹X · Comp · In progress · Done · Refunded, plus total paid and unused credits. Candidates list gets "Paid ₹" + "Unused credits" columns; drop the single linear stage or keep it only as "furthest step".
- T5: `is_internal` flag (email domain list in config) to exclude from metrics, with toggle.
- T6-T8: small fixes in `adminPayments.ts` + payments page labels.

## Proposed structure

Sidebar 15 → 6 items, grouped:

```
Home                 needs-attention + 4 KPIs
Candidates           list (search + stage filter) → detail
Recruiters           tabs: Accounts · Activity · Lookups · Contact reveals
Payments             tabs: Transactions · Unpaid unlocks · Grant access
Counselling          queue
Insights             today's Overview analytics (funnel, trends, by role, revenue, scores)
─── Tools (collapsed)
  Broadcast · Email templates · Duplicates
─── System (collapsed)
  Pipeline failures · Webhook events · Learned skills · Admin audit log
```

Pipeline failures count also surfaces on Home, so moving it under System loses nothing.

### Home — new

1. **Needs attention** (cards, each = count + link, hidden when 0, green "All clear" when all 0):
   unresolved pipeline failures · counselling requested · stuck interviews · interviews terminated (7d) · unlocked without payment · failed payments (7d).
2. **This week**: new candidates · interviews completed · revenue this month · active recruiters.
3. Link "See all insights →".

### Candidate detail — new

- Header strip: name, email, current stage badge, roles applied, total paid, last active, flags (banned / pending deletion / duplicate suspected).
- Tabs: **Summary** (profile + per-role status table) · Reports · References · Recruiter visibility · Payments & activity · **Admin actions** (notify, profile override, ban/delete/merge — danger zone last).

### Copy rules for every page

- `h2` title + one plain sentence: what this is, when to act.
- No raw JSON; human labels for actions ("Interview score overridden 62 → 70").
- Every email/name links to candidate or recruiter page.
- Empty state says what "good" means.

## Phased plan

| Phase | Work | Size |
|---|---|---|
| 1 | Fix H7 histogram; regroup sidebar (H1); add title + subtitle to every page (H5); fix M5 label | Small |
| 2 | New Home "Needs attention" + "This week"; move current Overview to `/admin/insights` (H2, H3) | Medium |
| 3 | Candidate detail header strip + tab reorder, danger zone last (H4); candidates list filters (M1) | Medium |
| 4 | Humanize logs/JSON (H6, M4); Reports tab admin action bar (M2) | Medium |
| 5 | Merge recruiter pages into tabs (M6, M7, M9); payments tabs + links (M3); counselling columns (M8); lows | Medium |

Not checked: live UI in browser, real data volumes, mobile rendering. Run a browser pass on Phase 1 output before Phase 2.
