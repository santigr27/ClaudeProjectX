import {
  BedDouble,
  Bath,
  Car,
  Ruler,
  Building2,
  CalendarClock,
  Wallet,
  Gauge,
  Tag,
} from "lucide-react";
import type { ReactNode } from "react";
import { formatCOP, formatPricePerSqm } from "@/lib/currency";
import type { PropertyWithRelations } from "@/types/property";

function InfoItem({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-ink-100 px-4 py-3">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-ink-50 text-ink-500">
        {icon}
      </span>
      <div>
        <p className="text-xs text-ink-500">{label}</p>
        <p className="text-sm font-semibold text-ink-900">{value}</p>
      </div>
    </div>
  );
}

export function PropertyInfoGrid({ property }: { property: PropertyWithRelations }) {
  const pricePerSqm = property.price / property.areaSqm;

  const items: { icon: ReactNode; label: string; value: string }[] = [
    { icon: <Ruler className="size-4" aria-hidden />, label: "Área", value: `${property.areaSqm} m²` },
  ];

  if (property.bedrooms > 0) {
    items.push({
      icon: <BedDouble className="size-4" aria-hidden />,
      label: "Habitaciones",
      value: String(property.bedrooms),
    });
  }
  if (property.bathrooms > 0) {
    items.push({
      icon: <Bath className="size-4" aria-hidden />,
      label: "Baños",
      value: String(property.bathrooms),
    });
  }
  if (property.parkingSpaces > 0) {
    items.push({
      icon: <Car className="size-4" aria-hidden />,
      label: "Parqueaderos",
      value: String(property.parkingSpaces),
    });
  }
  if (property.floor !== null) {
    items.push({ icon: <Building2 className="size-4" aria-hidden />, label: "Piso", value: String(property.floor) });
  }
  if (property.propertyAge !== null) {
    items.push({
      icon: <CalendarClock className="size-4" aria-hidden />,
      label: "Antigüedad",
      value: property.propertyAge === 0 ? "Nuevo" : `${property.propertyAge} años`,
    });
  }
  if (property.administrationFee) {
    items.push({
      icon: <Wallet className="size-4" aria-hidden />,
      label: "Administración",
      value: formatCOP(property.administrationFee),
    });
  }
  if (property.estrato !== null) {
    items.push({ icon: <Gauge className="size-4" aria-hidden />, label: "Estrato", value: String(property.estrato) });
  }
  items.push({
    icon: <Tag className="size-4" aria-hidden />,
    label: "Precio por m²",
    value: formatPricePerSqm(pricePerSqm),
  });

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {items.map((item) => (
        <InfoItem key={item.label} {...item} />
      ))}
    </div>
  );
}
