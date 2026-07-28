import { listLocalitiesWithNeighborhoods } from "@/repositories/market-data.repository";
import { getMarketplaceConfig } from "@/features/marketplace/config";
import { ValuationCalculator } from "./ValuationCalculator";

export async function ValuationSection() {
  const [localities, config] = await Promise.all([
    listLocalitiesWithNeighborhoods(),
    getMarketplaceConfig(),
  ]);
  const listingLower = config.terminology.listing.toLowerCase();

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-10 max-w-2xl">
        <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-brand-600">
          Herramienta gratuita
        </p>
        <h2 className="font-display text-3xl font-semibold text-ink-900 sm:text-4xl">
          Estima el valor de tu {listingLower}
        </h2>
        <p className="mt-3 text-ink-500">
          Calcula un estimado de venta o arriendo usando el precio promedio por metro cuadrado en
          tu zona.
        </p>
      </div>

      <ValuationCalculator localities={localities} />
    </section>
  );
}
