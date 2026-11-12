import { test, expect, VIEWPORTS, seedUser, seedOrder, seedLead, login, guards, postWebhook, db, type Seeded } from "../../../../test/e2e/hub";
import { PRODUCT_PRICING, PRODUCT_LABELS } from "@/lib/razorpay/pricing";

// Payments simulated through the app's real finalize path: an "initiated" order (as /initiate leaves it) plus a
// signed Razorpay webhook (e2e secret). Razorpay's UI is never driven; no money moves.
type Product = keyof typeof PRODUCT_PRICING;
const amount = (p: Product) => PRODUCT_PRICING[p].entry;

async function pay(page: import("@playwright/test").Page, u: Seeded, product: Product, extra: { createdAt?: string } = {}) {
  const orderId = await seedOrder(u, product, { status: "initiated", amountPaise: amount(product), ...extra });
  const res = await postWebhook(page, "payment.captured", orderId, amount(product));
  expect(res.status()).toBe(200);
  return orderId;
}
async function status(orderId: string) {
  const { data } = await db.from("razorpay_transactions").select("status").eq("order_id", orderId).single();
  return data?.status;
}
const panel = (page: import("@playwright/test").Page) => page.locator(".plan-panel");

for (const vp of VIEWPORTS) {
  test.describe(`payments (simulated) @${vp.name}`, () => {
    test.use(vp.use);

    for (const product of ["plan_prepare", "plan_mentor"] as const) {
      test(`${product}: webhook grants the plan; badge and panel rows`, async ({ page }) => {
        const u = await seedUser(`pay-${product}-${vp.name}`, { allowlisted: true });
        const order = await pay(page, u, product);
        expect(await status(order)).toBe("success");
        await login(page, u.email);
        await expect(page.getByText(`${PRODUCT_LABELS[product]} · active`)).toBeVisible();
        await expect(panel(page)).toContainText(`Your plan: ${PRODUCT_LABELS[product]}`);
        await expect(panel(page)).toContainText("3 of 3 left");
        const mentoring = panel(page).locator("li").filter({ hasText: "Mentoring" });
        if (product === "plan_prepare") await expect(mentoring).toContainText("Not in your plan");
        else await expect(mentoring).toContainText("Session 1");
        await guards(page);
      });
    }

    test("upgrade: mentoring and assistance rows become active", async ({ page }) => {
      const u = await seedUser(`pay-upgrade-${vp.name}`, { allowlisted: true });
      await seedOrder(u, "plan_prepare", { createdAt: new Date(Date.now() - 60_000).toISOString() });
      await login(page, u.email);
      const row = (t: string) => panel(page).locator("li").filter({ hasText: t });
      await expect(row("Mentoring")).toContainText("Not in your plan");
      await expect(row("Application assistance")).toContainText("Not in your plan");
      await pay(page, u, "plan_upgrade_mentor");
      await page.reload();
      await expect(page.getByText(`${PRODUCT_LABELS.plan_mentor} · active`)).toBeVisible();
      await expect(row("Mentoring")).toContainText("Session 1");
      await expect(row("Mentoring").getByRole("link", { name: /Book session 1/ })).toBeVisible();
      await expect(row("Application assistance")).not.toContainText("Not in your plan");
      await guards(page);
    });

    test("refund webhook removes the plan view; results stay", async ({ page }) => {
      const u = await seedUser(`pay-refund-${vp.name}`);
      await seedLead(u, { role: "Product Analyst" });
      const order = await pay(page, u, "plan_prepare");
      await login(page, u.email);
      await expect(panel(page)).toContainText(`Your plan: ${PRODUCT_LABELS.plan_prepare}`);
      const res = await postWebhook(page, "refund.processed", order, amount("plan_prepare"));
      expect(res.status()).toBe(200);
      expect(await status(order)).toBe("refunded");
      await page.reload();
      await expect(panel(page)).toHaveCount(0);
      await expect(page.getByRole("heading", { level: 1 })).toContainText("how you stand for Product Analyst");
      await guards(page);
    });

    test("double webhook does not double-grant", async ({ page }) => {
      const u = await seedUser(`pay-double-${vp.name}`);
      await seedLead(u);
      const order = await pay(page, u, "personality");
      const again = await postWebhook(page, "payment.captured", order, amount("personality"));
      expect(again.status()).toBe(200);
      const { count: unlocks } = await db.from("product_unlocks").select("user_id", { count: "exact", head: true }).eq("user_id", u.id).eq("product", "personality");
      expect(unlocks).toBe(1);
      const { count: txns } = await db.from("razorpay_transactions").select("order_id", { count: "exact", head: true }).eq("user_id", u.id).eq("status", "success");
      expect(txns).toBe(1);
    });

    test("wrong amount is refused (guard)", async ({ page }) => {
      const u = await seedUser(`pay-guard-${vp.name}`, { allowlisted: true });
      const order = await seedOrder(u, "plan_prepare", { status: "initiated", amountPaise: amount("plan_prepare") });
      await postWebhook(page, "payment.captured", order, 100);
      expect(await status(order)).toBe("initiated");
    });
  });
}
