# Hub login page polish

**Date:** 2026-09-16
**File touched:** `app/hub/login/page.tsx` (single file, no other routes/logic affected)

## Problem

`/hub/login` is a bare white card — no logo, flat background, generic heading — while the rest of the hub (dashboard, FitmentChecker) is visibly branded. Feels disconnected/generic against the rest of the product.

## Scope decision

Considered a split-screen branded-panel redesign; rejected as overkill for a single sign-in card — going with polish-in-place instead. No mechanism change: stays Supabase email-OTP ("magic link"), same `handleSubmit`, same `/hub/auth/callback` redirect flow.

## Changes

1. **Card header** — add Merito mark + red "HUB" pill badge above the heading (same visual language as `TopBar.tsx`'s logo lockup), so the card is self-evidently branded without relying on the nav above it.
2. **Background** — replace flat `#fdf8fb` with a subtle red-tinted radial glow behind the card (very light, decorative only — no interaction change).
3. **Button copy** — "Send magic link" → **"Send link"**. The explainer paragraph above the form already says "we'll send you a link to sign in — no password needed," so the button doesn't need to repeat "magic" jargon. Loading label stays "Sending…".
4. **Trust line** — add a small gray line under the button: "1000+ professionals placed · 100+ companies trust us" (existing site stats, no new data source).
5. **Sent state** — currently one plain sentence. Add a small icon (mail/checkmark) above "Check your inbox" as its own line, with the existing explanatory sentence below it, so success reads as a distinct confirmed state rather than swapped-in text.
6. **Error state** — unchanged.

## Out of scope

- No change to the auth mechanism, redirect allowlist, or `/hub/auth/callback`.
- No split-screen / two-column layout.
- No copy changes to the explainer paragraph itself.
