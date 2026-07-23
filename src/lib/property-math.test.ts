import { describe, expect, it } from "vitest";
import { calculatePricePerSqm } from "./property-math";

describe("calculatePricePerSqm", () => {
  it("divides price by area", () => {
    expect(calculatePricePerSqm(850_000_000, 100)).toBe(8_500_000);
  });

  it("handles non-integer results", () => {
    expect(calculatePricePerSqm(391_000_000, 48)).toBeCloseTo(8_145_833.33, 1);
  });

  it("returns 0 when area is zero to avoid Infinity/NaN in the UI", () => {
    expect(calculatePricePerSqm(100, 0)).toBe(0);
  });

  it("returns 0 when area is negative", () => {
    expect(calculatePricePerSqm(100, -10)).toBe(0);
  });
});
