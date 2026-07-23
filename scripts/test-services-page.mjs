import { chromium } from "playwright";
import fs from "fs";

fs.mkdirSync("screenshots/services", { recursive: true });
const browser = await chromium.launch();
const results = [];

async function checkPage(name, url, viewport) {
  const page = await browser.newPage({ viewport });
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForTimeout(900);
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
  );
  const servicesHref = await page.evaluate(() =>
    document.querySelector('.site-nav a[href*="service"], .site-nav a')?.getAttribute("href"),
  );
  await page.screenshot({ path: `screenshots/services/${name}.png`, fullPage: false });
  results.push({ name, overflow, errors, servicesHref, title: await page.title() });
  await page.close();
}

await checkPage("home-1440", "http://127.0.0.1:8080/index.html", { width: 1440, height: 900 });
await checkPage("services-1440", "http://127.0.0.1:8080/services.html", { width: 1440, height: 900 });
await checkPage("services-1280", "http://127.0.0.1:8080/services.html", { width: 1280, height: 720 });
await checkPage("services-1024", "http://127.0.0.1:8080/services.html", { width: 1024, height: 768 });
await checkPage("services-768", "http://127.0.0.1:8080/services.html", { width: 768, height: 1024 });
await checkPage("services-390", "http://127.0.0.1:8080/services.html", { width: 390, height: 844 });

const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto("http://127.0.0.1:8080/services.html", { waitUntil: "domcontentloaded" });
for (const id of ["overview", "security", "retail", "infrastructure", "process", "finder", "cta"]) {
  await page.locator("#" + id).scrollIntoViewIfNeeded();
  await page.waitForTimeout(450);
  await page.screenshot({ path: `screenshots/services/section-${id}.png` });
}

await page.locator('[data-service="security"]').click();
const wa = await page.locator("[data-finder-wa]").getAttribute("href");
const resultVisible = await page.locator("[data-finder-result]").isVisible();
results.push({ finder: { wa, resultVisible } });

const rm = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await rm.emulateMedia({ reducedMotion: "reduce" });
await rm.goto("http://127.0.0.1:8080/services.html", { waitUntil: "domcontentloaded" });
const hidden = await rm.evaluate(
  () =>
    [...document.querySelectorAll("h1,h2,.svc-lede,.svc-feature-rail li")].filter(
      (el) => getComputedStyle(el).opacity === "0",
    ).length,
);
await rm.screenshot({ path: "screenshots/services/reduced-motion.png" });
results.push({ reducedMotionHidden: hidden });

await rm.close();
await page.close();
await browser.close();
console.log(JSON.stringify(results, null, 2));
