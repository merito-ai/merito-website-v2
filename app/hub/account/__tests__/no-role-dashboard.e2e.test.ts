import { test, expect, VIEWPORTS, seedUser, seedOrder, seedLead, login, guards, copyGuard, dialogGuard } from "../../../../test/e2e/hub";
import { PRODUCT_PRICING, PRODUCT_LABELS } from "@/lib/razorpay/pricing";

// plans/2026-11-12-hub-first-visit-guide-design.md "Scope (2026-11-12, user)". Never pays, never starts an interview.
const price = (p: "plan_prepare" | "plan_mentor") => `₹${(PRODUCT_PRICING[p].entry / 100).toLocaleString("en-IN")}`;
const visible = (l: import("@playwright/test").Locator) => l.filter({ visible: true }).first();

for (const vp of VIEWPORTS) {
  test.describe(`no-role dashboard @${vp.name}`, () => {
    test.use(vp.use);
    const mobile = vp.name !== "desktop";

    test("N1: welcome, fit check, sample report, how it works", async ({ page }) => {
      const u = await seedUser(`nr-n1-${vp.name}`);
      await login(page, u.email);
      await expect(page.getByRole("heading", { level: 1 })).toContainText("Welcome, Asha.");
      await expect(page.getByRole("heading", { name: "How Merito works" })).toBeVisible();
      await expect(page.locator("#how-merito-works ~ ul li")).toHaveCount(5);
      await expect(page.getByText("No fitment scores yet")).toHaveCount(0);
      await guards(page);

      await visible(page.getByRole("button", { name: "Check my fit for a role" })).click();
      const fit = page.getByRole("dialog", { name: "Check my fit for a role" });
      // The dialog node wraps a position:fixed overlay (zero box), so check its content is shown.
      await expect(fit.getByRole("heading").first()).toBeVisible();
      await dialogGuard(fit);
      await copyGuard(fit);
      await page.keyboard.press("Escape");
      await expect(fit).toHaveCount(0);

      await page.getByRole("link", { name: "See a sample report" }).click();
      await expect(page).toHaveURL(/\/hub\/sample-report/);
    });

    test("N1 without a name: generic welcome (E12)", async ({ page }) => {
      const u = await seedUser(`nr-n1-noname-${vp.name}`, { name: null });
      await login(page, u.email);
      await expect(page.getByRole("heading", { level: 1 })).toContainText("Welcome to Merito HUB.");
    });

    test("S1: plans popup a11y, Esc/outside close, confirm dialog (no pay)", async ({ page }) => {
      const u = await seedUser(`nr-s1-${vp.name}`, { allowlisted: true });
      await login(page, u.email);
      await expect(page.getByText("Exclusive plans unlocked for you")).toBeVisible();
      await expect(page.getByRole("heading", { name: "What your plan includes" })).toBeVisible();
      await guards(page);

      const open = visible(page.getByRole("button", { name: "Unlock plans" }));
      await open.click();
      const dlg = page.getByRole("dialog", { name: "Choose your plan" });
      await expect(dlg).toBeVisible();
      await dialogGuard(dlg);
      await expect.poll(() => dlg.evaluate((d) => d.contains(document.activeElement))).toBe(true);
      for (const p of ["plan_prepare", "plan_mentor"] as const) {
        await expect(dlg.getByRole("heading", { name: PRODUCT_LABELS[p], exact: true })).toBeVisible();
        await expect(dlg.getByText(price(p), { exact: true })).toBeVisible();
      }
      await copyGuard(dlg);
      if (mobile) {
        // Bottom sheet: flush with the viewport bottom, full width.
        await expect.poll(async () => { const b = (await dlg.boundingBox())!; return [Math.round(b.y + b.height), Math.round(b.width)]; }).toEqual([812, 375]);
      }

      await page.keyboard.press("Escape");
      await expect(dlg).toHaveCount(0);
      await expect(open).toBeFocused();

      await open.click();
      await expect(dlg).toBeVisible();
      await page.mouse.click(5, 5); // backdrop
      await expect(dlg).toHaveCount(0);

      await open.click();
      await dlg.getByRole("button", { name: `Choose ${PRODUCT_LABELS.plan_prepare}` }).click();
      const confirm = page.getByRole("dialog", { name: "Confirm your plan" });
      await expect(confirm).toBeVisible();
      await dialogGuard(confirm);
      await expect(confirm).toContainText(PRODUCT_LABELS.plan_prepare);
      await expect(confirm).toContainText(price("plan_prepare"));
      await copyGuard(confirm);
      // STOP: Razorpay is never opened.
    });

    test("P1: plan badge, Start here, Needs a role without links, personality reachable", async ({ page }) => {
      const u = await seedUser(`nr-p1-${vp.name}`);
      await seedOrder(u, "plan_prepare");
      await login(page, u.email);
      await expect(page.getByText(`${PRODUCT_LABELS.plan_prepare} · active`)).toBeVisible();
      await guards(page);

      const rows = page.locator(".plan-panel li");
      await expect(rows.first()).toContainText("Start here");
      for (const key of ["Invite referees", "AI interview", "Share consolidated profile"]) {
        const row = rows.filter({ hasText: key });
        await expect(row).toContainText("Needs a role");
        await expect(row.locator("a")).toHaveCount(0);
      }
      await expect(rows.filter({ hasText: "Personality + culture" })).toContainText("You can do this anytime");
      await page.getByRole("main").getByRole("link", { name: "Start personality test" }).click();
      await expect(page).toHaveURL(/\/hub\/account\/personality/);
    });

    for (const path of ["interview", "references", "combined-report"]) {
      test(`no-role /${path}: stays, offers the fit check`, async ({ page }) => {
        const u = await seedUser(`nr-page-${path}-${vp.name}`);
        await seedOrder(u, "plan_prepare"); // a paid user is the case that used to bounce
        await login(page, u.email);
        await page.goto(`/hub/account/${path}`);
        await expect(page).toHaveURL(new RegExp(`/hub/account/${path}$`));
        await expect(visible(page.getByRole("button", { name: "Check my fit for a role" }))).toBeVisible();
        await guards(page);
      });
    }

    test("plan holder with a role: interview confirm names the role, Switch role, 10 days (not started)", async ({ page }) => {
      const u = await seedUser(`nr-p-role-${vp.name}`);
      await seedLead(u, { role: "Growth Marketing Lead" });
      await seedOrder(u, "plan_prepare");
      await login(page, u.email);
      await page.goto("/hub/account/interview");
      await page.getByRole("button", { name: "Start my mock interview" }).click();
      const dlg = page.getByRole("dialog", { name: "Start your interview?" });
      await expect(dlg).toBeVisible();
      await dialogGuard(dlg);
      await expect(dlg).toContainText("This uses your plan's interview for Growth Marketing Lead.");
      await expect(dlg.getByRole("button", { name: "Switch role" })).toBeVisible();
      await expect(dlg).toContainText("You have 10 days to finish, starting now");
      await expect(dlg.getByRole("button", { name: "Start interview for Growth Marketing Lead" })).toBeEnabled();
      await copyGuard(dlg);
      await guards(page);
      // Not clicked: would start a live interview.
    });
  });
}
