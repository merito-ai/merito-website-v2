// Retake Hub screenshots for the guide. Usage: node .ecc-design/hub-guide/shots.mjs "<prod magic-link callback URL for an allowlisted, plan-less, role-less account>"
import { chromium } from "playwright";

const login = process.argv[2];
if (!login) throw new Error("pass a /hub/auth/callback?token_hash=... URL");
const out = new URL("./assets/", import.meta.url);

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 760 }, deviceScaleFactor: 1.5 });
await page.goto(login);
await page.waitForURL(/\/hub\/account/);
await page.getByText("Exclusive plans unlocked for you").waitFor();
await page.waitForTimeout(1500);
await page.screenshot({ path: new URL("06-dashboard.png", out).pathname.slice(1) });

await page.getByRole("button", { name: "Check my fit for a role", exact: true }).filter({ visible: true }).first().click();
const dialog = page.getByRole("dialog");
await dialog.getByLabel("Full name").fill("Priya Shah");
await dialog.getByLabel("Phone number").fill("9876543210");
await dialog.getByLabel("The role you want").fill("Senior Product Manager");
await dialog.getByRole("combobox").selectOption("senior");
await dialog.getByLabel("Job description").fill("We are hiring a Senior Product Manager to own the roadmap for our B2B SaaS platform...");
await page.waitForTimeout(500);
await page.screenshot({ path: new URL("09-role-check.png", out).pathname.slice(1) });

await browser.close();
