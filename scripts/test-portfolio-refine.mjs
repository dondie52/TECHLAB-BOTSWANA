import { chromium } from "playwright";
import fs from "fs";

fs.mkdirSync("screenshots/portfolio-refine", { recursive: true });
const browser = await chromium.launch();

async function capture(name, viewport, projectIndex = 0) {
  const page = await browser.newPage({ viewport });
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  await page.goto("http://127.0.0.1:8080/websites.html#work", {
    waitUntil: "domcontentloaded",
    timeout: 60000,
  });
  await page.waitForTimeout(1000);
  await page.evaluate(() => window.ScrollTrigger?.refresh?.());
  await page.evaluate(() => {
    document.querySelector("#work")?.scrollIntoView({ block: "start" });
  });
  await page.waitForTimeout(500);
  await page.evaluate(() => window.ScrollTrigger?.refresh?.());

  // Scroll into pinned gallery stage
  await page.evaluate(() => {
    const stage = document.querySelector("[data-gallery-pin]");
    stage?.scrollIntoView({ block: "start" });
  });
  await page.waitForTimeout(600);

  if (viewport.width < 769) {
    await page.evaluate(() => {
      document.querySelector("[data-project]")?.scrollIntoView({ block: "start" });
    });
    await page.waitForTimeout(400);
  } else if (projectIndex > 0) {
    await page.evaluate((idx) => {
      const btn = document.querySelector(`[data-gallery-goto="${idx}"]`);
      btn?.click();
    }, projectIndex);
    await page.waitForTimeout(1100);
  }

  const metrics = await page.evaluate(() => {
    const active = document.querySelector(".svc-project.is-active");
    const browserEl = active?.querySelector(".svc-browser");
    const phone = active?.querySelector(".svc-phone");
    const info = active?.querySelector(".svc-project-info");
    const vh = window.innerHeight;
    const vw = window.innerWidth;
    const box = (el) => {
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return {
        top: Math.round(r.top),
        bottom: Math.round(r.bottom),
        left: Math.round(r.left),
        right: Math.round(r.right),
        w: Math.round(r.width),
        h: Math.round(r.height),
        inView: r.top >= 0 && r.bottom <= vh + 2 && r.left >= 0 && r.right <= vw + 2,
      };
    };
    return {
      overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
      progress: document.querySelector("[data-gallery-progress]")?.textContent,
      title: active?.querySelector("h3")?.textContent,
      browser: box(browserEl),
      phone: box(phone),
      info: box(info),
      enhanced: document.querySelector("[data-gallery]")?.classList.contains("is-enhanced"),
    };
  });

  await page.screenshot({ path: `screenshots/portfolio-refine/${name}.png` });
  console.log(name, JSON.stringify({ ...metrics, errors: errors.slice(0, 3) }));
  await page.close();
}

try {
  (await fetch("http://127.0.0.1:8080/websites.html")).ok;
} catch {
  console.error("server down");
}

await capture("d1440-p1", { width: 1440, height: 900 }, 0);
await capture("d1440-p3", { width: 1440, height: 900 }, 2);
await capture("d1440-p5", { width: 1440, height: 900 }, 4);
await capture("d1280-p1", { width: 1280, height: 720 }, 0);
await capture("d1280-p3", { width: 1280, height: 720 }, 2);
await capture("m390-p1", { width: 390, height: 844 }, 0);

await browser.close();
