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
| 1-hour mentoring session | ₹2,999 | — | ✓ |
| Application assistance (3 companies) | — | — | ✓ (manual, offline) |
| Shareable profile | — | ✓ | ✓ |

Plan prices are flat (no level split). After buying a plan, extras use normal prices (4th role report ₹299, reference refresh ₹149). An allowlisted user who already bought something individually before being allowlisted gets no credit.

## Entitlements

- Plans never expire. Each feature single-use: 1 interview, 3 role reports, 1 personality test, 1 reference round, 1 mentoring session (Plan 2).
- 3 role reports = 3 report credits spent on any 3 roles the candidate checks.
- Plan 2 mentoring uses the existing counselling flow (`counselling_requests` row + Calendly + admin queue).
- Application assistance: **not built.** Plan 2 card line only. Merito team refers the candidate to 3 dream companies through its own network, by phone/email. Ops finds Plan 2 buyers via the existing admin payments page. Copy says "we refer you" — no interview/offer guarantee.

## AI interview

- Plan interview is always 45 min (skill cap 10, `lib/intervuebox/jobs.ts:77`), regardless of level.
- Normal users unchanged: `durationForLevel` (`lib/intervuebox/agents.ts:34`) — 45 senior, 30 entry/mid.
- The plan's interview entitlement carries a 45-min override into job creation.

## Personality + culture assessment (replaces current test for all users)

Content upgrade, independent of pricing: everyone gets the new test; normal users still pay ₹299 for it.

Source: `D:\Work-Projects\staff-assessment-platform\backend\apps\psychometrics` (Django). Port item bank + scoring maths to TypeScript; Django/tenant/ReportLab code is not reused.

- **Part 1 — Personality:** 60 IPIP Big Five items (12/trait, 6 reverse-keyed) + 5 impression-management items, 1–5 Likert (`seed_data.py` `PERSONALITY_ITEMS`, `PERSONALITY_IM`, `PERSONALITY_PAIRS`). Scoring per `scoring.py` `score_personality`: keyed mean → 0–100, min 6/12 answered per trait, response-quality flags.
- **Part 2 — Culture:** 36 Competing Values items (9 per type: Clan, Adhocracy, Market, Hierarchy; 3 reverse-keyed) + 3 attention checks, 1–7 Likert (`seed_data.py` `CULTURE_ITEMS`). Scoring per `_culture_levels`: each type independent 0–100; attention checks set `reliable`.
- One assessment, two parts; progress saved between parts. No 15-min timer.
- **No company/benchmark fit score.** Candidate sees culture mix + org types that typically suit it (fixed text mapping below).
- Existing personality results stay viewable as the old version; new takers get the new version (results carry a version).

Draft culture → org-type mapping (copy only, needs expert sign-off):
- Clan (team/family): NGO/social sector, family business/SME, academia, hospitals
- Adhocracy (innovative): startups, product/tech companies, R&D
- Market (results-driven): sales-led corporates, consulting, MNCs
- Hierarchy (structured): government/PSU, banks/BFSI, manufacturing, IT services

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

- Culture fit % per org type (benchmarks) once real candidate data exists.
- Plans for all users / new individual prices for everyone (option 2, rejected 2026-11-10).
- Upgrade credit for earlier individual purchases.
- In-app application-assistance workflow (request form + admin queue).
- Allowlist expiry / per-seminar batches.
- Expert validation of culture items and org-type mapping.
