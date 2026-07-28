import Link from "next/link";
import type { findActiveTopLevelCategories } from "@/repositories/category.repository";

/**
 * The homepage's category-discovery section (spec section 8) — the single
 * clearest signal that this is a general marketplace engine, not a
 * real-estate site with extra fields. Every active top-level category shows
 * up here automatically, native-mapped or not (a "Carros" tile appears the
 * moment it exists in the database, with zero code change).
 */
export function CategoryGrid({
  categories,
}: {
  categories: Awaited<ReturnType<typeof findActiveTopLevelCategories>>;
}) {
  if (categories.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h2 className="mb-5 font-display text-2xl font-semibold text-ink-900">Explora por categoría</h2>
      <div className="flex flex-wrap gap-3">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/properties?categoryId=${category.id}`}
            className="flex items-center gap-3 rounded-2xl border border-ink-100 bg-white px-4 py-3 transition-colors hover:border-brand-300 hover:bg-brand-50"
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-50 text-sm font-semibold text-brand-700">
              {category.name.charAt(0).toUpperCase()}
            </span>
            <span className="text-sm font-medium text-ink-800">{category.name}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
