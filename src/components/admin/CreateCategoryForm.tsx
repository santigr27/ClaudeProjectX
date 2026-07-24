"use client";

import { useActionState } from "react";
import { Input, Select } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { createCategoryAction, type AdminActionState } from "@/features/admin/categories/actions";

const initialState: AdminActionState = {};

export function CreateCategoryForm({
  parentOptions,
}: {
  parentOptions: { value: string; label: string }[];
}) {
  const [state, formAction, isPending] = useActionState(createCategoryAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4 rounded-2xl border border-ink-200 bg-white p-5">
      <h3 className="font-display text-lg font-semibold text-ink-900">Nueva categoría</h3>
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Nombre" name="name" placeholder="Ej. Herramientas" error={state.fieldErrors?.name} />
        <Input label="Slug" name="slug" placeholder="ej. herramientas" error={state.fieldErrors?.slug} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Select
          label="Categoría padre (opcional)"
          name="parentId"
          options={parentOptions}
          placeholder="Ninguna (categoría raíz)"
        />
        <Input label="Icono (opcional)" name="icon" placeholder="ej. wrench" error={state.fieldErrors?.icon} />
      </div>
      {state.formError && (
        <p role="alert" className="text-sm text-red-600">
          {state.formError}
        </p>
      )}
      <Button type="submit" disabled={isPending} className="self-start">
        {isPending ? "Creando..." : "Crear categoría"}
      </Button>
    </form>
  );
}
