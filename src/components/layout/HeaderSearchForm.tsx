import { Search } from "lucide-react";

/**
 * Plain GET form: works without client-side JavaScript and lets users land
 * directly on a filtered, shareable /properties URL.
 */
export function HeaderSearchForm({ className }: { className?: string }) {
  return (
    <form action="/properties" method="get" role="search" className={className}>
      <label htmlFor="header-search" className="sr-only">
        Buscar por barrio, localidad o dirección
      </label>
      <div className="flex items-center gap-2 rounded-full border border-ink-200 bg-white px-3.5 py-2 text-sm text-ink-500 transition-colors focus-within:border-brand-400">
        <Search className="size-4 shrink-0" aria-hidden />
        <input
          id="header-search"
          type="text"
          name="q"
          placeholder="Barrio, localidad o dirección"
          className="w-full min-w-0 bg-transparent text-ink-900 placeholder:text-ink-400 focus:outline-none"
        />
      </div>
    </form>
  );
}
