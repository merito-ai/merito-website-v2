import { test, expect, VIEWPORTS, seedUser, seedLead, seedOrder, login, guards, dialogGuard, db } from "../../../../test/e2e/hub";

// Dashboard once a role exists. SECRET_* strings stand in for paid report text.
const raw = (tag: string) => ({
  overallScore: 72,
  rank: 1,
  summary: `SECRET_SUMMARY_${tag}`,
  strongPoints: [`SECRET_STRONG_${tag}`],
  weakPoints: [`SECRET_WEAK_${tag}`],
  categories: ["skillsMatch", "educationMatch", "experienceMatch", "locationMatch", "domainMatch", "roleRelevance"].map((key) => ({
    key,
    label: key,
    score: 70,
    comment: `SECRET_COMMENT_${tag}_${key}`,
  })),
});
const panel = (page: import("@playwright/test").Page) => page.locator(".plan-panel");

async function unlockReport(userId: string, leadId: string, role: string, orderId: string | null = null) {
  const { error } = await db.from("report_unlocks").insert({ user_id: userId, lead_id: leadId, role_title: role, order_id: orderId });
  if (error) throw new Error(error.message);
}

for (const vp of VIEWPORTS) {
  test.describe(`dashboard with a role @${vp.name}`, () => {
    test.use(vp.use);

    test("normal user, report locked: score, rail, no paid text in the dashboard", async ({ page }) => {
      const u = await seedUser(`dash-locked-${vp.name}`);
      await seedLead(u, { raw: raw("L") });
      await login(page, u.email);
      await expect(page.getByRole("heading", { level: 1 })).toContainText("how you stand for Product Analyst");
      await expect(page.getByText("Fitment report").filter({ visible: true }).first()).toBeVisible();
      await expect(page.getByText("Locked", { exact: true }).filter({ visible: true }).first()).toBeVisible();
      await guards(page);
      expect(await page.content()).not.toContain("SECRET_");
    });

    test("normal user, report unlocked: rail says Unlocked and the report renders", async ({ page }) => {
      const u = await seedUser(`dash-unlocked-${vp.name}`);
      const lead = await seedLead(u, { raw: raw("U") });
      await unlockReport(u.id, lead, "Product Analyst");
      await login(page, u.email);
      await expect(page.getByText("Unlocked", { exact: true }).filter({ visible: true }).first()).toBeVisible();
      await page.goto("/hub/account/report");
      await expect(page.getByText("SECRET_SUMMARY_U").first()).toBeVisible();
      await guards(page);
    });

    // Locked report: real scores only; every paid text field is a placeholder (redactLockedReport).
    test("locked report page keeps paid text out of the DOM", async ({ page }) => {
      const u = await seedUser(`dash-leak-${vp.name}`);
      await seedLead(u, { raw: raw("K") });
      await login(page, u.email);
      await page.goto("/hub/account/report");
      await expect(page.getByRole("heading", { name: "Fitment report", level: 1 })).toBeVisible();
      expect(await page.content()).not.toContain("SECRET_");
    });

    test("role switcher switches roles; Check a new role opens the role check", async ({ page }) => {
      const u = await seedUser(`dash-switch-${vp.name}`);
      const older = await seedLead(u, { role: "Data Analyst", createdAt: "2026-01-01T00:00:00Z" });
      await seedLead(u, { role: "Product Analyst" });
      await login(page, u.email);
      const label = page.getByTestId("role-label").filter({ visible: true }).first();
      await expect(label).toHaveText("Product Analyst");
      await page.getByTestId("role-switcher-trigger").filter({ visible: true }).first().click();
      await page.getByTestId(`role-option-${older}`).click();
      await expect(page).toHaveURL(new RegExp(`lead=${older}`));
      await expect(page.getByRole("heading", { level: 1 })).toContainText("Data Analyst");
      await guards(page);

      await page.getByTestId("role-switcher-trigger").filter({ visible: true }).first().click();
      await page.getByRole("menuitem", { name: /Check a new role/ }).click();
      const dlg = page.getByRole("dialog").filter({ hasText: "Change target role" });
      await expect(dlg.getByRole("heading", { name: "Change target role" })).toBeVisible();
      await dialogGuard(dlg);
      await expect(dlg).toContainText("re-locks for the new role (₹299)");
      // Not submitted: rescoring calls the scoring vendor.
    });

    test("plan user report credits 3 → 0 and the ₹299 prompt for a 4th role", async ({ page }) => {
      const u = await seedUser(`dash-credits-${vp.name}`);
      const lead = await seedLead(u, { raw: raw("C") });
      const order = await seedOrder(u, "plan_prepare");
      await login(page, u.email);
      await expect(panel(page)).toContainText("Your report is ready · 3 of 3 left");
      await unlockReport(u.id, lead, "Product Analyst", order);
      for (const [n, role] of [[2, "Role B"], [1, "Role C"]] as const) {
        await page.reload();
        await expect(panel(page)).toContainText(`${n} of 3 left`);
        const l = await seedLead(u, { role, createdAt: "2026-01-01T00:00:00Z" });
        await unlockReport(u.id, l, role, order);
      }
      await page.reload();
      await expect(panel(page)).toContainText("All 3 used · extra reports ₹299");
      await guards(page);
      await page.getByTestId("role-switcher-trigger").filter({ visible: true }).first().click();
      await page.getByRole("menuitem", { name: /Check a new role/ }).click();
      await expect(page.getByRole("dialog").filter({ hasText: "Change target role" })).toContainText("₹299");
    });
  });
}
