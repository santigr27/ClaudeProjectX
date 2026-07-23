import { describe, expect, it, vi, beforeEach } from "vitest";
import {
  estimatePropertyValue,
  comparePriceToNeighborhoodAverage,
  ValuationDataUnavailableError,
} from "./valuation.service";
import { findMarketData } from "@/repositories/market-data.repository";

vi.mock("@/repositories/market-data.repository", () => ({
  findMarketData: vi.fn(),
}));

const CHICO_MARKET_DATA = {
  id: "market-1",
  locality: "Chapinero",
  neighborhood: "Chicó",
  salePricePerSqm: 8_500_000,
  rentPricePerSqm: 55_000,
  updatedAt: new Date(),
};

describe("estimatePropertyValue", () => {
  beforeEach(() => {
    vi.mocked(findMarketData).mockReset();
  });

  it("multiplies area by the neighborhood's average sale price per sqm", async () => {
    vi.mocked(findMarketData).mockResolvedValue(CHICO_MARKET_DATA);

    const result = await estimatePropertyValue({
      mode: "sale",
      locality: "Chapinero",
      neighborhood: "Chicó",
      propertyType: "apartment",
      areaSqm: 100,
      bedrooms: 2,
      bathrooms: 2,
      parkingSpaces: 1,
      propertyAge: 5,
    });

    expect(result.estimatedValue).toBe(850_000_000);
    expect(result.pricePerSqm).toBe(8_500_000);
  });

  it("uses the rent price per sqm when mode is rent", async () => {
    vi.mocked(findMarketData).mockResolvedValue(CHICO_MARKET_DATA);

    const result = await estimatePropertyValue({
      mode: "rent",
      locality: "Chapinero",
      neighborhood: "Chicó",
      propertyType: "apartment",
      areaSqm: 80,
      bedrooms: 2,
      bathrooms: 1,
      parkingSpaces: 0,
      propertyAge: 0,
    });

    expect(result.estimatedValue).toBe(80 * 55_000);
  });

  it("returns a range straddling the point estimate", async () => {
    vi.mocked(findMarketData).mockResolvedValue(CHICO_MARKET_DATA);

    const result = await estimatePropertyValue({
      mode: "sale",
      locality: "Chapinero",
      neighborhood: "Chicó",
      propertyType: "apartment",
      areaSqm: 100,
      bedrooms: 2,
      bathrooms: 2,
      parkingSpaces: 1,
      propertyAge: 5,
    });

    expect(result.rangeLow).toBeLessThan(result.estimatedValue);
    expect(result.rangeHigh).toBeGreaterThan(result.estimatedValue);
  });

  it("throws ValuationDataUnavailableError when the neighborhood has no market data", async () => {
    vi.mocked(findMarketData).mockResolvedValue(null);

    await expect(
      estimatePropertyValue({
        mode: "sale",
        locality: "Nowhere",
        neighborhood: "Unknown",
        propertyType: "apartment",
        areaSqm: 100,
        bedrooms: 2,
        bathrooms: 2,
        parkingSpaces: 1,
        propertyAge: 5,
      }),
    ).rejects.toBeInstanceOf(ValuationDataUnavailableError);
  });
});

describe("comparePriceToNeighborhoodAverage", () => {
  beforeEach(() => {
    vi.mocked(findMarketData).mockReset();
  });

  it("reports a negative percent difference when priced below the average", async () => {
    vi.mocked(findMarketData).mockResolvedValue(CHICO_MARKET_DATA);

    const result = await comparePriceToNeighborhoodAverage({
      locality: "Chapinero",
      neighborhood: "Chicó",
      listingType: "sale",
      price: 391_000_000,
      areaSqm: 48,
    });

    expect(result).not.toBeNull();
    expect(result!.percentDifference).toBeCloseTo(-4.17, 1);
  });

  it("reports a positive percent difference when priced above the average", async () => {
    vi.mocked(findMarketData).mockResolvedValue(CHICO_MARKET_DATA);

    const result = await comparePriceToNeighborhoodAverage({
      locality: "Chapinero",
      neighborhood: "Chicó",
      listingType: "sale",
      price: 1_000_000_000,
      areaSqm: 100,
    });

    expect(result!.percentDifference).toBeGreaterThan(0);
  });

  it("returns null when there is no market data for the neighborhood", async () => {
    vi.mocked(findMarketData).mockResolvedValue(null);

    const result = await comparePriceToNeighborhoodAverage({
      locality: "Nowhere",
      neighborhood: "Unknown",
      listingType: "sale",
      price: 100,
      areaSqm: 10,
    });

    expect(result).toBeNull();
  });

  it("returns null when area is zero", async () => {
    vi.mocked(findMarketData).mockResolvedValue(CHICO_MARKET_DATA);

    const result = await comparePriceToNeighborhoodAverage({
      locality: "Chapinero",
      neighborhood: "Chicó",
      listingType: "sale",
      price: 100,
      areaSqm: 0,
    });

    expect(result).toBeNull();
  });
});
