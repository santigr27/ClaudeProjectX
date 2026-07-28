import Image from "next/image";
import Link from "next/link";
import { Pencil, Eye } from "lucide-react";
import { PropertyStatusBadge } from "./PropertyStatusBadge";
import { formatCompactCOP, formatCompactRentPerMonth } from "@/lib/currency";
import { listingTypeLabels } from "@/config/site";
import type { OwnerPropertySummary } from "@/repositories/property.repository";

export function DashboardPropertyRow({ property }: { property: OwnerPropertySummary }) {
  const canViewPublic = property.status === "PUBLISHED";

  return (
    <div className="flex items-center gap-4 rounded-2xl border border-ink-100 bg-white p-4">
      <div className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-ink-100">
        {property.coverImageUrl && (
          <Image src={property.coverImageUrl} alt={property.title} fill className="object-cover" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-ink-900">{property.title}</p>
        <p className="text-sm text-ink-500">
          {[
            listingTypeLabels[property.listingType],
            property.categoryName,
            property.neighborhood,
            property.createdAt.toLocaleDateString("es-CO"),
          ]
            .filter(Boolean)
            .join(" · ")}
        </p>
      </div>

      <p className="hidden shrink-0 font-display text-lg font-semibold text-brand-700 sm:block">
        {property.listingType === "SALE"
          ? formatCompactCOP(property.price)
          : formatCompactRentPerMonth(property.price)}
      </p>

      <PropertyStatusBadge status={property.status} />

      <div className="flex shrink-0 items-center gap-1">
        {canViewPublic && (
          <Link
            href={`/properties/${property.slug}`}
            aria-label="Ver anuncio"
            className="flex size-9 items-center justify-center rounded-full text-ink-500 hover:bg-ink-100"
          >
            <Eye className="size-4" aria-hidden />
          </Link>
        )}
        <Link
          href={`/dashboard/properties/${property.id}/edit`}
          aria-label={property.status === "DRAFT" ? "Continuar borrador" : "Editar propiedad"}
          className="flex size-9 items-center justify-center rounded-full text-ink-500 hover:bg-ink-100"
        >
          <Pencil className="size-4" aria-hidden />
        </Link>
      </div>
    </div>
  );
}
