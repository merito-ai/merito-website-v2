import { test, expect, VIEWPORTS, seedUser, magicLink, login, guards } from "../../../../test/e2e/hub";

// Hub sign-in (magic link only). OTP mail goes to the LOCAL Supabase mail catcher.
for (const vp of VIEWPORTS) {
  test.describe(`auth @${vp.name}`, () => {
    test.use(vp.use);

    test("login form shows the Check your email state", async ({ page }) => {
      const u = await seedUser(`auth-form-${vp.name}`);
      await page.goto("/hub/login");
      await guards(page);
      await page.getByLabel("Email").fill(u.email);
      await page.getByRole("button", { name: "Send link" }).click();
      await expect(page.getByText("Check your email")).toBeVisible();
      await guards(page);
    });

    test("bad or expired link shows the expired message", async ({ page }) => {
      await page.goto("/hub/auth/callback?token_hash=not-a-real-token&type=magiclink");
      await expect(page).toHaveURL(/\/hub\/login\?error=expired/);
      await expect(page.getByText("That sign-in link has expired or was already used.")).toBeVisible();
      await guards(page);
    });

    test("a reused link while signed in lands on the dashboard", async ({ page }) => {
      const u = await seedUser(`auth-reuse-${vp.name}`);
      const link = await magicLink(u.email);
      await page.goto(link);
      await expect(page).toHaveURL(/\/hub\/account$/);
      await page.goto("/hub/account/pricing");
      await page.goto(link); // token already used
      await expect(page).toHaveURL(/\/hub\/account$/);
    });

    test("logged-out pricing deep link goes to login and back", async ({ page }) => {
      const u = await seedUser(`auth-deep-${vp.name}`);
      await page.goto("/hub/account/pricing");
      await expect(page).toHaveURL(/\/hub\/login\?next=%2Fhub%2Faccount%2Fpricing/);
      await page.goto(await magicLink(u.email, "/hub/account/pricing"));
      await expect(page).toHaveURL(/\/hub\/account\/pricing$/);
    });

    test("logged-out feature deep link goes to login; signed-in reaches it", async ({ page }) => {
      const u = await seedUser(`auth-feature-${vp.name}`);
      await page.goto("/hub/account/interview");
      await expect(page).toHaveURL(/\/hub\/login/);
      await login(page, u.email);
      await page.goto("/hub/account/interview");
      await expect(page).toHaveURL(/\/hub\/account\/interview$/);
    });
  });
}
