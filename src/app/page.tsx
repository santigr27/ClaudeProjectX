import Link from "next/link";
import { Hero } from "@/components/search/Hero";
import { FeaturedProperties } from "@/components/property/FeaturedProperties";
import { ValuationSection } from "@/components/valuation/ValuationSection";
import { Button } from "@/components/ui/Button";

const POPULAR_LOCALITIES = [
  "Chapinero",
  "Usaquén",
  "Suba",
  "Teusaquillo",
  "Fontibón",
  "Barrios Unidos",
];

export default function HomePage() {
  return (
    <>
      <Hero />
      <FeaturedProperties />

      <section className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <h2 className="mb-4 font-display text-2xl font-semibold text-ink-900">
          Explora por localidad
        </h2>
        <div className="flex flex-wrap gap-2">
          {POPULAR_LOCALITIES.map((locality) => (
            <Link
              key={locality}
              href={`/properties?locality=${encodeURIComponent(locality)}`}
              className="rounded-full border border-ink-200 px-4 py-2 text-sm font-medium text-ink-700 transition-colors hover:border-brand-400 hover:text-brand-700"
            >
              {locality}
            </Link>
          ))}
        </div>
      </section>

      <ValuationSection />

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start gap-4 rounded-3xl bg-brand-600 px-8 py-12 text-white sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-2xl font-semibold sm:text-3xl">
              ¿Quieres vender o arrendar tu propiedad?
            </h2>
            <p className="mt-2 max-w-lg text-white/85">
              Publica tu propiedad en minutos y conecta con compradores y arrendatarios en toda
              Bogotá.
            </p>
          </div>
          <Button
            href="/sell"
            variant="outline"
            size="lg"
            className="shrink-0 bg-white text-brand-700 hover:bg-brand-50"
          >
            Publicar propiedad
          </Button>
        </div>
      </section>
    </>
  );
}
