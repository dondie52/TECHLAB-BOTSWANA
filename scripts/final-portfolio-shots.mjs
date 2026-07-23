import { chromium } from "playwright";
import fs from "fs";

fs.mkdirSync("screenshots/portfolio-qa", { recursive: true });
const browser = await chromium.launch();

async function shot(name, viewport, idx) {
  const page = await browser.newPage({ viewport });
  await page.goto("http://127.0.0.1:8080/websites.html", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(900);
  await page.evaluate(() => window.ScrollTrigger?.refresh?.());
  await page.evaluate(() => document.querySelector("[data-gallery-pin]")?.scrollIntoView({ block: "start" }));
  await page.waitForTimeout(500);
  if (idx > 0) {
    await page.locator(`[data-gallery-goto="${idx}"]`).click();
    await page.waitForTimeout(1000);
  }
  await page.screenshot({ path: `screenshots/portfolio-qa/${name}.png` });
  const title = await page.locator(".svc-project.is-active h3").textContent();
  console.log(name, title?.trim());
  await page.close();
}

await shot("d1440-p1", { width: 1440, height: 900 }, 0);
await shot("d1440-p3", { width: 1440, height: 900 }, 2);
await shot("d1440-p5", { width: 1440, height: 900 }, 4);
await shot("d1280-p1", { width: 1280, height: 720 }, 0);
await shot("d1280-p3", { width: 1280, height: 720 }, 2);
await shot("d1280-p5", { width: 1280, height: 720 }, 4);

const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
await mobile.goto("http://127.0.0.1:8080/websites.html", { waitUntil: "domcontentloaded" });
await mobile.waitForTimeout(800);
await mobile.evaluate(() => document.querySelectorAll("[data-project]")[0]?.scrollIntoView({ block: "start" }));
await mobile.waitForTimeout(350);
await mobile.screenshot({ path: "screenshots/portfolio-qa/m390-p1.png" });
await mobile.evaluate(() => document.querySelectorAll("[data-project]")[2]?.scrollIntoView({ block: "start" }));
await mobile.waitForTimeout(350);
await mobile.screenshot({ path: "screenshots/portfolio-qa/m390-p3.png" });
console.log("m390 done");
await mobile.close();
await browser.close();
