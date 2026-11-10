# Hub Plans Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Sell two flat-price plans (Assess + Prepare ₹2,996, Assess + Mentor + Apply ₹5,995) to email-allowlisted users only, and replace the personality test for everyone with a personality + culture assessment, ported from the Django psychometrics app, with org-type fit.

**Architecture:** Extend the existing bundle pattern. Two new `product_type` values flow through the existing `razorpay_transactions` → `finalizeRazorpayOrder` pipeline. A plan's grants are: `product_unlocks` rows, a `counselling_requests` row (Plan 2), the plan txn's own `consumed_at` as the single 45-min interview credit, and 3 report credits counted from a new `report_unlocks.order_id`. The allowlist is a new admin-managed table checked server-side in `initiate`. Psychometrics scoring is a pure TS port, checked against golden JSON produced by running the real Python `scoring.py`.

**Tech Stack:** Next.js 16.2.4 (App Router, `--webpack`), React, Supabase Postgres (service-role client `@/lib/supabase`, session client `@/lib/supabaseAuthServer`), Razorpay, Vitest (`npm test`, `npm run test:db`), Python 3.12 (golden generation only).

**Spec:** `plans/2026-11-10-hub-plans-design.md`. It was approved 2026-11-10. Do not change its decisions. If you hit a question it does not answer, add it to "Open issues for PM" and stop that task.

---

## Open issues for PM

Each task below takes the listed **default** so work isn't blocked. Confirm or override before Phase B or Phase D ships.

1. **Skill cap 10 vs. when the IntervueBox job gets created (spec "AI interview").** The job and its skill list are created at **fitment-check** time (`app/api/hub/fitment-check/route.ts:319` → `createJob` → `maxSkillsForLevel`). That happens before the plan is bought and before the interview starts. Only the interview *agent* (`maxInterviewMinutes`) is created at interview start. **Default (B5):** at interview start, a plan credit forces 45 min. At fitment-check, a user who holds an unused plan interview gets 10 skills. Leads created *before* the plan purchase keep 7 skills (entry/mid) but still get 45 min. To change that, we would need to know whether IntervueBox lets us update a job's skills, which is a vendor question.
2. **Second plan purchase / upgrade (Plan 1 → Plan 2).** The spec doesn't cover it. **Default (B2):** a user who already has a successful plan gets 409 on any further plan order. No upgrade path.
3. **Plan buyers who already have a v1 personality result.** The spec says "existing results stay viewable as old version" and "no credit for earlier purchases". So a plan buyer with a v1 row keeps the v1 report and never sees the culture part. **Default (C5):** no retake. The PM may want v1 holders, or only plan buyers, to be able to take v2.
4. **"SD of the 4 candidate scores < 8".** The spec doesn't say population or sample SD. **Default (D1):** population SD (divide by 4).
5. **Benchmark row doesn't sum to 100.** Hospital / healthcare is 31+21+22+24 = **98**. The spec says the rows are ipsative and sum to 100, and step 1 says "subtract 25". **Default (D1):** compute true Pearson r, which centres each benchmark on its own mean. That gives exactly the spec's result for the six rows that sum to 100. PM: correct the hospital numbers, or accept this.
6. **`reliable = null`.** This happens when an attention check is skipped. The spec only defines `false`. Our UI requires every item to be answered, so null can't occur from the Hub. **Default:** null is treated like true (fit is shown).
7. **Server-side block on individual purchases for allowlisted users without a plan.** The spec only says pricing surfaces show plans only. **Default (E):** UI only. `initiate`/`unlock-report` still accept individual products at normal prices.
8. **Report-credit race.** Two *concurrent* unlocks of different leads can both see "1 left" and spend a 4th credit. **Default (B6):** accepted, with a `shortcut:` comment. The upgrade path is a Postgres function with a row lock.
9. **Migration numbers.** `0067_interview_skill_rubric.sql` is taken by the unmerged `worktree-interview-skill-rubric`. This plan uses **0068** (A), **0069** (B) and **0070** (C). Re-check the directory right before creating each file.
10. **Report narrative depth.** `report_rules.py` is 1,699 lines of admin/leadership narrative and is not ported. Strengths and development areas reuse the existing `TRAIT_WORK_IMPLICATION` copy (`lib/personality.ts`). The culture and caveat copy is new. PM: confirm that's enough for "strengths & development areas".

---

## Global Constraints

- Normal users: **no pricing change.** `PRODUCT_PRICING` existing rows stay byte-identical. Public `app/hub/PricingSection.tsx` stays unchanged.
- Plan prices are flat: `plan_prepare` = 299600 paise and `plan_mentor` = 599500 paise at every level.
- Plan purchase is allowed only if `lower(auth email)` is in `plan_allowlist`, **checked server-side in order creation**.
- Removing an email from the allowlist never revokes a purchase.
- Entitlements never expire. Each is single-use: 1 interview (45 min), 3 role reports, 1 personality test, 1 reference round, and 1 mentoring session (Plan 2 only).
- After a plan: 4th report ₹299 and reference refresh ₹149 (existing prices).
- Application assistance: **card copy only**, "we refer you", no guarantee. Nothing is built for it.
- Personality v2 = 60 IPIP + 5 IM items (1–5). Culture = 36 CVF + 3 attention items (1–7). Port both verbatim from `D:\Work-Projects\staff-assessment-platform\backend\apps\psychometrics\seed_data.py`. No timer.
- Scoring must match Python `scoring.py` exactly on golden fixtures.
- Fit % = `round(50 + 50 × r)`. Flat (SD < 8) shows "No strong preference — adaptable across cultures". `reliable === false` shows the culture mix only. Show the top 3 benchmarks and collapse the rest.
- These caveats must appear in the report, verbatim in meaning: typical patterns only (teams inside one company vary more than industries do); fit modestly predicts satisfaction and weakly predicts turnover/performance; benchmarks are Merito estimates from small or non-Indian samples; this is a preference, not ability, and not a hiring screen; most people prefer Clan, so a high Clan score is common.
- The report is labelled self-development ("not for hiring/promotion"). The share page labels culture as "self-reported preferences, for development".

## Repo rules (every task)

- **Next.js 16 differs from your training data.** Before writing any route handler, page or client component, read the relevant guide in `node_modules/next/dist/docs/01-app/`. Follow the patterns already in neighbouring files: `searchParams: Promise<…>`, `Response.json`, `export const runtime = "nodejs"`.
- **Migrations:** the prod ledger is desynced. **Never run `supabase db push`.** Write idempotent SQL (`if not exists`, `add value if not exists`, `drop … if exists`). A human applies it by hand in the Supabase SQL editor, then runs `supabase migration repair --status applied <NNNN>`. The agent's task report must say `BLOCKED-ON-HUMAN: apply <file> + repair <NNNN>`. You may apply locally with `supabase start` / `supabase db reset`. After the human applies it to prod, run `npm run verify:schema`.
- **Commits:** the repo has long-lived unrelated pre-staged files. Always run `git commit --only <your paths> -m "…"`. A new (untracked) file must first be added with `git add <that path>`, otherwise `--only` fails with "pathspec did not match". Never run a bare `git commit` or `git add -A`. End each message with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- **Before any push:** run `npm run build` (not just `tsc`) plus `npm test`. Don't push code that depends on an unapplied migration. Merge order is migration applied → code deployed.
- **Never print `.env.local` values.** Don't grep full lines from it.
- **IntervueBox manual tests:** use `roshanrk2014@gmail.com` only.
- Tests live in `__tests__/` next to the code (`*.test.ts`, mocked Supabase) or in `*.dbtest.ts` (real local DB). Vitest only picks up `**/*.test.ts`, so UI logic goes in `.ts` helpers that can be tested.

---

## Phases and dependencies

| Phase | What | Depends on | Size |
|---|---|---|---|
| **A** | Allowlist table + lib + admin page | none (do **Task A1 first**, it's tiny) | S |
| **B** | Plan products, initiate gate, finalize grants, refund, admin grant, reference credits, 45-min interview, report credits | A1 | L |
| **C** | Personality v2 + culture port, golden tests, migration, save route, two-part test UI | none | M–L |
| **D** | Culture fit + benchmarks, combined report (Hub + PDF), share page | C (C3, C4) | M |
| **E** | Plan pricing UI, plan-state API, paywall surfaces | A1, B1 (B2 for buying) | M |

Run order: A1 → then A2–A3 ‖ B ‖ C in parallel worktrees → D after C → E after B1 (E can be built alongside B, but integration-test it after B2). Each phase ends in its own branch: `feat/hub-plans-a-allowlist`, `-b-products`, `-c-psychometrics`, `-d-report`, `-e-pricing-ui`. Merge to `main` in the order A, B, C, D, E. Migrations 0068/0069/0070 must be applied to prod before the code that needs them is deployed.

**Shared interfaces (exact names; every phase relies on these):**

```ts
// lib/planAllowlist.ts (A1)
export function parseEmailList(text: string): { valid: string[]; invalid: string[] };
export async function isEmailAllowlisted(email: string | null | undefined): Promise<boolean>;

// lib/plans.ts (B1; E1 adds getPlanState)
export const PLAN_PRODUCTS: readonly ["plan_prepare", "plan_mentor"];
export type PlanProduct = "plan_prepare" | "plan_mentor";
export const PLAN_REPORT_CREDITS = 3;
export const PLAN_INTERVIEW_MINUTES = 45;
export function isPlanProduct(p: unknown): p is PlanProduct;
export type PlanOrder = { orderId: string; product: PlanProduct; interviewUsed: boolean };
export async function getPlanOrder(userId: string): Promise<PlanOrder | null>;
export async function planReportCreditsLeft(orderId: string): Promise<number>;
export type PlanState = { allowlisted: boolean; plan: (PlanOrder & { reportCreditsLeft: number }) | null };
export async function getPlanState(userId: string, email: string | null | undefined): Promise<PlanState>;

// lib/psychometrics/* (C)
export type CultureKey = "Clan" | "Adhocracy" | "Market" | "Hierarchy";
export type CultureScores = Record<CultureKey, number>;
export function scorePersonality(answers: Record<string, number>): PersonalityResultV2;
export function scoreCulture(answers: Record<string, number>): CultureResult;
// lib/psychometrics/cultureFit.ts (D1)
export function cultureFit(scores: CultureScores, reliable: boolean | null): FitResult;
```

---

# Phase A — Allowlist

### Task A1: allowlist table + lib

**Files:**
- Create: `supabase/migrations/0068_plan_allowlist.sql`
- Create: `lib/planAllowlist.ts`
- Modify: `lib/adminAuditLog.ts:3` (add `"plan_allowlist"` to `AuditTargetType`)
- Modify: `lib/schemaContract.ts` (add one check inside `SCHEMA_CONTRACT`)
- Test: `lib/__tests__/planAllowlist.test.ts`

**Interfaces:** Produces `parseEmailList`, `isEmailAllowlisted`, `listAllowlist`, `addToAllowlist`, `removeFromAllowlist`.

- [ ] **Step 1: Migration** (`ls supabase/migrations` first and confirm 0068 is free)

```sql
-- 0068_plan_allowlist.sql
-- Emails allowed to buy Hub plans (spec plans/2026-11-10-hub-plans-design.md).
-- Idempotent: applied by hand in the SQL editor + `supabase migration repair --status applied 0068`.
create table if not exists plan_allowlist (
  email text primary key check (email = lower(btrim(email)) and email <> ''),
  added_by text not null,
  added_at timestamptz not null default now(),
  note text
);
alter table plan_allowlist enable row level security;
-- No policies on purpose: only the server's service-role client reads/writes it.
```

- [ ] **Step 2: Write the failing test** `lib/__tests__/planAllowlist.test.ts`

```ts
import { describe, it, expect, vi, beforeEach } from "vitest";

const maybeSingleMock = vi.fn();
const eqMock = vi.fn(() => ({ maybeSingle: maybeSingleMock }));
const selectMock = vi.fn(() => ({ eq: eqMock }));
vi.mock("@/lib/supabase", () => ({ getSupabaseServerClient: () => ({ from: () => ({ select: selectMock }) }) }));
vi.mock("@/lib/adminAuditLog", () => ({ logAdminAction: vi.fn() }));

import { parseEmailList, isEmailAllowlisted } from "@/lib/planAllowlist";

describe("parseEmailList", () => {
  it("splits on newlines, commas, semicolons and spaces, lowercases and dedupes", () => {
    expect(parseEmailList("A@x.com, b@y.in\nA@X.com; c@z.org  bad-email")).toEqual({
      valid: ["a@x.com", "b@y.in", "c@z.org"],
      invalid: ["bad-email"],
    });
  });
  it("ignores empty input", () => {
    expect(parseEmailList(" \n ,")).toEqual({ valid: [], invalid: [] });
  });
});

describe("isEmailAllowlisted", () => {
  beforeEach(() => { eqMock.mockClear(); maybeSingleMock.mockReset(); });
  it("matches case-insensitively", async () => {
    maybeSingleMock.mockResolvedValue({ data: { email: "a@x.com" }, error: null });
    expect(await isEmailAllowlisted("  A@X.com ")).toBe(true);
    expect(eqMock).toHaveBeenCalledWith("email", "a@x.com");
  });
  it("returns false for a missing email without querying", async () => {
    expect(await isEmailAllowlisted(undefined)).toBe(false);
    expect(eqMock).not.toHaveBeenCalled();
  });
  it("throws on a DB error (fail closed, never sells to unlisted)", async () => {
    maybeSingleMock.mockResolvedValue({ data: null, error: { message: "boom" } });
    await expect(isEmailAllowlisted("a@x.com")).rejects.toThrow("boom");
  });
});
```

- [ ] **Step 3: Run it.** `npx vitest run lib/__tests__/planAllowlist.test.ts` should FAIL with "Cannot find module".

- [ ] **Step 4: Implement** `lib/planAllowlist.ts`

```ts
import { getSupabaseServerClient } from "@/lib/supabase";
import { logAdminAction } from "@/lib/adminAuditLog";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function parseEmailList(text: string): { valid: string[]; invalid: string[] } {
  const valid = new Set<string>();
  const invalid: string[] = [];
  for (const raw of text.split(/[\s,;]+/)) {
    const email = raw.trim().toLowerCase();
    if (!email) continue;
    if (EMAIL_RE.test(email)) valid.add(email);
    else invalid.push(raw.trim());
  }
  return { valid: [...valid], invalid };
}

export async function isEmailAllowlisted(email: string | null | undefined): Promise<boolean> {
  const normalized = email?.trim().toLowerCase();
  if (!normalized) return false;
  const { data, error } = await getSupabaseServerClient()
    .from("plan_allowlist")
    .select("email")
    .eq("email", normalized)
    .maybeSingle();
  if (error) throw new Error(`Failed to check plan allowlist: ${error.message}`);
  return Boolean(data);
}

export type AllowlistRow = { email: string; added_by: string; added_at: string; note: string | null };

export async function listAllowlist(): Promise<AllowlistRow[]> {
  const { data, error } = await getSupabaseServerClient()
    .from("plan_allowlist")
    .select("email, added_by, added_at, note")
    .order("added_at", { ascending: false });
  if (error) throw new Error(`Failed to list plan allowlist: ${error.message}`);
  return data ?? [];
}

// Returns how many emails were newly added; re-adding an existing email is a no-op.
export async function addToAllowlist(emails: string[], note: string | null, adminEmail: string): Promise<number> {
  if (emails.length === 0) return 0;
  const { data, error } = await getSupabaseServerClient()
    .from("plan_allowlist")
    .upsert(emails.map((email) => ({ email, added_by: adminEmail, note })), { onConflict: "email", ignoreDuplicates: true })
    .select("email");
  if (error) throw new Error(`Failed to add to plan allowlist: ${error.message}`);
  const added = (data ?? []).map((r) => r.email as string);
  for (const email of added) {
    await logAdminAction({ adminEmail, action: "plan_allowlist.add", targetType: "plan_allowlist", targetId: email, newValue: { note } });
  }
  return added.length;
}

// Removing never revokes a plan already bought (spec): it only stops new plan orders.
export async function removeFromAllowlist(email: string, adminEmail: string): Promise<void> {
  const normalized = email.trim().toLowerCase();
  const { error } = await getSupabaseServerClient().from("plan_allowlist").delete().eq("email", normalized);
  if (error) throw new Error(`Failed to remove from plan allowlist: ${error.message}`);
  await logAdminAction({ adminEmail, action: "plan_allowlist.remove", targetType: "plan_allowlist", targetId: normalized });
}
```

In `lib/adminAuditLog.ts:3`, append `| "plan_allowlist"` to `AuditTargetType`. The `admin_audit_log.target_type` column has no check constraint (0034), so no migration is needed.

In `lib/schemaContract.ts`, add to `SCHEMA_CONTRACT` after the `product_unlocks` entry:

```ts
  uniqueOn("plan_allowlist", ["email"], 'planAllowlist upserts with onConflict:"email"'),
```

- [ ] **Step 5:** `npx vitest run lib/__tests__/planAllowlist.test.ts lib/__tests__/schemaContract.test.ts` should PASS. If `schemaContract.test.ts` asserts a check count, update it.
- [ ] **Step 6: Commit**

```bash
git commit --only supabase/migrations/0068_plan_allowlist.sql lib/planAllowlist.ts lib/adminAuditLog.ts lib/schemaContract.ts lib/__tests__/planAllowlist.test.ts -m "feat(hub-plans): plan_allowlist table + lib

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

### Task A2: admin allowlist API

**Files:**
- Create: `app/api/admin/plan-allowlist/route.ts`
- Test: `app/api/admin/plan-allowlist/__tests__/route.test.ts`

Mirror `app/api/admin/payments/grant/route.ts`: `requireAdmin` → zod → `enforceAdminRateLimit` → lib.

- [ ] **Step 1: Failing test.** Mock `@/lib/adminAuth` (`requireAdmin` resolves `{ email: "admin@merito.in" }`), `@/lib/adminRateLimit` (`enforceAdminRateLimit` resolves, and export a `RateLimitExceededError` class), and `@/lib/planAllowlist` (keep the real `parseEmailList` via `vi.importActual`, and mock `addToAllowlist`/`removeFromAllowlist`). Cases:
  - `POST {emails:"A@x.com, bad", note:"Pune seminar 2026-11"}` → 200 `{ added: 1, invalid: ["bad"] }`, and `addToAllowlist` was called with `(["a@x.com"], "Pune seminar 2026-11", "admin@merito.in")`.
  - `POST {emails:""}` → 400.
  - `DELETE {email:"a@x.com"}` → 200, and `removeFromAllowlist("a@x.com","admin@merito.in")`.
  - `DELETE {email:"nope"}` → 400.
- [ ] **Step 2:** Run it and confirm FAIL.
- [ ] **Step 3: Implement**

```ts
import { z } from "zod";
import { requireAdmin } from "@/lib/adminAuth";
import { enforceAdminRateLimit, RateLimitExceededError } from "@/lib/adminRateLimit";
import { parseEmailList, addToAllowlist, removeFromAllowlist } from "@/lib/planAllowlist";

const PostSchema = z.object({ emails: z.string().min(1), note: z.string().max(200).optional() });
const DeleteSchema = z.object({ email: z.string().email() });

async function readJson(request: Request): Promise<unknown> {
  try { return await request.json(); } catch { return null; }
}

function errorResponse(error: unknown) {
  if (error instanceof RateLimitExceededError) return Response.json({ error: error.message }, { status: 429 });
  return Response.json({ error: error instanceof Error ? error.message : "Failed." }, { status: 500 });
}

export async function POST(request: Request) {
  const admin = await requireAdmin();
  const parsed = PostSchema.safeParse(await readJson(request));
  if (!parsed.success) return Response.json({ error: "Paste at least one email." }, { status: 400 });
  const { valid, invalid } = parseEmailList(parsed.data.emails);
  if (valid.length === 0) return Response.json({ error: "No valid emails found.", invalid }, { status: 400 });
  try {
    await enforceAdminRateLimit(admin.email as string, "plan_allowlist.add");
    const added = await addToAllowlist(valid, parsed.data.note?.trim() || null, admin.email as string);
    return Response.json({ added, invalid });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(request: Request) {
  const admin = await requireAdmin();
  const parsed = DeleteSchema.safeParse(await readJson(request));
  if (!parsed.success) return Response.json({ error: "A valid email is required." }, { status: 400 });
  try {
    await enforceAdminRateLimit(admin.email as string, "plan_allowlist.remove");
    await removeFromAllowlist(parsed.data.email, admin.email as string);
    return Response.json({ ok: true });
  } catch (error) {
    return errorResponse(error);
  }
}
```

- [ ] **Step 4:** Run the test and confirm PASS.
- [ ] **Step 5:** `git commit --only app/api/admin/plan-allowlist -m "feat(hub-plans): admin allowlist API" …` (with the trailer).

### Task A3: admin allowlist page

**Files:**
- Create: `app/admin/plan-allowlist/page.tsx` (server)
- Create: `app/admin/plan-allowlist/AllowlistForm.tsx` (client)
- Create: `app/admin/plan-allowlist/RemoveButton.tsx` (client)
- Modify: `app/admin/_components/AdminSidebar.tsx:19` (add the nav item after Payments)

Follow `app/admin/payments/GrantForm.tsx` for style (Poppins, `inputStyle`, `Button`, `ConfirmDialog`, `useToast`, `router.refresh()`). Before you style anything, read memory note "Design plugin fit check": the admin look is minimalist, so don't pull in marketing styles.

- [ ] **Step 1:** Sidebar: `{ label: "Plan Allowlist", href: "/admin/plan-allowlist" },` after `Payments`.
- [ ] **Step 2:** `page.tsx`:

```tsx
import { requireAdmin } from "@/lib/adminAuth";
import { listAllowlist } from "@/lib/planAllowlist";
import AllowlistForm from "./AllowlistForm";
import RemoveButton from "./RemoveButton";

export default async function PlanAllowlistPage() {
  await requireAdmin();
  const rows = await listAllowlist();
  return (
    <div className="font-[family-name:var(--font-poppins)]">
      <h1 style={{ fontSize: 22, fontWeight: 600, margin: "0 0 6px" }}>Plan allowlist</h1>
      <p style={{ fontSize: 13, color: "#6b6b6b", margin: "0 0 20px" }}>
        Signed-in users with these emails see the two plans instead of individual prices. Removing an email does not take away a plan already bought.
      </p>
      <AllowlistForm />
      <p style={{ fontSize: 13, margin: "0 0 8px" }}>{rows.length} emails</p>
      <table style={{ width: "100%", fontSize: 13, borderCollapse: "collapse" }}>
        <thead><tr><th align="left">Email</th><th align="left">Note</th><th align="left">Added by</th><th align="left">Added</th><th /></tr></thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.email} style={{ borderTop: "1px solid #eee" }}>
              <td>{r.email}</td><td>{r.note ?? "—"}</td><td>{r.added_by}</td>
              <td>{new Date(r.added_at).toLocaleDateString("en-IN")}</td>
              <td align="right"><RemoveButton email={r.email} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

- [ ] **Step 3:** `AllowlistForm.tsx` has a textarea (placeholder "One email per line, or comma separated"), a note input (placeholder "e.g. Pune seminar 2026-11") and an Add button. It sends `POST /api/admin/plan-allowlist {emails, note}`. On success: toast `Added ${added}${invalid.length ? ` · skipped invalid: ${invalid.join(", ")}` : ""}`, clear the inputs, then `router.refresh()`.
- [ ] **Step 4:** `RemoveButton.tsx` opens a `ConfirmDialog` ("Remove {email}? Plans already bought are kept."), sends `DELETE /api/admin/plan-allowlist {email}`, then toast + `router.refresh()`.
- [ ] **Step 5: Manual check.** Run `npm run dev`, open `/admin/plan-allowlist` against a local DB with 0068 applied, then add, list and remove. Run `npm run build` and confirm PASS.
- [ ] **Step 6:** `git commit --only app/admin/plan-allowlist app/admin/_components/AdminSidebar.tsx -m "feat(hub-plans): admin allowlist page" …`

---

# Phase B — Plan products and entitlements

### Task B1: products, migration, plans lib

**Files:**
- Create: `supabase/migrations/0069_plan_products.sql`
- Modify: `lib/razorpay/pricing.ts`
- Create: `lib/plans.ts`
- Modify: `lib/schemaContract.ts`
- Test: `lib/__tests__/plans.test.ts`

- [ ] **Step 1: Migration**

```sql
-- 0069_plan_products.sql — Hub plans (plans/2026-11-10-hub-plans-design.md).
-- Idempotent; apply by hand + `supabase migration repair --status applied 0069`.
-- ADD VALUE can't be used in the same transaction it's added in; nothing below uses it.
alter type product_type add value if not exists 'plan_prepare';
alter type product_type add value if not exists 'plan_mentor';

-- Which paid order a report unlock was spent from. Plan report credits =
-- 3 - count(report_unlocks where order_id = plan order). NULL for every
-- existing/individual unlock.
alter table report_unlocks
  add column if not exists order_id text references razorpay_transactions(order_id) on delete set null;
create index if not exists report_unlocks_order_id_idx on report_unlocks(order_id) where order_id is not null;
```

- [ ] **Step 2: Failing test** `lib/__tests__/plans.test.ts`. Mock `@/lib/supabase` with a chainable fake (follow `lib/__tests__/referenceCredits.test.ts`). Cases:
  - `isPlanProduct("plan_prepare") === true`, `isPlanProduct("bundle") === false`, `isPlanProduct(undefined) === false`.
  - `PRODUCT_PRICING.plan_prepare` is `{entry:299600, mid:299600, senior:299600}` and `plan_mentor` is 599500 at every level. The existing 6 rows are unchanged (assert each literal value).
  - `getPlanOrder` returns `null` when no row. For row `{order_id:"o1", product:"plan_mentor", consumed_at:null}` it returns `{orderId:"o1", product:"plan_mentor", interviewUsed:false}`. Assert the query used `.eq("status","success")` and `.in("product", ["plan_prepare","plan_mentor"])`.
  - `planReportCreditsLeft("o1")` with count 2 → 1, with count 5 → 0.
- [ ] **Step 3:** Run it and confirm FAIL.
- [ ] **Step 4: Implement.** In `lib/razorpay/pricing.ts`:

```ts
export type RazorpayProduct = "report" | "personality" | "references" | "interview" | "counselling" | "bundle" | "plan_prepare" | "plan_mentor";
// in PRODUCT_PRICING, append (plans are flat — no level split):
  plan_prepare: { entry: 299600, mid: 299600, senior: 299600 },
  plan_mentor: { entry: 599500, mid: 599500, senior: 599500 },
// in PRODUCT_LABELS, append:
  plan_prepare: "Assess + Prepare",
  plan_mentor: "Assess + Mentor + Apply",
```

`lib/plans.ts`:

```ts
import { getSupabaseServerClient } from "@/lib/supabase";

export const PLAN_PRODUCTS = ["plan_prepare", "plan_mentor"] as const;
export type PlanProduct = (typeof PLAN_PRODUCTS)[number];
export const PLAN_REPORT_CREDITS = 3;
export const PLAN_INTERVIEW_MINUTES = 45;

export function isPlanProduct(p: unknown): p is PlanProduct {
  return typeof p === "string" && (PLAN_PRODUCTS as readonly string[]).includes(p);
}

export type PlanOrder = { orderId: string; product: PlanProduct; interviewUsed: boolean };

// initiate refuses a second plan, so the newest successful plan row is the plan.
// Its consumed_at doubles as the plan's single interview credit (start-ai-interview).
export async function getPlanOrder(userId: string): Promise<PlanOrder | null> {
  const { data, error } = await getSupabaseServerClient()
    .from("razorpay_transactions")
    .select("order_id, product, consumed_at")
    .eq("user_id", userId)
    .eq("status", "success")
    .in("product", [...PLAN_PRODUCTS])
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw new Error(`Failed to load plan: ${error.message}`);
  if (!data) return null;
  return { orderId: data.order_id, product: data.product as PlanProduct, interviewUsed: data.consumed_at !== null };
}

export async function planReportCreditsLeft(orderId: string): Promise<number> {
  const { count, error } = await getSupabaseServerClient()
    .from("report_unlocks")
    .select("user_id", { count: "exact", head: true })
    .eq("order_id", orderId);
  if (error) throw new Error(`Failed to count plan report credits: ${error.message}`);
  return Math.max(0, PLAN_REPORT_CREDITS - (count ?? 0));
}
```

In `lib/schemaContract.ts` add `columnExists("report_unlocks", "order_id", "plan report credits count report_unlocks.order_id (migration 0069)"),`.

- [ ] **Step 5:** Run `npx vitest run lib/__tests__/plans.test.ts` and confirm PASS. Then `npx tsc --noEmit`, because adding to the `RazorpayProduct` union breaks exhaustive `Record<RazorpayProduct,…>` maps. Fix every error by adding plan entries, never by casting. Known spot: `lib/analytics.ts` `PURCHASE_EVENT` (if keyed by product, add `plan_prepare: "purchase_plan_prepare"`, `plan_mentor: "purchase_plan_mentor"`).
- [ ] **Step 6:** Commit `supabase/migrations/0069_plan_products.sql lib/razorpay/pricing.ts lib/plans.ts lib/schemaContract.ts lib/__tests__/plans.test.ts` plus any files you fixed for tsc. Report `BLOCKED-ON-HUMAN: apply 0069`.

### Task B2: plan orders in initiate (allowlist gate)

**Files:**
- Modify: `app/api/hub/razorpay/initiate/route.ts`
- Test: `app/api/hub/razorpay/initiate/__tests__/route.test.ts` (extend)

**Consumes:** `isEmailAllowlisted` (A1), `isPlanProduct`, `getPlanOrder` (B1).

- [ ] **Step 1: Failing tests** (add to the existing describe). Mock `@/lib/planAllowlist` (`isEmailAllowlisted`) and `@/lib/plans` (`getPlanOrder`; keep the real `isPlanProduct` via `vi.importActual`):
  - Allowlisted, no plan, `{product:"plan_prepare"}` → 200, `amountPaise` 299600, and insert has `product:"plan_prepare"`, `lead_id:null`.
  - `plan_mentor` → 599500, even when the lead level is `senior`.
  - Not allowlisted → **403** `{error:"Plans aren't available on this account."}`, and `createOrder` is not called.
  - Allowlisted but `getPlanOrder` returns a plan → **409**, no order.
  - `isEmailAllowlisted` rejects → 500, no order (fail closed).
- [ ] **Step 2:** Run them and confirm FAIL.
- [ ] **Step 3: Implement.** Change `INITIATABLE_PRODUCTS` to `["counselling","personality","references","interview","plan_prepare","plan_mentor"]`. After `const product = body.product;` insert:

```ts
  if (isPlanProduct(product)) {
    // Server-side gate (spec): hiding the plan in the UI is not enough.
    let allowlisted: boolean;
    try {
      allowlisted = await isEmailAllowlisted(user.email);
    } catch {
      return Response.json({ error: "Something went wrong starting payment." }, { status: 500 });
    }
    if (!allowlisted) {
      return Response.json({ error: "Plans aren't available on this account." }, { status: 403 });
    }
    if (await getPlanOrder(user.id)) {
      return Response.json({ error: "You already have a plan." }, { status: 409 });
    }
  }
```

No price change is needed: `PRODUCT_PRICING[product][level]` is already flat for plans.
- [ ] **Step 4:** Run it and confirm PASS. Commit.

### Task B3: finalize grants + refund reversal

**Files:**
- Create: `lib/planGrants.ts`
- Modify: `lib/razorpay/finalize.ts` (effect chain around :96-110, refund around :190-210)
- Test: `lib/__tests__/planGrants.test.ts`, `lib/razorpay/__tests__/finalize.test.ts` (extend)

- [ ] **Step 1: Failing tests.**
  - `planGrants.test.ts`: `applyPlanGrants("u1","o1","plan_prepare")` calls `unlockProduct("u1","personality")` and `unlockProduct("u1","references")` and does **not** touch `counselling_requests`. With `"plan_mentor"` it also inserts `{user_id:"u1", order_id:"o1"}`. When a `counselling_requests` row with `order_id "o1"` already exists, it does not insert again (retry idempotency). An insert error throws.
  - `finalize.test.ts`:
    - (a) txn `{product:"plan_mentor", status:"initiated"}` calls `applyPlanGrants(user, orderId, "plan_mentor")`, then sets status to success. It does not call `unlockReport`.
    - (b) When `applyPlanGrants` throws, status is not updated (the txn stays initiated, so the retry is real).
    - (c) Already `success` → `applyPlanGrants` not called (webhook/verify/reconcile replay is idempotent).
    - (d) `markRazorpayRefunded` on a success plan: deletes `report_unlocks` where `order_id = orderId`; revokes personality only when no other success `personality|bundle|plan_*` txn exists (excluding this order); revokes references via the existing `revokeReferencesUnlessOtherwisePaid`; cancels its counselling request via the existing `revokeCounsellingForOrder`; sets status `refunded`.
    - (e) Same as (d), but another `personality` success exists → personality is not revoked.
- [ ] **Step 2:** Run them and confirm FAIL.
- [ ] **Step 3: Implement** `lib/planGrants.ts`:

```ts
import { getSupabaseServerClient } from "@/lib/supabase";
import { unlockProduct } from "@/lib/productUnlocks";
import type { PlanProduct } from "@/lib/plans";

// Effects of a paid (or admin-comped) plan. Idempotent: safe on webhook/verify/reconcile replays.
// Interview: the success+unconsumed plan txn itself is the credit (start-ai-interview).
// Reports: 3 credits are derived from report_unlocks.order_id (lib/plans.ts), nothing to write here.
export async function applyPlanGrants(userId: string, orderId: string, product: PlanProduct): Promise<void> {
  await unlockProduct(userId, "personality");
  await unlockProduct(userId, "references");
  if (product !== "plan_mentor") return;
  const supabase = getSupabaseServerClient();
  const { data: existing, error: readError } = await supabase
    .from("counselling_requests").select("id").eq("order_id", orderId).maybeSingle();
  if (readError) throw new Error(`Failed to check plan mentoring request: ${readError.message}`);
  if (existing) return;
  const { error } = await supabase.from("counselling_requests").insert({ user_id: userId, order_id: orderId });
  if (error) throw new Error(`Failed to record plan mentoring request: ${error.message}`);
}
```

In `finalize.ts`: import `isPlanProduct, PLAN_PRODUCTS` from `@/lib/plans` and `applyPlanGrants` from `@/lib/planGrants`. Add the effect branch after the `bundle` branch:

```ts
    } else if (isPlanProduct(product)) {
      await applyPlanGrants(txn.user_id, orderId, product);
    }
```

Add the refund branch after the `bundle` branch in `markRazorpayRefunded`:

```ts
  } else if (isPlanProduct(txn.product)) {
    const { error: unlockError } = await supabase.from("report_unlocks").delete().eq("order_id", orderId);
    if (unlockError) throw new Error(`Failed to revoke plan reports: ${unlockError.message}`);
    await revokePersonalityUnlessOtherwisePaid(txn.user_id, orderId);
    await revokeReferencesUnlessOtherwisePaid(txn.user_id, orderId);
    await revokeCounsellingForOrder(supabase, orderId);
  }
```

Add the helper next to `revokeReferencesUnlessOtherwisePaid`:

```ts
// A plan buyer may also own personality from an earlier individual/bundle purchase: keep it.
async function revokePersonalityUnlessOtherwisePaid(userId: string, refundedOrderId: string): Promise<void> {
  const { count, error } = await getSupabaseServerClient()
    .from("razorpay_transactions")
    .select("order_id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("status", "success")
    .in("product", ["personality", "bundle", ...PLAN_PRODUCTS])
    .neq("order_id", refundedOrderId);
  if (error) throw new Error(`Failed to check other personality purchases: ${error.message}`);
  if ((count ?? 0) > 0) return;
  await revokeProduct(userId, "personality");
}
```

Interview needs no refund code. The existing status flip to `refunded` removes the credit, because start-ai-interview requires `status='success'`.
- [ ] **Step 4:** Run `npx vitest run lib/__tests__/planGrants.test.ts lib/razorpay/__tests__/finalize.test.ts lib/razorpay/__tests__/reconcile.test.ts` and confirm PASS. `verify/route.ts` needs no change: plan orders have `lead_id null`, so it returns `{status:"unlocked"}`. Add one test in `app/api/hub/razorpay/verify/__tests__` asserting that.
- [ ] **Step 5:** Commit.

### Task B4: reference credits, unpaid-unlock audit, admin grant

**Files:**
- Modify: `lib/referenceCredits.ts:16`, `lib/adminPayments.ts` (`findUnpaidUnlocks` :37-69, `grantFreeAccess` :315-381), `app/api/admin/payments/grant/route.ts:8`, `app/admin/payments/GrantForm.tsx:9`
- Test: `lib/__tests__/referenceCredits.test.ts`, `lib/__tests__/adminPayments.test.ts`, `app/api/admin/payments/grant/__tests__/route.test.ts`

Why this matters: without the first change, a plan buyer gets `countReferenceCredits = 0`, so `referenceRefreshNeedsPayment` returns `0 >= 0 → true`. That would charge ₹149 for the reference round they already paid for.

- [ ] **Step 1: Failing tests.**
  - `countReferenceCredits` queries `.in("product", ["references","bundle","plan_prepare","plan_mentor"])`.
  - `findUnpaidUnlocks`: a user with a successful `plan_prepare` txn and a `personality` unlock, a `references` unlock and a report unlock is **not** flagged.
  - `grantFreeAccess({product:"plan_mentor", …})` inserts a $0 txn with `consumed_at: null` (interview credit unused) and calls `applyPlanGrants(userId, orderId, "plan_mentor")`. It does **not** require an allowlist entry (admin decides). It throws `"Candidate already has a plan."` when `getPlanOrder` returns one.
  - The grant route accepts `product:"plan_prepare"`.
- [ ] **Step 2:** Run them and confirm FAIL.
- [ ] **Step 3: Implement.**
  - `referenceCredits.ts`: `.in("product", ["references", "bundle", ...PLAN_PRODUCTS])`, and update the comment ("each successful references, bundle or plan payment is one credit").
  - `findUnpaidUnlocks`: build `planCoveredUsers` from `t.product === "plan_prepare" || t.product === "plan_mentor"` and treat it exactly like `bundleCoveredUsers` in both the report and product checks. This is a shortcut: plan users count as covered for all their reports, the same simplification bundle already uses.
  - `grantFreeAccess`: right after the `personality|references` already-unlocked guard, add `if (isPlanProduct(params.product) && (await getPlanOrder(userId))) throw new Error("Candidate already has a plan.");`. Change `consumedAt` to `params.product === "interview" || isPlanProduct(params.product) ? null : new Date().toISOString()`. Add the branch `else if (isPlanProduct(params.product)) { await applyPlanGrants(userId, orderId, params.product); }`.
  - Grant route zod enum and `GrantForm` `PRODUCTS`: append `"plan_prepare", "plan_mentor"`.
- [ ] **Step 4:** Run them and confirm PASS. Commit.

### Task B5: 45-minute plan interview

**Files:**
- Modify: `lib/intervuebox/agents.ts:47-75`, `lib/intervuebox/jobs.ts:6-12,74-81,100-136`, `app/api/hub/start-ai-interview/route.ts:96-120,170-173`, `app/api/hub/fitment-check/route.ts:~319`
- Test: `lib/intervuebox/__tests__/agents.test.ts`, `lib/intervuebox/__tests__/jobs.test.ts`, `app/api/hub/start-ai-interview/__tests__/route.test.ts`, `app/api/hub/fitment-check/__tests__/route.test.ts` (extend whichever exist; otherwise create them next to the code)

- [ ] **Step 1: Failing tests.**
  - `createInterviewAgent("j","Sales Executive","entry")` posts `maxInterviewMinutes: 30` (unchanged). `createInterviewAgent("j","Sales Executive","entry", 45)` posts 45.
  - `createJob({…, candidateLevel:"entry", maxSkills: 10})` passes `max=10` to skill extraction. Without `maxSkills` it passes 7.
  - start-ai-interview, not bypassed:
    - (a) only a success/unconsumed `plan_prepare` txn → consumes that order and calls `createInterviewAgent(..., "entry", 45)`.
    - (b) only an `interview` txn, entry → `createInterviewAgent` gets `undefined` as the 4th argument, i.e. 30 (normal users unchanged).
    - (c) plan txn with `consumed_at` set → 402 (one start only).
    - (d) invite chain throws after consuming a plan credit → `consumed_at` is reset to null on the plan order.
    - Assert the credit query uses `.in("product", ["interview","plan_prepare","plan_mentor"])`.
  - fitment-check: a session user whose `getPlanOrder` returns `{interviewUsed:false}` → `createJob` receives `maxSkills: 10`. Anonymous, or plan with interview used → `maxSkills` undefined.
- [ ] **Step 2:** Run them and confirm FAIL.
- [ ] **Step 3: Implement.**
  - `agents.ts`:

```ts
export async function createInterviewAgent(
  jobId: string,
  roleTitle: string,
  candidateLevel: CandidateLevel,
  // Plan interviews are always 45 min regardless of level (plans/2026-11-10-hub-plans-design.md).
  maxInterviewMinutes: 30 | 45 = durationForLevel(candidateLevel)
): Promise<{ ibAgentId: string }> {
  // body unchanged except: maxInterviewMinutes,
```

  - `jobs.ts`: export the map as `export const MAX_SKILLS_BY_DURATION`. Add `maxSkills?: number;` to `CreateJobInput`. Change `resolveSkills(jobTitle, jobDescription, candidateLevel, resumeText, maxSkills?: number)` so it uses `const max = maxSkills ?? maxSkillsForLevel(candidateLevel);`. In `createJob`, call `resolveSkills(input.title, input.jobDescription, input.candidateLevel, input.resumeText, input.maxSkills)`.
  - `start-ai-interview/route.ts`: change the credit query to `.select("order_id, product")` and `.in("product", ["interview", ...PLAN_PRODUCTS])` (replacing `.eq("product","interview")`). After `consumedOrderId = credit.order_id;` set `planMinutes = isPlanProduct(credit.product) ? PLAN_INTERVIEW_MINUTES : undefined;`. Declare `let planMinutes: 45 | undefined;` before the `if (!arePaymentsBypassed())` block. In the chain: `createInterviewAgent(ibJobId, lead.role_title, candidateLevel, planMinutes)`. Credits are still consumed oldest-first.
  - `fitment-check/route.ts`: before the `try { ({ ibJobId } = await createJob(` block:

```ts
  // Open issue #1: only leads created while an unused plan interview exists get the 45-min skill cap.
  const plan = sessionUser ? await getPlanOrder(sessionUser.id).catch(() => null) : null;
  const maxSkills = plan && !plan.interviewUsed ? MAX_SKILLS_BY_DURATION[45] : undefined;
```

  Then pass `maxSkills` into `createJob({ …, maxSkills })`. The `.catch(() => null)` is deliberate: a plan lookup failure must never block a fitment check, and falling back to the level default is harmless.
- [ ] **Step 4:** Run them and confirm PASS. Commit.
- [ ] **Step 5 (manual, after B is deployed to preview):** With `roshanrk2014@gmail.com` as an **entry-level** test candidate holding an admin-comped `plan_prepare`, start the interview. Confirm the IntervueBox agent shows 45 min. Record the agent id in the task report.

### Task B6: plan report credits

**Files:**
- Modify: `lib/reportUnlocks.ts:7-19`, `lib/completeReportUnlock.ts:23-36`, `app/api/hub/unlock-report/route.ts:32-89`
- Test: `lib/__tests__/reportUnlocks.test.ts`, `lib/__tests__/completeReportUnlock.test.ts`, `app/api/hub/unlock-report/__tests__/route.test.ts`

- [ ] **Step 1: Failing tests.**
  - `unlockReport("u","l","Role","o1")` inserts `{user_id, lead_id, role_title, order_id:"o1"}`. Without an orderId, the insert object has **no** `order_id` key, so the existing path is byte-identical.
  - `completeReportUnlock(u, lead, "report", "o1")` forwards `"o1"`.
  - unlock-report, not bypassed, `product:"report"`:
    - (a) `getPlanOrder` → `{orderId:"o1"}`, `planReportCreditsLeft` → 2 → no `createOrder`, `completeReportUnlock(user, lead, "report", "o1")`, response `{status:"unlocked", report}`.
    - (b) credits 0 → normal ₹299 order (4th report prompts payment).
    - (c) no plan → normal order.
    - (d) `product:"bundle"` never checks plan credits.
- [ ] **Step 2:** Run them and confirm FAIL.
- [ ] **Step 3: Implement.**
  - `reportUnlocks.ts`:

```ts
export async function unlockReport(userId: string, leadId: string, roleTitle: string, orderId?: string): Promise<void> {
  const supabase = getSupabaseServerClient();
  const { error } = await supabase
    .from("report_unlocks")
    // order_id only when spending a plan credit, so non-plan unlocks don't depend on migration 0069.
    .insert({ user_id: userId, lead_id: leadId, role_title: roleTitle, ...(orderId ? { order_id: orderId } : {}) });
```

  - `completeReportUnlock.ts`: add a 4th param `orderId?: string` and pass it to `unlockReport(userId, lead.id, lead.role_title, orderId)`.
  - `unlock-report/route.ts`: after the lead lookup, replace `if (!arePaymentsBypassed()) {` with:

```ts
  // shortcut: two concurrent unlocks of different leads can both see 1 credit left and spend a 4th;
  // upgrade to a locking Postgres function if that's ever seen (open issue #8).
  const plan = product === "report" ? await getPlanOrder(user.id) : null;
  const planOrderId = plan && (await planReportCreditsLeft(plan.orderId)) > 0 ? plan.orderId : null;

  if (!planOrderId && !arePaymentsBypassed()) {
```

  Then change the final call to `completeReportUnlock(user.id, lead, product, planOrderId ?? undefined)`.

  If the lead is already unlocked, the insert hits 23505 and is swallowed, so no credit is spent.
- [ ] **Step 4:** Run them and confirm PASS. Then run `npm test` (full suite) and `npm run build`. Commit.
- [ ] **Step 5: Phase B finish.** Run `superpowers:requesting-code-review` on the branch. Report `BLOCKED-ON-HUMAN: apply 0069 to prod, then npm run verify:schema` before any deploy.

---

# Phase C — Personality + culture port

### Task C1: golden fixtures from the real Python scorer

**Files:**
- Create: `scripts/psychometrics/gen_golden.py`
- Create: `lib/psychometrics/__tests__/golden.json` (generated, committed)
- Create: `lib/psychometrics/pyRound.ts`
- Test: `lib/psychometrics/__tests__/pyRound.test.ts`

The script imports the **real** `apps.psychometrics.scoring` and stubs only the Django models module. That module is used only for `.objects.count()`: 60 personality items, 5 IM items, 3 attention checks. This was verified on 2026-11-10: it runs and prints `ok 39 41`.

- [ ] **Step 1: Write** `scripts/psychometrics/gen_golden.py`

```python
"""Golden fixtures for the TS psychometrics port: runs the REAL Django scoring.py.

Usage (from repo root):
  python -I scripts/psychometrics/gen_golden.py D:/Work-Projects/staff-assessment-platform/backend lib/psychometrics/__tests__/golden.json
"""
import json, random, sys, types
from types import SimpleNamespace as NS

sys.path.insert(0, sys.argv[1])


class _Mgr:
    def __init__(self, n): self.n = n
    def count(self): return self.n
    def filter(self, **kw): return self


stub = types.ModuleType("apps.psychometrics.models")
stub.PersonalityStatement = NS(objects=_Mgr(60))
stub.PersonalityValidityStatement = NS(objects=_Mgr(5))
stub.CultureStatement = NS(objects=_Mgr(3))  # only used as filter(is_attention_check=True).count()
sys.modules["apps.psychometrics.models"] = stub

from apps.psychometrics.seed_data import PERSONALITY_ITEMS, PERSONALITY_IM, PERSONALITY_PAIRS, CULTURE_ITEMS  # noqa: E402
from apps.psychometrics.scoring import score_personality, score_culture  # noqa: E402


class _Rel(list):
    def select_related(self, *a): return self


def p_attempt(answers):
    rs = []
    for order, it in enumerate(PERSONALITY_ITEMS, start=1):  # order = seed order, as the seed command sets it
        v = answers.get(str(it["id"]))
        if v is None: continue
        st = NS(trait=it["trait"], reverse_keyed=it["reverse_keyed"], order=order)
        rs.append(NS(statement_id=it["id"], statement=st, validity_statement_id=None, value=v))
    for it in PERSONALITY_IM:
        v = answers.get(str(it["id"]))
        if v is None: continue
        rs.append(NS(statement_id=None, statement=None, validity_statement_id=it["id"], value=v))
    return NS(responses=_Rel(rs))


def c_attempt(answers):
    rs = []
    for it in CULTURE_ITEMS:
        v = answers.get(it["id"])
        if v is None: continue
        st = NS(culture=it["culture"], reverse_keyed=it["reverse_keyed"],
                is_attention_check=it["is_attention_check"], attention_direction=it["attention_direction"])
        rs.append(NS(statement=st, value=v))
    return NS(responses=_Rel(rs))


P_IDS = [str(i["id"]) for i in PERSONALITY_ITEMS] + [str(i["id"]) for i in PERSONALITY_IM]
C_IDS = [i["id"] for i in CULTURE_ITEMS]


def p_cases():
    r = random.Random(42)
    yield "all-1", {k: 1 for k in P_IDS}
    yield "all-5", {k: 5 for k in P_IDS}
    yield "all-3", {k: 3 for k in P_IDS}
    yield "im-high", {**{k: r.randint(1, 5) for k in P_IDS}, **{str(i["id"]): 5 for i in PERSONALITY_IM}}
    for n in range(25):
        yield f"random-{n}", {k: r.randint(1, 5) for k in P_IDS}
    for n in range(10):
        a = {k: r.randint(1, 5) for k in P_IDS}
        for k in r.sample(P_IDS, r.randint(5, 40)): a.pop(k)
        yield f"partial-{n}", a


def c_cases():
    r = random.Random(7)
    yield "all-1", {k: 1 for k in C_IDS}
    yield "all-7", {k: 7 for k in C_IDS}
    yield "attn-pass", {**{k: r.randint(1, 7) for k in C_IDS}, "attn1": 1, "attn2": 2, "attn3": 7}
    yield "attn-fail-low", {**{k: r.randint(1, 7) for k in C_IDS}, "attn1": 6, "attn2": 1, "attn3": 7}
    yield "attn-fail-high", {**{k: r.randint(1, 7) for k in C_IDS}, "attn1": 1, "attn2": 1, "attn3": 2}
    a = {k: r.randint(1, 7) for k in C_IDS}; a.pop("attn2"); a["attn1"] = 1; a["attn3"] = 7
    yield "attn-skipped", a
    for n in range(25):
        yield f"random-{n}", {k: r.randint(1, 7) for k in C_IDS}
    for n in range(10):
        a = {k: r.randint(1, 7) for k in C_IDS}
        for k in r.sample(C_IDS, r.randint(3, 20)): a.pop(k)
        yield f"partial-{n}", a


out = {
    "items": {"personality": PERSONALITY_ITEMS, "im": PERSONALITY_IM, "pairs": PERSONALITY_PAIRS, "culture": CULTURE_ITEMS},
    "personality": [{"name": n, "answers": a, "expected": score_personality(p_attempt(a))} for n, a in p_cases()],
    "culture": [{"name": n, "answers": a, "expected": score_culture(c_attempt(a))} for n, a in c_cases()],
}
with open(sys.argv[2], "w", encoding="utf-8") as f:
    json.dump(out, f, indent=1, ensure_ascii=False)
print("ok", len(out["personality"]), len(out["culture"]))
```

- [ ] **Step 2: Generate.** `mkdir -p lib/psychometrics/__tests__ && python -I scripts/psychometrics/gen_golden.py D:/Work-Projects/staff-assessment-platform/backend lib/psychometrics/__tests__/golden.json`. Expected output: `ok 39 41`.
- [ ] **Step 3: Failing test** `lib/psychometrics/__tests__/pyRound.test.ts`

```ts
import { describe, it, expect } from "vitest";
import { pyRound } from "../pyRound";

describe("pyRound matches Python round()", () => {
  it.each([
    [3.125, 2, 3.12],   // exact binary tie -> half-even (JS toFixed would give 3.13)
    [2.675, 2, 2.67],   // not a real tie (2.67499... in binary)
    [64.58333333333333, 2, 64.58],
    [12.5, 0, 12],
    [13.5, 0, 14],
    [0.5, 0, 0],
    [1.5, 0, 2],
    [33.333333333333336, 0, 33],
  ])("pyRound(%s, %s) = %s", (x, n, want) => {
    expect(pyRound(x, n)).toBe(want);
  });
});
```

- [ ] **Step 4:** Run it and confirm FAIL. Then implement `lib/psychometrics/pyRound.ts`:

```ts
// Python's round(): rounds the exact binary value, ties to even. JS toFixed() rounds the exact
// value too but sends ties up, so detect exact ties from the full decimal expansion first.
// toFixed(100) is exact for every double this code sees (scores in [0, 100]).
export function pyRound(x: number, ndigits = 0): number {
  if (x < 0) return -pyRound(-x, ndigits);
  const [int, frac = ""] = x.toFixed(100).split(".");
  if (/^50*$/.test(frac.slice(ndigits))) {
    let n = Number(int + frac.slice(0, ndigits));
    if (n % 2 === 1) n += 1;
    return n / 10 ** ndigits;
  }
  return Number(x.toFixed(ndigits));
}
```

- [ ] **Step 5:** Run it and confirm PASS. Commit `scripts/psychometrics/gen_golden.py lib/psychometrics/__tests__/golden.json lib/psychometrics/pyRound.ts lib/psychometrics/__tests__/pyRound.test.ts`.

### Task C2: item banks

**Files:**
- Create: `lib/psychometrics/cultureItems.ts`
- Test: `lib/psychometrics/__tests__/items.test.ts`

The personality items already exist in `lib/personality.ts` (`ITEMS`, `IMPRESSION_ITEMS`, `CONSISTENCY_PAIRS`) and are reused. This test proves they are verbatim.

- [ ] **Step 1: Failing test**

```ts
import { describe, it, expect } from "vitest";
import golden from "./golden.json";
import { ITEMS, IMPRESSION_ITEMS, CONSISTENCY_PAIRS } from "@/lib/personality";
import { CULTURE_ITEMS } from "../cultureItems";

describe("item banks are verbatim ports of seed_data.py", () => {
  it("personality items", () => {
    expect(ITEMS.map((i) => ({ id: i.id, trait: i.t, reverse_keyed: i.k === "-", text: i.s }))).toEqual(
      golden.items.personality.map((i) => ({ id: i.id, trait: i.trait, reverse_keyed: i.reverse_keyed, text: i.text }))
    );
  });
  it("impression-management items and pairs", () => {
    expect(IMPRESSION_ITEMS.map((i) => ({ id: i.id, text: i.s }))).toEqual(golden.items.im);
    expect(CONSISTENCY_PAIRS).toEqual(golden.items.pairs);
  });
  it("culture items (order, keying, attention direction, text)", () => {
    expect(CULTURE_ITEMS.map((i) => ({ id: i.id, culture: i.culture, reverse_keyed: i.reverse, is_attention_check: i.attention !== null, attention_direction: i.attention, text: i.text }))).toEqual(
      golden.items.culture
    );
  });
});
```

(If `tsconfig` lacks `resolveJsonModule`, load with `JSON.parse(readFileSync(new URL("./golden.json", import.meta.url), "utf8"))`. Check `tsconfig.json` first.)
- [ ] **Step 2:** Run it and confirm FAIL. Implement `lib/psychometrics/cultureItems.ts`:

```ts
export type CultureKey = "Clan" | "Adhocracy" | "Market" | "Hierarchy";
export const CULTURES: CultureKey[] = ["Clan", "Adhocracy", "Market", "Hierarchy"];

export type CultureItem = {
  id: string;
  culture: CultureKey | "ATTN";
  reverse: boolean;
  attention: "low" | "high" | null;
  text: string;
};

// Verbatim port of CULTURE_ITEMS in staff-assessment-platform/backend/apps/psychometrics/seed_data.py
// (36 CVF items, 9 per type with 3 reverse-keyed, then 3 attention checks). Do not edit the text: items.test.ts checks it.
export const CULTURE_ITEMS: CultureItem[] = [
  { id: "c1", culture: "Clan", reverse: false, attention: null, text: "…" },
  // … all 39 entries, same order as seed_data.py lines 80-162 …
];
```

Copy **all 39** entries from `seed_data.py` (`CULTURE_ITEMS`, lines 80–162) in order. Keep the em dashes (—) exactly as they are. The `"…"` above stands for the real text, and the test fails until every entry matches.
- [ ] **Step 3:** Run it and confirm PASS. Commit.

### Task C3: scoring port

**Files:**
- Create: `lib/psychometrics/scoring.ts`
- Test: `lib/psychometrics/__tests__/scoring.test.ts`

- [ ] **Step 1: Failing test**

```ts
import { describe, it, expect } from "vitest";
import golden from "./golden.json";
import { scorePersonality, scoreCulture, longstring } from "../scoring";

describe("scorePersonality === Python score_personality", () => {
  it.each(golden.personality.map((c) => [c.name, c] as const))("%s", (_n, c) => {
    expect(scorePersonality(c.answers as Record<string, number>)).toEqual(c.expected);
  });
});

describe("scoreCulture === Python score_culture", () => {
  it.each(golden.culture.map((c) => [c.name, c] as const))("%s", (_n, c) => {
    expect(scoreCulture(c.answers as Record<string, number>)).toEqual(c.expected);
  });
});

it("longstring", () => {
  expect(longstring([1, 1, 2, 2, 2, 3])).toBe(3);
  expect(longstring([])).toBe(0);
});
```

- [ ] **Step 2:** Run it and confirm FAIL. Implement it, **keeping the arithmetic in the same operation order as Python** so the floats come out bit-identical:

```ts
import { ITEMS, IMPRESSION_ITEMS, CONSISTENCY_PAIRS, TRAITS, type TraitKey } from "@/lib/personality";
import { CULTURE_ITEMS, CULTURES, type CultureKey } from "./cultureItems";
import { pyRound } from "./pyRound";

// Constants copied from apps/psychometrics/scoring.py — see the rationale comments there.
export const ATTN_LOW_FLAG = 6;
export const ATTN_HIGH_FLAG = 2;
export const SD_FLAG = 4.8;
export const IM_FLAG = "very favourable self-description — interpret with care";
export const LONGSTRING_FLAG = 10;
export const MIN_ITEMS_PER_TRAIT = 6;
export const MIN_ITEMS_PER_CULTURE = 5;

export type RawAnswers = Record<string, number>;
export type CultureScores = Record<CultureKey, number>;
export type PersonalityValidityV2 = {
  mean_raw: number; pct_mid: number; inconsistency: number; social_desirability: number;
  longstring: number; flags: string[]; answered: number; total: number; insufficient: TraitKey[];
};
export type PersonalityResultV2 = { trait_scores: Record<TraitKey, number> | null; validity: PersonalityValidityV2 };
export type CultureResult = { culture_scores: CultureScores | null; reliable: boolean | null; insufficient: CultureKey[] };

const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);
const val = (a: RawAnswers, id: number | string) => a[String(id)];

export function longstring(values: number[]): number {
  let best = 0;
  let run = 0;
  let prev: number | undefined;
  for (const v of values) {
    run = v === prev ? run + 1 : 1;
    prev = v;
    best = Math.max(best, run);
  }
  return best;
}

export function scorePersonality(answers: RawAnswers): PersonalityResultV2 {
  // ITEMS is in seed order (= statement.order), which Python's longstring uses.
  const answered = ITEMS.filter((i) => val(answers, i.id) != null);
  const traitScores = {} as Record<TraitKey, number>;
  const insufficient: TraitKey[] = [];
  for (const t of TRAITS) {
    const keyed = answered.filter((i) => i.t === t).map((i) => (i.k === "-" ? 6 - val(answers, i.id) : val(answers, i.id)));
    if (keyed.length < MIN_ITEMS_PER_TRAIT) { insufficient.push(t); continue; }
    const pct = pyRound(((sum(keyed) / keyed.length - 1) / 4) * 100, 2);
    traitScores[t] = Math.max(0, Math.min(100, pct));
  }
  const values = answered.map((i) => val(answers, i.id));
  const meanRaw = values.length ? sum(values) / values.length : 0;
  const pctMid = values.length ? (100 * values.filter((v) => v === 3).length) / values.length : 0;
  const gaps = CONSISTENCY_PAIRS.filter(([a, b]) => val(answers, a) != null && val(answers, b) != null).map(([a, b]) => Math.abs(val(answers, a) - val(answers, b)));
  const inconsistency = gaps.length ? sum(gaps) / gaps.length : 0;
  const im = IMPRESSION_ITEMS.map((i) => val(answers, i.id)).filter((v) => v != null);
  const socialDesirability = im.length ? sum(im) / im.length : 0;
  const run = longstring(values);

  const flags: string[] = [];
  if (meanRaw >= 3.6) flags.push("agreement (yea-saying) bias");
  else if (meanRaw <= 2.4) flags.push("disagreement bias");
  if (pctMid >= 40) flags.push("central-tendency (fence-sitting)");
  if (inconsistency >= 1.5) flags.push("inconsistent / careless responding");
  if (run >= LONGSTRING_FLAG) flags.push(`the same answer given to ${run} statements in a row (possible straight-lining)`);
  if (socialDesirability >= SD_FLAG) flags.push(IM_FLAG);

  return {
    trait_scores: insufficient.length ? null : traitScores,
    validity: {
      mean_raw: pyRound(meanRaw, 2), pct_mid: pyRound(pctMid, 2), inconsistency: pyRound(inconsistency, 2),
      social_desirability: pyRound(socialDesirability, 2), longstring: run, flags,
      answered: answered.length + im.length, total: ITEMS.length + IMPRESSION_ITEMS.length, insufficient,
    },
  };
}

export function scoreCulture(answers: RawAnswers): CultureResult {
  let attnFailed = false;
  let attnAnswered = 0;
  for (const it of CULTURE_ITEMS) {
    if (!it.attention) continue;
    const v = val(answers, it.id);
    if (v == null) continue;
    attnAnswered++;
    if (it.attention === "high" && v <= ATTN_HIGH_FLAG) attnFailed = true;
    else if (it.attention === "low" && v >= ATTN_LOW_FLAG) attnFailed = true;
  }
  const attnTotal = CULTURE_ITEMS.filter((i) => i.attention).length;
  // Skipped attention checks are unknown, not passed.
  const reliable = attnFailed ? false : attnAnswered >= attnTotal ? true : null;

  const keyed: Record<CultureKey, number[]> = { Clan: [], Adhocracy: [], Market: [], Hierarchy: [] };
  for (const it of CULTURE_ITEMS) {
    if (it.culture === "ATTN") continue;
    const v = val(answers, it.id);
    if (v == null) continue;
    keyed[it.culture].push(it.reverse ? 8 - v : v);
  }
  const insufficient = CULTURES.filter((c) => keyed[c].length < MIN_ITEMS_PER_CULTURE);
  if (insufficient.length) return { culture_scores: null, reliable, insufficient };
  const scores = {} as CultureScores;
  for (const c of CULTURES) scores[c] = pyRound(((sum(keyed[c]) / keyed[c].length - 1) / 6) * 100);
  return { culture_scores: scores, reliable, insufficient: [] };
}
```

- [ ] **Step 3:** Run it and confirm PASS on all 80 golden cases. If a case is off by 0.01 or 1, the operation order or the rounding is wrong. **Do not** loosen the test to `toBeCloseTo`.
- [ ] **Step 4:** Commit.

### Task C4: storage, migration, save route

**Files:**
- Create: `supabase/migrations/0070_personality_v2.sql`
- Modify: `lib/personality.ts` (`Validity` type, `validityFlags`, new `toStoredScores`/`toStoredValidity`)
- Modify: `app/api/hub/save-personality-test/route.ts`
- Modify: `lib/schemaContract.ts`
- Test: `lib/__tests__/personality.test.ts`, `app/api/hub/save-personality-test/__tests__/route.test.ts` (create), `app/api/hub/save-personality-test/__tests__/route.dbtest.ts` (extend)

The design choice is to keep `scores` in the existing `TraitScore` shape (`{raw,pct,band}`) and keep the legacy `validity` keys populated. That way none of the 10 existing readers of `personality_tests` breaks (`grep -rln personality_tests app lib`).

- [ ] **Step 1: Migration**

```sql
-- 0070_personality_v2.sql — personality + culture assessment (plans/2026-11-10-hub-plans-design.md).
-- Idempotent; apply by hand + `supabase migration repair --status applied 0070`.
-- version 1 = old personality-only results (kept viewable as-is); 2 = ported psychometrics.
alter table personality_tests add column if not exists version smallint not null default 1;
alter table personality_tests add column if not exists culture_scores jsonb;
alter table personality_tests add column if not exists culture_reliable boolean;
alter table personality_tests add column if not exists culture_answers jsonb;
alter table personality_tests add column if not exists culture_completed_at timestamptz;
```

Add to schemaContract: `columnExists("personality_tests", "version", "save-personality-test writes version 2 + culture columns (migration 0070)"),` and the same for `culture_scores`.

- [ ] **Step 2: Failing tests.**
  - `lib/__tests__/personality.test.ts`: `toStoredScores({E:64.58,A:50,C:100,ES:0,O:39.99}, answers)` gives `pct` = `Math.round` of each, `band` = `min(4, floor(pct/20))` (64.58 → pct 65, band 3; 100 → band 4), and `raw` = the keyed sum of answered items. `toStoredValidity(v2)` maps to `{meanRaw, pctMid, incon, sd, longstring, flags}`. `validityFlags({...legacy, flags:["x"]})` returns `["x"]`. `validityFlags` on a v1 object (no `flags`) still returns the old computed flags.
  - Route unit test (mock both Supabase clients, `isProductUnlocked` → true):
    - (a) `{roleTitle, answers: full 65}` with no `part` → treated as `"personality"` (old in-flight clients). The upsert has `version: 2`, `culture_scores: null`, `culture_reliable: null`, `culture_answers: null`, `culture_completed_at: null`. The response is `{scores, validity}`.
    - (b) Incomplete personality answers → 400.
    - (c) A value of 6 on a personality item → 400.
    - (d) `{part:"culture", answers: full 39}` with an existing `version:2` row → `update` with `culture_scores`, `culture_reliable`, `culture_answers`, `culture_completed_at`. The response is `{culture:{scores, reliable}}`.
    - (e) `part:"culture"` with no row, or a `version:1` row → 409 `"Finish part 1 first."`.
    - (f) Culture value 8 → 400.
    - (g) Unknown culture id → 400.
- [ ] **Step 3:** Run them and confirm FAIL.
- [ ] **Step 4: Implement** `lib/personality.ts` additions:

```ts
// Validity: add optional v2 fields
export type Validity = { meanRaw: number; pctMid: number; incon: number; sd: number; longstring?: number; flags?: string[] };

export function validityFlags(v: Validity): string[] {
  if (v.flags) return v.flags; // v2: flags computed by the Python-ported scorer
  // …existing v1 body unchanged, but the return type is now string[] (ValidityFlag stays as the v1 vocabulary)…
}

// v2 scores stored in the v1 TraitScore shape so every existing reader keeps working.
export function toStoredScores(traitScores: Record<TraitKey, number>, answers: Answers): Scores {
  const out = {} as Scores;
  for (const t of TRAITS) {
    const pct = Math.round(traitScores[t]);
    const raw = ITEMS.filter((i) => i.t === t && answers[i.id] != null).reduce((s, i) => s + (i.k === "+" ? answers[i.id] : 6 - answers[i.id]), 0);
    out[t] = { raw, pct, band: Math.min(4, Math.floor(pct / 20)) };
  }
  return out;
}

export function toStoredValidity(v: import("@/lib/psychometrics/scoring").PersonalityValidityV2): Validity {
  return { meanRaw: v.mean_raw, pctMid: v.pct_mid, incon: v.inconsistency, sd: v.social_desirability, longstring: v.longstring, flags: v.flags };
}
```

(Use a normal top-level `import type { PersonalityValidityV2 } from "@/lib/psychometrics/scoring"`. The inline form above is only there for brevity, and a type-only import cannot create a runtime cycle.)

Route rewrite. Keep the auth and 402 blocks as they are. Then:

```ts
  let body: { roleTitle?: string; part?: string; answers?: Record<string, unknown> };
  // …parse as today; roleTitle required as today…
  const part = body.part === "culture" ? "culture" : "personality"; // no part = old client = personality
  const raw = body.answers;
  if (!raw || typeof raw !== "object") return Response.json({ error: "answers is required." }, { status: 400 });

  const admin = getSupabaseServerClient();

  if (part === "personality") {
    const answers: Answers = {};
    for (const [key, value] of Object.entries(raw)) {
      const id = Number(key);
      if (!Number.isInteger(id) || typeof value !== "number") return Response.json({ error: "answers must map item id to a 1-5 rating." }, { status: 400 });
      answers[id] = value;
    }
    if (!isCompleteAnswerSet(answers)) return Response.json({ error: "All statements must be answered before scoring." }, { status: 400 });
    const result = scorePersonality(answers as unknown as RawAnswers);
    if (!result.trait_scores) return Response.json({ error: "All statements must be answered before scoring." }, { status: 400 });
    const scores = toStoredScores(result.trait_scores, answers);
    const validity = toStoredValidity(result.validity);
    const { error } = await admin.from("personality_tests").upsert(
      { user_id: user.id, role_title: roleTitle, version: 2, scores, validity, answers, completed_at: new Date().toISOString(),
        culture_scores: null, culture_reliable: null, culture_answers: null, culture_completed_at: null },
      { onConflict: "user_id" }
    );
    if (error) { console.error("personality_tests upsert failed", { user_id: user.id, error }); return Response.json({ error: "Something went wrong saving your results. Please try again." }, { status: 500 }); }
    return Response.json({ scores, validity });
  }

  const cultureIds = new Set(CULTURE_ITEMS.map((i) => i.id));
  const cultureAnswers: RawAnswers = {};
  for (const [key, value] of Object.entries(raw)) {
    if (!cultureIds.has(key) || typeof value !== "number" || !Number.isInteger(value) || value < 1 || value > 7) {
      return Response.json({ error: "answers must map culture item id to a 1-7 rating." }, { status: 400 });
    }
    cultureAnswers[key] = value;
  }
  if (Object.keys(cultureAnswers).length !== CULTURE_ITEMS.length) return Response.json({ error: "All statements must be answered before scoring." }, { status: 400 });
  const { data: row } = await admin.from("personality_tests").select("version").eq("user_id", user.id).maybeSingle();
  if (!row || row.version !== 2) return Response.json({ error: "Finish part 1 first." }, { status: 409 });
  const culture = scoreCulture(cultureAnswers);
  const { error } = await admin.from("personality_tests").update({
    culture_scores: culture.culture_scores, culture_reliable: culture.reliable, culture_answers: cultureAnswers, culture_completed_at: new Date().toISOString(),
  }).eq("user_id", user.id);
  if (error) { console.error("personality_tests culture update failed", { user_id: user.id, error }); return Response.json({ error: "Something went wrong saving your results. Please try again." }, { status: 500 }); }
  return Response.json({ culture: { scores: culture.culture_scores, reliable: culture.reliable } });
```

- [ ] **Step 5:** Extend `route.dbtest.ts` with one real-DB case: personality part, then culture part, then read back `version=2` and non-null `culture_scores`. Run `supabase start`, then `supabase db reset`, then `npm run test:db`.
- [ ] **Step 6:** Run them and confirm PASS. Commit. Report `BLOCKED-ON-HUMAN: apply 0070`.

### Task C5: two-part test UI

**Files:**
- Modify: `app/hub/account/personality/PersonalityTestClient.tsx`, `app/hub/account/personality/page.tsx:72-97`
- Create: `lib/psychometrics/testFlow.ts` (pure phase logic that can be tested)
- Test: `lib/psychometrics/__tests__/testFlow.test.ts`

- [ ] **Step 1: Failing test** for `initialPhase(row)`:

```ts
import { initialPhase } from "../testFlow";
it.each([
  [null, "intro"],
  [{ version: 1, culture_scores: null }, "report"],          // v1 result: viewable as old version
  [{ version: 2, culture_scores: null }, "culture-intro"],    // part 1 saved, resume at part 2
  [{ version: 2, culture_scores: { Clan: 1 } }, "report"],
])("%j -> %s", (row, want) => expect(initialPhase(row as never)).toBe(want));
```

- [ ] **Step 2:** Implement `lib/psychometrics/testFlow.ts`:

```ts
export type TestPhase = "intro" | "quiz" | "culture-intro" | "culture-quiz" | "report";
export function initialPhase(row: { version: number; culture_scores: unknown } | null): TestPhase {
  if (!row) return "intro";
  if (row.version === 2 && row.culture_scores == null) return "culture-intro";
  return "report";
}
```

- [ ] **Step 3: Page.** Select `"scores, validity, version, culture_scores, culture_reliable"`. Pass `initialRow` (`{version, culture_scores}` or null) and `initialResult` (now also carrying `culture: { scores, reliable } | null`) to the client.
- [ ] **Step 4: Client.**
  - Change `Phase` to `TestPhase`, initialised with `initialPhase(initialRow)`.
  - Part 1 is unchanged, except that its save now sends `part: "personality"`. On success, go to `"culture-intro"` (not `"report"`) and store the result.
  - `"culture-intro"` is a short card: "Part 2 of 2 — Work culture preferences. 39 statements, about 6 minutes. Your Part 1 answers are saved." with a Start button.
  - `"culture-quiz"` reuses the existing paging markup, with `cultureOrder = shuffle(CULTURE_ITEMS)`, `PER_PAGE` 13, and a 7-point scale. Use labels `["Strongly disagree","Disagree","Slightly disagree","Neutral","Slightly agree","Agree","Strongly agree"]`, and a 1–7 value in a separate `cultureAnswers: Record<string, number>` state.
  - On the last page, POST `{roleTitle, part:"culture", answers: cultureAnswers}`, set `result.culture`, then go to `"report"`.
  - No timer.
  - Keep the "Part 1 of 2" / "Part 2 of 2" label above the progress bar.
- [ ] **Step 5: Manual check.** Locally: take part 1, reload the page, and confirm it resumes at Part 2; finish and see the report. A v1 row shows the old report. Run `npm run build`.
- [ ] **Step 6:** Commit.

---

# Phase D — Report, fit, share

### Task D1: benchmarks + fit

**Files:**
- Create: `lib/psychometrics/cultureFit.ts`
- Test: `lib/psychometrics/__tests__/cultureFit.test.ts`

- [ ] **Step 1: Failing test**

```ts
import { describe, it, expect } from "vitest";
import { cultureFit, CULTURE_BENCHMARKS } from "../cultureFit";

describe("cultureFit", () => {
  it("has the 7 spec benchmarks", () => expect(CULTURE_BENCHMARKS).toHaveLength(7));
  it("same shape as Government/PSU -> 100% and ranked first", () => {
    const r = cultureFit({ Clan: 50, Adhocracy: 36, Market: 40, Hierarchy: 74 }, true);
    expect(r.kind).toBe("fit");
    if (r.kind === "fit") { expect(r.fits[0]).toMatchObject({ key: "gov_psu", fit: 100 }); }
  });
  it("mirror shape -> 0%", () => {
    const r = cultureFit({ Clan: 50, Adhocracy: 64, Market: 60, Hierarchy: 26 }, true);
    if (r.kind === "fit") expect(r.fits.find((f) => f.key === "gov_psu")!.fit).toBe(0);
  });
  it("flat profile (population SD < 8) -> no fit", () => {
    expect(cultureFit({ Clan: 60, Adhocracy: 62, Market: 58, Hierarchy: 61 }, true)).toEqual({ kind: "flat" });
  });
  it("failed attention checks -> culture mix only", () => {
    expect(cultureFit({ Clan: 90, Adhocracy: 10, Market: 50, Hierarchy: 30 }, false)).toEqual({ kind: "unreliable" });
  });
  it("reliable null is treated as reliable (open issue #6)", () => {
    expect(cultureFit({ Clan: 90, Adhocracy: 10, Market: 50, Hierarchy: 30 }, null).kind).toBe("fit");
  });
  it("fits are sorted high to low", () => {
    const r = cultureFit({ Clan: 80, Adhocracy: 70, Market: 30, Hierarchy: 20 }, true);
    if (r.kind === "fit") expect(r.fits.map((f) => f.fit)).toEqual([...r.fits.map((f) => f.fit)].sort((a, b) => b - a));
  });
});
```

- [ ] **Step 2:** Run it and confirm FAIL. Implement it:

```ts
import { CULTURES, type CultureKey } from "./cultureItems";
import type { CultureScores } from "./scoring";

export type Benchmark = { key: string; label: string; profile: Record<CultureKey, number>; basis: string };

// Merito estimate v1, set 2026-11-10 (spec "Culture benchmarks"). Ipsative C/A/M/H.
export const CULTURE_BENCHMARKS: Benchmark[] = [
  { key: "gov_psu", label: "Government / PSU", profile: { Clan: 25, Adhocracy: 18, Market: 20, Hierarchy: 37 }, basis: "Public-sector studies (Croatia, Pakistan): hierarchy dominant — direction only" },
  // Sums to 98, not 100 — open issue #5; Pearson below centres on each profile's own mean.
  { key: "hospital", label: "Hospital / healthcare", profile: { Clan: 31, Adhocracy: 21, Market: 22, Hierarchy: 24 }, basis: "Croatian hospitals study — published numbers" },
  { key: "startup", label: "Early-stage startup", profile: { Clan: 33, Adhocracy: 32, Market: 20, Hierarchy: 15 }, basis: "Startup/scale-up studies: clan + adhocracy — weak" },
  { key: "product_tech", label: "Product / tech company (scale-up)", profile: { Clan: 26, Adhocracy: 28, Market: 28, Hierarchy: 18 }, basis: "Scale-up preference data — weak" },
  { key: "family_sme", label: "Family business / SME", profile: { Clan: 36, Adhocracy: 22, Market: 18, Hierarchy: 24 }, basis: "Family-business review: clan + adhocracy — weak–moderate" },
  { key: "sales_finance", label: "Sales / finance / consulting", profile: { Clan: 20, Adhocracy: 20, Market: 37, Hierarchy: 23 }, basis: "Qualitative CVF descriptions — weak" },
  { key: "it_mnc_mfg", label: "IT services / MNC / manufacturing", profile: { Clan: 22, Adhocracy: 20, Market: 28, Hierarchy: 30 }, basis: "Indian IT+manufacturing sample ≈ flat; shape is estimate — weak" },
];

// shortcut: untested threshold (spec) — recalibrate on real Merito data. Population SD (open issue #4).
export const FLAT_SD = 8;

export type Fit = { key: string; label: string; basis: string; fit: number };
export type FitResult = { kind: "unreliable" } | { kind: "flat" } | { kind: "fit"; fits: Fit[] };

const centred = (xs: number[]) => { const m = xs.reduce((a, b) => a + b, 0) / xs.length; return xs.map((x) => x - m); };
const dot = (a: number[], b: number[]) => a.reduce((s, x, i) => s + x * b[i], 0);

export function cultureFit(scores: CultureScores, reliable: boolean | null): FitResult {
  if (reliable === false) return { kind: "unreliable" };
  const x = centred(CULTURES.map((c) => scores[c]));
  if (Math.sqrt(dot(x, x) / x.length) < FLAT_SD) return { kind: "flat" };
  const fits = CULTURE_BENCHMARKS.map((b) => {
    const y = centred(CULTURES.map((c) => b.profile[c]));
    const r = dot(x, y) / Math.sqrt(dot(x, x) * dot(y, y)); // Pearson r of the two profiles
    return { key: b.key, label: b.label, basis: b.basis, fit: Math.round(50 + 50 * r) };
  }).sort((a, b) => b.fit - a.fit);
  return { kind: "fit", fits };
}
```

- [ ] **Step 3:** Run it and confirm PASS. Commit.

### Task D2: report content in Hub + PDF

**Files:**
- Create: `lib/psychometrics/reportCopy.ts`
- Create: `app/hub/account/personality/CultureSection.tsx`, `app/hub/account/personality/StrengthsSection.tsx`
- Modify: `app/hub/account/personality/PersonalityReport.tsx`, `app/hub/account/personality/PersonalityTestClient.tsx` (pass culture), `app/hub/account/personality/print/page.tsx` (PDF export renders this page), `app/api/hub/personality/export/route.tsx` (select culture columns if it passes data)
- Test: `lib/psychometrics/__tests__/reportCopy.test.ts`

- [ ] **Step 1: Failing test.** `strengthsAndDevelopment(scores)` returns the top 2 traits by `pct` as strengths and the bottom 2 as development. Ties are broken by `TRAITS` order. Also assert that `CULTURE_CAVEATS` has 5 entries and that `SELF_DEV_NOTE` contains "not for hiring".
- [ ] **Step 2: Implement** `lib/psychometrics/reportCopy.ts`:

```ts
import { TRAITS, type Scores, type TraitKey } from "@/lib/personality";
import type { CultureKey } from "./cultureItems";

export const CULTURE_LABEL: Record<CultureKey, string> = { Clan: "Collaborative (Clan)", Adhocracy: "Creative (Adhocracy)", Market: "Results-driven (Market)", Hierarchy: "Structured (Hierarchy)" };
export const CULTURE_MEANING: Record<CultureKey, string> = {
  Clan: "You value teamwork, mentoring and a supportive, people-first workplace.",
  Adhocracy: "You value experimenting, new ideas and the freedom to take risks.",
  Market: "You value clear targets, competition and measurable results.",
  Hierarchy: "You value clear roles, defined processes and stability.",
};
export const FLAT_TEXT = "No strong preference — adaptable across cultures";
export const UNRELIABLE_TEXT = "Some check statements were answered in a way that suggests they weren't read closely, so we show your culture mix only, without organisation-type fit.";
export const CULTURE_CAVEATS = [
  "These are typical patterns only — teams inside one company often differ more than industries do.",
  "Culture fit modestly predicts job satisfaction and only weakly predicts staying or performing well.",
  "The organisation benchmarks are Merito estimates built from small or non-Indian samples.",
  "This shows what you prefer, not what you are able to do, and it is not a hiring screen.",
  "Most people prefer collaborative (Clan) cultures, so a high Clan score is common.",
];
export const SELF_DEV_NOTE = "This report is for your own development. It describes your self-reported preferences and is not for hiring or promotion decisions.";

export function strengthsAndDevelopment(scores: Scores): { strengths: TraitKey[]; development: TraitKey[] } {
  const ranked = [...TRAITS].sort((a, b) => scores[b].pct - scores[a].pct || TRAITS.indexOf(a) - TRAITS.indexOf(b));
  return { strengths: ranked.slice(0, 2), development: ranked.slice(-2).reverse() };
}
```

- [ ] **Step 3: UI.** `PersonalityReport` gets an optional prop `culture?: { scores: CultureScores | null; reliable: boolean | null } | null`. It renders, in spec order:
  1. Existing trait cards (unchanged). Round any displayed pct.
  2. `<StrengthsSection scores candidateName />`: two columns. Each trait shows `TRAIT_NAME` plus `TRAIT_WORK_IMPLICATION[t][traitLevel(pct)](name)`.
  3. When `culture?.scores` exists, `<CultureSection>`:
     - culture mix as four horizontal bars (0–100), each with `CULTURE_LABEL` and `CULTURE_MEANING`;
     - "Suitable organisation types", from `cultureFit()`: `kind:"fit"` shows the top 3 rows "{label} — {fit}% fit" plus a `<details>` "Show all 7" with the rest and each `basis`; `kind:"flat"` shows `FLAT_TEXT`; `kind:"unreliable"` shows `UNRELIABLE_TEXT`;
     - the `CULTURE_CAVEATS` list.
  4. Existing validity block.
  5. `SELF_DEV_NOTE` as the last paragraph. This is shown for v1 results too.

  A v1 result (no culture) shows only 1, 2, 4 and 5. Use the existing dark-theme tokens in `PersonalityReport.tsx`. The print page uses the same components' data with its own light-theme markup, mirroring how it already renders traits. Bars must have text values (not colour alone) for accessibility.
- [ ] **Step 4: Manual check.** Run `npm run dev`. The report renders for a v2 user with fit, a v2 user with a flat profile (seed `culture_scores` by hand locally), and a v1 user. `GET /api/hub/personality/export` produces a PDF that contains the culture section. Run `npm run build`.
- [ ] **Step 5:** Commit.

### Task D3: combined report + share page

**Files:**
- Modify: `lib/combinedReportData.ts:11,65-74`, `app/hub/account/combined-report/CondensedPersonalitySection.tsx`, `app/hub/share/[token]/page.tsx:340-345`, `app/api/hub/export/combined/route.tsx:55-60`, `app/api/hub/export/share-summary/route.tsx:45-50`
- Test: `lib/__tests__/combinedReportData.test.ts` (extend or create)

- [ ] **Step 1: Failing test.** `loadCombinedReportData` with personality included selects `culture_scores, culture_reliable` and returns `personality: { scores, culture: { scores, reliable } | null }`. A v1 row gives `culture: null`.
- [ ] **Step 2: Implement.** Change the type to `personality: { scores: Scores; culture: { scores: CultureScores; reliable: boolean | null } | null } | null`. `CondensedPersonalitySection` gets an optional `culture` prop and renders the culture-mix bars plus the top-1 fit line (or `FLAT_TEXT`), under the heading "Work culture — self-reported preferences, for development". Unreliable results show the mix only. Share page and both exports pass `personality.culture`. Sharing controls are unchanged; the candidate controls them as today.
- [ ] **Step 3:** Run tests + `npm run build`. Check `/hub/share/<token>` manually for a v2 user. Commit.

---

# Phase E — Pricing UI for allowlisted users

### Task E1: plan catalog + plan state

**Files:**
- Modify: `app/hub/account/pricing/pricingCatalog.ts`, `lib/plans.ts` (add `getPlanState`)
- Create: `app/api/hub/plan-state/route.ts`, `app/hub/account/usePlanState.ts`
- Test: `app/hub/account/pricing/__tests__/pricingCatalog.test.ts` (extend), `lib/__tests__/plans.test.ts` (extend), `app/api/hub/plan-state/__tests__/route.test.ts`

- [ ] **Step 1: Failing tests.**
  - `buildPlanCards()` returns two cards. `plan_prepare` has `priceLabel "₹2996"` and `plan_mentor` has `"₹5995"`. The 7 lines appear in spec order with `included` flags exactly per the spec table, and the value labels are `₹499, ₹499, ₹1499, ₹499, ₹2999, —, —`. `plan_mentor` has the footnote containing "we refer you". Neither card mentions a guarantee.
  - `getPlanState` combines `isEmailAllowlisted` and `getPlanOrder`, and adds `reportCreditsLeft`.
  - `GET /api/hub/plan-state`: 401 without a session; otherwise returns the `PlanState` JSON.
- [ ] **Step 2: Implement.**

```ts
// pricingCatalog.ts
import { PRODUCT_PRICING, PRODUCT_LABELS, formatPrice } from "@/lib/razorpay/pricing";
import type { PlanProduct } from "@/lib/plans";

type PlanLine = { label: string; valuePaise: number | null; prepare: boolean; mentor: boolean };
// Seminar value table (spec "Pricing"). Values are shown for context only, never charged.
const PLAN_LINES: PlanLine[] = [
  { label: "CV analysis with detailed report (3 roles)", valuePaise: 49900, prepare: true, mentor: true },
  { label: "Personality + culture assessment", valuePaise: 49900, prepare: true, mentor: true },
  { label: "Mock AI interview (45 min)", valuePaise: 149900, prepare: true, mentor: true },
  { label: "References module", valuePaise: 49900, prepare: true, mentor: true },
  { label: "1-hour mentoring session", valuePaise: 299900, prepare: false, mentor: true },
  { label: "Application assistance (3 companies)", valuePaise: null, prepare: false, mentor: true },
  { label: "Shareable profile", valuePaise: null, prepare: true, mentor: true },
];

export type PlanCard = {
  product: PlanProduct; title: string; price: number; priceLabel: string;
  lines: { label: string; valueLabel: string; included: boolean }[]; footnote: string | null;
};

export function buildPlanCards(): PlanCard[] {
  return (["plan_prepare", "plan_mentor"] as const).map((product) => ({
    product,
    title: PRODUCT_LABELS[product],
    price: PRODUCT_PRICING[product].entry,
    priceLabel: formatPrice(PRODUCT_PRICING[product].entry),
    lines: PLAN_LINES.map((l) => ({
      label: l.label,
      valueLabel: l.valuePaise === null ? "—" : formatPrice(l.valuePaise),
      included: product === "plan_mentor" ? l.mentor : l.prepare,
    })),
    footnote: product === "plan_mentor"
      ? "Application assistance: our team refers you to 3 companies you choose, through our own network. We refer you; we can't guarantee interviews or offers."
      : null,
  }));
}
```

```ts
// lib/plans.ts (append)
import { isEmailAllowlisted } from "@/lib/planAllowlist";
export type PlanState = { allowlisted: boolean; plan: (PlanOrder & { reportCreditsLeft: number }) | null };
export async function getPlanState(userId: string, email: string | null | undefined): Promise<PlanState> {
  const [allowlisted, plan] = await Promise.all([isEmailAllowlisted(email), getPlanOrder(userId)]);
  return { allowlisted, plan: plan ? { ...plan, reportCreditsLeft: await planReportCreditsLeft(plan.orderId) } : null };
}
```

Route `GET`: `createSupabaseServerClient` → user, else 401 → `Response.json(await getPlanState(user.id, user.email))`.

`usePlanState.ts` (client): `useEffect` fetches `/api/hub/plan-state` once and returns `{ loading, state }`. On error, return `state: null`, which callers treat as a normal user.
- [ ] **Step 3:** Run them and confirm PASS. Commit.

### Task E2: pricing page — plans only for allowlisted users

**Files:**
- Create: `app/hub/account/pricing/PlanCardsClient.tsx`, `app/hub/account/pricing/PlanStatusBanner.tsx`
- Modify: `app/hub/account/pricing/page.tsx`

- [ ] **Step 1: page.tsx.** After `user` is known: `const planState = await getPlanState(user.id, user.email);`.
  - If `planState.allowlisted && !planState.plan`, return `<PlanCardsClient plans={buildPlanCards()} />` (no lead needed: plans are account-level).
  - Otherwise render the existing tree, preceded by `{planState.plan && <PlanStatusBanner plan={planState.plan} />}`. After a plan, the existing cards show the normal extra prices.
- [ ] **Step 2: PlanCardsClient.** Two cards side by side, stacked on mobile. Each card has the title, `priceLabel`, a list of lines (✓ or —, the label, and `valueLabel` greyed) and the footnote. The Buy button runs checkout with `/api/hub/razorpay/initiate {product}`. Copy `loadRazorpayCheckoutScript` and the `runCheckout` body **verbatim** from `app/hub/account/PersonalityPaywallModal.tsx:9-48` and `:67-134`; that is the repo's established per-modal pattern, so don't refactor it. On paid, call `router.refresh()` so the page re-renders with the plan banner, and `trackPurchase(product)`. Show any `error` text under the button (it covers the server's 403/409 messages).
- [ ] **Step 3: PlanStatusBanner.** One line: "Your plan: {PRODUCT_LABELS[product]} · Role reports left: {reportCreditsLeft} of 3 · AI interview: {interviewUsed ? "used" : "ready (45 min)"}". For `plan_mentor` add "· Mentoring session included — book it from Expert". Then "Extra role reports ₹299 · reference refresh ₹149".
- [ ] **Step 4: Manual check.** Use a local DB with 0068/0069 applied and `RAZORPAY_BYPASS` unset with test keys. Allowlist your test email and confirm you see only the plans. Buy `plan_prepare` with a Razorpay test card and confirm the banner appears. A non-listed account sees the unchanged page. Run `npm run build`. Commit.

### Task E3: paywall surfaces

**Files:**
- Create: `app/hub/account/PlanOnlyNotice.tsx`
- Modify: `app/hub/account/PriceOptionTiles.tsx` (covers the Report, Personality and References modals), `app/hub/account/InterviewPaywallModal.tsx`, `app/hub/account/CounsellingPaywallModal.tsx`, `app/hub/account/BundlePromoCard.tsx`

`planOnly` = `state?.allowlisted && !state.plan`.

- [ ] **Step 1:** `PlanOnlyNotice`: "This is included in your Merito plans." plus `<Link href="/hub/account/pricing">See plans</Link>`.
- [ ] **Step 2:** `PriceOptionTiles`: call `usePlanState()`. While `loading`, render the tiles disabled (`submitting` true), so nobody can buy individually before the state loads. If `planOnly`, render `<PlanOnlyNotice />` instead of the tiles. If `state?.plan && soloProduct === "report" && state.plan.reportCreditsLeft > 0`, relabel the solo tile "Use 1 of your {n} plan reports — free". The server (B6) spends the credit on the same `onContinue("solo")` call.
- [ ] **Step 3:** `InterviewPaywallModal`: call `usePlanState()`.
  - If `state?.plan && !state.plan.interviewUsed`, replace the pay button with "Start your 45-min interview (included in your plan)", which calls the existing `startInterview()` directly with `setPaying(true)` first.
  - Else if `planOnly`, show `<PlanOnlyNotice />`.
  - Otherwise leave it unchanged.
- [ ] **Step 4:** `CounsellingPaywallModal`: if `planOnly`, show `<PlanOnlyNotice />`. Plan 2 holders already have a `counselling_requests` row, so the existing "requested" UI shows. Plan 1 holders keep normal counselling prices.
- [ ] **Step 5:** `BundlePromoCard`: if `planOnly`, render a promo pointing to `/hub/account/pricing` ("Your Merito plan options are ready — see plans") instead of the ₹749 bundle.
- [ ] **Step 6: Manual checks.**
  - Allowlisted without a plan: every paywall shows "See plans".
  - Plan holder: report unlock spends a credit with no checkout; the 4th report asks for ₹299; the interview starts with no checkout; the IntervueBox agent is 45 min (test with `roshanrk2014@gmail.com` only); personality and references are already unlocked.
  - Normal user: everything unchanged.
  - Run `npm test` + `npm run build`. Commit.
- [ ] **Step 7: Phase E finish.** Run `superpowers:requesting-code-review`. Then `superpowers:finishing-a-development-branch`, but **do not push** until the human confirms 0068–0070 are applied in prod and `npm run verify:schema` passes.

---

## Spec coverage check

| Spec item | Task |
|---|---|
| `plan_allowlist` table, case-insensitive, admin add/list/remove, removal doesn't revoke | A1–A3 (removal only touches the allowlist) |
| Normal pricing unchanged; public PricingSection unchanged | B1 test asserts existing rows; E only touches the account pricing page |
| Allowlisted users see only plans on pricing surfaces | E2, E3 |
| Plan prices flat, value table, Plan 2 application-assistance copy | B1, E1 |
| Server-side allowlist check in order creation | B2 |
| Grants: personality, references, 3 report credits, 45-min interview, Plan 2 mentoring | B3, B5, B6 |
| Refund reverses grants | B3 |
| Admin grant accepts plan keys | B4 |
| Extras after plan at normal price (4th report ₹299, refresh ₹149) | B6 (credits 0 → normal order), B4 (reference credits) |
| No credit for earlier individual purchase | B2/B3 don't look at earlier purchases |
| Verify/webhook/reconcile idempotent | B3 (c) |
| Personality v2 + culture port, min items, flags, attention → reliable | C1–C4 |
| Two parts, progress saved between parts, no timer | C4, C5 |
| v1 results stay viewable, results carry a version | C4 (`version`), C5 (`initialPhase`) |
| Benchmarks, fit formula, flat, unreliable, top 3 + collapsed | D1, D2 |
| Candidate caveats; self-development label | D2 |
| Combined report in Hub + PDF; share page labelled | D2, D3 |
| Tests: golden vs Python; allowlist reject; finalize/refund; interview 45 vs 30; 3 credits then ₹299 | C1/C3, A1/B2, B3, B5, B6 |

## Deferred (nice to have, from the spec and found while planning)

- All items in the spec's "Deferred" list.
- `purge_candidate_data` (0049) does not remove `plan_allowlist` emails, because entries are keyed by email and not by user. Decide whether purging a candidate should also drop their allowlist row.
- `lib/database.types.ts` is not regenerated for the new enum values and columns. The clients are untyped, so nothing breaks; regenerate it when it's convenient.
- The checkout code is now copied into 6 client files. Extract a shared `useRazorpayCheckout` once a 7th copy is needed.
- The existing `bundle` refund revokes personality without checking for other paid personality purchases. Plans use the safer helper (B3); switch bundle to it too.
- Python's `longstring` runs on seed order, but the Hub shuffles items, so the straight-lining flag is weaker here than in the Django app.
- The report-credit concurrency lock (open issue #8).

## PM decisions on open issues (2026-11-10)

1. Skill cap: for allowlisted users, fitment check extracts up to 10 skills (45-min cap) at fitment time. Older leads keep 7 skills; accepted.
2. Plan 1 → Plan 2 upgrade: no upgrade product. Refuse a second plan; Plan 1 holders buy mentoring individually at ₹2,999 (equals the price difference).
3. Old personality result + plan: plan buyers may take the new test even if they hold an old-version result.
4. Flat-profile SD: population SD. Default accepted.
5. Hospital benchmark corrected to C 31 / A 21 / M 23 / H 25 (sums 100); spec updated.
6. `reliable = null`: treat as reliable only if all attention items are required in UI (they must be); default accepted.
7. Individual purchases by allowlisted users without a plan: UI-only block accepted (no harm, normal price).
8. Concurrent report-credit race: accepted with code comment.
9. Migrations 0068-0070: accepted; check the number is still free before applying.
10. Python report narrative not ported in v1; reuse existing trait copy. Deferred.

## Follow-ups (Phase C/D)

Branch `feat/hub-plans-d` (on top of `feat/hub-plans-c`). Nice-to-haves and minor findings:

- **Deploy order (blocking):** every `personality_tests` reader now selects `version, culture_scores` (dashboard, exports, share summary, admin, recruiter preview). Deploying before migration 0070 is applied breaks those pages, not just the test. BLOCKED-ON-HUMAN: apply `0070_personality_v2.sql` + `supabase migration repair --status applied 0070`, then `npm run verify:schema`.
- Phase C: old-result retake is wired to `canRetakeV2 = false` (`app/hub/account/personality/page.tsx`) until Phase B merges; then set it to `Boolean(await getPlanOrder(user.id))` (PM decision #3).
- Phase C: `app/api/hub/save-personality-test/__tests__/route.dbtest.ts` not yet run — local Supabase (127.0.0.1:54321) unreachable during C and D.
- Manual browser checks (D2 step 4, D3 step 3) not done: report for v2 fit / v2 flat / v1 user, PDF export with culture section, `/hub/share/<token>` for a v2 user.
- Dashboard `ProgressRail` has no "in progress" state: a Part-1-only v2 row shows "not started" (the personality page resumes at Part 2).
- Admin candidate detail hides a Part-1-only row entirely; admins may want to see partial progress.
- `lib/sampleReports/combined.ts` and `SamplePersonalityReport` carry no culture data; add sample culture scores so prospects see the new section.
- Recruiter preview / extension lookup (`buildLookupPersonality`) shows no culture; spec only requires the share page.
- Combined-report dashboard summary line (`personalitySummary`) doesn't mention culture.
- Hub report "Show all 7" `<details>` lists all 7 (top 3 repeated) with basis; the PDF lists all 7 expanded since it can't open `<details>`.
- No route-level test for the recruiter-preview lookup with a Part-1-only row; covered by `isPersonalityComplete` unit tests + admin funnel test.
