/**
 * Derives a full 50..900 shade scale from a single admin-picked hex color
 * using CSS `color-mix()`, so `MarketplaceConfig` only ever has to store one
 * hex per role (primary/accent) instead of nine hand-picked shades. `base`
 * is treated as the "600" shade, matching the existing globals.css scale.
 */
const STEPS: Array<[step: string, mix: string | null]> = [
  ["50", "8%"],
  ["100", "16%"],
  ["200", "30%"],
  ["300", "48%"],
  ["400", "70%"],
  ["500", "88%"],
  ["600", null],
  ["700", "85%"],
  ["800", "68%"],
  ["900", "50%"],
];

export function buildColorScaleVars(prefix: string, base: string): Record<string, string> {
  return Object.fromEntries(
    STEPS.map(([step, mix]) => {
      if (step === "600") return [`--color-${prefix}-600`, base];
      const towards = Number(step) < 600 ? "white" : "black";
      return [`--color-${prefix}-${step}`, `color-mix(in srgb, ${base} ${mix}, ${towards})`];
    }),
  );
}
