import type { Metadata } from "next";
import { getPropertyFilterOptions, getPropertySearchResults } from "@/features/properties/queries";
import { getFavoritedIdsForCurrentSession } from "@/features/favorites/queries";
import { findActiveTopLevelCategories } from "@/repositories/category.repository";
import { getMarketplaceConfig } from "@/features/marketplace/config";
import { isFeatureEnabled, FEATURE_FLAGS } from "@/features/marketplace/feature-flags";
import { PropertyFiltersBar } from "@/components/search/PropertyFiltersBar";
import { PropertySearchExperience } from "@/components/search/PropertySearchExperience";
import { propertySearchParamsSchema } from "@/validations/property-filters";

export async function generateMetadata(): Promise<Metadata> {
  const [config, locationEnabled] = await Promise.all([
    getMarketplaceConfig(),
    isFeatureEnabled(FEATURE_FLAGS.LOCATION),
  ]);
  const listingPluralLower = config.terminology.listingPlural.toLowerCase();

  return {
    title: `${config.terminology.listingPlural} en venta y arriendo`,
    description: locationEnabled
      ? `Explora ${listingPluralLower} en venta y arriendo con mapa interactivo y filtros por barrio, precio y más.`
      : `Explora ${listingPluralLower} en venta y arriendo con filtros por precio, categoría y más.`,
  };
}

export default async function PropertiesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const rawSearchParams = await searchParams;
  const parseResult = propertySearchParamsSchema.safeParse(rawSearchParams);
  const parsedParams = parseResult.success ? parseResult.data : {};

  const [results, filterOptions, favoritedIds, categories, config] = await Promise.all([
    getPropertySearchResults(parsedParams),
    getPropertyFilterOptions(),
    getFavoritedIdsForCurrentSession(),
    findActiveTopLevelCategories(),
    getMarketplaceConfig(),
  ]);

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col">
      <PropertyFiltersBar filterOptions={filterOptions} categories={categories} />
      <PropertySearchExperience
        properties={results.properties}
        total={results.total}
        page={results.page}
        totalPages={results.totalPages}
        favoritedIds={favoritedIds}
        rawSearchParams={rawSearchParams}
        listingPluralLower={config.terminology.listingPlural.toLowerCase()}
      />
    </div>
  );
}
