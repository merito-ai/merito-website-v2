# Hub Plans (Assess + Prepare / Assess + Mentor + Apply) — Design

**Date:** 2026-11-10 · **Status:** approved in chat, awaiting spec review · **Owner:** PM (Claude) / Roshan RK

## Goal

Sell two fixed-price plans to every Hub user (originally requested for seminar attendees; decided to open to all — no seminar tagging, no leak problem). One payment unlocks a set of features; individual purchases stay available.

## Pricing (flat, no entry/mid/senior split)

| Module | Individual | Plan 1 — Assess + Prepare ₹2,996 | Plan 2 — Assess + Mentor + Apply ₹5,995 |
|---|---|---|---|
| CV analysis report | ₹299 per role | 3 roles | 3 roles |
| Personality + culture assessment | ₹499 | ✓ | ✓ |
| Mock AI interview (45 min) | ₹1,499 | ✓ | ✓ |
| References module | ₹499 | ✓ | ✓ |
| 1-hour mentoring session | ₹2,999 | — | ✓ |
| Application assistance (3 companies) | — | — | ✓ (manual, offline) |
| Shareable profile | free | ✓ | ✓ |
| **Individual total** | | ₹3,394 (save ₹398) | ₹6,393 (save ₹398) |

Changes vs today (`lib/razorpay/pricing.ts`):
- personality ₹299 → ₹499; references ₹299 → ₹499; report stays ₹299.
- interview: ₹999 (30 min, entry/mid) / ₹1,499 (45 min, senior) → ₹1,499, 45 min, all levels.
- counselling: ₹1,999 / ₹2,999 by level → ₹2,999 all levels.
- level-based pricing removed; `candidate_level` no longer affects price.
- ₹749 "Full Profile Bundle" retired (Plan 1 replaces it). Existing bundle purchases keep working.
- ₹149 reference refresh unchanged.

## Entitlements

- Plans never expire. Each feature is single-use: 1 interview, 3 role reports, 1 personality test, 1 reference round, 1 mentoring session (Plan 2).
- No credit for earlier individual purchases; plan is full price.
- 3 role reports = 3 report credits the candidate spends on any 3 roles they check; a 4th role costs ₹299 as today.
- Plan 2 mentoring uses the existing counselling flow (`counselling_requests` row + Calendly + admin queue).
- Application assistance: **not built.** Listed on the Plan 2 card only. Merito team refers the candidate to 3 dream companies through its own network, handled by phone/email. Ops finds Plan 2 buyers via the existing admin payments page. Copy must say "we refer you" — no interview/offer guarantee.

## AI interview

All interviews (plan or individual) are 45 min: `durationForLevel` (`lib/intervuebox/agents.ts:34`) returns 45 for every level, so skill cap is 10 (`lib/intervuebox/jobs.ts:77`). Applies to new interviews only.

## Personality + culture assessment (replaces current test for all users)

Source: `D:\Work-Projects\staff-assessment-platform\backend\apps\psychometrics` (Django). Port item bank + scoring maths to TypeScript; Django/tenant/ReportLab code is not reused.

- **Part 1 — Personality:** 60 IPIP Big Five items (12/trait, 6 reverse-keyed) + 5 impression-management items, 1–5 Likert (`seed_data.py` `PERSONALITY_ITEMS`, `PERSONALITY_IM`, `PERSONALITY_PAIRS`). Scoring per `scoring.py` `score_personality`: keyed mean → 0–100, min 6/12 answered per trait, response-quality flags.
- **Part 2 — Culture:** 36 Competing Values items (9 per type: Clan, Adhocracy, Market, Hierarchy; 3 reverse-keyed) + 3 attention checks, 1–7 Likert (`seed_data.py` `CULTURE_ITEMS`). Scoring per `_culture_levels`: each type independent 0–100; attention checks set `reliable`.
- One assessment, two parts; progress saved between parts.
- **No company/benchmark fit score.** Candidate sees culture mix + which org types typically suit it (fixed text mapping below). No 15-min timer (staff-platform timing rule not ported).
- Existing personality results stay viewable as the old version; new takers get the new version (results carry a version).

Draft culture → org-type mapping (needs expert sign-off, copy only):
- Clan (team/family): NGO/social sector, family business/SME, academia, hospitals
- Adhocracy (innovative): startups, product/tech companies, R&D
- Market (results-driven): sales-led corporates, consulting, MNCs
- Hierarchy (structured): government/PSU, banks/BFSI, manufacturing, IT services

## Report

One combined report: Big Five traits → strengths & development areas → culture mix → suitable org types → self-development note. Labelled self-development (source docs: "not for hiring/promotion"). Available in Hub and existing PDF export.

**Shareable profile:** shows personality summary and culture mix, labelled "self-reported preferences, for development". Candidate controls sharing as today.

## Approach

Chosen: **extend the existing bundle pattern.** Two new products (`plan_prepare`, `plan_mentor`) in pricing; `finalize.ts` (today applies `bundle` at :96-110) applies plan grants: personality + references `product_unlocks`, 3 report credits, an interview entitlement accepted by `start-ai-interview` (today it looks for an unconsumed `interview` transaction, :98-120), and for Plan 2 a `counselling_requests` row. Refund path (`finalize.ts` ~:200) reverses the same grants. Admin grant (`grantFreeAccess`) accepts plan keys.

Rejected: a generic entitlements table rewrite — bigger blast radius across all unlock checks for no user-visible gain now.

## UI touchpoints

`app/hub/account/pricing/pricingCatalog.ts`, `BundlePromoCard.tsx`, `PriceOptionTiles.tsx`, public `app/hub/PricingSection.tsx`, personality pages `app/hub/account/personality/*`, share page `/hub/share/<token>`.

## Testing

- Unit: ported scoring matches Python on fixed answer fixtures (golden values computed from `scoring.py`).
- Finalize: plan purchase grants exactly the listed entitlements; refund reverses; verify/webhook/reconcile paths are idempotent.
- Interview: plan buyer starts one 45-min interview; second start is blocked.
- Report credits: 3 unlocks consumed, 4th prompts ₹299.

## Deferred (nice to have)

- Culture fit % per org type (benchmarks) once real candidate data exists.
- Seminar-only pricing / attendee tagging (dropped; plans open to all).
- Upgrade credit for earlier individual purchases.
- In-app application-assistance workflow (request form + admin queue).
- Expert validation of culture items and org-type mapping.
