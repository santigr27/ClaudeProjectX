import type { PropertyWithRelations } from "@/types/property";

function formatValue(value: unknown, unit: string | null): string {
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "boolean") return value ? "Sí" : "No";
  return unit ? `${value} ${unit}` : String(value);
}

/**
 * Read-only display for a listing's custom (non-native) category
 * attributes — the counterpart to AttributeField's sell-form inputs. Every
 * real-estate listing has zero of these today; a "Carros" listing's Marca/
 * Modelo/Año/etc. is the intended use case.
 */
export function AttributeValueList({
  attributeValues,
}: {
  attributeValues: PropertyWithRelations["attributeValues"];
}) {
  if (attributeValues.length === 0) return null;

  const sorted = [...attributeValues].sort(
    (a, b) => a.attributeDefinition.sortOrder - b.attributeDefinition.sortOrder,
  );

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {sorted.map(({ attributeDefinition, value }) => (
        <div key={attributeDefinition.id} className="rounded-xl border border-ink-100 px-4 py-3">
          <p className="text-xs text-ink-500">{attributeDefinition.name}</p>
          <p className="text-sm font-semibold text-ink-900">
            {formatValue(value, attributeDefinition.unit)}
          </p>
        </div>
      ))}
    </div>
  );
}
