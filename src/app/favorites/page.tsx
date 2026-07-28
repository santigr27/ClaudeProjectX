import type { Metadata } from "next";
import { Heart } from "lucide-react";
import { getSessionId } from "@/lib/session";
import { findPropertiesByIds } from "@/repositories/property.repository";
import { listFavoritedPropertyIds } from "@/repositories/favorite.repository";
import { getMarketplaceConfig } from "@/features/marketplace/config";
import { ListingGrid } from "@/components/listing/ListingGrid";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Favoritos",
};

export default async function FavoritesPage() {
  const [sessionId, config] = await Promise.all([getSessionId(), getMarketplaceConfig()]);
  const propertyIds = sessionId ? await listFavoritedPropertyIds(sessionId) : [];
  const properties = await findPropertiesByIds(propertyIds);
  const favoritedIds = new Set(propertyIds);

  const listingLower = config.terminology.listing.toLowerCase();
  const listingPluralLower = config.terminology.listingPlural.toLowerCase();

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="mb-8 font-display text-3xl font-semibold text-ink-900">Tus favoritos</h1>

      {properties.length === 0 ? (
        <EmptyState
          icon={<Heart className="size-8" aria-hidden />}
          title="Aún no tienes favoritos guardados"
          // "esa selección" (always feminine) sidesteps having to know the
          // grammatical gender of whatever noun this vertical's terminology
          // configures — "cualquier carro"/"cualquier propiedad" both work.
          description={`Toca el corazón en cualquier ${listingLower} para guardar esa selección aquí y comparar más adelante.`}
          action={<Button href="/properties">Explorar {listingPluralLower}</Button>}
        />
      ) : (
        <ListingGrid properties={properties} favoritedIds={favoritedIds} />
      )}
    </div>
  );
}
