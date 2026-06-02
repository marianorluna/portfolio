/**
 * Genera public/images/og-social-preview.png (1200×630) desde la plantilla HTML.
 * Uso: node scripts/generate-og-image.mjs
 */
import { chromium } from "playwright";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const htmlPath = path.join(__dirname, "og-social-preview.html");
const outputPath = path.join(root, "public", "images", "og-social-preview.png");
const fileUrl = `file:///${htmlPath.replace(/\\/g, "/")}`;

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 1200, height: 630 },
  deviceScaleFactor: 1,
});

await page.goto(fileUrl, { waitUntil: "networkidle" });
await page.waitForTimeout(500);
await page.screenshot({
  path: outputPath,
  type: "png",
  clip: { x: 0, y: 0, width: 1200, height: 630 },
});

await browser.close();
console.log(`OG image saved: ${outputPath}`);
