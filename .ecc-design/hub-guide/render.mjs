// Render merito-hub-guide.html to pages/slide-NN.png (2x) and merito-hub-guide.pdf. Usage: node .ecc-design/hub-guide/render.mjs
import { chromium } from "playwright";
import { readdirSync, rmSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const dir = fileURLToPath(new URL(".", import.meta.url));
const pages = `${dir}pages/`;
for (const f of readdirSync(pages)) if (/^slide-\d+\.png$/.test(f)) rmSync(pages + f);

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 2, reducedMotion: "reduce" });
await page.goto(new URL("merito-hub-guide.html", import.meta.url).href);
await page.addStyleTag({ content: "html{scroll-behavior:auto!important}.progress,.counter{display:none!important}" });
await page.evaluate(() => document.fonts.ready);
const slides = page.locator("section.slide");
const n = await slides.count();
const names = [];
for (let i = 0; i < n; i++) {
  const slide = slides.nth(i);
  await slide.evaluate((el) => { el.classList.add("visible"); el.scrollIntoView(); });
  await page.waitForTimeout(150);
  const name = `slide-${String(i + 1).padStart(2, "0")}.png`;
  await slide.screenshot({ path: pages + name });
  names.push(name);
}
const print = `<html><head><style>@page{size:1280px 720px;margin:0}html,body{margin:0}img{display:block;width:1280px;height:720px;break-after:page}</style></head><body>${names.map((n) => `<img src="${n}">`).join("")}</body></html>`;
writeFileSync(pages + "print.html", print);
const pdfPage = await browser.newPage();
await pdfPage.goto(new URL("print.html", `file:///${pages.replace(/\\/g, "/")}`).href);
await pdfPage.waitForLoadState("networkidle");
await pdfPage.pdf({ path: `${dir}merito-hub-guide.pdf`, width: "1280px", height: "720px", printBackground: true });
await browser.close();
console.log(`rendered ${n} slides + PDF`);
