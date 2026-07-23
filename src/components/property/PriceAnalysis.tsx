import { TrendingDown, TrendingUp, Minus } from "lucide-react";
import { formatPricePerSqm } from "@/lib/currency";
import type { comparePriceToNeighborhoodAverage } from "@/services/valuation.service";

type Analysis = Awaited<ReturnType<typeof comparePriceToNeighborhoodAverage>>;

export function PriceAnalysis({ analysis, neighborhood }: { analysis: Analysis; neighborhood: string }) {
  if (!analysis) return null;

  const { propertyPricePerSqm, neighborhoodAveragePricePerSqm, percentDifference } = analysis;
  const rounded = Math.round(percentDifference * 10) / 10;
  const isBelow = rounded < -0.5;
  const isAbove = rounded > 0.5;

  return (
    <div className="rounded-2xl border border-ink-100 p-5">
      <h3 className="mb-4 font-display text-lg font-semibold text-ink-900">Análisis de precio</h3>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-ink-500">Precio de esta propiedad</p>
          <p className="text-base font-semibold text-ink-900">{formatPricePerSqm(propertyPricePerSqm)}</p>
        </div>
        <div>
          <p className="text-ink-500">Promedio en {neighborhood}</p>
          <p className="text-base font-semibold text-ink-900">
            {formatPricePerSqm(neighborhoodAveragePricePerSqm)}
          </p>
        </div>
      </div>

      <div
        className={`mt-4 flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-sm font-medium ${
          isBelow ? "bg-accent-50 text-accent-700" : isAbove ? "bg-amber-50 text-amber-700" : "bg-ink-50 text-ink-600"
        }`}
      >
        {isBelow ? (
          <TrendingDown className="size-4 shrink-0" aria-hidden />
        ) : isAbove ? (
          <TrendingUp className="size-4 shrink-0" aria-hidden />
        ) : (
          <Minus className="size-4 shrink-0" aria-hidden />
        )}
        <span>
          {isBelow && `Esta propiedad está ${Math.abs(rounded)}% por debajo del promedio del barrio.`}
          {isAbove && `Esta propiedad está ${Math.abs(rounded)}% por encima del promedio del barrio.`}
          {!isBelow && !isAbove && "Esta propiedad está en línea con el promedio del barrio."}
        </span>
      </div>
    </div>
  );
}
