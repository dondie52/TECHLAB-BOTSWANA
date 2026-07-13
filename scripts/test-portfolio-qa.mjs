import { chromium } from "playwright";
import fs from "fs";

fs.mkdirSync("screenshots/portfolio-qa", { recursive: true });

const browser = await chromium.launch();
const report = { scrollEnd: null, a11y: [], viewports: [], errors: [] };

async function openServices(viewport) {
  const page = await browser.newPage({ viewport });
  page.on("pageerror", (e) => report.errors.push(String(e)));
  await page.goto("http://127.0.0.1:8080/services.html", {
    waitUntil: "domcontentloaded",
    timeout: 60000,
  });
  await page.waitForTimeout(900);
  await page.evaluate(() => window.ScrollTrigger?.refresh?.());
  return page;
}

async function goToGallery(page) {
  await page.evaluate(() => {
    document.querySelector("[data-gallery-pin]")?.scrollIntoView({ block: "start" });
  });
  await page.waitForTimeout(500);
  await page.evaluate(() => window.ScrollTrigger?.refresh?.());
  await page.evaluate(() => {
    document.querySelector("[data-gallery-pin]")?.scrollIntoView({ block: "start" });
  });
  await page.waitForTimeout(400);
}

const page1440 = await openServices({ width: 1440, height: 900 });
await goToGallery(page1440);

report.scrollEnd = await page1440.evaluate(() => {
  const triggers = ScrollTrigger.getAll().filter((t) => t.vars?.pin);
  const galleryPin = document.querySelector("[data-gallery-pin]");
  const match = triggers.find((t) => t.trigger === galleryPin || t.pin === galleryPin || galleryPin?.contains(t.pin));
  const st = match || triggers.find((t) => String(t.vars?.trigger).includes("gallery") || t.pin?.classList?.contains("svc-gallery-stage"));
  const all = ScrollTrigger.getAll().map((t) => ({
    start: t.start,
    end: t.end,
    distance: Math.round(t.end - t.start),
    pin: !!(t.pin || t.vars?.pin),
  }));
  const gallery = all
    .filter((t) => t.pin)
    .sort((a, b) => b.distance - a.distance)[0];
  const expected = Math.round(window.innerHeight * 0.9 * 4);
  return {
    innerHeight: window.innerHeight,
    transitionDistance: window.innerHeight * 0.9,
    expectedTotal: expected,
    measuredPinDistance: gallery?.distance ?? null,
    allPinned: all.filter((t) => t.pin),
  };
});

report.a11y.push(
  await page1440.evaluate(async () => {
    const progress = document.querySelector("[data-gallery-progress]")?.textContent;
    const projects = [...document.querySelectorAll("[data-project]")];
    const active = projects.find((p) => p.classList.contains("is-active"));
    const inactive = projects.filter((p) => !p.classList.contains("is-active"));
    const inactiveFocusable = inactive.flatMap((p) =>
      [...p.querySelectorAll("a, button")].filter((el) => el.tabIndex !== -1),
    ).length;
    const prevDisabled = document.querySelector("[data-gallery-prev]")?.disabled;
    const nextDisabled = document.querySelector("[data-gallery-next]")?.disabled;
    const hiddenOk = inactive.every((p) => p.getAttribute("aria-hidden") === "true");
    document.querySelector('[data-gallery-goto="2"]')?.click();
    await new Promise((r) => setTimeout(r, 1000));
    const after = document.querySelector("[data-gallery-progress]")?.textContent;
    const activeTitle = document.querySelector(".svc-project.is-active h3")?.textContent;
    document.querySelector("[data-gallery-next]")?.click();
    await new Promise((r) => setTimeout(r, 1000));
    const afterNext = document.querySelector("[data-gallery-progress]")?.textContent;
    document.querySelector('[data-gallery-goto="0"]')?.click();
    await new Promise((r) => setTimeout(r, 200));
    return {
      progress,
      prevDisabled,
      nextDisabled,
      inactiveFocusable,
      hiddenOk,
      afterMarker2: after,
      titleAt2: activeTitle,
      afterNext,
      overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
    };
  }),
);

async function shot(name, viewport, projectIndex) {
  const page = await openServices(viewport);
  const mobile = viewport.width < 769;
  if (mobile) {
    await page.evaluate((idx) => {
      const project = document.querySelectorAll("[data-project]")[idx];
      project?.scrollIntoView({ block: "start" });
    }, projectIndex);
    await page.waitForTimeout(350);
  } else {
    await goToGallery(page);
      if (projectIndex > 0) {
      await page.evaluate((idx) => document.querySelector(`[data-gallery-goto="${idx}"]`)?.click(), projectIndex);
      await page.waitForTimeout(1100);
    }
  }

  const metrics = await page.evaluate((idx) => {
    const projects = [...document.querySelectorAll("[data-project]")];
    const active =
      projects.find((p) => p.classList.contains("is-active") && p.getAttribute("aria-hidden") !== "true") ||
      projects[idx] ||
      projects[0];
    const box = (sel) => {
      const el = typeof sel === "string" ? active?.querySelector(sel) : sel;
      if (!el) return null;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const vw = window.innerWidth;
      const header = 72;
      return {
        top: Math.round(r.top),
        bottom: Math.round(r.bottom),
        left: Math.round(r.left),
        right: Math.round(r.right),
        inView: r.top >= header - 8 && r.bottom <= vh - 2 && r.left >= -1 && r.right <= vw + 2,
      };
    };
    return {
      progress: document.querySelector("[data-gallery-progress]")?.textContent,
      title: active?.querySelector("h3")?.textContent,
      enhanced: document.querySelector("[data-gallery]")?.classList.contains("is-enhanced"),
      overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
      toolbar: box(document.querySelector(".svc-gallery-toolbar")),
      browser: box(".svc-browser"),
      phone: box(".svc-phone"),
      info: box(".svc-project-info"),
      link: box(".svc-project-link"),
      markers: box(document.querySelector(".svc-gallery-markers")),
      controls: box(document.querySelector(".svc-gallery-controls")),
    };
  }, projectIndex);

  await page.screenshot({ path: `screenshots/portfolio-qa/${name}.png` });
  report.viewports.push({ name, ...metrics });
  console.log(name, JSON.stringify(metrics));
  await page.close();
}

await page1440.close();

await shot("d1440-p1", { width: 1440, height: 900 }, 0);
await shot("d1440-p3", { width: 1440, height: 900 }, 2);
await shot("d1440-p5", { width: 1440, height: 900 }, 4);
await shot("d1280-p1", { width: 1280, height: 720 }, 0);
await shot("d1280-p3", { width: 1280, height: 720 }, 2);
await shot("d1280-p5", { width: 1280, height: 720 }, 4);
await shot("d1366-p1", { width: 1366, height: 768 }, 0);
await shot("d1024-p1", { width: 1024, height: 768 }, 0);
await shot("m430-p1", { width: 430, height: 932 }, 0);
await shot("m390-p1", { width: 390, height: 844 }, 0);
await shot("m390-p3", { width: 390, height: 844 }, 2);
await shot("m360-p1", { width: 360, height: 800 }, 0);

// refresh mid-gallery
const refreshPage = await openServices({ width: 1440, height: 900 });
await goToGallery(refreshPage);
await refreshPage.evaluate(() => document.querySelector('[data-gallery-goto="2"]')?.click());
await refreshPage.waitForTimeout(400);
await refreshPage.reload({ waitUntil: "domcontentloaded" });
await refreshPage.waitForTimeout(1000);
await refreshPage.evaluate(() => {
  window.ScrollTrigger?.refresh?.();
  document.querySelector("[data-gallery-pin]")?.scrollIntoView({ block: "start" });
});
await refreshPage.waitForTimeout(500);
const refreshState = await refreshPage.evaluate(() => ({
  progress: document.querySelector("[data-gallery-progress]")?.textContent,
  activeCount: document.querySelectorAll(".svc-project.is-active").length,
  title: document.querySelector(".svc-project.is-active h3")?.textContent,
}));
report.refresh = refreshState;
await refreshPage.close();

fs.writeFileSync("screenshots/portfolio-qa/report.json", JSON.stringify(report, null, 2));
console.log("SCROLL", JSON.stringify(report.scrollEnd, null, 2));
console.log("A11Y", JSON.stringify(report.a11y, null, 2));
console.log("REFRESH", JSON.stringify(refreshState));
await browser.close();
