import type { Metadata } from "next";
import { getPropertyFilterOptions, getPropertySearchResults } from "@/features/properties/queries";
import { getFavoritedIdsForCurrentSession } from "@/features/favorites/queries";
import { PropertyFiltersBar } from "@/components/search/PropertyFiltersBar";
import { PropertySearchExperience } from "@/components/search/PropertySearchExperience";
import { propertySearchParamsSchema } from "@/validations/property-filters";

export const metadata: Metadata = {
  title: "Propiedades en venta y arriendo en Bogotá",
  description: "Explora apartamentos, casas y locales en venta y arriendo en Bogotá con mapa interactivo y filtros por barrio, precio y más.",
};

export default async function PropertiesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const rawSearchParams = await searchParams;
  const parseResult = propertySearchParamsSchema.safeParse(rawSearchParams);
  const parsedParams = parseResult.success ? parseResult.data : {};

  const [results, filterOptions, favoritedIds] = await Promise.all([
    getPropertySearchResults(parsedParams),
    getPropertyFilterOptions(),
    getFavoritedIdsForCurrentSession(),
  ]);

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col">
      <PropertyFiltersBar filterOptions={filterOptions} />
      <PropertySearchExperience
        properties={results.properties}
        total={results.total}
        page={results.page}
        totalPages={results.totalPages}
        favoritedIds={favoritedIds}
        rawSearchParams={rawSearchParams}
      />
    </div>
  );
}
