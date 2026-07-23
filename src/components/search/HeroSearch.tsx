"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { SegmentedToggle } from "@/components/ui/SegmentedToggle";
import { propertyTypeLabels } from "@/config/site";

const PROPERTY_TYPE_OPTIONS = Object.entries(propertyTypeLabels).map(([value, label]) => ({
  value: value.toLowerCase(),
  label,
}));

export function HeroSearch() {
  const router = useRouter();
  const [listingType, setListingType] = useState<"sale" | "rent">("sale");
  const [query, setQuery] = useState("");
  const [propertyType, setPropertyType] = useState("");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const params = new URLSearchParams({ listingType });
    if (query.trim()) params.set("q", query.trim());
    if (propertyType) params.set("propertyType", propertyType);
    router.push(`/properties?${params.toString()}`);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-2xl rounded-3xl bg-white/95 p-3 shadow-xl backdrop-blur-sm sm:p-4"
    >
      <SegmentedToggle
        name="Tipo de operación"
        value={listingType}
        onChange={(value) => setListingType(value as "sale" | "rent")}
        options={[
          { value: "sale", label: "Comprar" },
          { value: "rent", label: "Arrendar" },
        ]}
        className="mb-3"
      />

      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="flex flex-1 items-center gap-2 rounded-xl border border-ink-200 px-3.5 py-2.5">
          <Search className="size-4 shrink-0 text-ink-400" aria-hidden />
          <label htmlFor="hero-search-query" className="sr-only">
            Barrio, localidad o dirección
          </label>
          <input
            id="hero-search-query"
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Barrio, localidad o dirección, ej. Chicó"
            className="w-full min-w-0 text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none"
          />
        </div>

        <select
          value={propertyType}
          onChange={(event) => setPropertyType(event.target.value)}
          aria-label="Tipo de propiedad"
          className="rounded-xl border border-ink-200 px-3.5 py-2.5 text-sm text-ink-700 focus:outline-none sm:w-48"
        >
          <option value="">Todos los tipos</option>
          {PROPERTY_TYPE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <button
          type="submit"
          className="rounded-xl bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
        >
          Buscar
        </button>
      </div>
    </form>
  );
}
