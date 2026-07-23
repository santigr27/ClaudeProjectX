import Link from "next/link";
import { clsx } from "clsx";

function buildHref(searchParams: Record<string, string | string[] | undefined>, page: number) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams)) {
    if (key === "page") continue;
    if (Array.isArray(value)) {
      value.forEach((item) => params.append(key, item));
    } else if (value !== undefined) {
      params.set(key, value);
    }
  }
  if (page > 1) params.set("page", String(page));
  return `/properties?${params.toString()}`;
}

export function Pagination({
  page,
  totalPages,
  searchParams,
}: {
  page: number;
  totalPages: number;
  searchParams: Record<string, string | string[] | undefined>;
}) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1,
  );

  return (
    <nav aria-label="Paginación" className="flex items-center justify-center gap-1 py-8">
      <Link
        href={buildHref(searchParams, Math.max(1, page - 1))}
        aria-disabled={page === 1}
        className={clsx(
          "rounded-full px-3 py-2 text-sm font-medium",
          page === 1 ? "pointer-events-none text-ink-300" : "text-ink-700 hover:bg-ink-100",
        )}
      >
        Anterior
      </Link>

      {pages.map((p, index) => (
        <span key={p} className="flex items-center">
          {index > 0 && pages[index - 1] !== p - 1 && <span className="px-1 text-ink-300">…</span>}
          <Link
            href={buildHref(searchParams, p)}
            className={clsx(
              "flex size-9 items-center justify-center rounded-full text-sm font-medium",
              p === page ? "bg-brand-600 text-white" : "text-ink-700 hover:bg-ink-100",
            )}
          >
            {p}
          </Link>
        </span>
      ))}

      <Link
        href={buildHref(searchParams, Math.min(totalPages, page + 1))}
        aria-disabled={page === totalPages}
        className={clsx(
          "rounded-full px-3 py-2 text-sm font-medium",
          page === totalPages ? "pointer-events-none text-ink-300" : "text-ink-700 hover:bg-ink-100",
        )}
      >
        Siguiente
      </Link>
    </nav>
  );
}
