"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { Map as MapIcon, List as ListIcon } from "lucide-react";
import { PropertyCard } from "@/components/property/PropertyCard";
import { PropertyCardSkeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { SortSelect } from "./SortSelect";
import { Pagination } from "./Pagination";
import type { MapBoundingBox } from "@/components/map/PropertyMap";
import type { PropertySummary } from "@/types/property";

const PropertyMap = dynamic(
  () => import("@/components/map/PropertyMap").then((mod) => mod.PropertyMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center rounded-2xl bg-ink-100 text-sm text-ink-400">
        Cargando mapa...
      </div>
    ),
  },
);

export function PropertySearchExperience({
  properties,
  total,
  page,
  totalPages,
  favoritedIds,
  rawSearchParams,
}: {
  properties: PropertySummary[];
  total: number;
  page: number;
  totalPages: number;
  favoritedIds: Set<string>;
  rawSearchParams: Record<string, string | string[] | undefined>;
}) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mobileView, setMobileView] = useState<"list" | "map">("list");

  function handleSearchArea(bbox: MapBoundingBox) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(rawSearchParams)) {
      if (["north", "south", "east", "west", "page"].includes(key)) continue;
      if (Array.isArray(value)) value.forEach((item) => params.append(key, item));
      else if (value !== undefined) params.set(key, value);
    }
    params.set("north", bbox.north.toFixed(5));
    params.set("south", bbox.south.toFixed(5));
    params.set("east", bbox.east.toFixed(5));
    params.set("west", bbox.west.toFixed(5));
    router.push(`/properties?${params.toString()}`);
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <p className="text-sm text-ink-500">
          <span className="font-semibold text-ink-800">{total}</span> propiedades encontradas
        </p>
        <div className="flex items-center gap-2">
          <div className="flex overflow-hidden rounded-xl border border-ink-200 lg:hidden">
            <button
              type="button"
              onClick={() => setMobileView("list")}
              aria-pressed={mobileView === "list"}
              className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium ${mobileView === "list" ? "bg-ink-900 text-white" : "text-ink-600"}`}
            >
              <ListIcon className="size-4" aria-hidden /> Lista
            </button>
            <button
              type="button"
              onClick={() => setMobileView("map")}
              aria-pressed={mobileView === "map"}
              className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium ${mobileView === "map" ? "bg-ink-900 text-white" : "text-ink-600"}`}
            >
              <MapIcon className="size-4" aria-hidden /> Mapa
            </button>
          </div>
          <SortSelect />
        </div>
      </div>

      <div className="grid flex-1 gap-4 px-4 pb-8 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div className={`${mobileView === "map" ? "block" : "hidden"} h-[70vh] lg:sticky lg:top-20 lg:block lg:h-[calc(100vh-6rem)]`}>
          <PropertyMap properties={properties} selectedId={selectedId} onSelect={setSelectedId} onSearchArea={handleSearchArea} />
        </div>

        <div className={mobileView === "list" ? "block" : "hidden lg:block"}>
          {properties.length === 0 ? (
            <EmptyState
              title="No encontramos propiedades con estos filtros"
              description="Intenta ampliar el rango de precio, quitar filtros o buscar en otra zona de Bogotá."
            />
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              {properties.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  initialFavorited={favoritedIds.has(property.id)}
                  highlighted={property.id === selectedId}
                  onMouseEnter={() => setSelectedId(property.id)}
                  onMouseLeave={() => setSelectedId(null)}
                />
              ))}
            </div>
          )}
          <Pagination page={page} totalPages={totalPages} searchParams={rawSearchParams} />
        </div>
      </div>
    </div>
  );
}

export function PropertySearchSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-5 px-4 py-6 sm:grid-cols-2 sm:px-6 lg:px-8">
      {Array.from({ length: 6 }).map((_, i) => (
        <PropertyCardSkeleton key={i} />
      ))}
    </div>
  );
}
