# Hub locked-state redesign: sample reports, direct routing, expert LinkedIn

Date: 2026-09-17
Status: Approved design, not yet implemented

## Problem

Three separate gaps in the candidate hub:

1. **Dashboard feature cards interrupt.** The four cards in `ProgressRail` (fitment report,
   personality test, reference checks, mock interview) open a paywall modal when locked. The
   candidate gets a price before they get context. Each feature already has a page with a locked
   state that explains the product properly — the modal short-circuits it.

2. **Locked states hide the product behind blur.** `PersonalityLockedState`, `InterviewLockedState`,
   `ReferencesLockedState` and `ReportLockedState` each end with a small blurred preview block. Blur
   signals "something exists" but proves nothing. A candidate cannot tell what they are buying.

3. **Locked-state copy describes features, not outcomes.** Current copy explains what the test does
   ("A Big Five (OCEAN) assessment mapping how you think, work and relate to others"). It does not
   say why that changes anything for someone who is job hunting.

Plus: the expert guidance page has no link to the expert's LinkedIn, so his credentials cannot be
independently checked.

## Goals

- Locked feature cards route to their own page instead of popping a modal.
- Replace every blurred preview with a real, readable sample report built from the same components
  the paid product renders.
- Rewrite locked-state copy from the candidate's point of view: the problem they have, and what
  changes in their job search after buying.
- Add the expert's LinkedIn to the expert guidance page.

## Non-goals

- No change to pricing, payment flow, or the paywall modals themselves.
- No change to the unlocked (paid) report pages.
- No new sample-report route or shareable sample page. Samples live inside the locked states.
- `BundlePromoCard` keeps its modal — it sells a bundle, not a single feature, so it has no page to
  route to.

## Design

### 1. Card routing

`app/hub/account/ProgressRail.tsx` — every pill gets an `href` unconditionally; the `onClick` field
and the four `onOpen*` props are removed from the `Pill` type and the component signature.

| Pill | href when locked |
|---|---|
| Fitment report | `/hub/account/report?lead=<leadId>` |
| Personality | `/hub/account/personality?role=<roleTitle>` |
| References | `/hub/account/references` |
| Mock interview | `/hub/account/interview?lead=<leadId>` |

Each of those pages already renders its locked state when the product is not unlocked, and each
locked state already owns its own paywall modal. So the modal still exists — it just opens from the
feature page's CTA, after the candidate has seen the sample, instead of from the dashboard.

`StatusPill` loses its `<button>` branch; every pill renders as a `Link`.

`app/hub/account/DashboardClient.tsx` — remove the `personality`, `references` and `interview` cases
from the `modal` union along with their JSX branches, and drop the now-unused imports
(`PersonalityPaywallModal`, `ReferencesPaywallModal`, `InterviewPaywallModal`). The `report` case
and `ReportPaywallModal` stay: `BundlePromoCard` opens them via `setModal("report")`. That modal's
`onUnlocked` handler is unchanged, including its bundle-unlock side effects.

### 2. Expert LinkedIn

`app/hub/account/expert/page.tsx` — the bio card's name line becomes a flex row: `{NAME}` followed
by a `Linkedin` icon from lucide (15px, `text-white/40`, hover `#0A66C2`) wrapped in an anchor to
`https://www.linkedin.com/in/humbe/` with `target="_blank" rel="noopener noreferrer"` and an
`aria-label` naming the expert. No other layout change to that card.

### 3. Locked-state structure

All four locked states converge on one order:

```
[icon]  Feature name                              ₹price
        Hook — the candidate's problem, one line

WHY THIS MATTERS
  three job-market impact points

SAMPLE REPORT ─────────────────────────────
  real components, fixture data, cropped to ~60%
  ↓ gradient fade
  [ Start my <feature> for ₹price ]

ALSO INCLUDED
  the sections hidden behind the fade, listed

HOW IT WORKS
  the existing three steps, demoted to the bottom
```

The "how it works" steps and the price badge are kept from the current implementation. The blurred
preview block at the bottom of each file is deleted outright — no blur survives anywhere in these
four components.

### 4. `SamplePreviewFrame`

New shared component: `app/hub/account/SamplePreviewFrame.tsx`.

Props:

- `cropHeight: number` — max pixel height of the sample body before the fade.
- `alsoIncluded: string[]` — labels of the withheld sections.
- `cta: ReactNode` — the existing per-feature paywall button.
- `children: ReactNode` — the sample body.

Renders:

- A header strip labelled `SAMPLE REPORT` with a secondary line "Sample data — not your results",
  so a candidate can never mistake the fixture for their own report.
- The sample body inside a container with `maxHeight: cropHeight`, `overflow: hidden`, and
  `pointerEvents: "none"` on the body (the sample is a picture, not an interactive surface).
- An absolutely positioned gradient from transparent to the card background over the bottom ~140px,
  with the CTA sitting inside it.
- The `alsoIncluded` list below the fade, each line prefixed with a lock glyph.

Also `aria-hidden` on the sample body: screen readers get the "also included" list and the CTA,
not a fictional candidate's scores read aloud as if they were the user's.

### 5. Sample fixtures

New directory `lib/sampleReports/` with one file per product, each exporting a typed constant:

| File | Type it satisfies |
|---|---|
| `fitment.ts` | `ResumeMatchReportReady` / `ResumeMatchCategory` from `lib/intervuebox/reports.ts` |
| `personality.ts` | `Scores` and `Validity` from `lib/personality.ts` |
| `interview.ts` | `InterviewReportReady` from `lib/intervuebox/interviewReports.ts` |
| `references.ts` | `RefereeRow[]`, passed through the real `computeReferenceReport` from `lib/referenceChecks.ts` |

Typing the fixtures against the production types is the sync mechanism: if a report's shape changes,
`tsc` fails on the fixture rather than the sample silently going stale.

The reference fixture deliberately stores raw `RefereeRow[]` and runs it through the real
`computeReferenceReport`, so the sample's category averages are computed by production code rather
than hand-written.

**Persona.** One fictional candidate across all four samples: **Ananya Iyer, Product Analyst**.
Referee names in the reference sample are fictional too. No data is copied from the real exported
PDFs used as tone reference — no real candidate names, emails, employers, or verbatim narrative.
Narrative text in the fixtures is written fresh, matching the structure and register of real output
(assessment summary, "what it measures" / "at work" trait prose, AI overview, SWOT evaluator notes).

### 6. Sample bodies

One component per product, e.g. `app/hub/account/report/SampleFitmentReport.tsx`, composing the
existing pure presentational components with fixture data. Confirmed prop-driven and side-effect
free:

- `ResumeMatchGauge({ percent })`, `ResumeMatchCategoryCard({ category })`
- `InterviewScoreGauge({ score })`, `ParameterScoreTile({ skill, score })`,
  `SkillDistribution({ skillReport })`
- `ReferenceScoreGauge({ score })`
- Personality trait bars: the trait-row markup plus `TRAIT_NAME` / `TRAIT_MEANING` /
  `TRAIT_WORK_IMPLICATION` / `traitLevel` from `lib/personality.ts`

Interactive shells are excluded from sample bodies: no `ExportPreviewButton`, no `ReferencesClient`
forms, no status pollers, no fetches.

**Crop contents** — what is visible above the fade, and what the "also included" list names:

| Product | Visible | Withheld |
|---|---|---|
| Fitment | overall gauge + match band, assessment summary, 3 of 6 dimension cards | remaining 3 dimensions, strong points, weak points |
| Personality | all 5 trait bars with percent and band, first trait card in full | the other 4 trait cards, response-validity checks |
| Interview | overall score, 5 parameter tiles, skill gauge with distribution counts, AI overview | skill-wise evaluation table, strengths and gaps, 3-phase roadmap, evaluator notes |
| References | overall gauge, 2 referee quote cards, 3 of 7 category rows | remaining 4 categories, remaining referee quotes |

The interview roadmap is withheld deliberately — it is the densest, most actionable block in that
report and therefore the strongest reason to buy.

### 7. Copy

Each locked state gets a hook line and three "why this matters" points, written from the candidate's
position in a job search rather than from the product's feature list. No invented statistics.

**Fitment report** — Hook: "You keep applying and hearing nothing back, and nobody tells you why."
Points: (a) scores your profile against this specific job description across six dimensions, so the
gap stops being a guess; (b) names your weak points in the recruiter's language, not yours; (c) tells
you which two things to fix before the next application, ranked.

**Personality test** — Hook: "Your technical rounds go fine. You still don't get picked."
Points: (a) behavioural rounds decide most offers, and they test something a resume cannot show;
(b) gives you evidence-backed language for how you work, so "tell me about yourself" stops being
adjectives; (c) flags the watch-outs an interviewer will probe, before they probe them.

**Mock interview** — Hook: "You've never been interviewed at this level, and the first attempt will
be a real one."
Points: (a) burns your first attempt somewhere it costs nothing; (b) scores you question by question
so you know which answers would have lost the offer; (c) hands you a phased roadmap — what to study,
in what order, with what resources.

**Reference checks** — Hook: "Your references are a black box that opens at the worst possible
moment."
Points: (a) collects and verifies references up front, so trust stops being the thing that stalls an
offer; (b) shows you what your referees actually say while there is still time to act on it;
(c) lets you arrive with references already done, which most candidates cannot.

## Files

**New**
- `app/hub/account/SamplePreviewFrame.tsx`
- `lib/sampleReports/{fitment,personality,interview,references}.ts`
- `app/hub/account/report/SampleFitmentReport.tsx`
- `app/hub/account/personality/SamplePersonalityReport.tsx`
- `app/hub/account/interview/SampleInterviewReport.tsx`
- `app/hub/account/references/SampleReferenceReport.tsx`

**Modified**
- `app/hub/account/ProgressRail.tsx` — hrefs always, drop onClick and the four paywall props
- `app/hub/account/DashboardClient.tsx` — drop 3 modal branches and imports, keep report modal
- `app/hub/account/expert/page.tsx` — LinkedIn icon link
- `app/hub/account/report/ReportLockedState.tsx`
- `app/hub/account/personality/PersonalityLockedState.tsx`
- `app/hub/account/interview/InterviewLockedState.tsx`
- `app/hub/account/references/ReferencesLockedState.tsx`

## Verification

Type-level sync is enforced by `tsc`, but rendering is not, so the samples must be checked in a
browser rather than assumed:

1. `npm run build` — catches fixture/type drift and any unused-import fallout from the dashboard
   edits. (`tsc` alone has previously passed while the production build failed.)
2. Dev server: for each of the four features, visit the page as a candidate who has not purchased it
   and confirm the sample renders, the fade sits flush against the card background, the CTA is
   readable over the fade, and no interactive control inside the sample responds to clicks.
3. From the dashboard, click each of the four locked cards and confirm it navigates rather than
   opening a modal. Then confirm the CTA on each page still opens the correct paywall modal.
4. Confirm `BundlePromoCard` still opens the report paywall modal.
5. Confirm the expert LinkedIn link opens `https://www.linkedin.com/in/humbe/` in a new tab.
6. Check the four locked pages at mobile width — the crop heights are fixed pixel values and need to
   be sane on a narrow column, where the same content is taller.

## Risks

- **Crop height is content-dependent.** A fixed `cropHeight` that cuts cleanly on desktop may cut
  mid-word on mobile. Mitigation: the fade is tall enough (~140px) that a mid-element cut reads as
  intentional, and step 6 above checks it.
- **Sample mistaken for the candidate's own report.** Mitigation: the "Sample data — not your
  results" line in the frame header, and `aria-hidden` on the body.
- **Fixture narrative drifting from real output tone.** The fixtures are written from four real
  exports as reference, but the underlying LLM prompts can change. This is accepted: the structure
  stays correct via types, and the prose is illustrative.
