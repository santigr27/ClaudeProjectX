import type { Metadata } from "next";
import { listLocalitiesWithNeighborhoods } from "@/repositories/market-data.repository";
import { SellPropertyForm } from "@/components/sell/SellPropertyForm";

export const metadata: Metadata = {
  title: "Publicar propiedad",
  description: "Publica tu propiedad en venta o arriendo en Bogotá en minutos.",
};

export default async function SellPage() {
  const localities = await listLocalitiesWithNeighborhoods();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-semibold text-ink-900">Publica tu propiedad</h1>
        <p className="mt-2 text-ink-500">
          Completa la información de tu propiedad. Nuestro equipo la revisará antes de publicarla.
        </p>
      </div>

      <SellPropertyForm localities={localities} />
    </div>
  );
}
