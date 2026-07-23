import {
  DoorOpen,
  ArrowUpDown,
  ShieldCheck,
  Dumbbell,
  Waves,
  Sun,
  Box,
  Car,
  PawPrint,
  CheckCircle2,
  type LucideIcon,
} from "lucide-react";

const AMENITY_ICONS: Record<string, LucideIcon> = {
  "Balcón": DoorOpen,
  "Ascensor": ArrowUpDown,
  "Vigilancia 24 horas": ShieldCheck,
  "Gimnasio": Dumbbell,
  "Piscina": Waves,
  "Terraza": Sun,
  "Depósito": Box,
  "Parqueadero de visitantes": Car,
  "Admite mascotas": PawPrint,
};

export function PropertyFeatures({ amenities }: { amenities: string[] }) {
  if (amenities.length === 0) return null;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {amenities.map((amenity) => {
        const Icon = AMENITY_ICONS[amenity] ?? CheckCircle2;
        return (
          <div key={amenity} className="flex items-center gap-2.5 rounded-xl border border-ink-100 px-3.5 py-2.5">
            <Icon className="size-4 shrink-0 text-brand-600" aria-hidden />
            <span className="text-sm text-ink-700">{amenity}</span>
          </div>
        );
      })}
    </div>
  );
}
