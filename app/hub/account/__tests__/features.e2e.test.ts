import { test, expect, VIEWPORTS, seedUser, seedOrder, seedLead, login, guards, copyGuard, dialogGuard, db, type Seeded } from "../../../../test/e2e/hub";
import { SAMPLE_INTERVIEW_REPORT } from "@/lib/sampleReports/interview";
import type { Page } from "@playwright/test";

// Feature pages for a plan holder and a normal user. No live interview start, no referee email (DB-seeded).
const ROLE = "Product Analyst";

async function answerPage(page: Page) {
  const groups = page.getByRole("radiogroup");
  await expect(groups.first()).toBeVisible();
  const n = await groups.count();
  for (let i = 0; i < n; i++) await groups.nth(i).getByRole("radio").nth((i % 3) + 1).click();
}
// Answers every page of the current part; returns once the last page's button was pressed.
async function finishPart(page: Page) {
  for (let guard = 0; guard < 30; guard++) {
    await answerPage(page);
    const btn = page.getByRole("button", { name: /^(Next|Save Part 1|Finish test|Continue to Part 2)$/ });
    const label = (await btn.innerText()).trim();
    await btn.click();
    if (label !== "Next") return;
    await expect(page.getByRole("radio", { checked: true })).toHaveCount(0);
  }
  throw new Error("personality part never ended");
}
async function interviewRow(u: Seeded, leadId: string, row: Record<string, unknown>) {
  const { error } = await db.from("fitment_interviews").insert({
    user_id: u.id, lead_id: leadId, role_title: ROLE, ib_job_id: "e2e", ib_agent_id: "e2e", ib_candidate_id: "e2e", ...row,
  });
  if (error) throw new Error(error.message);
}
const panel = (page: Page) => page.locator(".plan-panel");

for (const vp of VIEWPORTS) {
  test.describe(`feature pages @${vp.name}`, () => {
    test.use(vp.use);

    test("personality (plan holder): start, part 1, resume, part 2, report with culture, export", async ({ page }) => {
      test.setTimeout(240_000);
      const u = await seedUser(`feat-pers-${vp.name}`);
      await seedLead(u, { role: ROLE });
      await seedOrder(u, "plan_prepare");
      await login(page, u.email);
      await page.goto("/hub/account/personality");
      await page.waitForLoadState("networkidle");
      await guards(page);
      await page.getByRole("button", { name: "Start test" }).click();
      await finishPart(page);
      await expect(page.getByRole("button", { name: "Start Part 2" })).toBeVisible({ timeout: 60_000 }); // scoring + first compile
      await page.reload(); // resume: Part 1 is saved server-side
      await expect(page.getByRole("button", { name: "Start Part 2" })).toBeVisible();
      await page.getByRole("button", { name: "Start Part 2" }).click();
      await finishPart(page);
      const download = page.getByRole("link", { name: "Download" });
      await expect(download).toHaveAttribute("href", /\/api\/hub\/personality\/export/);
      const { data } = await db.from("personality_tests").select("culture_scores").eq("user_id", u.id).single();
      expect(data?.culture_scores).toBeTruthy();
      await page.reload();
      await expect(page.getByRole("link", { name: "Download" })).toBeVisible();
      await expect(page.getByText(/culture/i).filter({ visible: true }).first()).toBeVisible();
      await guards(page);
    });

    test("personality (normal user): locked page shows the sample and the price", async ({ page }) => {
      const u = await seedUser(`feat-pers-normal-${vp.name}`);
      await seedLead(u, { role: ROLE });
      await login(page, u.email);
      await page.goto("/hub/account/personality");
      await expect(page.getByRole("heading", { name: "Personality test", level: 1 })).toBeVisible();
      await expect(page.getByRole("button", { name: /₹/ }).first()).toBeVisible();
      await guards(page);
    });

    test("interview (normal user): paywall states, never pays", async ({ page }) => {
      const u = await seedUser(`feat-int-normal-${vp.name}`);
      await seedLead(u, { role: ROLE });
      await login(page, u.email);
      await page.goto("/hub/account/interview");
      await page.getByRole("button", { name: /Start my mock interview/ }).click();
      const dlg = page.getByRole("dialog", { name: "Ready for a real AI interview?" });
      await expect(dlg).toBeVisible();
      await dialogGuard(dlg);
      await expect(dlg.getByRole("button", { name: /^Pay ₹/ })).toBeEnabled();
      await copyGuard(dlg);
      await page.keyboard.press("Escape");
      await expect(dlg).toHaveCount(0);
      await guards(page);
    });

    test("interview in progress: deadline card", async ({ page }) => {
      const u = await seedUser(`feat-int-prog-${vp.name}`);
      const lead = await seedLead(u, { role: ROLE });
      await seedOrder(u, "plan_prepare", { consumed: true });
      const due = new Date(Date.now() + 7 * 86_400_000);
      await interviewRow(u, lead, { status: "invited", magic_link_expires_at: due.toISOString() });
      await login(page, u.email);
      await page.goto("/hub/account/interview");
      await expect(page.getByText(/Complete this interview by/)).toBeVisible();
      await guards(page);
      await page.goto("/hub/account");
      await expect(panel(page).locator("li").filter({ hasText: "AI interview" })).toContainText(`Interview used for ${ROLE}`);
    });

    test("interview completed: report view", async ({ page }) => {
      const u = await seedUser(`feat-int-done-${vp.name}`);
      const lead = await seedLead(u, { role: ROLE });
      await interviewRow(u, lead, { status: "ready", report_raw: SAMPLE_INTERVIEW_REPORT });
      await login(page, u.email);
      await page.goto("/hub/account/interview");
      await expect(page.getByText(SAMPLE_INTERVIEW_REPORT.overallSummary.slice(0, 40)).first()).toBeVisible();
      await guards(page);
    });

    test("references: invite form validation and the waiting state", async ({ page }) => {
      const u = await seedUser(`feat-refs-${vp.name}`);
      await seedLead(u, { role: ROLE });
      await seedOrder(u, "plan_prepare");
      const { data: check, error } = await db.from("reference_checks").insert({ user_id: u.id, status: "in_progress" }).select("id").single();
      if (error) throw new Error(error.message);
      await db.from("referees").insert({ reference_check_id: check.id, name: "Roshan Test", email: "roshanrk2014@gmail.com", role: "manager", status: "pending" });
      await login(page, u.email);
      await page.goto("/hub/account/references");
      await page.waitForLoadState("networkidle");
      await expect(page.getByText("Roshan Test")).toBeVisible();
      await expect(page.getByText("Pending", { exact: true }).first()).toBeVisible();
      await guards(page);

      const posts: string[] = [];
      page.on("request", (r) => r.url().includes("/add-referee") && posts.push(r.url()));
      const form = page.locator("form").filter({ hasText: "Add a referee" });
      await form.getByRole("button", { name: "Add referee" }).click();
      const email = form.locator('input[type="email"]');
      expect(await email.evaluate((el: HTMLInputElement) => el.validity.valid)).toBe(false);
      await email.fill("not-an-email");
      expect(await email.evaluate((el: HTMLInputElement) => el.validity.valid)).toBe(false);
      await form.getByRole("button", { name: "Add referee" }).click();
      expect(posts).toEqual([]); // nothing sent: no referee email
    });

    test("mentoring (Mentor + Apply): session 1 bookable, follow-up locked", async ({ page }) => {
      const u = await seedUser(`feat-expert-${vp.name}`);
      await seedLead(u, { role: ROLE });
      await seedOrder(u, "plan_mentor");
      await login(page, u.email);
      await page.goto("/hub/account/expert");
      const items = page.locator("li");
      await expect(items.filter({ hasText: "Session 1" }).getByRole("link", { name: /Schedule your call/ })).toBeVisible();
      await expect(items.filter({ hasText: "Follow-up" }).getByRole("link")).toHaveCount(0);
      await guards(page);
    });

    for (const [status, text] of [
      ["not_contacted", "Our team will call or email you within 7 working days"],
      ["in_progress", "In progress: our team is working on your 3 companies"],
      ["done", "Our team has referred you to your 3 companies"],
    ] as const) {
      test(`application assistance status text: ${status}`, async ({ page }) => {
        const u = await seedUser(`feat-assist-${status}-${vp.name}`);
        await seedLead(u, { role: ROLE });
        await seedOrder(u, "plan_mentor");
        await db.from("plan_assistance").insert({ user_id: u.id, status, updated_by: "e2e@example.test" });
        await login(page, u.email);
        await expect(panel(page).locator("li").filter({ hasText: "Application assistance" })).toContainText(text);
      });
    }

    test("consolidated report: share link, public page, revoked link", async ({ page, browser }) => {
      const u = await seedUser(`feat-share-${vp.name}`);
      const lead = await seedLead(u, { role: ROLE, raw: { overallScore: 72, rank: 1, summary: "s", strongPoints: [], weakPoints: [], categories: [] } });
      await db.from("report_unlocks").insert({ user_id: u.id, lead_id: lead, role_title: ROLE });
      await page.context().grantPermissions(["clipboard-read", "clipboard-write"]);
      await login(page, u.email);
      await page.goto("/hub/account/combined-report");
      await page.waitForLoadState("networkidle");
      await guards(page);
      await page.getByRole("button", { name: "Copy live link" }).click();
      await expect(page.getByRole("button", { name: "Link copied" })).toBeVisible();
      const { data: link } = await db.from("report_share_links").select("token").eq("user_id", u.id).single();
      expect(link?.token).toBeTruthy();

      const anon = await browser.newPage({ viewport: page.viewportSize()! });
      await anon.goto(`/hub/share/${link!.token}`);
      await expect(anon.getByText(ROLE).first()).toBeVisible();
      await guards(anon);

      const res = await page.request.post("/api/hub/share/revoke", { data: { roleTitle: ROLE, revoked: true } });
      expect(res.ok()).toBe(true);
      await anon.reload();
      await expect(anon.getByText("This link is no longer available")).toBeVisible();
      await anon.close();
    });
  });
}
