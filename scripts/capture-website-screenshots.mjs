/**
 * Capture desktop + mobile viewport screenshots of TechLab Botswana portfolio sites,
 * convert to WebP, and write a manifest under assets/services/websites/.
 */
import { chromium } from "playwright";
import sharp from "sharp";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const OUT = path.join(ROOT, "assets", "services", "websites");

const SITES = [
  {
    id: "lmhts",
    title: "LMHTS Botswana",
    url: "https://lmhts-botswana.vercel.app",
    category: "corporate / logistics",
  },
  {
    id: "water",
    title: "Fresh Water Market",
    url: "https://water-delivary.vercel.app",
    category: "e-commerce / delivery",
  },
  {
    id: "props",
    title: "Props",
    url: "https://props-blue-phi.vercel.app",
    category: "real estate / marketplace",
  },
  {
    id: "cxow",
    title: "CXOW",
    url: "https://cxow.vercel.app",
    category: "SaaS / B2B",
  },
  {
    id: "bank",
    title: "Bank",
    url: "https://bank-fawn-sigma.vercel.app",
    category: "fintech / banking",
  },
];

const DESKTOP = { width: 1440, height: 900 };
const MOBILE = { width: 390, height: 844 };
const MOBILE_UA =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1";

async function waitForReady(page) {
  try {
    await page.waitForLoadState("networkidle", { timeout: 5000 });
  } catch {
    // networkidle timeout — continue after settle
  }
  await new Promise((r) => setTimeout(r, 500));
  try {
    await page.evaluate(async () => {
      if (document.fonts?.ready) await document.fonts.ready;
    });
  } catch {
    // fonts API unavailable
  }
  await new Promise((r) => setTimeout(r, 300));
}

function guessNotes(title, bodyText) {
  const t = `${title} ${bodyText}`.toLowerCase();
  const notes = [];
  if (
    /sign in|log in|login|password|authentication required|unauthorized|access denied/.test(
      t
    )
  ) {
    notes.push("login-walled or auth prompt");
  }
  if (
    /application error|deployment failed|404|not found|something went wrong|this page could not|internal server error|500/.test(
      t
    )
  ) {
    notes.push("error page");
  }
  if (!bodyText || bodyText.trim().length < 40) {
    notes.push("possibly blank or sparse content");
  }
  return notes;
}

async function captureSite(browser, site) {
  const result = {
    id: site.id,
    title: site.title,
    url: site.url,
    category: site.category,
    desktop: `${site.id}-desktop.webp`,
    mobile: `${site.id}-mobile.webp`,
    desktopPng: `${site.id}-desktop.png`,
    mobilePng: `${site.id}-mobile.png`,
    notes: [],
    presentable: true,
  };

  // Desktop
  {
    const context = await browser.newContext({
      viewport: DESKTOP,
      deviceScaleFactor: 1,
    });
    const page = await context.newPage();
    try {
      const resp = await page.goto(site.url, {
        waitUntil: "domcontentloaded",
        timeout: 45000,
      });
      result.httpStatus = resp?.status() ?? null;
      await waitForReady(page);
      const title = await page.title();
      const bodyText = await page.evaluate(
        () => document.body?.innerText?.slice(0, 2000) || ""
      );
      result.pageTitle = title;
      result.notes.push(...guessNotes(title, bodyText));
      const pngPath = path.join(OUT, `${site.id}-desktop.png`);
      await page.screenshot({ path: pngPath, fullPage: false, type: "png" });
      await sharp(pngPath)
        .resize({ width: 1600, withoutEnlargement: true })
        .webp({ quality: 78 })
        .toFile(path.join(OUT, `${site.id}-desktop.webp`));
    } catch (err) {
      result.notes.push(`desktop capture error: ${err.message}`);
      result.presentable = false;
    } finally {
      await context.close();
    }
  }

  // Mobile
  {
    const context = await browser.newContext({
      viewport: MOBILE,
      userAgent: MOBILE_UA,
      isMobile: true,
      hasTouch: true,
      deviceScaleFactor: 2,
    });
    const page = await context.newPage();
    try {
      await page.goto(site.url, {
        waitUntil: "domcontentloaded",
        timeout: 45000,
      });
      await waitForReady(page);
      const pngPath = path.join(OUT, `${site.id}-mobile.png`);
      await page.screenshot({ path: pngPath, fullPage: false, type: "png" });
      await sharp(pngPath)
        .resize({ width: 780, withoutEnlargement: true })
        .webp({ quality: 78 })
        .toFile(path.join(OUT, `${site.id}-mobile.webp`));
    } catch (err) {
      result.notes.push(`mobile capture error: ${err.message}`);
      result.presentable = false;
    } finally {
      await context.close();
    }
  }

  if (result.notes.some((n) => /login|error|blank|sparse|capture error/i.test(n))) {
    result.presentable = false;
  }
  result.notes = [...new Set(result.notes)];
  return result;
}

async function main() {
  await fs.mkdir(OUT, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const entries = [];
  try {
    for (const site of SITES) {
      console.log(`Capturing ${site.id} — ${site.url}`);
      const entry = await captureSite(browser, site);
      entries.push(entry);
      console.log(
        `  done: presentable=${entry.presentable} notes=${JSON.stringify(entry.notes)}`
      );
    }
  } finally {
    await browser.close();
  }

  const manifest = {
    generatedAt: new Date().toISOString(),
    outputDir: "assets/services/websites",
    sites: entries.map((e) => ({
      id: e.id,
      title: e.title,
      url: e.url,
      category: e.category,
      desktop: e.desktop,
      mobile: e.mobile,
      desktopPng: e.desktopPng,
      mobilePng: e.mobilePng,
      pageTitle: e.pageTitle ?? null,
      httpStatus: e.httpStatus ?? null,
      presentable: e.presentable,
      notes: e.notes,
    })),
  };
  await fs.writeFile(
    path.join(OUT, "manifest.json"),
    JSON.stringify(manifest, null, 2),
    "utf8"
  );
  console.log("Wrote manifest.json");
  console.log(JSON.stringify(manifest, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

