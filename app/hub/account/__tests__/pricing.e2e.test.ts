import { test, expect, VIEWPORTS, seedUser, seedOrder, seedLead, login, guards, copyGuard, dialogGuard, db } from "../../../../test/e2e/hub";
import { PRODUCT_LABELS } from "@/lib/razorpay/pricing";

const P = PRODUCT_LABELS.plan_prepare;
const M = PRODUCT_LABELS.plan_mentor;

for (const vp of VIEWPORTS) {
  test.describe(`pricing @${vp.name}`, () => {
    test.use(vp.use);

    test("allowlisted: comparison table, 3 columns, ticks and crosses, plan names", async ({ page }) => {
      const u = await seedUser(`price-allow-${vp.name}`, { allowlisted: true });
      await login(page, u.email);
      await page.goto("/hub/account/pricing");
      await expect(page.getByRole("heading", { name: "Your Merito plans" })).toBeVisible();
      const table = page.getByRole("table");
      const head = table.locator("thead tr").first().getByRole("columnheader");
      await expect(head).toHaveCount(3);
      await expect(head.nth(1)).toContainText(P);
      await expect(head.nth(2)).toContainText(M);
      expect(await table.getByText("Included", { exact: true }).count()).toBeGreaterThan(0);
      expect(await table.getByText("Not included", { exact: true }).count()).toBeGreaterThan(0);
      await expect(table.getByRole("button", { name: /Choose this plan/ })).toHaveCount(2);
      await expect(table.getByRole("button", { name: /Upgrade for/ })).toHaveCount(0);
      await guards(page);
    });

    test("non-allowlisted: normal per-product pricing, no plan table", async ({ page }) => {
      const u = await seedUser(`price-normal-${vp.name}`);
      await seedLead(u);
      await login(page, u.email);
      await page.goto("/hub/account/pricing");
      await expect(page.getByText("Your Merito plans")).toHaveCount(0);
      await expect(page.getByText(P, { exact: true })).toHaveCount(0);
      await expect(page.getByRole("heading", { name: "Pricing", level: 1 })).toBeVisible();
      await expect(page.getByRole("heading", { name: "Detailed Report" })).toBeVisible();
      await guards(page);
    });

    test("confirm dialog carries the You already have note", async ({ page }) => {
      const u = await seedUser(`price-owned-${vp.name}`, { allowlisted: true });
      await db.from("product_unlocks").insert({ user_id: u.id, product: "personality" });
      await login(page, u.email);
      await page.goto("/hub/account/pricing");
      await page.getByRole("button", { name: /Choose this plan.*Mentor/ }).click();
      const dlg = page.getByRole("dialog", { name: "Confirm your plan" });
      await expect(dlg).toBeVisible();
      await dialogGuard(dlg);
      await expect(dlg).toContainText("You already have:");
      await expect(dlg).toContainText(/personality/i);
      await copyGuard(dlg);
      // Never confirmed: that would open Razorpay.
    });

    test("upgrade button only for Assess + Prepare holders", async ({ page }) => {
      const prep = await seedUser(`price-prep-${vp.name}`, { allowlisted: true });
      await seedOrder(prep, "plan_prepare");
      await login(page, prep.email);
      await page.goto("/hub/account/pricing");
      await expect(page.getByRole("button", { name: /Upgrade for ₹2,999/ })).toHaveCount(1);
      await expect(page.getByText("Your plan", { exact: true })).toBeVisible();
      await guards(page);
      await page.getByRole("button", { name: /Upgrade for/ }).click();
      await expect(page.getByRole("dialog", { name: "Confirm your upgrade" })).toBeVisible();

      const mentor = await seedUser(`price-mentor-${vp.name}`, { allowlisted: true });
      await seedOrder(mentor, "plan_mentor");
      await page.context().clearCookies();
      await login(page, mentor.email);
      await page.goto("/hub/account/pricing");
      await expect(page.getByRole("button", { name: /Upgrade for/ })).toHaveCount(0);
      await expect(page.getByRole("button", { name: /Choose this plan/ })).toHaveCount(0);
    });
  });
}
