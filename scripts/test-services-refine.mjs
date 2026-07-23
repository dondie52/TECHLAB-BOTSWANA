import { chromium } from "playwright";
import fs from "fs";

fs.mkdirSync("screenshots/refine-final", { recursive: true });
const browser = await chromium.launch();
const results = [];

async function shot(name, url, viewport, hash = "") {
  const page = await browser.newPage({ viewport });
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });
  await page.goto(url + hash, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForTimeout(900);
  await page.evaluate(() => window.ScrollTrigger?.refresh?.());
  if (hash) {
    await page.evaluate((h) => {
      const el = document.querySelector(h);
      el?.scrollIntoView({ block: "start" });
    }, hash);
    await page.waitForTimeout(500);
    await page.evaluate(() => window.ScrollTrigger?.refresh?.());
    await page.evaluate((h) => {
      document.querySelector(h)?.scrollIntoView({ block: "start" });
    }, hash);
    await page.waitForTimeout(350);
  }
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
  );
  await page.screenshot({ path: `screenshots/refine-final/${name}.png` });
  results.push({ name, overflow, errors: errors.slice(0, 5) });
  await page.close();
}

await shot("home", "http://127.0.0.1:8080/index.html", { width: 1440, height: 900 });
await shot("hero-1440", "http://127.0.0.1:8080/services.html", { width: 1440, height: 900 });
await shot("hero-390", "http://127.0.0.1:8080/services.html", { width: 390, height: 844 });
await shot("cctv-1440", "http://127.0.0.1:8080/services.html", { width: 1440, height: 900 }, "#security");
await shot("pos-1440", "http://127.0.0.1:8080/services.html", { width: 1440, height: 900 }, "#retail");
await shot("websites-1440", "http://127.0.0.1:8080/websites.html", { width: 1440, height: 900 }, "#work");
await shot("automation-1440", "http://127.0.0.1:8080/automation.html", { width: 1440, height: 900 }, "#journey");
await shot("infra-1440", "http://127.0.0.1:8080/services.html", { width: 1440, height: 900 }, "#infrastructure");
await shot("process-1440", "http://127.0.0.1:8080/services.html", { width: 1440, height: 900 }, "#process");
await shot("finder-1440", "http://127.0.0.1:8080/services.html", { width: 1440, height: 900 }, "#finder");
await shot("cta-1440", "http://127.0.0.1:8080/services.html", { width: 1440, height: 900 }, "#cta");
await shot("cctv-390", "http://127.0.0.1:8080/services.html", { width: 390, height: 844 }, "#security");
await shot("finder-390", "http://127.0.0.1:8080/services.html", { width: 390, height: 844 }, "#finder");

const finderPage = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await finderPage.goto("http://127.0.0.1:8080/services.html#finder", { waitUntil: "domcontentloaded" });
await finderPage.waitForTimeout(800);
await finderPage.locator('[data-service="security"]').click();
await finderPage.waitForTimeout(200);
await finderPage.screenshot({ path: "screenshots/refine-final/finder-selected-1440.png" });
await finderPage.close();
for (const vp of [
  { w: 1366, h: 768 },
  { w: 1280, h: 720 },
  { w: 1024, h: 768 },
  { w: 768, h: 1024 },
  { w: 430, h: 932 },
  { w: 360, h: 800 },
]) {
  await shot(`vp-${vp.w}x${vp.h}`, "http://127.0.0.1:8080/services.html", { width: vp.w, height: vp.h });
}

const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto("http://127.0.0.1:8080/services.html", { waitUntil: "domcontentloaded" });
await page.locator('[data-service="security"]').click();
const wa = await page.locator("[data-finder-wa]").getAttribute("href");
await page.locator('[data-infra-tab="wifi"]').click();
const infraHeading = await page.locator("[data-infra-heading]").textContent();
const rm = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await rm.emulateMedia({ reducedMotion: "reduce" });
await rm.goto("http://127.0.0.1:8080/services.html", { waitUntil: "domcontentloaded" });
const hidden = await rm.evaluate(
  () =>
    [...document.querySelectorAll("h1,h2,.svc-lede,.svc-feature-group")].filter(
      (el) => getComputedStyle(el).opacity === "0",
    ).length,
);
results.push({ finderWa: wa, infraHeading, reducedMotionHidden: hidden });

await page.close();
await rm.close();
await browser.close();
console.log(JSON.stringify(results, null, 2));
