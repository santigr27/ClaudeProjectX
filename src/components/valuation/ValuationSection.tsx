import { listLocalitiesWithNeighborhoods } from "@/repositories/market-data.repository";
import { ValuationCalculator } from "./ValuationCalculator";

export async function ValuationSection() {
  const localities = await listLocalitiesWithNeighborhoods();

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-10 max-w-2xl">
        <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-brand-600">
          Herramienta gratuita
        </p>
        <h2 className="font-display text-3xl font-semibold text-ink-900 sm:text-4xl">
          Estima el valor de tu propiedad
        </h2>
        <p className="mt-3 text-ink-500">
          Calcula un estimado de venta o arriendo usando el precio promedio por metro cuadrado de
          tu barrio en Bogotá.
        </p>
      </div>

      <ValuationCalculator localities={localities} />
    </section>
  );
}
