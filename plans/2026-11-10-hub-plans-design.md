# Hub Plans (Assess + Prepare / Assess + Mentor + Apply) — Design

**Date:** 2026-11-10 · **Status:** approved in chat, awaiting spec review · **Owner:** PM (Claude) / Roshan RK

## Goal

Sell two fixed-price plans to **selected users only** (e.g. Merito Hub seminar attendees), via an admin-managed email allowlist. One payment unlocks a set of features. Everyone else keeps today's pricing, unchanged.

## Who sees plans: email allowlist

- New table `plan_allowlist` (email unique, lowercased; added_by; added_at; note e.g. "Pune seminar 2026-11").
- Admin page: paste a list of emails (one per line / comma separated), see the list, remove an email.
- A logged-in user whose auth email is on the list sees plans. Works for existing accounts and accounts created later. Access is tied to email, not a link, so revisits are safe and friends can't use it.
- Removing an email after purchase does not revoke what was bought.

## Pricing

**Normal users: no change.** `lib/razorpay/pricing.ts` stays as is (level-based; report/personality/references ₹299; interview ₹999 / ₹1,499; counselling ₹1,999 / ₹2,999; ₹749 bundle; ₹149 reference refresh).

**Allowlisted users** see only the two plans on pricing surfaces (no individual module purchases until they buy a plan). Plan card shows the value breakdown from the seminar table:

| Module | Value shown | Plan 1 — Assess + Prepare ₹2,996 | Plan 2 — Assess + Mentor + Apply ₹5,995 |
|---|---|---|---|
| CV analysis with detailed report (3 roles) | ₹499 | ✓ | ✓ |
| Personality + culture assessment | ₹499 | ✓ | ✓ |
| Mock AI interview (45 min) | ₹1,499 | ✓ | ✓ |
| References module | ₹499 | ✓ | ✓ |
| Mentoring: 1 hour as two 30-min sessions | ₹2,999 | — | ✓ |
| Application assistance (3 companies) | — | — | ✓ (manual, offline) |
| Shareable profile | — | ✓ | ✓ |

Plan prices are flat (no level split). After buying a plan, extras: 4th+ role report ₹299 (normal price); re-reference report (the "reference refresh") ₹299 for plan holders incl. upgraded (PM 2026-11-11), while normal users stay ₹149 pending PM. Rule: `referenceRefreshPricePaise(planHolder)` in `lib/razorpay/pricing.ts`, used by the initiate route (server amount), restart route and references page; repricing normal users is a one-constant change (`REFERENCE_REFRESH_PRICE_PAISE`). An allowlisted user who already bought something individually before being allowlisted gets no credit.

## Entitlements

- Plans never expire. Each feature single-use: 1 interview, 3 role reports, 1 personality test, 1 reference round, 1 mentoring hour as two 30-min sessions (Plan 2).
- 3 role reports = 3 report credits spent on any 3 roles the candidate checks.
- Plan 2 mentoring uses the existing counselling flow (`counselling_requests` row + Calendly + admin queue).
- Application assistance: **not built.** Plan 2 card line only. Merito team refers the candidate to 3 dream companies through its own network, by phone/email. Ops finds Plan 2 buyers via the existing admin payments page. Copy says "we refer you" — no interview/offer guarantee.

## AI interview

- Plan interview is always 45 min (skill cap 10, `lib/intervuebox/jobs.ts:77`), regardless of level.
- Normal users unchanged: `durationForLevel` (`lib/intervuebox/agents.ts:34`) — 45 senior, 30 entry/mid.
- The plan's interview entitlement carries a 45-min override into job creation.
- IntervueBox charges the same per interview for 30 and 45 min (confirmed by user 2026-11-10) — no extra vendor cost.

## Personality + culture assessment (replaces current test for all users)

Content upgrade, independent of pricing: everyone gets the new test; normal users still pay ₹299 for it.

Source: `D:\Work-Projects\staff-assessment-platform\backend\apps\psychometrics` (Django). Port item bank + scoring maths to TypeScript; Django/tenant/ReportLab code is not reused.

- **Part 1 — Personality:** 60 IPIP Big Five items (12/trait, 6 reverse-keyed) + 5 impression-management items, 1–5 Likert (`seed_data.py` `PERSONALITY_ITEMS`, `PERSONALITY_IM`, `PERSONALITY_PAIRS`). Scoring per `scoring.py` `score_personality`: keyed mean → 0–100, min 6/12 answered per trait, response-quality flags.
- **Part 2 — Culture:** 36 Competing Values items (9 per type: Clan, Adhocracy, Market, Hierarchy; 3 reverse-keyed) + 3 attention checks, 1–7 Likert (`seed_data.py` `CULTURE_ITEMS`). Scoring per `_culture_levels`: each type independent 0–100; attention checks set `reliable`.
- One assessment, two parts; progress saved between parts. No 15-min timer.
- **Fit is scored against fixed Merito benchmarks** (below). No company ever fills a profile.
- Existing personality results stay viewable as the old version; new takers get the new version (results carry a version).

### Culture benchmarks (Merito estimate v1, set 2026-11-10)

Research summary: published CVF numbers by org type are thin and non-Indian; no India sector data found. Person–organisation fit predicts job satisfaction (ρ≈.44), commitment (ρ≈.51) and intent to quit (ρ≈−.35) (Kristof-Brown et al. 2005), weaker for actual turnover/performance. Benchmarks are therefore labelled "Merito estimate" and are a career signal, not a hiring screen.

Benchmarks (Clan / Adhocracy / Market / Hierarchy, ipsative, sum 100):

| Org type | C | A | M | H | Basis |
|---|---|---|---|---|---|
| Government / PSU | 25 | 18 | 20 | 37 | Public-sector studies (Croatia, Pakistan): hierarchy dominant — direction only |
| Hospital / healthcare | 31 | 21 | 23 | 25 | Croatian hospitals study — published numbers |
| Early-stage startup | 33 | 32 | 20 | 15 | Startup/scale-up studies: clan + adhocracy — weak |
| Product / tech company (scale-up) | 26 | 28 | 28 | 18 | Scale-up preference data — weak |
| Family business / SME | 36 | 22 | 18 | 24 | Family-business review: clan + adhocracy — weak–moderate |
| Sales / finance / consulting | 20 | 20 | 37 | 23 | Qualitative CVF descriptions — weak |
| IT services / MNC / manufacturing | 22 | 20 | 28 | 30 | Indian IT+manufacturing sample ≈ flat; shape is estimate — weak |

Sources: Kristof-Brown 2005 via https://onlinelibrary.wiley.com/doi/10.1111/peps.12581 · public sector https://www.emerald.com/ccsm/article/doi/10.1108/CCM-05-2013-0082/143150 · hospitals https://britishjournalofnursing.com/content/professional/analysis-of-the-organisational-culture-in-two-croatian-hospitals · family business https://revistas.ucm.es/index.php/CESE/en/article/view/53632 · India https://www.pbr.co.in/2019/jan11.aspx · Czech baseline https://doaj.org/article/ad618661163949ef9351935ecd8f1448

**Fit calculation** (our scores are independent 0–100, benchmarks are ipsative — compare shape, not level):
1. Candidate: subtract the candidate's own mean of the 4 type scores. Benchmark: subtract 25.
2. r = Pearson correlation of the two centred 4-value profiles (profile-correlation fit).
3. Fit % = round(50 + 50 × r).
4. Flat profile (SD of the 4 candidate scores < 8): no fit %, show "No strong preference — adaptable across cultures".
5. Show top 3 benchmarks by fit %; rest collapsed. If `reliable` = false (attention checks failed), show culture mix only, no fit %.

Thresholds (SD 8) are untested — recalibrate once real Merito data exists.

**Candidate-facing caveats (must appear in report):** typical patterns only — teams inside one company vary more than industries do; fit modestly predicts satisfaction, weakly predicts turnover/performance; benchmarks are Merito estimates from small or non-Indian samples; this is a preference, not ability, and not a hiring screen; most people prefer collaborative (Clan) cultures, so a high Clan score is common.

## Report

One combined report: Big Five traits → strengths & development areas → culture mix → suitable org types → self-development note. Labelled self-development (source docs: "not for hiring/promotion"). Available in Hub and existing PDF export.

**Shareable profile:** shows personality summary and culture mix, labelled "self-reported preferences, for development". Candidate controls sharing as today.

## Approach

Chosen: **extend the existing bundle pattern.** Two new products (`plan_prepare`, `plan_mentor`), purchasable only if the user's email is on `plan_allowlist` (checked server-side in order creation, not just hidden in UI). `finalize.ts` (applies `bundle` at :96-110) applies plan grants: personality + references `product_unlocks`, 3 report credits, a 45-min interview entitlement accepted by `start-ai-interview` (today it looks for an unconsumed `interview` transaction, :98-120), and for Plan 2 a `counselling_requests` row. Refund path (`finalize.ts` ~:200) reverses the same grants. Admin grant (`grantFreeAccess`) accepts plan keys.

Rejected: generic entitlements table rewrite — bigger blast radius across all unlock checks for no user-visible gain now. Rejected for access: seminar link (forwardable), one-time codes (more build, codes get shared).

## UI touchpoints

Pricing: `app/hub/account/pricing/pricingCatalog.ts`, `BundlePromoCard.tsx`, `PriceOptionTiles.tsx` (branch on allowlist). Public `app/hub/PricingSection.tsx` unchanged (anonymous visitors = normal pricing). Personality pages `app/hub/account/personality/*`. Share page `/hub/share/<token>`. New admin allowlist page under `app/admin/`.

## Testing

- Unit: ported scoring matches Python on fixed answer fixtures (golden values from `scoring.py`).
- Allowlist: non-listed user cannot create a plan order (server rejects); email match is case-insensitive.
- Finalize: plan purchase grants exactly the listed entitlements; refund reverses; verify/webhook/reconcile paths idempotent.
- Interview: plan buyer gets 45 min at any level, one start only; normal entry user still 30 min.
- Report credits: 3 unlocks consumed, 4th prompts ₹299.

## Deferred (nice to have)

- Recalibrate benchmarks + flat-profile threshold on real Merito data; norm against Merito population so high Clan doesn't over-match family business.
- Buy Cameron & Quinn "Diagnosing and Changing Organizational Culture" (Fig 4.4/4.6 industry averages) to upgrade benchmark numbers.
- Plans for all users / new individual prices for everyone (option 2, rejected 2026-11-10).
- Upgrade credit for earlier individual purchases.
- In-app application-assistance workflow (request form + admin queue).
- Allowlist expiry / per-seminar batches.
- Expert validation of culture items and org-type mapping.

## Mentoring (2026-11-11)

PM decision: Plan 2's "1-hour mentoring" is delivered as TWO 30-minute sessions on the existing 30-min Calendly event: a first session, then a follow-up.

- Model: `counselling_requests.session` (1 = first, 2 = follow-up), unique `(order_id, session)` (migration 0072). Plan 2 purchase, upgrade and admin plan grant all go through `applyPlanGrants`, which upserts both rows with `ignoreDuplicates` (idempotent across verify/webhook/reconcile). Standalone counselling stays one row (session 1); its finalize insert is now an upsert too, so a verify/webhook race can't double-insert.
- Gating (`mentoringSessions`, lib/planPanel.ts): session 1 bookable while `requested`; the follow-up becomes bookable once session 1 is `scheduled` or `completed` (admin sets both in the existing queue). Only the open session shows the Calendly link on `/hub/account/expert`.
- Panel step 5 "Mentoring (two 30-min sessions)": "Session 1: <state>" / "Follow-up: <state>", action Book session 1 / Book follow-up / View. Mentoring is done (and loses the "Next step" marker) only when BOTH are completed.
- Admin queue: "Session" column ("Session 1 of 2" / "Follow-up (2 of 2)") for plan orders; standalone counselling unlabelled.
- Refund (Plan 2 or upgrade): every `requested` or `scheduled` session of the order is cancelled; a `completed` one is kept as history. Scheduled is cancelled (entitlement gone); ops contacts the user about the booked Calendly slot.
- Legacy: orders from before 0072 had one row. 0072 backfills the follow-up for successful `plan_mentor` / `plan_upgrade_mentor` orders, a plan-grant replay adds it too, and the reader treats a missing row as `requested` (gated on session 1).

## Upgrade (2026-11-11)

PM decision (user-approved): Plan 1 holders can self-serve upgrade to Plan 2 for ₹2,999 (the difference). No downgrade.

- Product `plan_upgrade_mentor` (migration 0071), flat ₹2,999. Not a plan of its own (`isPlanProduct` false): it carries no interview, report or reference credit.
- Initiate: allowlisted AND effective plan is `plan_prepare`, else 403 (not allowlisted) / 409 (no plan, or already Plan 2). Fails closed (500) on lookup errors.
- Effective plan: `getPlanOrder` returns `plan_mentor` when a successful upgrade was paid at or after the live Plan 1 order. `orderId` stays the Plan 1 order (report credits, interview credit unchanged); `upgradeOrderId` holds the mentoring sessions. Everything keyed on the effective plan (table, panel, expert page, assistance row) follows.
- Finalize grants only the extras: both mentoring sessions (`counselling_requests` session 1 + 2) on the upgrade order. Application assistance is derived from the effective plan. Idempotent like other plan grants.
- Refund of the upgrade: cancels its open mentoring sessions (completed ones kept); effective plan reverts to Plan 1.
- Refund of Plan 1 while the upgrade is still paid: Plan 1 grants are reversed as usual and the user has no plan (an upgrade needs a live base). The upgrade's mentoring request is kept (paid separately) and a `console.error` asks ops to refund the upgrade too if intended. Nothing is auto-refunded.
- Admin grant accepts `plan_upgrade_mentor` (needs an active Plan 1); admin payments label "Plan upgrade".
- UI: Plan 1 holder sees "Upgrade for ₹2,999" in the Plan 2 column; dashboard panel Plan-2-only rows say "Upgrade to unlock for ₹2,999" (links to pricing). GTM event `plan_upgrade_purchase`.
- Welcome email ("Your Merito plan is active: <plan>") on every plan purchase and upgrade: table-wording benefits, numbered steps, "Start with step 1: check a role" link. Sent once per order (compare-and-set on the success flip, so verify/webhook races send one); send failures never fail finalize.
