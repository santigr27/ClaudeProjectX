"use client";

import { useRouter, useSearchParams } from "next/navigation";

const SORT_OPTIONS = [
  { value: "recommended", label: "Recomendados" },
  { value: "price_asc", label: "Precio: menor a mayor" },
  { value: "price_desc", label: "Precio: mayor a menor" },
  { value: "newest", label: "Más recientes" },
  { value: "price_per_sqm_asc", label: "Precio por m²" },
];

export function SortSelect() {
  const router = useRouter();
  const searchParams = useSearchParams();

  return (
    <select
      aria-label="Ordenar por"
      value={searchParams.get("sort") ?? "recommended"}
      onChange={(event) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("sort", event.target.value);
        params.delete("page");
        router.push(`/properties?${params.toString()}`);
      }}
      className="rounded-xl border border-ink-200 bg-white px-3 py-2 text-sm text-ink-700 focus:border-brand-500 focus:outline-none"
    >
      {SORT_OPTIONS.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
