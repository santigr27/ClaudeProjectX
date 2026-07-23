"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SegmentedToggle } from "@/components/ui/SegmentedToggle";
import { Select } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { propertyTypeLabels } from "@/config/site";
import { clsx } from "clsx";
import type { LocalityWithNeighborhoods } from "@/repositories/property.repository";

const BEDROOM_OPTIONS = [
  { value: "", label: "Habitaciones" },
  { value: "1", label: "1+" },
  { value: "2", label: "2+" },
  { value: "3", label: "3+" },
  { value: "4", label: "4+" },
];

export function PropertyFiltersBar({ filterOptions }: { filterOptions: LocalityWithNeighborhoods[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [listingType, setListingType] = useState(searchParams.get("listingType") ?? "sale");
  const [locality, setLocality] = useState(searchParams.get("locality") ?? "");
  const [neighborhood, setNeighborhood] = useState(searchParams.get("neighborhood") ?? "");
  const [propertyTypes, setPropertyTypes] = useState<string[]>(
    searchParams.getAll("propertyType"),
  );
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") ?? "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") ?? "");
  const [bedrooms, setBedrooms] = useState(searchParams.get("bedrooms") ?? "");

  const neighborhoodOptions = useMemo(() => {
    if (!locality) return [];
    return filterOptions.find((option) => option.locality === locality)?.neighborhoods ?? [];
  }, [filterOptions, locality]);

  function toggleType(value: string) {
    setPropertyTypes((prev) =>
      prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value],
    );
  }

  function applyFilters() {
    const params = new URLSearchParams();
    params.set("listingType", listingType);
    if (locality) params.set("locality", locality);
    if (neighborhood) params.set("neighborhood", neighborhood);
    propertyTypes.forEach((type) => params.append("propertyType", type));
    if (minPrice) params.set("minPrice", minPrice);
    if (maxPrice) params.set("maxPrice", maxPrice);
    if (bedrooms) params.set("bedrooms", bedrooms);

    const currentSort = searchParams.get("sort");
    if (currentSort) params.set("sort", currentSort);

    router.push(`/properties?${params.toString()}`);
  }

  return (
    <div className="flex flex-col gap-4 border-b border-ink-100 bg-white px-4 py-4 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center gap-3">
        <SegmentedToggle
          name="Tipo de operación"
          value={listingType}
          onChange={setListingType}
          options={[
            { value: "sale", label: "Comprar" },
            { value: "rent", label: "Arrendar" },
          ]}
        />

        <Select
          wrapperClassName="w-44"
          value={locality}
          onChange={(event) => {
            setLocality(event.target.value);
            setNeighborhood("");
          }}
          placeholder="Localidad"
          options={filterOptions.map((option) => ({ value: option.locality, label: option.locality }))}
        />

        <Select
          key={locality}
          wrapperClassName="w-44"
          value={neighborhood}
          onChange={(event) => setNeighborhood(event.target.value)}
          placeholder={locality ? "Barrio" : "Elige una localidad"}
          disabled={!locality}
          options={neighborhoodOptions.map((n) => ({ value: n, label: n }))}
        />

        <Select
          wrapperClassName="w-40"
          value={bedrooms}
          onChange={(event) => setBedrooms(event.target.value)}
          options={BEDROOM_OPTIONS}
        />

        <input
          type="number"
          inputMode="numeric"
          placeholder="Precio mín."
          value={minPrice}
          onChange={(event) => setMinPrice(event.target.value)}
          className="w-32 rounded-xl border border-ink-200 px-3 py-2.5 text-sm text-ink-900 placeholder:text-ink-400 focus:border-brand-500 focus:outline-none"
        />
        <input
          type="number"
          inputMode="numeric"
          placeholder="Precio máx."
          value={maxPrice}
          onChange={(event) => setMaxPrice(event.target.value)}
          className="w-32 rounded-xl border border-ink-200 px-3 py-2.5 text-sm text-ink-900 placeholder:text-ink-400 focus:border-brand-500 focus:outline-none"
        />

        <Button onClick={applyFilters} size="md">
          Aplicar filtros
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {Object.entries(propertyTypeLabels).map(([value, label]) => {
          const key = value.toLowerCase();
          const isActive = propertyTypes.includes(key);
          return (
            <button
              key={key}
              type="button"
              onClick={() => toggleType(key)}
              className={clsx(
                "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                isActive
                  ? "border-brand-600 bg-brand-50 text-brand-700"
                  : "border-ink-200 text-ink-600 hover:border-ink-300",
              )}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
