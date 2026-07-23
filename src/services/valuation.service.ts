import { findMarketData } from "@/repositories/market-data.repository";
import type { ValuationInput } from "@/validations/valuation";

export interface ValuationResult {
  mode: "sale" | "rent";
  locality: string;
  neighborhood: string;
  areaSqm: number;
  pricePerSqm: number;
  estimatedValue: number;
  rangeLow: number;
  rangeHigh: number;
}

export class ValuationDataUnavailableError extends Error {
  constructor(locality: string, neighborhood: string) {
    super(`No market data available for ${neighborhood}, ${locality}`);
    this.name = "ValuationDataUnavailableError";
  }
}

/** Estimate uncertainty band applied around the point estimate. For an MVP
 * built on a single area-average figure (rather than comparable listings),
 * a fixed +/-6% band communicates that this is an estimate, not an appraisal. */
const RANGE_SPREAD = 0.06;

/**
 * Core valuation algorithm. Kept pure and swap-friendly: replacing the
 * area x price-per-sqm formula with a comparable-sales model or an ML
 * regression only requires changing this function's body, not its callers.
 */
function calculateValuation(
  input: Pick<ValuationInput, "areaSqm">,
  pricePerSqm: number,
): { estimatedValue: number; rangeLow: number; rangeHigh: number } {
  const estimatedValue = input.areaSqm * pricePerSqm;
  return {
    estimatedValue,
    rangeLow: estimatedValue * (1 - RANGE_SPREAD),
    rangeHigh: estimatedValue * (1 + RANGE_SPREAD),
  };
}

/**
 * Estimates a property's market value (or expected monthly rent) from the
 * average price per square meter of its Bogotá neighborhood.
 *
 * Data source and algorithm are both intentionally isolated behind this
 * function so either can later be swapped for a real valuation pipeline
 * (comparable properties, historical transactions, or an ML model) without
 * touching any UI or route code.
 */
export async function estimatePropertyValue(
  input: ValuationInput,
): Promise<ValuationResult> {
  const marketData = await findMarketData(input.locality, input.neighborhood);

  if (!marketData) {
    throw new ValuationDataUnavailableError(input.locality, input.neighborhood);
  }

  const pricePerSqm =
    input.mode === "sale" ? marketData.salePricePerSqm : marketData.rentPricePerSqm;

  const { estimatedValue, rangeLow, rangeHigh } = calculateValuation(input, pricePerSqm);

  return {
    mode: input.mode,
    locality: input.locality,
    neighborhood: input.neighborhood,
    areaSqm: input.areaSqm,
    pricePerSqm,
    estimatedValue,
    rangeLow,
    rangeHigh,
  };
}

/**
 * Compares a listed property price per m2 against its neighborhood average.
 * Used on the property detail page's "price analysis" section. Returns null
 * when there isn't enough market data to make the comparison meaningful.
 */
export async function comparePriceToNeighborhoodAverage(params: {
  locality: string;
  neighborhood: string;
  listingType: "sale" | "rent";
  price: number;
  areaSqm: number;
}): Promise<{
  propertyPricePerSqm: number;
  neighborhoodAveragePricePerSqm: number;
  percentDifference: number;
} | null> {
  const marketData = await findMarketData(params.locality, params.neighborhood);
  if (!marketData || params.areaSqm <= 0) return null;

  const propertyPricePerSqm = params.price / params.areaSqm;
  const neighborhoodAveragePricePerSqm =
    params.listingType === "sale" ? marketData.salePricePerSqm : marketData.rentPricePerSqm;

  if (neighborhoodAveragePricePerSqm <= 0) return null;

  const percentDifference =
    ((propertyPricePerSqm - neighborhoodAveragePricePerSqm) /
      neighborhoodAveragePricePerSqm) *
    100;

  return {
    propertyPricePerSqm,
    neighborhoodAveragePricePerSqm,
    percentDifference,
  };
}
