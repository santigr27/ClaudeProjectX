/**
 * Price-per-square-meter calculation, shared by property cards, the
 * detail page's price analysis, sort-by-price-per-sqm, and the valuation
 * service so the formula lives in exactly one place.
 */
export function calculatePricePerSqm(price: number, areaSqm: number): number {
  if (areaSqm <= 0) return 0;
  return price / areaSqm;
}
