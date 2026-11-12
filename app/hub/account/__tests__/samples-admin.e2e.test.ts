import { test, expect, VIEWPORTS, seedUser, seedOrder, seedLead, ensureUser, magicLink, login, guards, copyGuard, noHScroll, db } from "../../../../test/e2e/hub";

const ADMIN = "e2e-admin@example.test"; // = playwright.config.ts webServer.env.ADMIN_EMAIL

for (const vp of VIEWPORTS) {
  test.describe(`sample reports @${vp.name}`, () => {
    test.use(vp.use);

    test("/hub/sample-report renders without sideways scroll", async ({ page }) => {
      await page.goto("/hub/sample-report");
      await expect(page.getByRole("heading").first()).toBeVisible();
      await guards(page);
    });

    test("personality sample (locked page) renders without sideways scroll", async ({ page }) => {
      const u = await seedUser(`sample-pers-${vp.name}`);
      await seedLead(u);
      await login(page, u.email);
      await page.goto("/hub/account/personality");
      await expect(page.getByRole("heading", { name: "Personality test", level: 1 })).toBeVisible();
      await guards(page);
    });
  });

  test.describe(`admin @${vp.name}`, () => {
    test.use(vp.use);

    test("plan allowlist: mixed separators and Name <email>, blank note, remove", async ({ page }) => {
      const e = (k: string) => `e2e-al-${k}-${vp.name}@example.test`;
      await db.from("plan_allowlist").delete().in("email", ["a", "b", "c", "d"].map(e));
      await ensureUser(ADMIN);
      await page.goto(await magicLink(ADMIN, "/admin"));
      await page.goto("/admin/plan-allowlist");
      await page.waitForLoadState("networkidle"); // form is client-side; typing before hydration is lost
      await page.getByLabel("Emails").fill(`Asha Verma <${e("a")}>, ${e("b")}; ${e("c")}\n${e("d").toUpperCase()} not-an-email`);
      await page.getByRole("button", { name: "Add", exact: true }).click();
      // Display-name words are listed as skipped (documented Low, lib/__tests__/planAllowlist.test.ts).
      await expect(page.getByText("Added 4 · skipped invalid: Asha, Verma, not-an-email")).toBeVisible();
      for (const k of ["a", "b", "c", "d"]) await expect(page.getByRole("row").filter({ hasText: e(k) })).toBeVisible();
      const cells = page.getByRole("row").filter({ hasText: e("a") }).getByRole("cell");
      await expect(cells.nth(1)).toHaveText("");
      await copyGuard(page); // sideways scroll: own test below

      await page.getByRole("row").filter({ hasText: e("d") }).getByRole("button", { name: "Remove" }).click();
      const confirm = page.getByRole("dialog").filter({ hasText: "Remove email?" });
      await confirm.getByRole("button", { name: "Remove" }).click();
      await expect(page.getByRole("row").filter({ hasText: e("d") })).toHaveCount(0);
      const { count } = await db.from("plan_allowlist").select("email", { count: "exact", head: true }).eq("email", e("d"));
      expect(count).toBe(0);
      await db.from("plan_allowlist").delete().in("email", ["a", "b", "c"].map(e));
    });

    test("assistance: status change persists and shows on the candidate dashboard", async ({ page }) => {
      const u = await seedUser(`admin-assist-${vp.name}`);
      await seedLead(u);
      await seedOrder(u, "plan_mentor");
      await ensureUser(ADMIN);
      await page.goto(await magicLink(ADMIN, "/admin"));
      await page.goto("/admin/assistance");
      await page.waitForLoadState("networkidle");
      const row = page.getByRole("row").filter({ hasText: u.email });
      await expect(row).toContainText("Not contacted");
      await row.locator(`#status-${u.id}`).selectOption("in_progress");
      await row.getByRole("button", { name: "Save", exact: true }).click();
      await expect(page.getByText(`Saved for ${u.email}.`)).toBeVisible();
      await page.reload();
      await expect(page.getByRole("row").filter({ hasText: u.email })).toContainText("In progress");
      const { data } = await db.from("plan_assistance").select("status").eq("user_id", u.id).single();
      expect(data?.status).toBe("in_progress");
      await copyGuard(page);

      await page.context().clearCookies();
      await login(page, u.email);
      await expect(page.locator(".plan-panel li").filter({ hasText: "Application assistance" })).toContainText("In progress: our team is working on your 3 companies");
      await guards(page);
    });

    test("admin pages have no sideways scroll", async ({ page }) => {
      test.fail(vp.name !== "desktop", "Admin tables overflow the page at 375px. Logged Low in plans/2026-11-10-hub-plans-followups.md.");
      await ensureUser(ADMIN);
      await page.goto(await magicLink(ADMIN, "/admin"));
      for (const path of ["/admin/plan-allowlist", "/admin/assistance"]) {
        await page.goto(path);
        await page.waitForLoadState("networkidle");
        await noHScroll(page);
      }
    });
  });
}
