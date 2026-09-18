# Hub Locked-State Sample Reports Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the blurred previews on the four locked hub feature pages with real, readable report previews, route dashboard feature cards to those pages instead of a paywall modal, and add the expert's LinkedIn link.

**Architecture:** Two new shared presentational components (`LockedFeatureLayout`, `SamplePreviewFrame`) own the locked-card structure and the crop/fade/CTA mechanic. Four sample bodies compose the existing production report components with fixture data typed against production types, so `tsc` breaks if a report shape drifts. Fitment is special-cased to render the candidate's own already-generated report rather than a fixture.

**Tech Stack:** Next.js (App Router), React 19, TypeScript, Tailwind + inline styles, lucide-react icons, vitest (node environment).

Design spec: `plans/2026-09-17-hub-locked-state-sample-reports-design.md`

## Global Constraints

- **Read `node_modules/next/dist/docs/` before writing Next.js-specific code.** This repo's Next.js version has breaking changes from older conventions (per `AGENTS.md`).
- **Test runner is vitest in `environment: "node"`, and `include` is `["**/*.test.ts"]` only.** There is no React Testing Library, no jsdom. `.tsx` files cannot be unit tested here. Tests in this plan therefore cover fixture data and pure functions only; component rendering is verified by `npm run build` plus browser checks.
- **Commit with `git commit --only <paths>`, never bare `git commit`.** This repo has long-lived pre-staged unrelated files that must not be swept into a commit.
- **Run `npm run build`, not just `tsc`.** Type-checking alone has previously passed while the production build failed.
- **No real candidate data in fixtures.** Fictional persona is **Ananya Iyer, Product Analyst**. Do not copy names, emails, employers, or verbatim narrative from any real report.
- **No invented statistics in marketing copy.** Qualitative claims only.
- **Dark theme tokens:** card background `#141416`, card border `rgba(255,255,255,0.08)`, accent `#ed1a24`. Fonts are referenced as `font-[family-name:var(--font-poppins)]` and `font-[family-name:var(--font-gabarito)]`.
- **Every commit message ends with:** `Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>`

---

### Task 1: Route dashboard feature cards to their pages

**Files:**
- Modify: `app/hub/account/ProgressRail.tsx`
- Modify: `app/hub/account/DashboardClient.tsx`

**Interfaces:**
- Consumes: nothing from earlier tasks.
- Produces: `ProgressRail` no longer accepts `onOpenReportPaywall`, `onOpenPersonalityPaywall`, `onOpenReferencesPaywall`, `onOpenInterviewStart`. Its remaining props are unchanged: `reportUnlocked`, `interviewStatus`, `referenceCheckStatus`, `personalityStatus`, `personalityUnlocked`, `referencesUnlocked`, `roleTitle`, `leadId`.

- [ ] **Step 1: Remove the paywall props from the `ProgressRail` signature**

In `app/hub/account/ProgressRail.tsx`, delete these four lines from the destructured parameter list and the four matching lines from the type literal below it:

```tsx
  onOpenReportPaywall,
  onOpenPersonalityPaywall,
  onOpenReferencesPaywall,
  onOpenInterviewStart,
```

```tsx
  onOpenReportPaywall: () => void;
  onOpenPersonalityPaywall: () => void;
  onOpenReferencesPaywall: () => void;
  onOpenInterviewStart: () => void;
```

- [ ] **Step 2: Drop `onClick` from the `Pill` type**

Replace the `Pill` type with:

```tsx
type Pill = {
  key: string;
  label: string;
  icon: ComponentType<{ size?: number; strokeWidth?: number }>;
  state: PillState;
  statusText: string;
  pulse?: boolean;
  href: string;
};
```

- [ ] **Step 3: Give every pill an unconditional href**

Replace the whole `const pills: Pill[] = [...]` array with:

```tsx
  const pills: Pill[] = [
    {
      key: "report",
      label: "Fitment report",
      icon: FileText,
      state: reportUnlocked ? "done" : "locked",
      statusText: reportUnlocked ? "Unlocked" : "Not started",
      href: `/hub/account/report?lead=${encodeURIComponent(leadId)}`,
    },
    {
      key: "personality",
      label: "Personality test",
      icon: Brain,
      state: personalityStatus === "ready" ? "done" : personalityUnlocked ? "active" : "locked",
      statusText: personalityStatus === "ready" ? "Ready" : personalityUnlocked ? "Start test" : "Not started",
      href: `/hub/account/personality?role=${encodeURIComponent(roleTitle)}`,
    },
    {
      key: "references",
      label: "Reference checks",
      icon: Users,
      state: referencesDone ? "done" : referencesUnlocked ? "active" : "locked",
      statusText: referencesDone ? "Completed" : referenceCheckStatus === "in_progress" ? "In progress" : referencesUnlocked ? "Start" : "Not started",
      href: "/hub/account/references",
    },
    {
      key: "interview",
      label: "Mock interview",
      icon: Mic,
      state:
        interviewStatus === "ready"
          ? "done"
          : interviewStatus === "invited" || interviewStatus === "processing" || interviewStatus === "terminated" || interviewStatus === "stuck"
            ? "active"
            : "locked",
      statusText:
        interviewStatus === "ready"
          ? "Ready"
          : interviewStatus === "stuck"
            ? "Needs help"
            : interviewStatus === "terminated"
              ? "Interrupted"
              : interviewStatus === "processing"
                ? "Scoring…"
                : interviewStatus === "invited"
                  ? "Invited"
                  : "Not started",
      // No pulse for "stuck" -- unlike invited/processing/terminated, nothing
      // is pending on the vendor side; the row won't self-resolve without an
      // admin, so an animated "waiting" dot would be misleading.
      pulse: interviewStatus === "invited" || interviewStatus === "processing" || interviewStatus === "terminated",
      href: `/hub/account/interview?lead=${encodeURIComponent(leadId)}`,
    },
  ];
```

- [ ] **Step 4: Collapse `StatusPill` to a single `Link` branch**

Replace everything from `const style: CSSProperties = {` to the end of `StatusPill` with:

```tsx
  const style: CSSProperties = {
    borderRadius: 14,
    padding: "16px 16px",
    display: "block",
    textDecoration: "none",
    cursor: "pointer",
  };

  return (
    <Link
      data-tour={`pill-${pill.key}`}
      href={pill.href}
      className="bg-[#141416] border border-white/[0.08] hover:border-white/[0.16] transition-colors"
      style={style}
    >
      <div
        className="flex items-center justify-center bg-[#ed1a24]/12 text-[#ed1a24]"
        style={{ width: 32, height: 32, borderRadius: 9, marginBottom: 12 }}
      >
        <Icon size={16} strokeWidth={2} />
      </div>
      <p className="font-[family-name:var(--font-poppins)] font-semibold text-white" style={{ fontSize: 13.5, margin: "0 0 8px" }}>
        {pill.label}
      </p>
      {badge}
    </Link>
  );
```

Delete the now-unused `const content = (...)` block and the `ReactNode` import if nothing else in the file uses it (`badge` is typed `ReactNode`, so it stays).

- [ ] **Step 5: Strip the three dead modals from `DashboardClient`**

In `app/hub/account/DashboardClient.tsx`:

Remove these three imports:

```tsx
import PersonalityPaywallModal from "./PersonalityPaywallModal";
import ReferencesPaywallModal from "./ReferencesPaywallModal";
import InterviewPaywallModal from "./InterviewPaywallModal";
```

Narrow the modal state union:

```tsx
  const [modal, setModal] = useState<"none" | "report" | "generate" | "counselling" | "tour">("none");
```

Remove the four paywall props from the `<ProgressRail ... />` call so it reads:

```tsx
        <ProgressRail
          reportUnlocked={reportUnlocked}
          interviewStatus={interviewStatus}
          referenceCheckStatus={referenceCheckStatus}
          personalityStatus={personalityStatus}
          personalityUnlocked={personalityUnlockedState}
          referencesUnlocked={referencesUnlockedState}
          roleTitle={roleTitle}
          leadId={leadId}
        />
```

Delete the three JSX blocks `{modal === "personality" && (...)}`, `{modal === "references" && (...)}` and `{modal === "interview" && (...)}` in their entirety.

**Keep** `ReportPaywallModal`, the `{modal === "report" && (...)}` block, and its `onUnlocked` handler exactly as they are — `BundlePromoCard` still opens it via `setModal("report")`, and its bundle branch still calls `setPersonalityUnlockedState(true)` and `setReferencesUnlockedState(true)`.

- [ ] **Step 6: Verify the build**

Run: `npm run build`
Expected: build succeeds. If it reports `setInterviewStatus` or `userEmail` as unused, do **not** delete them — `setInterviewStatus` is used by the polling `useEffect`, and `userEmail` is still a declared prop. Investigate any unused-variable error before removing anything.

- [ ] **Step 7: Verify in the browser**

Run: `npm run dev`
Sign in as a candidate who has bought nothing. On `/hub/account`, click each of the four feature cards.
Expected: each one navigates to its feature page and shows that page's locked state. No modal opens from the dashboard. The bundle promo card still opens the report paywall modal.

- [ ] **Step 8: Commit**

```bash
git commit --only app/hub/account/ProgressRail.tsx app/hub/account/DashboardClient.tsx -m "$(cat <<'EOF'
feat(hub): route locked feature cards to their pages instead of a paywall modal

Candidates got a price before they got context. Each feature page already
explains the product; the dashboard modal short-circuited it.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 2: Expert LinkedIn link

**Files:**
- Modify: `app/hub/account/expert/page.tsx`

**Interfaces:**
- Consumes: nothing.
- Produces: nothing consumed by later tasks.

- [ ] **Step 1: Add the constant and the icon import**

In `app/hub/account/expert/page.tsx`, add `Linkedin` to the existing lucide-react import block, and add this next to the other bio constants near `const NAME = "Rushikesh Humbe";`:

```tsx
const LINKEDIN_URL = "https://www.linkedin.com/in/humbe/";
```

- [ ] **Step 2: Render the icon beside the name**

Replace the name paragraph (currently `<p className="font-[family-name:var(--font-gabarito)] font-semibold text-white" style={{ fontSize: 17, margin: 0 }}>{NAME}</p>`) with:

```tsx
                <div className="flex items-center" style={{ gap: 8 }}>
                  <p className="font-[family-name:var(--font-gabarito)] font-semibold text-white" style={{ fontSize: 17, margin: 0 }}>
                    {NAME}
                  </p>
                  <a
                    href={LINKEDIN_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${NAME} on LinkedIn`}
                    className="text-white/40 hover:text-[#0A66C2] transition-colors"
                    style={{ display: "inline-flex", alignItems: "center" }}
                  >
                    <Linkedin size={15} strokeWidth={2} />
                  </a>
                </div>
```

- [ ] **Step 3: Verify the build**

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 4: Verify in the browser**

Visit `/hub/account/expert`.
Expected: the LinkedIn glyph sits immediately right of "Rushikesh Humbe", turns LinkedIn blue on hover, and opens `https://www.linkedin.com/in/humbe/` in a new tab.

- [ ] **Step 5: Commit**

```bash
git commit --only app/hub/account/expert/page.tsx -m "$(cat <<'EOF'
feat(hub): link the expert's LinkedIn from the guidance page

Candidates had no way to independently check the expert's credentials
before booking a paid session.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 3: `SamplePreviewFrame` and `LockedFeatureLayout`

**Files:**
- Create: `app/hub/account/SamplePreviewFrame.tsx`
- Create: `app/hub/account/LockedFeatureLayout.tsx`

**Interfaces:**
- Consumes: nothing.
- Produces: two default-exported components used by Tasks 4-7.

```tsx
SamplePreviewFrame(props: {
  cropHeight: number;
  alsoIncluded: string[];
  cta: ReactNode;
  isRealData?: boolean;
  children: ReactNode;
}): JSX.Element

LockedFeatureLayout(props: {
  icon: ComponentType<{ size?: number; strokeWidth?: number }>;
  title: string;
  priceLabel: string;
  hook: string;
  impactPoints: string[];
  steps: string[];
  preview: ReactNode;
  modal?: ReactNode;
}): JSX.Element
```

- [ ] **Step 1: Create `SamplePreviewFrame`**

```tsx
"use client";

import type { ReactNode } from "react";
import { Lock } from "lucide-react";

const CARD_BG = "#141416";

export default function SamplePreviewFrame({
  cropHeight,
  alsoIncluded,
  cta,
  isRealData = false,
  children,
}: {
  cropHeight: number;
  alsoIncluded: string[];
  cta: ReactNode;
  isRealData?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="border-t border-white/[0.08] bg-white/[0.02]" style={{ padding: 20 }}>
      <p
        className="font-[family-name:var(--font-poppins)] font-bold uppercase text-white/40"
        style={{ fontSize: 10.5, letterSpacing: "0.06em", margin: "0 0 4px" }}
      >
        {isRealData ? "Your report" : "Sample report"}
      </p>
      <p className="font-[family-name:var(--font-poppins)] text-white/35" style={{ fontSize: 11.5, margin: "0 0 14px" }}>
        {isRealData
          ? "Generated from your CV. You're seeing the top of it."
          : "Sample data — not your results."}
      </p>

      <div style={{ position: "relative" }}>
        <div
          aria-hidden={!isRealData}
          style={{ maxHeight: cropHeight, overflow: "hidden", pointerEvents: "none" }}
        >
          {children}
        </div>
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            height: 160,
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
            paddingBottom: 4,
            background: `linear-gradient(to bottom, rgba(20,20,22,0) 0%, ${CARD_BG} 62%, ${CARD_BG} 100%)`,
          }}
        >
          {cta}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 18 }}>
        <p
          className="font-[family-name:var(--font-poppins)] font-bold uppercase text-white/40"
          style={{ fontSize: 10.5, letterSpacing: "0.06em", margin: 0 }}
        >
          Also included
        </p>
        {alsoIncluded.map((item) => (
          <div key={item} className="flex items-center" style={{ gap: 8 }}>
            <Lock size={12} strokeWidth={2} className="text-white/25 shrink-0" />
            <span className="font-[family-name:var(--font-poppins)] text-white/55" style={{ fontSize: 12.5 }}>
              {item}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create `LockedFeatureLayout`**

```tsx
"use client";

import type { ComponentType, ReactNode } from "react";
import { Check } from "lucide-react";

export default function LockedFeatureLayout({
  icon: Icon,
  title,
  priceLabel,
  hook,
  impactPoints,
  steps,
  preview,
  modal,
}: {
  icon: ComponentType<{ size?: number; strokeWidth?: number }>;
  title: string;
  priceLabel: string;
  hook: string;
  impactPoints: string[];
  steps: string[];
  preview: ReactNode;
  modal?: ReactNode;
}) {
  return (
    <div className="bg-[#141416] border border-white/[0.08]" style={{ borderRadius: 14, overflow: "hidden" }}>
      <div style={{ padding: 24 }}>
        <div className="flex items-start justify-between flex-wrap" style={{ gap: 12, marginBottom: 14 }}>
          <div className="flex items-center" style={{ gap: 12 }}>
            <div
              className="flex items-center justify-center bg-[#ed1a24]/15 text-[#ed1a24] shrink-0"
              style={{ width: 36, height: 36, borderRadius: 10 }}
            >
              <Icon size={17} strokeWidth={2} />
            </div>
            <span className="font-[family-name:var(--font-gabarito)] font-semibold text-white" style={{ fontSize: "1.05rem" }}>
              {title}
            </span>
          </div>
          <span className="font-[family-name:var(--font-poppins)] font-semibold text-white" style={{ fontSize: 15 }}>
            {priceLabel}
          </span>
        </div>

        <p
          className="font-[family-name:var(--font-gabarito)] font-semibold text-white"
          style={{ fontSize: 17, lineHeight: 1.45, margin: "0 0 18px" }}
        >
          {hook}
        </p>

        <p
          className="font-[family-name:var(--font-poppins)] font-bold uppercase text-white/40"
          style={{ fontSize: 10.5, letterSpacing: "0.06em", margin: "0 0 10px" }}
        >
          Why this matters
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {impactPoints.map((point) => (
            <div key={point} className="flex items-start" style={{ gap: 10 }}>
              <Check size={14} strokeWidth={2.5} className="text-[#ed1a24] shrink-0" style={{ marginTop: 2 }} />
              <span className="font-[family-name:var(--font-poppins)] text-white/70" style={{ fontSize: 13, lineHeight: 1.6 }}>
                {point}
              </span>
            </div>
          ))}
        </div>
      </div>

      {preview}

      <div className="border-t border-white/[0.08]" style={{ padding: 20 }}>
        <p
          className="font-[family-name:var(--font-poppins)] font-bold uppercase text-white/40"
          style={{ fontSize: 10.5, letterSpacing: "0.06em", margin: "0 0 12px" }}
        >
          How it works
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {steps.map((step, i) => (
            <div key={step} className="flex items-start" style={{ gap: 10 }}>
              <span
                className="flex items-center justify-center shrink-0 bg-[#ed1a24]/15 text-[#ed1a24] font-[family-name:var(--font-poppins)] font-bold"
                style={{ width: 18, height: 18, borderRadius: "50%", fontSize: 10, marginTop: 1 }}
              >
                {i + 1}
              </span>
              <span className="font-[family-name:var(--font-poppins)] text-white/55" style={{ fontSize: 12.5, lineHeight: 1.6 }}>
                {step}
              </span>
            </div>
          ))}
        </div>
      </div>

      {modal}
    </div>
  );
}
```

- [ ] **Step 3: Verify the build**

Run: `npm run build`
Expected: build succeeds. Both components are unused at this point, which is fine — Next.js does not fail on unused modules.

- [ ] **Step 4: Commit**

```bash
git commit --only app/hub/account/SamplePreviewFrame.tsx app/hub/account/LockedFeatureLayout.tsx -m "$(cat <<'EOF'
feat(hub): add shared locked-feature layout and sample preview frame

All four locked states share one card structure and one crop/fade/CTA
mechanic; extracting them avoids four copies of the same JSX.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 4: Fitment locked state (real report, fixture fallback)

**Files:**
- Create: `lib/sampleReports/fitment.ts`
- Create: `lib/sampleReports/__tests__/fitment.test.ts`
- Create: `app/hub/account/report/SampleFitmentReport.tsx`
- Modify: `app/hub/account/report/ReportLockedState.tsx`
- Modify: `app/hub/account/report/page.tsx`

**Interfaces:**
- Consumes: `SamplePreviewFrame` and `LockedFeatureLayout` from Task 3.
- Produces: `SAMPLE_FITMENT_REPORT: ResumeMatchReportReady` from `lib/sampleReports/fitment.ts`; `SampleFitmentReport({ report }: { report: ResumeMatchReportReady })` from `app/hub/account/report/SampleFitmentReport.tsx`; `ReportLockedState` now takes `report: ResumeMatchReportReady | null` in place of `previewSummary` and `previewCategory`.

- [ ] **Step 1: Write the failing fixture test**

Create `lib/sampleReports/__tests__/fitment.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { SAMPLE_FITMENT_REPORT } from "../fitment";

describe("SAMPLE_FITMENT_REPORT", () => {
  it("covers all six scored dimensions", () => {
    expect(SAMPLE_FITMENT_REPORT.categories).toHaveLength(6);
    expect(new Set(SAMPLE_FITMENT_REPORT.categories.map((c) => c.key)).size).toBe(6);
  });

  it("keeps every dimension score inside the 0-100 range the gauge expects", () => {
    SAMPLE_FITMENT_REPORT.categories.forEach((c) => {
      expect(c.score).toBeGreaterThanOrEqual(0);
      expect(c.score).toBeLessThanOrEqual(100);
    });
    expect(SAMPLE_FITMENT_REPORT.overallScore).toBeGreaterThanOrEqual(0);
    expect(SAMPLE_FITMENT_REPORT.overallScore).toBeLessThanOrEqual(100);
  });

  it("gives every dimension a non-empty explanation, since the card renders one", () => {
    SAMPLE_FITMENT_REPORT.categories.forEach((c) => {
      expect(c.comment.length).toBeGreaterThan(20);
      expect(c.label.length).toBeGreaterThan(0);
    });
  });

  it("has both strong and weak points so the withheld sections are real", () => {
    expect(SAMPLE_FITMENT_REPORT.strongPoints.length).toBeGreaterThanOrEqual(3);
    expect(SAMPLE_FITMENT_REPORT.weakPoints.length).toBeGreaterThanOrEqual(3);
  });

  it("carries no real candidate identifiers", () => {
    const blob = JSON.stringify(SAMPLE_FITMENT_REPORT).toLowerCase();
    expect(blob).not.toContain("@");
    expect(blob).not.toContain("deepak");
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run lib/sampleReports/__tests__/fitment.test.ts`
Expected: FAIL — cannot resolve `../fitment`.

- [ ] **Step 3: Write the fixture**

Create `lib/sampleReports/fitment.ts`:

```ts
import type { ResumeMatchReportReady } from "@/lib/intervuebox/reports";

// Fictional candidate (Ananya Iyer, Product Analyst) used as the fallback
// preview when a candidate's own fitment report hasn't generated yet. Typed
// against the production report type so a shape change fails the build here
// rather than silently rendering a stale sample.
export const SAMPLE_FITMENT_REPORT: ResumeMatchReportReady = {
  overallScore: 84,
  rank: null,
  summary:
    "Strong analytical foundation and clear product instincts, backed by relevant coursework and two years of hands-on analytics work. Gaps show up in experiment design at scale and in owning a metric end to end rather than reporting on it.",
  categories: [
    {
      key: "locationMatch",
      label: "Location Match",
      score: 100,
      comment:
        "Based in Bengaluru and the role is hybrid in the same city, so there is no relocation or timezone friction to work through.",
    },
    {
      key: "educationMatch",
      label: "Education Match",
      score: 92,
      comment:
        "A Bachelor's in Statistics with electives in econometrics maps directly onto the quantitative reasoning this role leans on, and the capstone on retention modelling is close to the day-to-day work.",
    },
    {
      key: "skillsMatch",
      label: "Skills Match",
      score: 86,
      comment:
        "SQL, Python and dashboarding are all evidenced with specifics rather than listed. Missing: experimentation tooling and any sign of statistical power calculations, both named explicitly in the JD.",
    },
    {
      key: "experienceMatch",
      label: "Experience Match",
      score: 78,
      comment:
        "Two years in analytics with ownership of a weekly reporting cycle. The JD asks for someone who has shipped decisions off their own analysis; the CV shows analysis delivered to others who then decided.",
    },
    {
      key: "domainMatch",
      label: "Domain Match",
      score: 74,
      comment:
        "Consumer subscription experience transfers reasonably to this marketplace role, though marketplace-specific dynamics like supply liquidity and take-rate are absent from the CV.",
    },
    {
      key: "roleRelevance",
      label: "Role Relevance",
      score: 71,
      comment:
        "Titles have been analyst-shaped throughout, while this role is pitched at product analyst with roadmap input. The analytical core matches; the product-partnering half is unevidenced.",
    },
  ],
  strongPoints: [
    "Quantitative training that lines up with the role's core reasoning demands.",
    "Two years of applied SQL and Python work described with concrete outputs.",
    "A retention-modelling capstone that maps closely onto the role's first project.",
  ],
  weakPoints: [
    "No evidence of designing or running experiments, which the JD names first.",
    "Analysis is described as delivered to decision-makers rather than owned through to a decision.",
    "Marketplace dynamics — supply liquidity, take-rate, two-sided growth — are absent.",
  ],
};
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run lib/sampleReports/__tests__/fitment.test.ts`
Expected: PASS, 5 tests.

- [ ] **Step 5: Write the sample body component**

Create `app/hub/account/report/SampleFitmentReport.tsx`. It renders the gauge, the summary, and the top three dimensions — the rest is what the crop and the "also included" list withhold.

```tsx
"use client";

import type { ResumeMatchReportReady } from "@/lib/intervuebox/reports";
import ResumeMatchGauge from "./ResumeMatchGauge";
import ResumeMatchCategoryCard from "./ResumeMatchCategoryCard";

export default function SampleFitmentReport({ report }: { report: ResumeMatchReportReady }) {
  const topCategories = [...report.categories].sort((a, b) => b.score - a.score).slice(0, 3);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div className="flex items-center" style={{ gap: 16 }}>
        <ResumeMatchGauge percent={report.overallScore} />
        <div>
          <p
            className="font-[family-name:var(--font-poppins)] font-bold uppercase text-white/40"
            style={{ fontSize: 10.5, letterSpacing: "0.06em", margin: "0 0 4px" }}
          >
            Overall match
          </p>
          <p className="font-[family-name:var(--font-poppins)] text-white/60" style={{ fontSize: 12.5, lineHeight: 1.6, margin: 0 }}>
            Scored across six dimensions against this job description.
          </p>
        </div>
      </div>

      <div className="bg-white/[0.04]" style={{ borderRadius: 10, padding: 14 }}>
        <p
          className="font-[family-name:var(--font-poppins)] font-bold uppercase text-white/40"
          style={{ fontSize: 10, letterSpacing: "0.06em", margin: "0 0 6px" }}
        >
          Assessment summary
        </p>
        <p className="font-[family-name:var(--font-poppins)] text-white/70" style={{ fontSize: 12.5, lineHeight: 1.65, margin: 0 }}>
          {report.summary}
        </p>
      </div>

      {topCategories.map((category) => (
        <ResumeMatchCategoryCard key={category.key} category={category} />
      ))}
    </div>
  );
}
```

- [ ] **Step 6: Rewrite `ReportLockedState`**

Replace the entire contents of `app/hub/account/report/ReportLockedState.tsx` with:

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, Unlock } from "lucide-react";
import { PRODUCT_PRICING, formatPrice, type CandidateLevel } from "@/lib/razorpay/pricing";
import type { ResumeMatchReportReady } from "@/lib/intervuebox/reports";
import { SAMPLE_FITMENT_REPORT } from "@/lib/sampleReports/fitment";
import ReportPaywallModal from "../ReportPaywallModal";
import LockedFeatureLayout from "../LockedFeatureLayout";
import SamplePreviewFrame from "../SamplePreviewFrame";
import SampleFitmentReport from "./SampleFitmentReport";

const IMPACT_POINTS = [
  "Scores your CV against this exact job description across six dimensions, so the gap stops being a guess.",
  "Names your weak points in the language a recruiter screens with, not the language you'd use.",
  "Tells you which two things to fix before the next application, ranked by what costs you most.",
];

const STEPS = [
  "Your CV and the job description are already scored — the report exists",
  "Unlock to read all six dimensions, each with its reasoning",
  "Work through the ranked gaps before you apply again",
];

const ALSO_INCLUDED = [
  "The remaining three dimension scores, each explained",
  "Your strong points, written out",
  "Your gaps, written out and ranked",
  "Full candidate profile: education and experience timeline",
];

export default function ReportLockedState({
  leadId,
  roleTitle,
  level,
  bundleEligible,
  report,
}: {
  leadId: string;
  roleTitle: string;
  level: CandidateLevel;
  bundleEligible: boolean;
  report: ResumeMatchReportReady | null;
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const router = useRouter();
  const priceLabel = formatPrice(PRODUCT_PRICING.report[level]);

  // The fitment report is generated before purchase, so a locked candidate
  // normally sees their own real numbers here. The fixture only stands in
  // while the report is still PENDING.
  const isRealData = report !== null;
  const previewReport = report ?? SAMPLE_FITMENT_REPORT;

  const cta = (
    <button
      onClick={() => setModalOpen(true)}
      className="flex items-center font-[family-name:var(--font-poppins)] font-semibold text-white bg-[#ed1a24] hover:bg-[#c8151e] transition-colors"
      style={{ gap: 8, height: 48, padding: "0 24px", borderRadius: 8, fontSize: 14.5, border: "none", cursor: "pointer" }}
    >
      <Unlock size={15} strokeWidth={2} />
      Unlock full report for {priceLabel}
    </button>
  );

  return (
    <LockedFeatureLayout
      icon={FileText}
      title="Fitment report"
      priceLabel={priceLabel}
      hook="You keep applying and hearing nothing back, and nobody tells you why."
      impactPoints={IMPACT_POINTS}
      steps={STEPS}
      preview={
        <SamplePreviewFrame cropHeight={420} alsoIncluded={ALSO_INCLUDED} cta={cta} isRealData={isRealData}>
          <SampleFitmentReport report={previewReport} />
        </SamplePreviewFrame>
      }
      modal={
        modalOpen ? (
          <ReportPaywallModal
            leadId={leadId}
            roleTitle={roleTitle}
            level={level}
            bundleEligible={bundleEligible}
            onClose={() => setModalOpen(false)}
            onUnlocked={() => {
              setModalOpen(false);
              router.refresh();
            }}
          />
        ) : null
      }
    />
  );
}
```

Note: `roleTitle` is no longer used in the card copy but is still required by `ReportPaywallModal`, so it stays a prop.

- [ ] **Step 7: Update the caller in `report/page.tsx`**

In `app/hub/account/report/page.tsx`, inside the `if (!unlocked)` branch, delete the `topCategory` computation and the `candidateDetails` fetch used only for `skillTags` (check first that `candidateDetails` is not used elsewhere in that branch — it is not), then change the component call to:

```tsx
          <ReportLockedState
            leadId={current.id}
            roleTitle={current.role_title}
            level={level}
            bundleEligible={bundleEligible}
            report={lockedReport}
          />
```

Remove the now-unused `getCandidateResumeDetails` import **only if** the unlocked branch below no longer uses it — it does use it, so keep the import.

- [ ] **Step 8: Run the full test suite and build**

Run: `npm test`
Expected: PASS, including the new fitment fixture tests.

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 9: Verify in the browser**

As a candidate with a generated but unpurchased fitment report, visit `/hub/account/report`.
Expected: the header reads "Your report" with "Generated from your CV", the gauge shows that candidate's real percentage, the three highest-scoring dimensions render, the fade covers the bottom with the unlock button legible over it, and the "also included" list sits below. Check the same page at 390px width and confirm the crop still reads as intentional.

- [ ] **Step 10: Commit**

```bash
git commit --only lib/sampleReports/fitment.ts lib/sampleReports/__tests__/fitment.test.ts app/hub/account/report/SampleFitmentReport.tsx app/hub/account/report/ReportLockedState.tsx app/hub/account/report/page.tsx -m "$(cat <<'EOF'
feat(hub): show the candidate's real fitment report behind the paywall

The report is generated before purchase, so a blurred placeholder was
hiding data we already had. Shows the real gauge, summary and top three
dimensions, cropped, with the rest listed as what unlocking buys.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 5: Personality locked state

**Files:**
- Create: `lib/sampleReports/personality.ts`
- Create: `lib/sampleReports/__tests__/personality.test.ts`
- Create: `app/hub/account/personality/SamplePersonalityReport.tsx`
- Modify: `app/hub/account/personality/PersonalityLockedState.tsx`

**Interfaces:**
- Consumes: `SamplePreviewFrame`, `LockedFeatureLayout` from Task 3.
- Produces: `SAMPLE_PERSONALITY_SCORES: Scores` and `SAMPLE_PERSONALITY_NAME: string` from `lib/sampleReports/personality.ts`; `SamplePersonalityReport()` taking no props.

- [ ] **Step 1: Write the failing fixture test**

Create `lib/sampleReports/__tests__/personality.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { TRAITS, BANDS, traitLevel } from "@/lib/personality";
import { SAMPLE_PERSONALITY_SCORES, SAMPLE_PERSONALITY_NAME } from "../personality";

describe("SAMPLE_PERSONALITY_SCORES", () => {
  it("scores all five Big Five traits", () => {
    TRAITS.forEach((trait) => {
      expect(SAMPLE_PERSONALITY_SCORES[trait]).toBeDefined();
    });
  });

  it("keeps pct in range and band consistent with pct, the way scoreTrait produces them", () => {
    TRAITS.forEach((trait) => {
      const { pct, band, raw } = SAMPLE_PERSONALITY_SCORES[trait];
      expect(pct).toBeGreaterThanOrEqual(0);
      expect(pct).toBeLessThanOrEqual(100);
      expect(band).toBe(Math.min(4, Math.floor(pct / 20)));
      expect(BANDS[band]).toBeDefined();
      // raw is a 12-item trait sum on a 1-5 scale
      expect(raw).toBeGreaterThanOrEqual(12);
      expect(raw).toBeLessThanOrEqual(60);
    });
  });

  it("produces a usable work-implication level for every trait", () => {
    TRAITS.forEach((trait) => {
      expect(["high", "avg", "low"]).toContain(traitLevel(SAMPLE_PERSONALITY_SCORES[trait].pct));
    });
  });

  it("uses the fictional sample persona", () => {
    expect(SAMPLE_PERSONALITY_NAME).toBe("Ananya");
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run lib/sampleReports/__tests__/personality.test.ts`
Expected: FAIL — cannot resolve `../personality`.

- [ ] **Step 3: Write the fixture**

Create `lib/sampleReports/personality.ts`. `raw` is derived from `pct` using the inverse of `scoreTrait`'s formula (`pct = round(((raw - 12) / 48) * 100)`), so the numbers stay internally consistent:

```ts
import type { Scores } from "@/lib/personality";

// Fictional sample persona. The real report addresses the candidate by first
// name, so the sample needs one too.
export const SAMPLE_PERSONALITY_NAME = "Ananya";

// pct/band/raw satisfy the same relationships scoreTrait() produces:
// pct = round(((raw - 12) / 48) * 100), band = floor(pct / 20) capped at 4.
export const SAMPLE_PERSONALITY_SCORES: Scores = {
  E: { raw: 42, pct: 63, band: 3 },
  A: { raw: 48, pct: 75, band: 3 },
  C: { raw: 51, pct: 81, band: 4 },
  ES: { raw: 45, pct: 69, band: 3 },
  O: { raw: 54, pct: 88, band: 4 },
};
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run lib/sampleReports/__tests__/personality.test.ts`
Expected: PASS, 4 tests. If the `band` assertion fails, recompute `band` as `Math.min(4, Math.floor(pct / 20))` for that trait rather than changing the test.

- [ ] **Step 5: Write the sample body component**

Create `app/hub/account/personality/SamplePersonalityReport.tsx`. It shows all five trait bars, then the first trait's full card — the other four cards and the validity checks are what the crop withholds.

```tsx
"use client";

import {
  TRAITS,
  TRAIT_NAME,
  TRAIT_MEANING,
  TRAIT_WORK_IMPLICATION,
  BANDS,
  traitLevel,
} from "@/lib/personality";
import { SAMPLE_PERSONALITY_SCORES, SAMPLE_PERSONALITY_NAME } from "@/lib/sampleReports/personality";

const TRAIT_COLORS: Record<string, string> = {
  E: "#F59E0B",
  A: "#22C55E",
  C: "#ed1a24",
  ES: "#3B82F6",
  O: "#A855F7",
};

export default function SamplePersonalityReport() {
  const firstTrait = TRAITS[0];
  const firstScore = SAMPLE_PERSONALITY_SCORES[firstTrait];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {TRAITS.map((trait) => {
          const { pct, band } = SAMPLE_PERSONALITY_SCORES[trait];
          return (
            <div key={trait}>
              <div className="flex items-center justify-between" style={{ marginBottom: 6 }}>
                <span className="font-[family-name:var(--font-poppins)] font-semibold text-white" style={{ fontSize: 12.5 }}>
                  {TRAIT_NAME[trait]}
                </span>
                <span
                  className="font-[family-name:var(--font-poppins)] font-semibold"
                  style={{ fontSize: 12, color: TRAIT_COLORS[trait] }}
                >
                  {pct}% · {BANDS[band]}
                </span>
              </div>
              <div className="bg-white/[0.08] overflow-hidden" style={{ height: 7, borderRadius: 6 }}>
                <div className="h-full" style={{ borderRadius: 6, width: `${pct}%`, background: TRAIT_COLORS[trait] }} />
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white/[0.04]" style={{ borderRadius: 10, padding: 14 }}>
        <div className="flex items-center justify-between" style={{ marginBottom: 8 }}>
          <span className="font-[family-name:var(--font-poppins)] font-semibold text-white" style={{ fontSize: 13 }}>
            {TRAIT_NAME[firstTrait]}
          </span>
          <span
            className="font-[family-name:var(--font-poppins)] font-semibold"
            style={{ fontSize: 13, color: TRAIT_COLORS[firstTrait] }}
          >
            {firstScore.pct}%
          </span>
        </div>
        <p className="font-[family-name:var(--font-poppins)] text-white/55" style={{ fontSize: 12, lineHeight: 1.65, margin: "0 0 8px" }}>
          <span className="font-semibold text-white/40" style={{ fontSize: 10, letterSpacing: "0.05em" }}>
            WHAT IT MEASURES{" "}
          </span>
          {TRAIT_MEANING[firstTrait]}
        </p>
        <p className="font-[family-name:var(--font-poppins)] text-white/55" style={{ fontSize: 12, lineHeight: 1.65, margin: 0 }}>
          <span className="font-semibold text-white/40" style={{ fontSize: 10, letterSpacing: "0.05em" }}>
            AT WORK{" "}
          </span>
          {TRAIT_WORK_IMPLICATION[firstTrait][traitLevel(firstScore.pct)](SAMPLE_PERSONALITY_NAME)}
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 6: Rewrite `PersonalityLockedState`**

Replace the entire contents of `app/hub/account/personality/PersonalityLockedState.tsx` with:

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ClipboardList, Play } from "lucide-react";
import { ITEMS, IMPRESSION_ITEMS } from "@/lib/personality";
import { PRODUCT_PRICING, formatPrice, type CandidateLevel } from "@/lib/razorpay/pricing";
import PersonalityPaywallModal from "../PersonalityPaywallModal";
import LockedFeatureLayout from "../LockedFeatureLayout";
import SamplePreviewFrame from "../SamplePreviewFrame";
import SamplePersonalityReport from "./SamplePersonalityReport";

const TOTAL_STATEMENTS = ITEMS.length + IMPRESSION_ITEMS.length;

const IMPACT_POINTS = [
  "Behavioural rounds decide most offers, and they test something a CV physically cannot show.",
  "Gives you evidence-backed language for how you work, so “tell me about yourself” stops being adjectives.",
  "Flags the watch-outs an interviewer will probe, before they probe them.",
];

const STEPS = [
  `Rate ${TOTAL_STATEMENTS} short statements, 1 (inaccurate) to 5 (accurate)`,
  "Get your Extroversion, Agreeableness, Conscientiousness, Emotional Stability and Openness scores instantly",
  "Read what each score suggests about how you'll show up at work",
];

const ALSO_INCLUDED = [
  "All five trait cards: what each measures and what it means at work",
  "Your watch-outs and best-fit environments per trait",
  "Response-quality and validity checks on your answers",
];

export default function PersonalityLockedState({
  leadId,
  roleTitle,
  level,
  bundleEligible,
}: {
  leadId: string;
  roleTitle: string;
  level: CandidateLevel;
  bundleEligible: boolean;
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const router = useRouter();
  const priceLabel = formatPrice(PRODUCT_PRICING.personality[level]);

  const cta = (
    <button
      onClick={() => setModalOpen(true)}
      className="flex items-center font-[family-name:var(--font-poppins)] font-semibold text-white bg-[#ed1a24] hover:bg-[#c8151e] transition-colors"
      style={{ gap: 8, height: 48, padding: "0 24px", borderRadius: 8, fontSize: 14.5, border: "none", cursor: "pointer" }}
    >
      <Play size={15} strokeWidth={2} fill="currentColor" />
      Start my personality test for {priceLabel}
    </button>
  );

  return (
    <LockedFeatureLayout
      icon={ClipboardList}
      title="Personality test"
      priceLabel={priceLabel}
      hook="Your technical rounds go fine. You still don't get picked."
      impactPoints={IMPACT_POINTS}
      steps={STEPS}
      preview={
        <SamplePreviewFrame cropHeight={400} alsoIncluded={ALSO_INCLUDED} cta={cta}>
          <SamplePersonalityReport />
        </SamplePreviewFrame>
      }
      modal={
        modalOpen ? (
          <PersonalityPaywallModal
            leadId={leadId}
            roleTitle={roleTitle}
            level={level}
            bundleEligible={bundleEligible}
            onClose={() => setModalOpen(false)}
            onUnlocked={() => {
              setModalOpen(false);
              router.refresh();
            }}
          />
        ) : null
      }
    />
  );
}
```

- [ ] **Step 7: Run tests and build**

Run: `npm test`
Expected: PASS.

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 8: Verify in the browser**

As a candidate who has not bought the personality test, visit `/hub/account/personality`.
Expected: header reads "Sample report" / "Sample data — not your results", five trait bars render with percentages and band labels, the first trait card shows beneath them, the fade cuts it off with the CTA legible. Check at 390px width.

- [ ] **Step 9: Commit**

```bash
git commit --only lib/sampleReports/personality.ts lib/sampleReports/__tests__/personality.test.ts app/hub/account/personality/SamplePersonalityReport.tsx app/hub/account/personality/PersonalityLockedState.tsx -m "$(cat <<'EOF'
feat(hub): show a real sample personality report instead of a blur

Blur proved nothing about what the test returns. Renders the real trait
bars and a full trait card from fixture data, with the rest listed.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 6: Mock interview locked state

**Files:**
- Create: `lib/sampleReports/interview.ts`
- Create: `lib/sampleReports/__tests__/interview.test.ts`
- Create: `app/hub/account/interview/SampleInterviewReport.tsx`
- Modify: `app/hub/account/interview/InterviewLockedState.tsx`

**Interfaces:**
- Consumes: `SamplePreviewFrame`, `LockedFeatureLayout` from Task 3.
- Produces: `SAMPLE_INTERVIEW_REPORT: InterviewReportReady` from `lib/sampleReports/interview.ts`; `SampleInterviewReport()` taking no props.

- [ ] **Step 1: Write the failing fixture test**

Create `lib/sampleReports/__tests__/interview.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { getSkillDistributionTier } from "@/app/hub/account/interview/SkillDistribution";
import { SAMPLE_INTERVIEW_REPORT } from "../interview";

describe("SAMPLE_INTERVIEW_REPORT", () => {
  // InterviewScoreGauge clamps to 100 and ParameterScoreTile renders the raw
  // number with a "%" suffix, so both fields are 0-100 despite the stale
  // "0-10" comment on the type. Confirmed against a real exported report
  // showing 50% overall and 58% relevance.
  it("scores overall on the 0-100 scale the gauge expects", () => {
    expect(SAMPLE_INTERVIEW_REPORT.overallScore).toBeGreaterThanOrEqual(0);
    expect(SAMPLE_INTERVIEW_REPORT.overallScore).toBeLessThanOrEqual(100);
  });

  it("has five parameter scores, each on the 0-100 scale", () => {
    const entries = Object.entries(SAMPLE_INTERVIEW_REPORT.skillMetrics);
    expect(entries).toHaveLength(5);
    entries.forEach(([, score]) => {
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });
  });

  it("has a skill report whose scores band cleanly for the distribution chart", () => {
    const entries = Object.values(SAMPLE_INTERVIEW_REPORT.skillReport);
    expect(entries.length).toBeGreaterThanOrEqual(2);
    entries.forEach((entry) => {
      expect(getSkillDistributionTier(entry.score).label).toBeTruthy();
      expect(entry.comment.length).toBeGreaterThan(20);
    });
  });

  it("carries the withheld sections the locked state advertises", () => {
    expect(SAMPLE_INTERVIEW_REPORT.roadmap).not.toBeNull();
    expect(SAMPLE_INTERVIEW_REPORT.strengths).not.toBeNull();
    expect(SAMPLE_INTERVIEW_REPORT.areasOfImprovement).not.toBeNull();
    expect(SAMPLE_INTERVIEW_REPORT.feedbackToInterviewer).not.toBeNull();
  });

  it("carries no real candidate identifiers", () => {
    const blob = JSON.stringify(SAMPLE_INTERVIEW_REPORT).toLowerCase();
    expect(blob).not.toContain("@");
    expect(blob).not.toContain("deepak");
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run lib/sampleReports/__tests__/interview.test.ts`
Expected: FAIL — cannot resolve `../interview`.

- [ ] **Step 3: Write the fixture**

Create `lib/sampleReports/interview.ts`. `InterviewReportReady` has many forward-compatible fields that are always `null` in production; set them `null` here too rather than inventing values.

```ts
import type { InterviewReportReady } from "@/lib/intervuebox/interviewReports";

// Fictional candidate (Ananya Iyer, Product Analyst). Typed against the
// production report type: if the vendor mapping changes shape, this fails
// to compile instead of rendering a stale sample.
// NOTE: overallScore and skillMetrics are 0-100, not 0-10. The "0-10" comment
// on InterviewReportReady is stale: InterviewScoreGauge clamps to 100 and
// ParameterScoreTile renders the raw number with a "%" suffix, and a real
// exported report shows 50% overall / 58% relevance.
export const SAMPLE_INTERVIEW_REPORT: InterviewReportReady = {
  overallScore: 68,
  skillMetrics: {
    Relevance: 74,
    Confidence: 61,
    Correctness: 70,
    Communication: 65,
    "Problem Solving": 72,
  },
  overallSummary:
    "Answers were structured and mostly on-target, with clear reasoning on the metrics questions. Confidence dipped noticeably on the experimentation prompts, where hedging replaced a direct answer. Examples were real but under-quantified — outcomes were described qualitatively where numbers would have carried more weight.",
  strengths:
    "- Structured answers with a clear beginning, middle and conclusion.\n- Comfortable reasoning aloud through an unfamiliar metrics question.\n- Concrete, real examples rather than hypotheticals.",
  areasOfImprovement:
    "- **Quantification**: outcomes were described in words where numbers were available and expected.\n- **Experiment design**: hedged on sample sizing and stopping rules rather than committing to an approach.\n- **Concision**: two answers ran past three minutes without a summary line.",
  shareableReportLink: null,
  approxDurationMinutes: 21,
  flagForSuspiciousActivity: false,
  integrityCheck: "No issues detected during this interview.",
  videoReport: null,
  feedbackToInterviewer:
    "STRENGTHS: Sound analytical instincts and a habit of stating assumptions before answering. WEAKNESSES: Limited experimentation depth; outcomes under-quantified. OPPORTUNITIES: A short course on experiment design would close the most visible gap. THREATS: May struggle in a role where owning an A/B programme is a week-one expectation. RECOMMENDATION: Worth a further round if the experimentation gap is probed directly.",
  roadmap:
    "Short-Term (0-2 months) — GOAL: Close the experimentation gap. Focus: sample sizing, power, stopping rules. What to do: run two end-to-end experiments on a public dataset and write up the decision each produced.\nMid-Term (2-4 months) — GOAL: Quantify your own impact. Focus: rebuild every CV bullet around a number and the decision it drove.\nLong-Term (4-6+ months) — GOAL: Move from reporting to owning. Focus: take one metric end to end, from definition through to the call you made on it.",
  opportunities: null,
  threats: null,
  criteriaEvaluationTable: [],
  interviewTitle: "Product Analyst",
  skillReport: {
    "Metrics reasoning": {
      score: 72,
      comment:
        "Defined activation and retention correctly and reasoned through a funnel drop-off without prompting, though the link to a business decision stayed implicit.",
    },
    Communication: {
      score: 61,
      comment:
        "Clear and well-paced overall. Two answers lost their thread partway and would have benefited from a closing summary line.",
    },
    "Experiment design": {
      score: 48,
      comment:
        "Recognised when an experiment was warranted but could not commit to a sample size or a stopping rule when pressed.",
    },
  },
  overallSkillScore: 64,
  answers: [],
  knowledgeAnswers: [],
  whatToFocusOnNext: null,
  trainingFocus: null,
  confidenceLevel: null,
  presentation: null,
  bodyLanguage: null,
  environmentCheck: null,
  responseQuality: null,
  tabChanges: null,
};
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run lib/sampleReports/__tests__/interview.test.ts`
Expected: PASS, 5 tests. If TypeScript reports a missing required field on `InterviewReportReady`, add it with `null` (or `[]` for array fields) — do not invent data for fields production leaves empty.

- [ ] **Step 5: Write the sample body component**

Create `app/hub/account/interview/SampleInterviewReport.tsx`:

```tsx
"use client";

import InterviewScoreGauge from "./InterviewScoreGauge";
import ParameterScoreTile from "./ParameterScoreTile";
import SkillDistribution from "./SkillDistribution";
import { SAMPLE_INTERVIEW_REPORT } from "@/lib/sampleReports/interview";

export default function SampleInterviewReport() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div className="flex items-center" style={{ gap: 16 }}>
        <InterviewScoreGauge score={SAMPLE_INTERVIEW_REPORT.overallScore} />
        <div>
          <p
            className="font-[family-name:var(--font-poppins)] font-bold uppercase text-white/40"
            style={{ fontSize: 10.5, letterSpacing: "0.06em", margin: "0 0 4px" }}
          >
            Overall score
          </p>
          <p className="font-[family-name:var(--font-poppins)] text-white/60" style={{ fontSize: 12.5, lineHeight: 1.6, margin: 0 }}>
            {SAMPLE_INTERVIEW_REPORT.approxDurationMinutes} minutes, scored across five parameters.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3" style={{ gap: 8 }}>
        {Object.entries(SAMPLE_INTERVIEW_REPORT.skillMetrics).map(([skill, score]) => (
          <ParameterScoreTile key={skill} skill={skill} score={score} />
        ))}
      </div>

      <SkillDistribution skillReport={SAMPLE_INTERVIEW_REPORT.skillReport} />

      <div className="bg-white/[0.04]" style={{ borderRadius: 10, padding: 14 }}>
        <p
          className="font-[family-name:var(--font-poppins)] font-bold uppercase text-white/40"
          style={{ fontSize: 10, letterSpacing: "0.06em", margin: "0 0 6px" }}
        >
          AI overview
        </p>
        <p className="font-[family-name:var(--font-poppins)] text-white/70" style={{ fontSize: 12.5, lineHeight: 1.65, margin: 0 }}>
          {SAMPLE_INTERVIEW_REPORT.overallSummary}
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 6: Rewrite `InterviewLockedState`**

Replace the entire contents of `app/hub/account/interview/InterviewLockedState.tsx` with:

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mic, Play } from "lucide-react";
import { PRODUCT_PRICING, formatPrice, type CandidateLevel } from "@/lib/razorpay/pricing";
import InterviewPaywallModal from "../InterviewPaywallModal";
import LockedFeatureLayout from "../LockedFeatureLayout";
import SamplePreviewFrame from "../SamplePreviewFrame";
import SampleInterviewReport from "./SampleInterviewReport";

const IMPACT_POINTS = [
  "Burns your first attempt somewhere it costs nothing, instead of in a round that counts.",
  "Scores you question by question, so you know which answers would have lost the offer.",
  "Hands you a phased roadmap: what to study, in what order, with what resources.",
];

const STEPS = [
  "Answer 10 role-matched questions on camera",
  "Get scored on 5 weighted parameters plus a per-skill breakdown",
  "Walk away with a strengths/gaps analysis and a phased improvement roadmap",
];

const ALSO_INCLUDED = [
  "Full skill-wise evaluation, scored and explained",
  "Your strengths and areas of improvement, written out",
  "A 3-phase roadmap: short, mid and long term, with resources",
  "Evaluator notes for hiring teams, including the hire recommendation",
];

export default function InterviewLockedState({
  leadId,
  roleTitle,
  level,
  userEmail,
}: {
  leadId: string;
  roleTitle: string;
  level: CandidateLevel;
  userEmail: string;
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const router = useRouter();
  const priceLabel = formatPrice(PRODUCT_PRICING.interview[level]);

  const cta = (
    <button
      onClick={() => setModalOpen(true)}
      className="flex items-center font-[family-name:var(--font-poppins)] font-semibold text-white bg-[#ed1a24] hover:bg-[#c8151e] transition-colors"
      style={{ gap: 8, height: 48, padding: "0 24px", borderRadius: 8, fontSize: 14.5, border: "none", cursor: "pointer" }}
    >
      <Play size={15} strokeWidth={2} />
      Start my mock interview for {priceLabel}
    </button>
  );

  return (
    <LockedFeatureLayout
      icon={Mic}
      title="Mock AI interview"
      priceLabel={priceLabel}
      hook="You've never been interviewed at this level, and the first attempt will be a real one."
      impactPoints={IMPACT_POINTS}
      steps={STEPS}
      preview={
        <SamplePreviewFrame cropHeight={440} alsoIncluded={ALSO_INCLUDED} cta={cta}>
          <SampleInterviewReport />
        </SamplePreviewFrame>
      }
      modal={
        modalOpen ? (
          <InterviewPaywallModal
            leadId={leadId}
            roleTitle={roleTitle}
            level={level}
            userEmail={userEmail}
            onClose={() => setModalOpen(false)}
            onStarted={() => {
              setModalOpen(false);
              router.refresh();
            }}
          />
        ) : null
      }
    />
  );
}
```

- [ ] **Step 7: Run tests and build**

Run: `npm test`
Expected: PASS.

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 8: Verify in the browser**

As a candidate who has not bought the interview, visit `/hub/account/interview?lead=<leadId>`.
Expected: gauge, five parameter tiles, the skill distribution chart and the AI overview render; the fade cuts the overview off with the CTA legible; "also included" names the roadmap and evaluator notes. Check at 390px width — the parameter tile grid drops to two columns there.

- [ ] **Step 9: Commit**

```bash
git commit --only lib/sampleReports/interview.ts lib/sampleReports/__tests__/interview.test.ts app/hub/account/interview/SampleInterviewReport.tsx app/hub/account/interview/InterviewLockedState.tsx -m "$(cat <<'EOF'
feat(hub): show a real sample interview report instead of a blur

Renders the real gauge, parameter tiles, skill distribution and AI
overview from fixture data. The roadmap stays behind the paywall, since
it is the densest thing unlocking buys.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 7: Reference checks locked state

**Files:**
- Create: `lib/sampleReports/references.ts`
- Create: `lib/sampleReports/__tests__/references.test.ts`
- Create: `app/hub/account/references/SampleReferenceReport.tsx`
- Modify: `app/hub/account/references/ReferencesLockedState.tsx`

**Interfaces:**
- Consumes: `SamplePreviewFrame`, `LockedFeatureLayout` from Task 3.
- Produces: `SAMPLE_REFEREES: RefereeRow[]` from `lib/sampleReports/references.ts`; `SampleReferenceReport()` taking no props.

Verified: `ReferencesLockedState` currently takes `{ leadId, level, bundleEligible }`, renders `ReferencesPaywallModal`, and prices via `PRODUCT_PRICING.references[level]`. The rewrite below keeps all three.

- [ ] **Step 1: Write the failing fixture test**

Create `lib/sampleReports/__tests__/references.test.ts`. The fixture is raw referee rows run through the real `computeReferenceReport`, so the test asserts production code produces a sane report from it:

```ts
import { describe, it, expect } from "vitest";
import { computeReferenceReport, REFERENCE_CATEGORIES } from "@/lib/referenceChecks";
import { SAMPLE_REFEREES } from "../references";

describe("SAMPLE_REFEREES", () => {
  it("has at least three completed referees, matching the product minimum", () => {
    const completed = SAMPLE_REFEREES.filter((r) => r.status === "completed");
    expect(completed.length).toBeGreaterThanOrEqual(3);
  });

  it("rates every category, so no row renders as a zero bar", () => {
    const report = computeReferenceReport(SAMPLE_REFEREES);
    expect(report.categoryScores).toHaveLength(REFERENCE_CATEGORIES.length);
    report.categoryScores.forEach((c) => {
      expect(c.value).toBeGreaterThan(0);
      expect(c.value).toBeLessThanOrEqual(5);
      expect(c.values.length).toBeGreaterThanOrEqual(3);
    });
  });

  it("produces an overall score in the 1-5 range the gauge expects", () => {
    const report = computeReferenceReport(SAMPLE_REFEREES);
    expect(report.overallScore).toBeGreaterThan(0);
    expect(report.overallScore).toBeLessThanOrEqual(5);
  });

  it("gives every completed referee written feedback to quote", () => {
    const report = computeReferenceReport(SAMPLE_REFEREES);
    report.referees.forEach((r) => {
      expect(r.overallFeedback).toBeTruthy();
      expect((r.overallFeedback ?? "").length).toBeGreaterThan(20);
    });
  });

  it("carries no real referee identifiers", () => {
    const blob = JSON.stringify(SAMPLE_REFEREES).toLowerCase();
    expect(blob).not.toContain("aalok");
    expect(blob).not.toContain("dhruv");
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run lib/sampleReports/__tests__/references.test.ts`
Expected: FAIL — cannot resolve `../references`.

- [ ] **Step 3: Write the fixture**

Create `lib/sampleReports/references.ts`. Emails use `example.com` so the "no real identifiers" intent holds even though the type requires the field:

```ts
import { REFERENCE_CATEGORIES, type RefereeRow } from "@/lib/referenceChecks";

const ratings = (values: number[]): { category: string; value: number }[] =>
  REFERENCE_CATEGORIES.map(({ value: category }, i) => ({ category, value: values[i] }));

// Fictional referees for the sample reference report. Raw rows rather than a
// precomputed report, so the sample's category averages are produced by the
// same computeReferenceReport() the paid page uses.
export const SAMPLE_REFEREES: RefereeRow[] = [
  {
    id: "sample-1",
    name: "Meera Raghavan",
    email: "meera@example.com",
    phone: null,
    status: "completed",
    reminder_count: 0,
    role: "manager",
    organization: "Northwind Analytics",
    ratings: ratings([4, 5, 4, 4, 5, 4, 3]),
    overall_feedback:
      "Took ownership of our weekly reporting cycle within a month and kept it running without supervision. Asks good questions before starting work rather than after.",
  },
  {
    id: "sample-2",
    name: "Karan Dutta",
    email: "karan@example.com",
    phone: null,
    status: "completed",
    reminder_count: 0,
    role: "team-lead",
    organization: "Northwind Analytics",
    ratings: ratings([4, 4, 5, 3, 4, 4, 3]),
    overall_feedback:
      "Reliable and easy to work alongside. Written updates could be more concise, but the analysis underneath them has always been sound.",
  },
  {
    id: "sample-3",
    name: "Priyanka Nair",
    email: "priyanka@example.com",
    phone: null,
    status: "completed",
    reminder_count: 0,
    role: "teammate",
    organization: "Northwind Analytics",
    ratings: ratings([3, 4, 5, 4, 4, 4, 4]),
    overall_feedback:
      "Steady under deadline pressure and generous with help. Would like to see more challenge to assumptions early rather than accepting the brief as given.",
  },
];
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run lib/sampleReports/__tests__/references.test.ts`
Expected: PASS, 5 tests.

- [ ] **Step 5: Write the sample body component**

Create `app/hub/account/references/SampleReferenceReport.tsx`. It shows the gauge, two referee quote cards and the first three category rows; the rest is withheld.

```tsx
"use client";

import { Quote } from "lucide-react";
import { computeReferenceReport } from "@/lib/referenceChecks";
import { SAMPLE_REFEREES } from "@/lib/sampleReports/references";
import ReferenceScoreGauge from "./ReferenceScoreGauge";

const report = computeReferenceReport(SAMPLE_REFEREES);

export default function SampleReferenceReport() {
  const visibleCategories = report.categoryScores.slice(0, 3);
  const visibleReferees = report.referees.slice(0, 2);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div className="flex items-center" style={{ gap: 16 }}>
        <ReferenceScoreGauge score={report.overallScore} />
        <div>
          <p
            className="font-[family-name:var(--font-poppins)] font-bold uppercase text-white/40"
            style={{ fontSize: 10.5, letterSpacing: "0.06em", margin: "0 0 4px" }}
          >
            Overall rating
          </p>
          <p className="font-[family-name:var(--font-poppins)] text-white/60" style={{ fontSize: 12.5, lineHeight: 1.6, margin: 0 }}>
            {report.overallScore} / 5 from {report.referees.length} references.
          </p>
        </div>
      </div>

      {visibleReferees.map((referee) => (
        <div key={referee.name} className="bg-white/[0.04]" style={{ borderRadius: 10, padding: 14 }}>
          <Quote size={13} strokeWidth={2} className="text-white/25" style={{ marginBottom: 6 }} />
          <p
            className="font-[family-name:var(--font-poppins)] italic text-white/70"
            style={{ fontSize: 12.5, lineHeight: 1.65, margin: "0 0 8px" }}
          >
            {referee.overallFeedback}
          </p>
          <p className="font-[family-name:var(--font-poppins)] font-semibold text-white/45" style={{ fontSize: 11.5, margin: 0 }}>
            {referee.name} · {referee.organization}
          </p>
        </div>
      ))}

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {visibleCategories.map((category) => (
          <div key={category.category}>
            <div className="flex items-center justify-between" style={{ marginBottom: 5 }}>
              <span className="font-[family-name:var(--font-poppins)] text-white/60" style={{ fontSize: 12.5 }}>
                {category.label}
              </span>
              <span className="font-[family-name:var(--font-poppins)] font-semibold text-white" style={{ fontSize: 12.5 }}>
                {category.value}
              </span>
            </div>
            <div className="bg-white/[0.08] overflow-hidden" style={{ height: 6, borderRadius: 6 }}>
              <div className="bg-[#ed1a24] h-full" style={{ borderRadius: 6, width: `${(category.value / 5) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 6: Rewrite `ReferencesLockedState`**

Replace the entire contents of `app/hub/account/references/ReferencesLockedState.tsx` with:

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Users, Unlock } from "lucide-react";
import { MIN_REFERENCES } from "@/lib/referenceChecks";
import { PRODUCT_PRICING, formatPrice, type CandidateLevel } from "@/lib/razorpay/pricing";
import ReferencesPaywallModal from "../ReferencesPaywallModal";
import LockedFeatureLayout from "../LockedFeatureLayout";
import SamplePreviewFrame from "../SamplePreviewFrame";
import SampleReferenceReport from "./SampleReferenceReport";

const IMPACT_POINTS = [
  "Collects and verifies your references up front, so trust stops being the thing that stalls an offer.",
  "Shows you what your referees actually say while there is still time to act on it.",
  "Lets you arrive with references already done, which almost no other candidate does.",
];

const STEPS = [
  `Invite at least ${MIN_REFERENCES} people who have worked with you`,
  "They rate you across seven categories and leave written feedback",
  "Your verified reference report is ready to share with recruiters",
];

const ALSO_INCLUDED = [
  "All seven rated categories, with each referee's individual score",
  "Every referee's written feedback in full",
  "A shareable verified report for recruiters",
];

export default function ReferencesLockedState({
  leadId,
  level,
  bundleEligible,
}: {
  leadId: string;
  level: CandidateLevel;
  bundleEligible: boolean;
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const router = useRouter();
  const priceLabel = formatPrice(PRODUCT_PRICING.references[level]);

  const cta = (
    <button
      onClick={() => setModalOpen(true)}
      className="flex items-center font-[family-name:var(--font-poppins)] font-semibold text-white bg-[#ed1a24] hover:bg-[#c8151e] transition-colors"
      style={{ gap: 8, height: 48, padding: "0 24px", borderRadius: 8, fontSize: 14.5, border: "none", cursor: "pointer" }}
    >
      <Unlock size={15} strokeWidth={2} />
      Start my reference checks for {priceLabel}
    </button>
  );

  return (
    <LockedFeatureLayout
      icon={Users}
      title="Reference checks"
      priceLabel={priceLabel}
      hook="Your references are a black box that opens at the worst possible moment."
      impactPoints={IMPACT_POINTS}
      steps={STEPS}
      preview={
        <SamplePreviewFrame cropHeight={420} alsoIncluded={ALSO_INCLUDED} cta={cta}>
          <SampleReferenceReport />
        </SamplePreviewFrame>
      }
      modal={
        modalOpen ? (
          <ReferencesPaywallModal
            leadId={leadId}
            level={level}
            bundleEligible={bundleEligible}
            onClose={() => setModalOpen(false)}
            onUnlocked={() => {
              setModalOpen(false);
              router.refresh();
            }}
          />
        ) : null
      }
    />
  );
}
```

- [ ] **Step 7: Run tests and build**

Run: `npm test`
Expected: PASS, all four fixture test files included.

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 8: Verify in the browser**

As a candidate who has not bought reference checks, visit `/hub/account/references`.
Expected: the gauge shows 4.0-ish out of 5, two quote cards render, three category bars render, the fade cuts it off with the CTA legible. Check at 390px width.

- [ ] **Step 9: Commit**

```bash
git commit --only lib/sampleReports/references.ts lib/sampleReports/__tests__/references.test.ts app/hub/account/references/SampleReferenceReport.tsx app/hub/account/references/ReferencesLockedState.tsx -m "$(cat <<'EOF'
feat(hub): show a real sample reference report instead of a blur

Sample referee rows run through the production computeReferenceReport, so
the preview's category averages come from the same code the paid page
uses rather than hand-written numbers.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 8: Full-surface verification

**Files:**
- Modify: none expected. Fix whatever the checks surface.

**Interfaces:**
- Consumes: everything from Tasks 1-7.
- Produces: nothing.

- [ ] **Step 1: Confirm no blur survives**

Run: `grep -rn "filter: \"blur" app/hub/account/`
Expected: no matches in the four locked states. If any other hub component still uses blur legitimately, leave it — this check is scoped to the locked states.

- [ ] **Step 2: Confirm the dead paywall props are gone**

Run: `grep -rn "onOpenPersonalityPaywall\|onOpenReferencesPaywall\|onOpenInterviewStart\|onOpenReportPaywall" app/`
Expected: no matches.

- [ ] **Step 3: Run the full suite and build**

Run: `npm test`
Expected: PASS.

Run: `npm run build`
Expected: build succeeds with no warnings about unused imports in the files this plan touched.

- [ ] **Step 4: Walk the whole flow in a browser**

With a candidate account that owns none of the four products:

1. `/hub/account` — click each of the four feature cards; each navigates, none opens a modal.
2. On each feature page, confirm the sample renders, the fade is flush against the card background, and the CTA is legible over it.
3. Click the CTA on each page; confirm the correct paywall modal opens and closes.
4. Confirm the bundle promo card on the dashboard still opens the report paywall modal.
5. `/hub/account/expert` — the LinkedIn icon opens `https://www.linkedin.com/in/humbe/` in a new tab.
6. Repeat steps 1-2 at 390px width; confirm no horizontal scrolling and no crop that reads as a rendering bug.

- [ ] **Step 5: Confirm nothing regressed for a paying candidate**

With an account that owns all four products, visit each of the four pages.
Expected: the unlocked views render exactly as before. None of the new components appear.

- [ ] **Step 6: Commit any fixes**

If steps 1-5 surfaced nothing, there is nothing to commit. Otherwise commit fixes with `git commit --only <paths>` and a message describing what the verification caught.

---

## Deferred

- **Crop heights are hand-tuned constants** (`cropHeight` per feature). If the copy or fixture content changes materially, they need re-tuning. A content-aware crop is not worth building for four call sites.
- **Fixture prose can drift from real output tone** if the underlying LLM prompts change. Structure stays correct via types; prose is illustrative and accepted as such.
