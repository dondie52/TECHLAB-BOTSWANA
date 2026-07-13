import { chromium, devices } from "playwright";
import sharp from "sharp";
import fs from "fs";
import path from "path";

const outDir = path.join("assets", "services", "websites");
fs.mkdirSync(outDir, { recursive: true });

const sites = [
  {
    id: "lmhts",
    title: "LMHTS Botswana",
    url: "https://lmhts-botswana.vercel.app",
    category: "Agriculture & operations",
    description:
      "Livestock management and health tracking for smallholder farmers in Botswana.",
  },
  {
    id: "water",
    title: "Fresh Water Market OS",
    url: "https://water-delivary.vercel.app",
    category: "Business operations",
    description: "Ordering, delivery, inventory and customer management.",
  },
  {
    id: "props",
    title: "Props",
    url: "https://props-blue-phi.vercel.app",
    category: "Product experience",
    description: "A clean product-focused web experience.",
  },
  {
    id: "cxow",
    title: "CXOW",
    url: "https://cxow.vercel.app",
    category: "Brand website",
    description: "A focused brand and service website.",
  },
  {
    id: "bank",
    title: "Bank",
    url: "https://bank-fawn-sigma.vercel.app",
    category: "Interface design",
    description: "A polished banking-style interface prototype.",
  },
];

async function settle(page) {
  await page.waitForLoadState("domcontentloaded");
  try {
    await page.waitForLoadState("networkidle", { timeout: 8000 });
  } catch {
    /* continue */
  }
  await page.evaluate(async () => {
    if (document.fonts?.ready) await document.fonts.ready;
    await Promise.all(
      Array.from(document.images)
        .filter((img) => !img.complete)
        .map(
          (img) =>
            new Promise((resolve) => {
              img.addEventListener("load", resolve, { once: true });
              img.addEventListener("error", resolve, { once: true });
            }),
        ),
    );
  });
  await page.waitForTimeout(600);
}

const browser = await chromium.launch();
const manifest = [];

for (const site of sites) {
  const desktop = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await desktop.goto(site.url, { waitUntil: "domcontentloaded", timeout: 60000 });
  await settle(desktop);
  const desktopPng = path.join(outDir, `${site.id}-desktop.png`);
  await desktop.screenshot({ path: desktopPng, type: "png" });
  await desktop.close();

  const mobile = await browser.newPage({
    ...devices["iPhone 13"],
    viewport: { width: 390, height: 844 },
  });
  await mobile.goto(site.url, { waitUntil: "domcontentloaded", timeout: 60000 });
  await settle(mobile);
  const mobilePng = path.join(outDir, `${site.id}-mobile.png`);
  await mobile.screenshot({ path: mobilePng, type: "png" });
  await mobile.close();

  const desktopWebp = path.join(outDir, `${site.id}-desktop.webp`);
  const mobileWebp = path.join(outDir, `${site.id}-mobile.webp`);
  await sharp(desktopPng).resize({ width: 1600, withoutEnlargement: true }).webp({ quality: 78 }).toFile(desktopWebp);
  await sharp(mobilePng).resize({ width: 780, withoutEnlargement: true }).webp({ quality: 78 }).toFile(mobileWebp);

  manifest.push({
    ...site,
    desktop: `${site.id}-desktop.webp`,
    mobile: `${site.id}-mobile.webp`,
    desktopBytes: fs.statSync(desktopWebp).size,
    mobileBytes: fs.statSync(mobileWebp).size,
  });
  console.log("captured", site.id);
}

fs.writeFileSync(path.join(outDir, "manifest.json"), JSON.stringify(manifest, null, 2));
await browser.close();
console.log("done", manifest.length);
