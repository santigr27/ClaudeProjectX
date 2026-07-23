import type { Metadata } from "next";
import { ValuationSection } from "@/components/valuation/ValuationSection";

export const metadata: Metadata = {
  title: "Estimar propiedad",
  description: "Calcula el valor estimado de venta o arriendo de tu propiedad en Bogotá.",
};

export default function EstimatePage() {
  return (
    <div className="py-6">
      <ValuationSection />
    </div>
  );
}
