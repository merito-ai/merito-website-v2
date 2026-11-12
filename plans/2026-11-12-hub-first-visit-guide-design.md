# Hub first-visit guide (design)

## Scope (2026-11-12, user)
The new design applies ONLY to the empty dashboard when a user signs in directly and has NO role yet. Principle: "We are building on the gaps of existing UI UX": fill gaps in the current Hub with its existing components, tokens and patterns; no parallel new design.

In scope:
1. N1: normal user, no role: the mockup's "Normal · login first" screen (replaces "No fitment scores yet").
2. S1: allowlisted user, no plan, no role: the "Plan user · login first" screen + the shared plans popup opened by "Unlock plans" (popup only used from this screen; choosing a plan goes into the existing confirm dialog + Razorpay flow).
3. P1: plan holder, no role: the existing PlanPanel with its gaps fixed (no new timeline component): interview, references and shareable profile show a "Needs a role" state with no dead link; step 1 "Check a role" is the clear start ("Start here"); personality stays available ("You can do this anytime"); the heading explains that the interview and references are built around a role.
4. Bug fix: interview, references and consolidated-report pages with no role show a short message + "Check my fit for a role" (existing empty-state pattern) instead of silently redirecting to /hub/account.
5. One interview per plan: the existing InterviewPaywallModal confirm for plan users names the role, says it can't move to another role, offers "Switch role" (existing role switcher), says the 10 days start now. Plan-panel interview row copy "1 interview, for any one of your roles" and "Interview used for <role>" after use. The plan panel keeps its look otherwise.
6. Edge cases E3/E4 (view switches correctly for the no-role screens), E5, E12, E14, E15; no-repetition rules on these screens.

Out of scope (existing UI stays as is): N2/S2 form-first changes, welcome line, locked report preview, replacing ProgressRail with the timeline, restyling the plan panel for users with roles, replacing inline plan cards on the dashboard with a role, paywall modal changes, sidebar lock icons, renaming the fitment check everywhere, E1/E6-E11/E13/E16 UI changes.

Approved 2026-11-12. Mockup: `mockups/2026-11-12-hub-first-visit-guide.html` (v3, 4 tabs + phone toggle).

## Problem
A signed-in user with no role sees "No fitment scores yet / Head back to the HUB" (wrong: they are in the Hub) and one button. Users who used the public form first land on the dashboard with no welcome or next step. Allowlisted (plan) users see plan cards inline with no explanation.

## Cases (decided from data on each dashboard load; no tracking of how they arrived)
| Case | allowlisted | plan | has role | View |
|---|---|---|---|---|
| N1 normal, login first | no | - | no | Hero: "Welcome, {first name}. See how well you fit your next role." + what you need (CV, job description) + "Check my fit for a role" (existing fitment checker modal) + "See a sample report" + sample score card. Right: "How Merito works" timeline, 5 steps, Free/Paid tags, "See prices" link. |
| N2 normal, form first | no | - | yes | Slim dismissible welcome line. Score (ring, role, verdict). Locked report preview. "Unlock detailed report" + "Check another role". Right: "Your progress" timeline with progress bar, step 1 Done, step 2 Next. Existing dashboard continues below. |
| S1 allowlisted, login first | yes | no | no | Kicker "Exclusive plans unlocked for you". Hero "Welcome, {first name}. Everything you need to land your next role." "Unlock plans" (opens plans popup) + "Check a role first, free". Right: "What your plan includes" timeline, tags "All plans" / "Mentor + Apply". |
| S2 allowlisted, form first | yes | no | yes | Slim dismissible welcome line. Score + locked preview. "Unlock plans" (popup). Note "This report is 1 of the 3 included in every plan." Right: "Your progress" timeline, step 1 Done. |
| Plan holder | any | yes | any | New style (mockup tabs "Plan holder · no role yet" / "start interview"): plan badge + one primary next action + plan timeline (restyled plan panel). Existing dashboard content (score, reports, role switcher) continues below. Does not revert to the old look. |

A user later added to the allowlist moves to S1/S2 on next load automatically.

## Plans popup (replaces inline plan cards on the dashboard)
- "Unlock plans" opens a modal: title "Choose your plan", line "One-time payment. Start with Assess + Prepare and upgrade to Assess + Mentor + Apply anytime for ₹2,999.", two plan cards (name, one-line summary, price, feature list with icons, crossed-out items for the lower plan), top plan marked "Most complete", footer "Secure payment by Razorpay. You confirm before paying." + "Compare all features" link to the pricing page.
- Choosing a plan goes into the EXISTING confirm dialog and Razorpay flow (no new payment code). Plan data from `buildPlanCards()` / `lib/planFeatures.ts`.
- Phone: bottom sheet with grab handle. `role="dialog"`, `aria-modal="true"`, focus moves into it, Esc and outside click close, focus returns to the button, 44px close button.
- The full pricing page with the comparison table is unchanged.

## Rules
- Never "Plan 1" / "Plan 2" in user-facing copy: use "Assess + Prepare" and "Assess + Mentor + Apply"; tags "All plans" and "Mentor + Apply". Never "seminar".
- No em-dashes.
- First name: from the user's lead/profile name if known, else "Welcome to Merito HUB".
- Locked report preview: blurred lines are fixed placeholder text, never real report text or counts (blur is visual only; real text in the DOM would leak the paid report). Two states only: ready ("Your strengths, gaps and what to fix are ready"), pending ("Your detailed report is being prepared"), from `resume_match_status`.
- Welcome line (N2, S2): shows until dismissed (✕, remembered per browser in localStorage, wrapped in try/catch) or until the next step is done (report unlocked for N2, plan bought for S2).
- Timeline copy reuses `lib/planFeatures.ts` so it cannot drift from the pricing page.
- Phone (375px): stacked layout, sticky bottom main button, no horizontal scroll.
- Motion: short fade-up on load, off under `prefers-reduced-motion`.
- Match the Hub's dark look and existing components; no new design system.

## Testing
- Unit: a pure `firstVisitView({ allowlisted, plan, hasRole })` returning `n1 | n2 | s1 | s2 | plan`; locked-preview state from `resume_match_status`; copy has no em-dash, no "Plan 1/2", no "seminar".
- Browser: all 4 cases + plan holder, desktop and 375px; popup keyboard (Tab, Esc), confirm dialog opens from the popup; no real report text in the DOM for a locked report.

## Out of scope
Video, guided tour overlay, per-feature prices on the dashboard, changes to the fitment check form, DB-stored dismissal.

## Additions (2026-11-12, approved in conversation)

### Ripple changes to existing UI (same build)
1. The new timeline replaces the old dashboard progress list (ProgressRail) for everyone, every visit (one progress pattern).
2. Plan panel (plan holders) restyled to the timeline look (icons, rows, tags, "Next" marker). Same data (`buildPlanPanelRows`).
3. Dashboard with a role: inline plan cards for allowlisted no-plan users replaced by "Unlock plans" + the plans popup.
4. Feature paywall modals (report, personality, interview, references): allowlisted no-plan users get "Unlock plans" opening the same popup (instead of the plain plan-only notice).
5. Locked feature pages (personality, sample reports): allowlisted users see "Unlock plans", not single prices.
6. Sidebar: small lock icon on features not yet unlocked.
7. Empty feature pages with no role (interview, references, consolidated report): short guide + "Check my fit for a role" instead of a silent redirect to the dashboard.
8. One name for the fitment check everywhere: "Check my fit for a role".

### Paid but no role yet (gap found 2026-11-12)
Interview and references pages need a role and currently redirect silently to /hub/account, so plan-panel "Start" / "Invite referees" look broken after a pay-first purchase.
- Step 1 "Check a role", marker "Start here", line "Your interview and references are built around this role."
- Interview, references, shareable profile rows: "Needs a role first" + lock icon; action "Check a role".
- Personality row stays available: "You can do this anytime."
- Interview row: "Your 10 days start when you begin."

### One interview per plan, for one role
The plan includes 1 interview, for any one of the 3 roles; it cannot move to another role once started.
- Popup + timeline: "45-min AI interview for one of your roles".
- Plan panel interview row: "1 interview, for any one of your roles. Pick the role you care most about."
- Interview start confirmation: "This uses your plan's interview for <role>. You can't switch it to another role later. Want a different role? Switch roles first." + "Switch role" link (existing role switcher).
- After use: "Interview used for <role>."

### No repetition (rules for every Hub screen)
- One primary action per screen (hero button; sticky copy of it on phone only). Timeline rows carry actions only for secondary steps; the "Next" row has no second button for the same action.
- Each fact said once per screen: details live in the timeline row or the confirm dialog, not also in the hero.
- One greeting element per screen (kicker or welcome line, not both).
- Score shown once (ring); timeline rows show the role name, not the score again.
- Locked rows show a "Needs a role" tag only, no extra "Check a role" buttons.
- One shared plans popup and one shared confirm dialog, reused by every entry point.

### Edge cases (checked 2026-11-12)
| # | Case | Behaviour |
|---|---|---|
| E1 | Normal user who bought items one by one (report, interview, personality, references, old bundle) | Normal timeline reflects ownership per step: "Done" / "Unlocked" / "In progress" instead of "Paid". Paid tag only on steps not owned. |
| E2 | Allowlisted user who already owns items from earlier purchases | Plans popup as normal; the existing confirm dialog keeps its "You already have: ... not credited" note. |
| E3 | Plan refunded | Plan no longer active: allowlisted users go back to S1/S2, others to N1/N2. Already-completed results stay visible. |
| E4 | Removed from allowlist before buying | Normal view (N1/N2). After buying: keeps the plan view. |
| E5 | Upgrade bought (Assess + Prepare to Assess + Mentor + Apply) | Plan badge and timeline switch to the top plan; mentoring + assistance rows become active. |
| E6 | Interview link expired (past 10 days, not finished) | Interview row and page: "Your interview link expired" + "Email us" (admin can reinvite). No dead Start button. |
| E7 | Fitment report pending or failed | Locked preview: pending text; failed: "We couldn't prepare this report. Try checking the role again or email us." No unlock button while failed. |
| E8 | Plan holder used all 3 role reports | Step 1 row: "All 3 used · extra roles ₹299"; checking a 4th role uses the existing ₹299 flow. |
| E9 | Several roles | Timeline step 1: "N roles checked · X left". Current role comes from the existing role switcher. Interview row after use: "Interview used for <role>" even when another role is selected. |
| E10 | Personality: part 1 done / old v1 result | Row shows "Continue part 2" / "Take the updated test" (existing states). |
| E11 | Everything done | Timeline all Done; primary action becomes "Share my profile" (consolidated report). |
| E12 | Name unknown | "Welcome to Merito HUB" (no name). |
| E13 | Low score / weak verdict | Use the existing verdict label; lead copy stays encouraging ("Here's what to work on"), never "you failed". |
| E14 | Payment window closed or failed | Nothing granted; same screen; the existing error/cancel handling. |
| E15 | Phone, primary action is a popup (Unlock plans / Start interview) | Sticky button opens the same popup; popup is a bottom sheet. |
| E16 | Mentoring / assistance progress | Existing states (session 1 then follow-up; Not contacted / In progress / Done) in the restyled rows. |
