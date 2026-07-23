/**
 * Generates on-brand local placeholder images used by the seed data, so the
 * app has no runtime dependency on an external image host. Run once with
 * `node scripts/generate-placeholders.mjs` whenever the palette or counts
 * below change; output is committed to public/placeholders/.
 */
import { PNG } from "pngjs";
import { mkdirSync, writeFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const outDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "public", "placeholders");
mkdirSync(outDir, { recursive: true });

function hexToRgb(hex) {
  const value = parseInt(hex.slice(1), 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function mixColor(colorA, colorB, t) {
  return [lerp(colorA[0], colorB[0], t), lerp(colorA[1], colorB[1], t), lerp(colorA[2], colorB[2], t)];
}

// A tasteful, brand-aligned set of gradient duos: terracotta, forest, ink,
// plus a couple of warm neutrals for variety across the property grid.
const PALETTES = [
  ["#e9c3ac", "#a1462c"],
  ["#a8cfb8", "#1e4f38"],
  ["#d9d0c5", "#574b3f"],
  ["#dba17e", "#692d1d"],
  ["#7ab595", "#163b2a"],
  ["#f5e2d6", "#833823"],
];

function insideTriangle(px, py, ax, ay, bx, by, cx, cy) {
  const d1 = (px - bx) * (ay - by) - (ax - bx) * (py - by);
  const d2 = (px - cx) * (by - cy) - (bx - cx) * (py - cy);
  const d3 = (px - ax) * (cy - ay) - (cx - ax) * (py - ay);
  const hasNeg = d1 < 0 || d2 < 0 || d3 < 0;
  const hasPos = d1 > 0 || d2 > 0 || d3 > 0;
  return !(hasNeg && hasPos);
}

function drawHouseMask(width, height) {
  const cx = width / 2;
  const baseWidth = width * 0.34;
  const baseHeight = height * 0.24;
  const baseTop = height * 0.56;
  const baseBottom = baseTop + baseHeight;
  const roofApexY = baseTop - height * 0.16;

  return function isHouse(x, y) {
    const inBase = x >= cx - baseWidth / 2 && x <= cx + baseWidth / 2 && y >= baseTop && y <= baseBottom;
    const inRoof = insideTriangle(
      x,
      y,
      cx,
      roofApexY,
      cx - baseWidth / 2 - width * 0.03,
      baseTop,
      cx + baseWidth / 2 + width * 0.03,
      baseTop,
    );

    const doorWidth = baseWidth * 0.22;
    const doorHeight = baseHeight * 0.55;
    const inDoor =
      x >= cx - doorWidth / 2 && x <= cx + doorWidth / 2 && y >= baseBottom - doorHeight && y <= baseBottom;

    return (inBase && !inDoor) || inRoof;
  };
}

function generateImage({ width, height, palette, seed }) {
  const png = new PNG({ width, height });
  const [colorA, colorB] = [hexToRgb(palette[0]), hexToRgb(palette[1])];
  const isHouse = drawHouseMask(width, height);
  const angle = ((seed * 37) % 60) - 30; // degrees, for gradient direction variety
  const rad = (angle * Math.PI) / 180;
  const dirX = Math.cos(rad);
  const dirY = Math.sin(rad);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const nx = x / width - 0.5;
      const ny = y / height - 0.5;
      let t = nx * dirX + ny * dirY + 0.5;
      t = Math.min(1, Math.max(0, t));

      let [r, g, b] = mixColor(colorA, colorB, t);

      // Subtle vignette for depth.
      const vignette = 1 - Math.min(0.35, (Math.hypot(nx, ny) - 0.2) * 0.5);
      r *= vignette;
      g *= vignette;
      b *= vignette;

      if (isHouse(x, y)) {
        r = lerp(r, 255, 0.22);
        g = lerp(g, 255, 0.22);
        b = lerp(b, 255, 0.22);
      }

      const idx = (width * y + x) << 2;
      png.data[idx] = Math.round(Math.min(255, Math.max(0, r)));
      png.data[idx + 1] = Math.round(Math.min(255, Math.max(0, g)));
      png.data[idx + 2] = Math.round(Math.min(255, Math.max(0, b)));
      png.data[idx + 3] = 255;
    }
  }

  return PNG.sync.write(png);
}

function generateAvatar({ size, palette }) {
  const png = new PNG({ width: size, height: size });
  const [colorA, colorB] = [hexToRgb(palette[0]), hexToRgb(palette[1])];
  const cx = size / 2;
  const cy = size / 2;
  const radius = size / 2;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.hypot(dx, dy);
      const idx = (size * y + x) << 2;

      if (dist > radius) {
        png.data[idx + 3] = 0;
        continue;
      }

      const t = 0.5 + 0.5 * (dy / radius);
      const [r, g, b] = mixColor(colorA, colorB, t);
      png.data[idx] = Math.round(r);
      png.data[idx + 1] = Math.round(g);
      png.data[idx + 2] = Math.round(b);
      png.data[idx + 3] = 255;
    }
  }

  return PNG.sync.write(png);
}

const PROPERTY_COUNT = 12;
for (let i = 0; i < PROPERTY_COUNT; i++) {
  const palette = PALETTES[i % PALETTES.length];
  const buffer = generateImage({ width: 1200, height: 800, palette, seed: i });
  writeFileSync(path.join(outDir, `property-${i}.png`), buffer);
}

const AGENT_COUNT = 6;
for (let i = 0; i < AGENT_COUNT; i++) {
  const palette = PALETTES[(i + 2) % PALETTES.length];
  const buffer = generateAvatar({ size: 300, palette });
  writeFileSync(path.join(outDir, `agent-${i}.png`), buffer);
}

const heroBuffer = generateImage({
  width: 1920,
  height: 1080,
  palette: ["#948572", "#221912"],
  seed: 3,
});
writeFileSync(path.join(outDir, "hero-bogota.png"), heroBuffer);

console.log(`Generated ${PROPERTY_COUNT} property placeholders, ${AGENT_COUNT} agent avatars, and 1 hero image in ${outDir}`);
