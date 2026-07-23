/**
 * MOCK / DEMO MARKET DATA.
 *
 * Average price per square meter for Bogotá localities and neighborhoods.
 * These numbers are illustrative approximations for the MVP and are NOT
 * sourced from a real appraisal, transaction registry, or licensed dataset.
 *
 * Replace this module's data source with a real feed (e.g. a comparable-sales
 * dataset, a licensed valuation API, or an ML pricing model) without changing
 * its shape — `src/services/valuation.service.ts` and the seed script are the
 * only consumers, and both only depend on this array's fields.
 */

export interface NeighborhoodMarketDataPoint {
  locality: string;
  neighborhood: string;
  /** Average sale price per square meter, in COP. */
  salePricePerSqm: number;
  /** Average monthly rent price per square meter, in COP. */
  rentPricePerSqm: number;
}

export const mockNeighborhoodMarketData: NeighborhoodMarketDataPoint[] = [
  // Chapinero
  { locality: "Chapinero", neighborhood: "Chicó", salePricePerSqm: 8_500_000, rentPricePerSqm: 55_000 },
  { locality: "Chapinero", neighborhood: "Chicó Norte", salePricePerSqm: 8_900_000, rentPricePerSqm: 58_000 },
  { locality: "Chapinero", neighborhood: "Rosales", salePricePerSqm: 10_500_000, rentPricePerSqm: 68_000 },
  { locality: "Chapinero", neighborhood: "Chapinero Alto", salePricePerSqm: 7_200_000, rentPricePerSqm: 46_000 },
  { locality: "Chapinero", neighborhood: "La Cabrera", salePricePerSqm: 9_800_000, rentPricePerSqm: 63_000 },
  { locality: "Chapinero", neighborhood: "El Nogal", salePricePerSqm: 9_200_000, rentPricePerSqm: 60_000 },
  { locality: "Chapinero", neighborhood: "Parque de la 93", salePricePerSqm: 10_200_000, rentPricePerSqm: 66_000 },
  { locality: "Chapinero", neighborhood: "Chapinero Central", salePricePerSqm: 6_500_000, rentPricePerSqm: 42_000 },

  // Usaquén
  { locality: "Usaquén", neighborhood: "Cedritos", salePricePerSqm: 6_800_000, rentPricePerSqm: 42_000 },
  { locality: "Usaquén", neighborhood: "Santa Bárbara", salePricePerSqm: 7_900_000, rentPricePerSqm: 50_000 },
  { locality: "Usaquén", neighborhood: "Usaquén", salePricePerSqm: 7_500_000, rentPricePerSqm: 48_000 },
  { locality: "Usaquén", neighborhood: "Bella Suiza", salePricePerSqm: 7_100_000, rentPricePerSqm: 45_000 },
  { locality: "Usaquén", neighborhood: "Country Club", salePricePerSqm: 9_000_000, rentPricePerSqm: 57_000 },
  { locality: "Usaquén", neighborhood: "Santa Ana", salePricePerSqm: 8_300_000, rentPricePerSqm: 53_000 },

  // Suba
  { locality: "Suba", neighborhood: "Colina Campestre", salePricePerSqm: 6_200_000, rentPricePerSqm: 39_000 },
  { locality: "Suba", neighborhood: "Niza", salePricePerSqm: 6_600_000, rentPricePerSqm: 41_000 },
  { locality: "Suba", neighborhood: "Suba Rincón", salePricePerSqm: 3_600_000, rentPricePerSqm: 21_000 },
  { locality: "Suba", neighborhood: "Batán", salePricePerSqm: 5_900_000, rentPricePerSqm: 37_000 },

  // Fontibón
  { locality: "Fontibón", neighborhood: "Salitre", salePricePerSqm: 5_800_000, rentPricePerSqm: 36_000 },
  { locality: "Fontibón", neighborhood: "Modelia", salePricePerSqm: 6_300_000, rentPricePerSqm: 39_500 },
  { locality: "Fontibón", neighborhood: "Fontibón Centro", salePricePerSqm: 4_200_000, rentPricePerSqm: 25_000 },

  // Teusaquillo
  { locality: "Teusaquillo", neighborhood: "Teusaquillo", salePricePerSqm: 6_900_000, rentPricePerSqm: 43_000 },
  { locality: "Teusaquillo", neighborhood: "Quinta Camacho", salePricePerSqm: 7_400_000, rentPricePerSqm: 47_000 },
  { locality: "Teusaquillo", neighborhood: "La Soledad", salePricePerSqm: 5_700_000, rentPricePerSqm: 35_000 },

  // Barrios Unidos
  { locality: "Barrios Unidos", neighborhood: "Los Andes", salePricePerSqm: 5_200_000, rentPricePerSqm: 32_000 },
  { locality: "Barrios Unidos", neighborhood: "Doce de Octubre", salePricePerSqm: 4_600_000, rentPricePerSqm: 28_000 },

  // Engativá
  { locality: "Engativá", neighborhood: "Engativá", salePricePerSqm: 3_900_000, rentPricePerSqm: 23_000 },
  { locality: "Engativá", neighborhood: "Bolivia", salePricePerSqm: 3_600_000, rentPricePerSqm: 21_500 },
  { locality: "Engativá", neighborhood: "Santa Cecilia", salePricePerSqm: 4_000_000, rentPricePerSqm: 24_000 },

  // Kennedy
  { locality: "Kennedy", neighborhood: "Kennedy Central", salePricePerSqm: 3_200_000, rentPricePerSqm: 19_000 },
  { locality: "Kennedy", neighborhood: "Timiza", salePricePerSqm: 3_000_000, rentPricePerSqm: 18_000 },

  // Puente Aranda
  { locality: "Puente Aranda", neighborhood: "Puente Aranda", salePricePerSqm: 3_800_000, rentPricePerSqm: 22_000 },
  { locality: "Puente Aranda", neighborhood: "Muzú", salePricePerSqm: 3_500_000, rentPricePerSqm: 20_500 },

  // Santa Fe
  { locality: "Santa Fe", neighborhood: "La Candelaria", salePricePerSqm: 4_800_000, rentPricePerSqm: 28_000 },
  { locality: "Santa Fe", neighborhood: "Centro Internacional", salePricePerSqm: 6_100_000, rentPricePerSqm: 38_000 },

  // Ciudad Bolívar
  { locality: "Ciudad Bolívar", neighborhood: "Lucero", salePricePerSqm: 2_100_000, rentPricePerSqm: 12_000 },

  // Rafael Uribe Uribe
  { locality: "Rafael Uribe Uribe", neighborhood: "Diana Turbay", salePricePerSqm: 2_300_000, rentPricePerSqm: 13_000 },
];
