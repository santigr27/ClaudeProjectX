"use client";

import { useActionState } from "react";
import { Input, Select } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { attributeDataTypes } from "@/validations/category";
import { createAttributeAction, type AdminActionState } from "@/features/admin/categories/actions";

const initialState: AdminActionState = {};

const DATA_TYPE_LABELS: Record<(typeof attributeDataTypes)[number], string> = {
  TEXT: "Texto",
  NUMBER: "Número",
  BOOLEAN: "Sí/No",
  SELECT: "Selección única",
  MULTI_SELECT: "Selección múltiple",
  DATE: "Fecha",
};

export function CreateAttributeForm({
  categoryOptions,
}: {
  categoryOptions: { value: string; label: string }[];
}) {
  const [state, formAction, isPending] = useActionState(createAttributeAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4 rounded-2xl border border-ink-200 bg-white p-5">
      <h3 className="font-display text-lg font-semibold text-ink-900">Nuevo atributo</h3>
      <Select
        label="Categoría"
        name="categoryId"
        options={categoryOptions}
        placeholder="Selecciona una categoría"
        error={state.fieldErrors?.categoryId}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Nombre" name="name" placeholder="Ej. Voltaje" error={state.fieldErrors?.name} />
        <Input label="Clave (key)" name="key" placeholder="ej. voltage" error={state.fieldErrors?.key} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Select
          label="Tipo de dato"
          name="dataType"
          options={attributeDataTypes.map((type) => ({ value: type, label: DATA_TYPE_LABELS[type] }))}
          error={state.fieldErrors?.dataType}
        />
        <Input label="Unidad (opcional)" name="unit" placeholder="ej. V, kg, m²" error={state.fieldErrors?.unit} />
      </div>
      <Input
        label="Opciones (solo para selección, separadas por coma)"
        name="options"
        placeholder="ej. 110V, 220V"
      />
      <div className="flex flex-wrap gap-4 text-sm text-ink-700">
        <label className="flex items-center gap-2">
          <input type="checkbox" name="required" className="size-4 rounded border-ink-300 text-brand-600" />
          Requerido
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" name="filterable" className="size-4 rounded border-ink-300 text-brand-600" />
          Filtrable en búsqueda
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" name="searchable" className="size-4 rounded border-ink-300 text-brand-600" />
          Incluir en búsqueda por texto
        </label>
      </div>
      {state.formError && (
        <p role="alert" className="text-sm text-red-600">
          {state.formError}
        </p>
      )}
      <Button type="submit" disabled={isPending} className="self-start">
        {isPending ? "Creando..." : "Crear atributo"}
      </Button>
    </form>
  );
}
