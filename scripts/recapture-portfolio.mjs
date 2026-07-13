import { chromium, devices } from "playwright";
import sharp from "sharp";
import fs from "fs";
import path from "path";

const outDir = path.join("assets", "services", "websites");
const archiveDir = path.join(outDir, "_previous");
fs.mkdirSync(outDir, { recursive: true });
fs.mkdirSync(archiveDir, { recursive: true });

const sites = [
  { id: "lmhts", url: "https://lmhts-botswana.vercel.app", title: "LMHTS Botswana" },
  { id: "water", url: "https://water-delivary.vercel.app", title: "Fresh Water Market" },
  { id: "props", url: "https://props-blue-phi.vercel.app", title: "PropManage BW" },
  { id: "cxow", url: "https://cxow.vercel.app", title: "Livestock Connect" },
  { id: "bank", url: "https://bank-fawn-sigma.vercel.app", title: "Typo Cash Solutions" },
];

function archiveExisting(id, kind) {
  for (const ext of ["webp", "png"]) {
    const file = path.join(outDir, `${id}-${kind}.${ext}`);
    if (fs.existsSync(file)) {
      fs.copyFileSync(file, path.join(archiveDir, `${id}-${kind}.${ext}`));
    }
  }
}

async function preparePage(page) {
  await page.addStyleTag({
    content: `
      *, *::before, *::after {
        animation: none !important;
        transition: none !important;
        caret-color: transparent !important;
      }
      [class*="cookie" i], [id*="cookie" i],
      [class*="consent" i], [id*="consent" i],
      [class*="nextjs-toast"], [data-nextjs-toast],
      #__next-build-watcher, [data-vercel-toolbar],
      vercel-live-feedback {
        display: none !important;
        visibility: hidden !important;
        opacity: 0 !important;
        pointer-events: none !important;
      }
    `,
  }).catch(() => {});

  await page.evaluate(async () => {
    window.scrollTo(0, 0);
    try {
      if (document.fonts?.ready) await document.fonts.ready;
    } catch {}
    await Promise.all(
      Array.from(document.images)
        .slice(0, 24)
        .map((img) =>
          img.complete
            ? Promise.resolve()
            : new Promise((resolve) => {
                const done = () => resolve();
                img.addEventListener("load", done, { once: true });
                img.addEventListener("error", done, { once: true });
                setTimeout(done, 2500);
              }),
        ),
    );
  });

  await page.waitForTimeout(700);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(150);
}

async function captureSite(browser, site) {
  archiveExisting(site.id, "desktop");
  archiveExisting(site.id, "mobile");

  const desktop = await browser.newPage({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
  });
  desktop.setDefaultTimeout(45000);
  await desktop.goto(site.url, { waitUntil: "domcontentloaded", timeout: 45000 });
  await preparePage(desktop);
  const desktopPng = path.join(outDir, `${site.id}-desktop.png`);
  await desktop.screenshot({ path: desktopPng, type: "png", fullPage: false, animations: "disabled" });
  await desktop.close();

  const mobile = await browser.newPage({
    ...devices["iPhone 12"],
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
  });
  mobile.setDefaultTimeout(45000);
  await mobile.goto(site.url, { waitUntil: "domcontentloaded", timeout: 45000 });
  await preparePage(mobile);
  const mobilePng = path.join(outDir, `${site.id}-mobile.png`);
  await mobile.screenshot({ path: mobilePng, type: "png", fullPage: false, animations: "disabled" });
  await mobile.close();

  const desktopWebp = path.join(outDir, `${site.id}-desktop.webp`);
  const mobileWebp = path.join(outDir, `${site.id}-mobile.webp`);
  const desktopMeta = await sharp(desktopPng).webp({ quality: 86, effort: 4 }).toFile(desktopWebp);
  const mobileMeta = await sharp(mobilePng).webp({ quality: 86, effort: 4 }).toFile(mobileWebp);
  const dInfo = await sharp(desktopPng).metadata();
  const mInfo = await sharp(mobilePng).metadata();

  return {
    id: site.id,
    title: site.title,
    desktop: { w: dInfo.width, h: dInfo.height, webpBytes: desktopMeta.size, pngBytes: fs.statSync(desktopPng).size },
    mobile: { w: mInfo.width, h: mInfo.height, webpBytes: mobileMeta.size, pngBytes: fs.statSync(mobilePng).size },
  };
}

const browser = await chromium.launch({ headless: true });
const results = [];

for (const site of sites) {
  try {
    const row = await captureSite(browser, site);
    results.push(row);
    console.log("ok", JSON.stringify(row));
  } catch (error) {
    console.error("fail", site.id, String(error));
  }
}

fs.writeFileSync(
  path.join(outDir, "manifest.json"),
  JSON.stringify({ generatedAt: new Date().toISOString(), sites: results }, null, 2),
);

await browser.close();
console.log("capture complete", results.length);
