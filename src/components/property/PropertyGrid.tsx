import { PropertyCard } from "./PropertyCard";
import type { PropertySummary } from "@/types/property";

export function PropertyGrid({
  properties,
  favoritedIds,
}: {
  properties: PropertySummary[];
  favoritedIds?: Set<string>;
}) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {properties.map((property, index) => (
        <PropertyCard
          key={property.id}
          property={property}
          initialFavorited={favoritedIds?.has(property.id) ?? false}
          priority={index === 0}
        />
      ))}
    </div>
  );
}
