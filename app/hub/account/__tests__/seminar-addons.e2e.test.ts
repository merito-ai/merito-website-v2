import { test, expect, VIEWPORTS, seedUser, seedLead, seedOrder, login, guards, copyGuard, dialogGuard, db, type Seeded } from "../../../../test/e2e/hub";
import type { Page } from "@playwright/test";

// "Later add-ons" for seminar users (allowlisted or plan holders), plans/2026-11-12-hub-first-visit-guide-design.md.
// Normal users must keep today's UI. Never pays, never starts an interview, no referee email.
const ROLE = "Product Analyst";
const SHOTS = process.env.ADDON_SHOTS; // optional screenshot folder
const welcome = (page: Page) => page.getByTestId("welcome-line");
const panel = (page: Page) => page.locator(".plan-panel");
const twoDaysAgo = () => new Date(Date.now() - 2 * 86_400_000).toISOString();
const LOCKABLE = ["Fitment report", "Personality test", "Mock interview", "Reference checks", "Expert guidance"];

async function shot(page: Page, name: string) {
  if (SHOTS) await page.screenshot({ path: `${SHOTS}/${name}.png`, fullPage: true });
}
async function interviewRow(u: Seeded, leadId: string, row: Record<string, unknown>) {
  const { error } = await db.from("fitment_interviews").insert({ user_id: u.id, lead_id: leadId, role_title: ROLE, ib_job_id: "e2e", ib_agent_id: "e2e", ib_candidate_id: "e2e", ...row });
  if (error) throw new Error(error.message);
}
async function navLocks(page: Page, desktop: boolean, expected: string[]) {
  if (!desktop) return; // the sidebar is desktop-only
  const nav = page.getByRole("navigation", { name: "Account navigation" });
  await expect(nav.getByTestId("nav-lock")).toHaveCount(expected.length);
  for (const label of expected) await expect(nav.getByRole("link", { name: new RegExp(`${label}.*locked`) })).toBeVisible();
}
async function openNewRoleMenu(page: Page) {
  await page.getByTestId("role-switcher-trigger").or(page.locator("[data-role-switcher]")).filter({ visible: true }).first().click();
}

for (const vp of VIEWPORTS) {
  test.describe(`seminar add-ons @${vp.name}`, () => {
    test.use(vp.use);
    const desktop = vp.name === "desktop";

    // ---------- normal-user guard ----------

    test("journey, normal user: login first, then a role: today's dashboard and paywall, no add-ons", async ({ page }) => {
      const u = await seedUser(`addon-normal-${vp.name}`);
      await login(page, u.email);
      await expect(page.getByRole("heading", { level: 1 })).toContainText("Welcome, Asha.");
      await expect(welcome(page)).toHaveCount(0);
      await seedLead(u, { role: ROLE, score: 3.1 }); // the fit check, seeded (scoring calls the vendor)
      await page.goto("/hub/account");
      await expect(page.getByRole("heading", { level: 1 })).toContainText(`how you stand for ${ROLE}`);
      await expect(page.getByText("New here? Quick orientation.")).toBeVisible();
      await expect(page.getByText("Bundle: Report + Personality + References")).toBeVisible();
      await expect(welcome(page)).toHaveCount(0);
      await expect(page.getByText("Here's what to work on")).toHaveCount(0);
      await expect(page.getByRole("button", { name: "Unlock plans" })).toHaveCount(0);
      await page.waitForLoadState("networkidle");
      await navLocks(page, desktop, []);
      await openNewRoleMenu(page);
      await expect(page.getByRole("menuitem", { name: /Check a new role/ })).toBeVisible();
      await page.keyboard.press("Escape");
      await guards(page);
      await shot(page, `normal-dashboard-${vp.name}`);

      await page.getByRole("button", { name: /^Get bundle for/ }).click();
      const dlg = page.getByRole("dialog").filter({ hasText: "Full Bundle for" }).first();
      await expect(dlg.getByRole("button", { name: "Get the bundle" })).toBeVisible(); // today's single-price paywall
      await expect(dlg.getByRole("button", { name: "Unlock plans" })).toHaveCount(0);
      await expect(dlg).not.toContainText("included in your Merito plans");
    });

    test("normal user, form first, report stuck pending: no failed/pending note", async ({ page }) => {
      const u = await seedUser(`addon-normal-pending-${vp.name}`);
      await seedLead(u, { role: ROLE, status: "PENDING", score: 0, createdAt: twoDaysAgo() });
      await login(page, u.email);
      await expect(page.getByRole("heading", { level: 1 })).toContainText(`how you stand for ${ROLE}`);
      await expect(page.getByText("We couldn't prepare this report")).toHaveCount(0);
      await expect(page.getByText("Your detailed report is being prepared")).toHaveCount(0);
      await expect(welcome(page)).toHaveCount(0);
    });

    // ---------- allowlisted, no plan ----------

    test("journey, allowlisted: login first (S1) then a role: welcome line, Unlock plans popup, sidebar locks, low-score copy", async ({ page }) => {
      const u = await seedUser(`addon-s-journey-${vp.name}`, { allowlisted: true });
      await login(page, u.email);
      await expect(welcome(page)).toContainText("Exclusive plans unlocked for you");
      await expect(page.getByRole("button", { name: "Check my fit for a role" }).filter({ visible: true })).toHaveCount(1);
      await guards(page);
      await shot(page, `s1-welcome-${vp.name}`);

      await seedLead(u, { role: ROLE, score: 3.1 });
      await page.goto("/hub/account");
      await expect(welcome(page)).toContainText(`Your ${ROLE} report is 1 of the 3 included in every plan.`);
      await expect(page.getByText("New here? Quick orientation.")).toHaveCount(0); // one greeting element
      await expect(page.getByText("Here's what to work on")).toBeVisible(); // E13
      await expect(page.getByText("Bundle: Report + Personality + References")).toHaveCount(0);
      await page.waitForLoadState("networkidle");
      await expect(page.getByText("Your Merito plan options are ready")).toHaveCount(0); // no duplicate plan card
      await navLocks(page, desktop, LOCKABLE);
      await guards(page);
      await shot(page, `s2-dashboard-${vp.name}`);

      await page.getByRole("button", { name: "Unlock plans" }).filter({ visible: true }).first().click();
      const plans = page.getByRole("dialog", { name: "Choose your plan" });
      await expect(plans).toBeVisible();
      await dialogGuard(plans);
      await page.keyboard.press("Escape");
      await expect(plans).toHaveCount(0);

      await openNewRoleMenu(page);
      await expect(page.getByRole("menuitem", { name: /Check my fit for a role/ })).toBeVisible();
      await page.keyboard.press("Escape");

      // ✕ dismisses for good
      await welcome(page).getByRole("button", { name: "Dismiss welcome message" }).click();
      await expect(welcome(page)).toHaveCount(0);
      await page.reload();
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      await expect(welcome(page)).toHaveCount(0);
    });

    test("allowlisted, form first: same dashboard; a report pending over a day shows the failed state (E7)", async ({ page }) => {
      const u = await seedUser(`addon-s-form-${vp.name}`, { allowlisted: true });
      await seedLead(u, { role: ROLE, status: "PENDING", score: 0, createdAt: twoDaysAgo() });
      await login(page, u.email);
      await expect(welcome(page)).toContainText(`Your ${ROLE} report is 1 of the 3 included in every plan.`);
      await expect(page.getByText("We couldn't prepare this report. Try checking the role again or email us.")).toBeVisible();
      await expect(page.getByRole("link", { name: "Email us" })).toHaveAttribute("href", "mailto:admin@merito.ai");
      await expect(page.getByRole("button", { name: "Unlock plans" }).filter({ visible: true }).first()).toBeVisible();
      await guards(page);
      await shot(page, `s2-report-failed-${vp.name}`);
    });

    test("allowlisted: a fresh pending report says it is being prepared (E7)", async ({ page }) => {
      const u = await seedUser(`addon-s-pending-${vp.name}`, { allowlisted: true });
      await seedLead(u, { role: ROLE, status: "PENDING", score: 0 });
      await login(page, u.email);
      await expect(page.getByText("Your detailed report is being prepared.")).toBeVisible();
      await expect(page.getByText("We couldn't prepare this report")).toHaveCount(0);
    });

    test("allowlisted: the interview paywall opens the shared plans popup", async ({ page }) => {
      const u = await seedUser(`addon-s-paywall-${vp.name}`, { allowlisted: true });
      await seedLead(u, { role: ROLE });
      await login(page, u.email);
      await page.goto("/hub/account/interview");
      await page.getByRole("button", { name: /Start my mock interview/ }).click();
      const pay = page.getByRole("dialog", { name: "Ready for a real AI interview?" });
      await expect(pay.getByText("This is included in your Merito plans.")).toBeVisible();
      await pay.getByRole("button", { name: "Unlock plans" }).click();
      const plans = page.getByRole("dialog", { name: "Choose your plan" });
      await expect(plans).toBeVisible();
      await dialogGuard(plans);
      await copyGuard(plans);
      await shot(page, `paywall-unlock-plans-${vp.name}`);
      await page.keyboard.press("Escape");
      await expect(plans).toHaveCount(0);
      await expect(pay).toBeVisible(); // Esc closes only the top dialog
    });

    // ---------- plan holders ----------

    test("plan holder, no role (P1): welcome line, then dismissed -> plan badge", async ({ page }) => {
      const u = await seedUser(`addon-p1-${vp.name}`);
      await seedOrder(u, "plan_prepare");
      await login(page, u.email);
      await expect(welcome(page)).toContainText("Thanks for joining. Your Assess + Prepare plan is active.");
      await expect(page.getByText("Assess + Prepare · active")).toHaveCount(0);
      await expect(panel(page)).toContainText("Check my fit for a role");
      await guards(page);
      await shot(page, `p1-welcome-${vp.name}`);
      await welcome(page).getByRole("button", { name: "Dismiss welcome message" }).click();
      await expect(page.getByText("Assess + Prepare · active")).toBeVisible();
      await page.reload();
      await expect(page.getByText("Assess + Prepare · active")).toBeVisible();
      await expect(welcome(page)).toHaveCount(0);
    });

    test("plan holder with a role: welcome line, fit-check name, mentoring lock only; expired interview link (E6)", async ({ page }) => {
      const u = await seedUser(`addon-p2-expired-${vp.name}`);
      const lead = await seedLead(u, { role: ROLE });
      await seedOrder(u, "plan_prepare", { consumed: true });
      await interviewRow(u, lead, { status: "invited", invited_at: new Date(Date.now() - 12 * 86_400_000).toISOString(), magic_link_expires_at: twoDaysAgo() });
      await login(page, u.email);
      // The interview was started, so the plan's next step is done: no welcome line.
      await expect(welcome(page)).toHaveCount(0);
      const row = panel(page).locator("li").filter({ hasText: "AI interview" });
      await expect(row).toContainText(`Interview used for ${ROLE} · Your interview link expired`);
      await expect(row.getByRole("link", { name: /Email us/ })).toHaveAttribute("href", "mailto:admin@merito.ai");
      await page.waitForLoadState("networkidle");
      await navLocks(page, desktop, ["Expert guidance"]);
      await guards(page);
      await shot(page, `p2-expired-${vp.name}`);

      await page.goto("/hub/account/interview");
      await expect(page.getByRole("heading", { name: "Your interview link expired" })).toBeVisible();
      await expect(page.getByRole("link", { name: "Email us" })).toHaveAttribute("href", "mailto:admin@merito.ai");
      await expect(page.getByRole("button", { name: /Start Interview/i })).toHaveCount(0);
      await guards(page);
    });

    test("plan holder, new with a role: welcome line replaces the orientation banner", async ({ page }) => {
      const u = await seedUser(`addon-p2-new-${vp.name}`);
      await seedLead(u, { role: ROLE });
      await seedOrder(u, "plan_prepare");
      await login(page, u.email);
      await expect(welcome(page)).toContainText("Your Assess + Prepare plan is active. Each step below is included.");
      await expect(page.getByText("New here? Quick orientation.")).toHaveCount(0);
      await guards(page);
    });

    test("plan holder, everything done: Share my profile (E11)", async ({ page }) => {
      const u = await seedUser(`addon-p2-done-${vp.name}`);
      const lead = await seedLead(u, { role: ROLE });
      const order = await seedOrder(u, "plan_prepare", { consumed: true });
      await db.from("report_unlocks").insert({ user_id: u.id, lead_id: lead, role_title: ROLE, order_id: order });
      await interviewRow(u, lead, { status: "ready" });
      const { error: pe } = await db.from("personality_tests").insert({ user_id: u.id, role_title: ROLE, answers: {}, scores: {}, validity: {}, version: 2, culture_scores: {} });
      if (pe) throw new Error(pe.message);
      const { error: re } = await db.from("reference_checks").insert({ user_id: u.id, status: "completed" });
      if (re) throw new Error(re.message);
      await login(page, u.email);
      const share = panel(page).locator("li").filter({ hasText: "Share consolidated profile" });
      await expect(share).toContainText("Everything is done. Your profile is ready to share.");
      await expect(share.getByRole("link", { name: /Share my profile/ })).toHaveAttribute("href", /combined-report/);
      await expect(welcome(page)).toHaveCount(0);
      await guards(page);
      await shot(page, `p2-all-done-${vp.name}`);
    });

    test("Mentor + Apply: follow-up unlocked after session 1, assistance not contacted yet (E16)", async ({ page }) => {
      const u = await seedUser(`addon-p2-mentor-${vp.name}`);
      await seedLead(u, { role: ROLE });
      await seedOrder(u, "plan_mentor");
      const { error } = await db.from("counselling_requests").update({ status: "scheduled", scheduled_at: "2026-12-01T05:30:00Z" }).eq("user_id", u.id).eq("session", 1);
      if (error) throw new Error(error.message);
      await login(page, u.email);
      await expect(panel(page).locator("li").filter({ hasText: "Mentoring" })).toContainText("Follow-up: Unlocked, not booked yet");
      await expect(panel(page).locator("li").filter({ hasText: "Application assistance" })).toContainText("Not contacted yet. Our team will call or email you");
      await page.waitForLoadState("networkidle");
      await navLocks(page, desktop, []);
      await guards(page);
    });
  });
}
