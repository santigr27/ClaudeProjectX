import Image from "next/image";
import Link from "next/link";
import { BedDouble, Bath, Car, Ruler } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { FavoriteButton } from "./FavoriteButton";
import {
  formatCompactCOP,
  formatCompactPricePerSqm,
  formatCompactRentPerMonth,
} from "@/lib/currency";
import { propertyTypeLabels } from "@/config/site";
import type { PropertySummary } from "@/types/property";

export function PropertyCard({
  property,
  initialFavorited = false,
}: {
  property: PropertySummary;
  initialFavorited?: boolean;
}) {
  const pricePerSqm = property.price / property.areaSqm;

  return (
    <Link
      href={`/properties/${property.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-ink-100 bg-white transition-shadow hover:shadow-lg"
    >
      <div className="relative aspect-4/3 w-full overflow-hidden bg-ink-100">
        {property.coverImageUrl ? (
          <Image
            src={property.coverImageUrl}
            alt={property.title}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-ink-400">Sin imagen</div>
        )}

        <div className="absolute left-3 top-3">
          <Badge variant="outline">{property.listingType === "SALE" ? "Venta" : "Arriendo"}</Badge>
        </div>
        <FavoriteButton
          propertyId={property.id}
          initialFavorited={initialFavorited}
          className="absolute right-3 top-3"
        />
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <p className="font-display text-xl font-semibold text-ink-900">
          {property.listingType === "SALE"
            ? formatCompactCOP(property.price)
            : formatCompactRentPerMonth(property.price)}
        </p>

        <p className="text-sm text-ink-500">
          {propertyTypeLabels[property.propertyType]} · {property.neighborhood}
        </p>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-ink-600">
          {property.bedrooms > 0 && (
            <span className="flex items-center gap-1">
              <BedDouble className="size-4 text-ink-400" aria-hidden />
              {property.bedrooms}
            </span>
          )}
          {property.bathrooms > 0 && (
            <span className="flex items-center gap-1">
              <Bath className="size-4 text-ink-400" aria-hidden />
              {property.bathrooms}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Ruler className="size-4 text-ink-400" aria-hidden />
            {property.areaSqm} m²
          </span>
          {property.parkingSpaces > 0 && (
            <span className="flex items-center gap-1">
              <Car className="size-4 text-ink-400" aria-hidden />
              {property.parkingSpaces}
            </span>
          )}
        </div>

        <p className="mt-auto pt-1 text-xs font-medium text-ink-400">
          {formatCompactPricePerSqm(pricePerSqm)}
        </p>
      </div>
    </Link>
  );
}
