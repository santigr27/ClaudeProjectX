import { ListingCard } from "./ListingCard";
import type { PropertySummary } from "@/types/property";

export function ListingGrid({
  properties,
  favoritedIds,
}: {
  properties: PropertySummary[];
  favoritedIds?: Set<string>;
}) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {properties.map((listing, index) => (
        <ListingCard
          key={listing.id}
          listing={listing}
          initialFavorited={favoritedIds?.has(listing.id) ?? false}
          priority={index === 0}
        />
      ))}
    </div>
  );
}
