import { getFeaturedProperties } from "@/features/properties/queries";
import { getFavoritedIdsForCurrentSession } from "@/features/favorites/queries";
import { getMarketplaceConfig } from "@/features/marketplace/config";
import { ListingGrid } from "@/components/listing/ListingGrid";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";

export async function FeaturedProperties() {
  const [properties, favoritedIds, config] = await Promise.all([
    getFeaturedProperties(8),
    getFavoritedIdsForCurrentSession(),
    getMarketplaceConfig(),
  ]);

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-brand-600">
            Selección {config.name}
          </p>
          <h2 className="font-display text-3xl font-semibold text-ink-900 sm:text-4xl">
            {config.terminology.listingPlural} destacadas
          </h2>
        </div>
        <Button href="/properties" variant="outline">
          Ver todas
        </Button>
      </div>

      {properties.length === 0 ? (
        <EmptyState title={`Aún no hay ${config.terminology.listingPlural.toLowerCase()} destacadas`} />
      ) : (
        <ListingGrid properties={properties} favoritedIds={favoritedIds} />
      )}
    </section>
  );
}
