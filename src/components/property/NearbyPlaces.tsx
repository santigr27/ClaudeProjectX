import { TreePine, ShoppingBag, GraduationCap, UtensilsCrossed, Bus } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { NearbyPlace } from "@/config/nearby-places.mock";

const CATEGORY_ICONS: Record<NearbyPlace["category"], LucideIcon> = {
  Parque: TreePine,
  "Centro comercial": ShoppingBag,
  Colegio: GraduationCap,
  Restaurante: UtensilsCrossed,
  "Transporte público": Bus,
};

export function NearbyPlaces({ places }: { places: NearbyPlace[] }) {
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      {places.map((place) => {
        const Icon = CATEGORY_ICONS[place.category];
        return (
          <div key={place.name} className="flex items-center gap-3 rounded-xl border border-ink-100 px-3.5 py-2.5">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-ink-50 text-ink-500">
              <Icon className="size-4" aria-hidden />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-ink-800">{place.name}</p>
              <p className="text-xs text-ink-500">
                {place.category} · {place.distanceKm} km
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
