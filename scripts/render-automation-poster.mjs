/**
 * Render automation packages posters (portrait + WhatsApp catalogue square).
 * Usage: node scripts/render-automation-poster.mjs
 */
import { chromium } from "playwright";
import path from "path";
import { pathToFileURL } from "url";
import fs from "fs";

const root = process.cwd();

const jobs = [
  {
    html: "assets/marketing/automation-packages-poster.html",
    width: 1080,
    height: 1536,
    png: "assets/marketing/techlab-botswana-automation-packages-poster.png",
    jpg: "assets/marketing/techlab-botswana-automation-packages-poster.jpg",
  },
  {
    html: "assets/marketing/automation-packages-catalogue-square.html",
    width: 1080,
    height: 1080,
    png: "assets/marketing/techlab-botswana-automation-catalogue-square.png",
    jpg: "assets/marketing/techlab-botswana-automation-catalogue-square.jpg",
  },
];

const browser = await chromium.launch({
  executablePath: process.env.CHROME_PATH || "/usr/local/bin/google-chrome",
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});

for (const job of jobs) {
  const htmlPath = path.join(root, job.html);
  if (!fs.existsSync(htmlPath)) {
    console.error("Missing poster HTML:", htmlPath);
    process.exit(1);
  }

  const page = await browser.newPage({
    viewport: { width: job.width, height: job.height },
    deviceScaleFactor: 1,
  });

  await page.goto(pathToFileURL(htmlPath).href, { waitUntil: "networkidle" });
  await page.evaluate(async () => {
    if (document.fonts?.ready) await document.fonts.ready;
  });
  await page.waitForTimeout(400);

  const outPng = path.join(root, job.png);
  const outJpg = path.join(root, job.jpg);
  const clip = { x: 0, y: 0, width: job.width, height: job.height };

  await page.screenshot({ path: outPng, type: "png", clip });
  await page.screenshot({ path: outJpg, type: "jpeg", quality: 92, clip });
  await page.close();

  console.log(`Wrote ${outPng} (${Math.round(fs.statSync(outPng).size / 1024)} KB)`);
  console.log(`Wrote ${outJpg} (${Math.round(fs.statSync(outJpg).size / 1024)} KB)`);
}

await browser.close();
