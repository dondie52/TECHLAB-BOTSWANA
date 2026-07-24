/**
 * Render the automation packages clarity poster to PNG.
 * Usage: node scripts/render-automation-poster.mjs
 */
import { chromium } from "playwright";
import path from "path";
import { pathToFileURL } from "url";
import fs from "fs";

const root = process.cwd();
const htmlPath = path.join(root, "assets/marketing/automation-packages-poster.html");
const outPng = path.join(root, "assets/marketing/techlab-botswana-automation-packages-poster.png");
const outJpg = path.join(root, "assets/marketing/techlab-botswana-automation-packages-poster.jpg");

if (!fs.existsSync(htmlPath)) {
  console.error("Missing poster HTML:", htmlPath);
  process.exit(1);
}

const browser = await chromium.launch({
  executablePath: process.env.CHROME_PATH || "/usr/local/bin/google-chrome",
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});

const page = await browser.newPage({
  viewport: { width: 1080, height: 1536 },
  deviceScaleFactor: 1,
});

await page.goto(pathToFileURL(htmlPath).href, { waitUntil: "networkidle" });
await page.evaluate(async () => {
  if (document.fonts?.ready) await document.fonts.ready;
});
await page.waitForTimeout(400);

await page.screenshot({
  path: outPng,
  type: "png",
  clip: { x: 0, y: 0, width: 1080, height: 1536 },
});

await page.screenshot({
  path: outJpg,
  type: "jpeg",
  quality: 92,
  clip: { x: 0, y: 0, width: 1080, height: 1536 },
});

await browser.close();

const pngStat = fs.statSync(outPng);
const jpgStat = fs.statSync(outJpg);
console.log(`Wrote ${outPng} (${Math.round(pngStat.size / 1024)} KB)`);
console.log(`Wrote ${outJpg} (${Math.round(jpgStat.size / 1024)} KB)`);
