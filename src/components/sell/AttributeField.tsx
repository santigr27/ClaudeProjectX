import { Input, Select } from "@/components/ui/Field";
import type { AttributeDefinition } from "@/generated/prisma/client";

function asStringArray(value: string | string[] | undefined): string[] {
  if (Array.isArray(value)) return value;
  return value ? [value] : [];
}

/**
 * Renders one form field for a category's custom (non-native) attribute,
 * generically switching on `dataType` — this is what lets a brand-new
 * attribute created in /admin/categories show up on the sell form with
 * zero code changes. Real-estate categories have none of these today; a
 * hardware category's "Voltaje" (SELECT) is the intended use case.
 */
export function AttributeField({
  attribute,
  value,
}: {
  attribute: AttributeDefinition;
  value: string | string[] | undefined;
}) {
  const fieldName = `attr_${attribute.key}`;
  const label = attribute.unit ? `${attribute.name} (${attribute.unit})` : attribute.name;
  const options = Array.isArray(attribute.options) ? (attribute.options as string[]) : [];

  switch (attribute.dataType) {
    case "NUMBER":
      return (
        <Input
          label={label}
          name={fieldName}
          type="number"
          required={attribute.required}
          defaultValue={Array.isArray(value) ? value[0] : value ?? ""}
        />
      );

    case "DATE":
      return (
        <Input
          label={label}
          name={fieldName}
          type="date"
          required={attribute.required}
          defaultValue={Array.isArray(value) ? value[0] : value ?? ""}
        />
      );

    case "BOOLEAN":
      return (
        <label className="flex items-center gap-2 self-end rounded-xl border border-ink-200 px-3.5 py-2.5 text-sm text-ink-700">
          <input
            type="checkbox"
            name={fieldName}
            defaultChecked={value === "true" || value === "on"}
            className="size-4 rounded border-ink-300 text-brand-600 focus:ring-brand-500"
          />
          {label}
        </label>
      );

    case "SELECT":
      return (
        <Select
          label={label}
          name={fieldName}
          options={options.map((option) => ({ value: option, label: option }))}
          placeholder="Selecciona"
          defaultValue={Array.isArray(value) ? value[0] : value ?? ""}
          required={attribute.required}
        />
      );

    case "MULTI_SELECT": {
      const selected = new Set(asStringArray(value));
      return (
        <fieldset className="flex flex-col gap-1.5">
          <legend className="text-sm font-medium text-ink-800">{label}</legend>
          <div className="flex flex-wrap gap-2">
            {options.map((option) => (
              <label
                key={option}
                className="flex items-center gap-1.5 rounded-lg border border-ink-200 px-2.5 py-1.5 text-sm text-ink-700"
              >
                <input
                  type="checkbox"
                  name={fieldName}
                  value={option}
                  defaultChecked={selected.has(option)}
                  className="size-4 rounded border-ink-300 text-brand-600 focus:ring-brand-500"
                />
                {option}
              </label>
            ))}
          </div>
        </fieldset>
      );
    }

    case "TEXT":
    default:
      return (
        <Input
          label={label}
          name={fieldName}
          type="text"
          required={attribute.required}
          defaultValue={Array.isArray(value) ? value[0] : value ?? ""}
        />
      );
  }
}
