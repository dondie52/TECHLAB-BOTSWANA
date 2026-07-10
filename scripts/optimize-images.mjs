import sharp from "sharp";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dir = path.join(__dirname, "..", "assets", "images");

const jobs = [
  { base: "hero-workshop", widths: [960, 1280, 1920] },
  { base: "chapter-fix", widths: [640, 960, 1280] },
  { base: "chapter-cctv", widths: [640, 960, 1280] },
  { base: "chapter-network", widths: [640, 960, 1280] },
  { base: "chapter-website", widths: [640, 960, 1280] },
  { base: "service-pos", widths: [400, 640] },
  { base: "botswana-map", widths: [640, 960] },
];

const defaults = [
  ["hero-workshop", 1280],
  ["chapter-fix", 960],
  ["chapter-cctv", 960],
  ["chapter-network", 960],
  ["chapter-website", 960],
  ["service-pos", 640],
  ["botswana-map", 960],
];

for (const job of jobs) {
  const input = path.join(dir, `${job.base}.png`);
  if (!fs.existsSync(input)) {
    console.error("Missing", input);
    continue;
  }
  const meta = await sharp(input).metadata();
  for (const width of job.widths) {
    const out = path.join(dir, `${job.base}-${width}w.webp`);
    await sharp(input)
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: 78, effort: 6 })
      .toFile(out);
    const stat = fs.statSync(out);
    console.log(
      `${path.basename(out)} ${(stat.size / 1024).toFixed(1)} KiB (${meta.width}x${meta.height} -> ${width}w)`,
    );
  }
}

for (const [base, w] of defaults) {
  const src = path.join(dir, `${base}-${w}w.webp`);
  const dest = path.join(dir, `${base}.webp`);
  fs.copyFileSync(src, dest);
  console.log("default", path.basename(dest));
}
