import Image from "next/image";
import Link from "next/link";
import { BedDouble, Bath, Car, Ruler } from "lucide-react";
import { clsx } from "clsx";
import { Badge } from "@/components/ui/Badge";
import { FavoriteButton } from "@/components/property/FavoriteButton";
import {
  formatCompactCOP,
  formatCompactPricePerSqm,
  formatCompactRentPerMonth,
} from "@/lib/currency";
import { propertyTypeLabels } from "@/config/site";
import { calculatePricePerSqm } from "@/lib/property-math";
import type { PropertySummary } from "@/types/property";

/**
 * Generic marketplace card — real-estate fields (bedrooms/bathrooms/area)
 * render conditionally today because that's what the one vertical currently
 * live needs; a future vertical's category-driven "featured attributes"
 * (spec section 9) would replace this fixed field list without touching
 * layout/image/favorite/price handling below.
 */
export function ListingCard({
  listing,
  initialFavorited = false,
  highlighted = false,
  priority = false,
  onMouseEnter,
  onMouseLeave,
}: {
  listing: PropertySummary;
  initialFavorited?: boolean;
  highlighted?: boolean;
  /** Set for the first card(s) above the fold to help LCP; leave the default off elsewhere. */
  priority?: boolean;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}) {
  const pricePerSqm = calculatePricePerSqm(listing.price, listing.areaSqm);

  return (
    <Link
      href={`/properties/${listing.slug}`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={clsx(
        "group flex flex-col overflow-hidden rounded-2xl border bg-white transition-shadow hover:shadow-lg",
        highlighted ? "border-brand-500 ring-2 ring-brand-500/30" : "border-ink-100",
      )}
    >
      <div className="relative aspect-4/3 w-full overflow-hidden bg-ink-100">
        {listing.coverImageUrl ? (
          <Image
            src={listing.coverImageUrl}
            alt={listing.title}
            fill
            priority={priority}
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-ink-400">Sin imagen</div>
        )}

        <div className="absolute left-3 top-3">
          <Badge variant="outline">{listing.listingType === "SALE" ? "Venta" : "Arriendo"}</Badge>
        </div>
        <FavoriteButton
          propertyId={listing.id}
          initialFavorited={initialFavorited}
          className="absolute right-3 top-3"
        />
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <p className="font-display text-xl font-semibold text-ink-900">
          {listing.listingType === "SALE"
            ? formatCompactCOP(listing.price)
            : formatCompactRentPerMonth(listing.price)}
        </p>

        <p className="text-sm text-ink-500">
          {propertyTypeLabels[listing.propertyType]} · {listing.neighborhood}
        </p>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-ink-600">
          {listing.bedrooms > 0 && (
            <span className="flex items-center gap-1">
              <BedDouble className="size-4 text-ink-400" aria-hidden />
              {listing.bedrooms}
            </span>
          )}
          {listing.bathrooms > 0 && (
            <span className="flex items-center gap-1">
              <Bath className="size-4 text-ink-400" aria-hidden />
              {listing.bathrooms}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Ruler className="size-4 text-ink-400" aria-hidden />
            {listing.areaSqm} m²
          </span>
          {listing.parkingSpaces > 0 && (
            <span className="flex items-center gap-1">
              <Car className="size-4 text-ink-400" aria-hidden />
              {listing.parkingSpaces}
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
