import { readFileSync } from "node:fs";
import { createHmac } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { test as base, expect, type Page, type Locator } from "@playwright/test";

// Shared e2e helpers: LOCAL Supabase only (asserted), idempotent seeding, magic-link sign-in, global guards.

function localEnv(): { url: string; key: string } {
  const text = readFileSync(".env.development.local", "utf8");
  const get = (k: string) => text.match(new RegExp(`^${k}=["']?([^"'\\r\\n]*)`, "m"))?.[1] ?? "";
  const url = get("SUPABASE_URL");
  const key = get("SUPABASE_SERVICE_ROLE_KEY");
  if (!/^http:\/\/(127\.0\.0\.1|localhost):\d+$/.test(url) || !key) throw new Error("e2e seeding refuses to run: SUPABASE_URL is not a local stack");
  return { url, key };
}
const env = localEnv();
export const db = createClient(env.url, env.key, { auth: { persistSession: false, autoRefreshToken: false } });

// Must match playwright.config.ts webServer.env (the e2e server never sees the real webhook secret).
export const E2E_WEBHOOK_SECRET = "e2e-local-webhook-secret";

export const VIEWPORTS = [
  { name: "desktop", use: { viewport: { width: 1280, height: 800 } } },
  { name: "mobile-375", use: { viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true } },
] as const;

// Children first; FKs to auth.users are NO ACTION.
const USER_TABLES = [
  "report_share_links", "report_unlocks", "product_unlocks", "reference_checks", "fitment_interviews", "fitment_reports",
  "personality_tests", "plan_assistance", "counselling_requests", "hub_notifications", "recruiter_preview_sections",
  "recruiter_preview_settings", "candidate_profile_overrides", "razorpay_transactions", "fitment_leads",
];

const ids = new Map<string, string>();
async function findUserId(email: string): Promise<string | null> {
  if (ids.has(email)) return ids.get(email)!;
  for (let page = 1; page < 50; page++) {
    const { data, error } = await db.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) throw error;
    const u = data.users.find((x) => x.email === email);
    if (u) return u.id;
    if (data.users.length < 1000) return null;
  }
  return null;
}

export type Seeded = { id: string; email: string };

/** Idempotent: (re)creates the user, wipes their rows, sets allowlist. */
export async function seedUser(slug: string, opts: { name?: string | null; allowlisted?: boolean } = {}): Promise<Seeded> {
  const email = `e2e-${slug}@example.test`;
  const name = opts.name === undefined ? "Asha Verma" : opts.name;
  const meta = { full_name: name };
  let id = await findUserId(email);
  if (!id) {
    const { data, error } = await db.auth.admin.createUser({ email, email_confirm: true, user_metadata: meta });
    if (error || !data.user) throw new Error(`createUser ${email}: ${error?.message}`);
    id = data.user.id;
  } else {
    await db.auth.admin.updateUserById(id, { user_metadata: meta });
  }
  ids.set(email, id);
  for (const t of USER_TABLES) {
    const { error } = await db.from(t).delete().eq("user_id", id);
    if (error && !/does not exist|schema cache/.test(error.message)) throw new Error(`wipe ${t}: ${error.message}`);
  }
  await db.from("fitment_leads").delete().eq("email", email);
  await db.from("plan_allowlist").delete().eq("email", email);
  if (opts.allowlisted) {
    const { error } = await db.from("plan_allowlist").insert({ email, added_by: "e2e@example.test", note: "e2e" });
    if (error) throw new Error(`allowlist: ${error.message}`);
  }
  return { id, email };
}

const PRICE: Record<string, number> = { plan_prepare: 199900, plan_mentor: 499900, plan_upgrade_mentor: 299900 };

/** A paid order row, as finalize leaves it. status "initiated" for webhook-simulation tests. */
export async function seedOrder(
  u: Seeded,
  product: string,
  o: { status?: string; consumed?: boolean; amountPaise?: number; leadId?: string; createdAt?: string } = {},
): Promise<string> {
  const orderId = `order_e2e_${product}_${u.id.slice(0, 8)}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  const { error } = await db.from("razorpay_transactions").insert({
    order_id: orderId,
    payment_id: o.status === "initiated" ? null : `pay_e2e_${Date.now()}`,
    user_id: u.id,
    product,
    level: "entry",
    lead_id: o.leadId ?? null,
    amount_paise: o.amountPaise ?? PRICE[product] ?? 49900,
    status: o.status ?? "success",
    consumed_at: o.consumed ? new Date().toISOString() : null,
    ...(o.createdAt ? { created_at: o.createdAt } : {}),
  });
  if (error) throw new Error(`seedOrder: ${error.message}`);
  return orderId;
}

export async function seedLead(u: Seeded, o: { role?: string; score?: number; status?: string; raw?: unknown; createdAt?: string } = {}): Promise<string> {
  const { data, error } = await db
    .from("fitment_leads")
    .insert({
      email: u.email,
      user_id: u.id,
      name: "Asha Verma",
      role_title: o.role ?? "Product Analyst",
      jd_text: "E2E fixture JD",
      jd_source: "paste",
      score: o.score ?? 7.2,
      verdict: "E2E fixture summary.",
      resume_match_status: o.status ?? "READY",
      resume_match_raw: o.raw ?? null,
      candidate_level: "entry",
      ...(o.createdAt ? { created_at: o.createdAt } : {}),
    })
    .select("id")
    .single();
  if (error) throw new Error(`seedLead: ${error.message}`);
  return data.id;
}

/** Magic-link sign-in through the app's own callback (no email is sent). */
export async function magicLink(email: string, next?: string): Promise<string> {
  const { data, error } = await db.auth.admin.generateLink({ type: "magiclink", email });
  if (error) throw new Error(`generateLink: ${error.message}`);
  return `/hub/auth/callback?token_hash=${data.properties.hashed_token}&type=magiclink${next ? `&next=${encodeURIComponent(next)}` : ""}`;
}

export async function login(page: Page, email: string, expectPath: RegExp = /\/hub\/account/) {
  await page.goto(await magicLink(email));
  await expect(page).toHaveURL(expectPath);
}

export function signWebhook(body: string) {
  return createHmac("sha256", E2E_WEBHOOK_SECRET).update(body).digest("hex");
}

/** Razorpay webhook as Razorpay would send it, signed with the e2e secret. */
export async function postWebhook(page: Page, event: string, orderId: string, amountPaise: number) {
  const body = JSON.stringify({
    event,
    payload: { payment: { entity: { id: `pay_e2e_${orderId.slice(-10)}`, order_id: orderId, amount: amountPaise, status: event === "payment.captured" ? "captured" : "refunded", email: "e2e@example.test" } } },
  });
  return page.request.post("/api/webhooks/razorpay", { data: body, headers: { "content-type": "application/json", "x-razorpay-signature": signWebhook(body) } });
}

// ---------- global guards ----------

export async function copyGuard(scope: Page | Locator) {
  const root = "goto" in scope ? scope.locator("body") : scope;
  const text = await root.innerText();
  const hits = [...text.matchAll(/.{0,40}(—|\bPlan [12]\b|seminar).{0,40}/gi)].map((m) => m[0]);
  expect(hits, 'UI copy has an em-dash, "Plan 1/2" or "seminar"').toEqual([]);
}

export async function noHScroll(page: Page) {
  const over = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(over, "horizontal scroll").toBeLessThanOrEqual(0);
}

export async function guards(page: Page) {
  await copyGuard(page);
  await noHScroll(page);
}

/** Every open modal: role=dialog + aria-modal, and the chat bubble hidden meanwhile. */
export async function dialogGuard(dialog: Locator) {
  await expect(dialog).toHaveAttribute("aria-modal", "true");
  // Zoho SalesIQ (components/ChromeGate.tsx) loads on Hub pages; globals.css hides it while aria-modal is open.
  await expect(dialog.page().getByRole("complementary", { name: "Live chat widget" })).toBeHidden();
  await expect(dialog.page().locator("#zsiq_float:visible, .zsiq_theme1:visible")).toHaveCount(0);
}

// Dev-only noise that isn't an app error.
const CONSOLE_NOISE = [/Download the React DevTools/, /\[HMR\]/, /\[Fast Refresh\]/, /favicon/, /checkout\.razorpay\.com/];

/** `test` with an auto fixture failing on uncaught page errors / console errors. */
export const test = base.extend<{ consoleGuard: void }, { safeServer: void }>({
  // A reused dev server without the e2e env could send real email / hit the live vendor: refuse it.
  safeServer: [
    async ({ playwright }, use) => {
      const req = await playwright.request.newContext({ baseURL: "http://localhost:3000" });
      const body = JSON.stringify({ event: "e2e.ping" });
      const res = await req.post("/api/webhooks/razorpay", { data: body, headers: { "content-type": "application/json", "x-razorpay-signature": signWebhook(body) } });
      await req.dispose();
      if (res.status() !== 200) throw new Error("The :3000 server is not the e2e-configured one (playwright.config.ts webServer.env). Stop it and rerun.");
      await use();
    },
    { scope: "worker", auto: true },
  ],
  consoleGuard: [
    async ({ page }, use) => {
      const errors: string[] = [];
      page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
      page.on("console", (m) => {
        if (m.type() === "error" && !CONSOLE_NOISE.some((r) => r.test(m.text()))) errors.push(`console: ${m.text()}`);
      });
      await use();
      expect(errors, "uncaught console errors").toEqual([]);
    },
    { auto: true },
  ],
});
export { expect };
