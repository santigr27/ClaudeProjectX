import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { findAllCategories } from "@/repositories/category.repository";
import { CreateCategoryForm } from "@/components/admin/CreateCategoryForm";
import { CreateAttributeForm } from "@/components/admin/CreateAttributeForm";

export const metadata: Metadata = {
  title: "Categorías — Admin",
};

const DATA_TYPE_LABELS: Record<string, string> = {
  TEXT: "Texto",
  NUMBER: "Número",
  BOOLEAN: "Sí/No",
  SELECT: "Selección única",
  MULTI_SELECT: "Selección múltiple",
  DATE: "Fecha",
};

/**
 * The category/attribute builder: the core white-label mechanism that lets
 * a new marketplace vertical (hardware, food, ...) define its own browse
 * tree and per-category fields without a code change. Deliberately plain —
 * this is an internal tool, not a customer-facing page.
 */
export default async function AdminCategoriesPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/admin/categories");
  // Route-level gate (proxy.ts) only confirms "logged in" — the role check
  // has to happen here too, same defense-in-depth pattern as property
  // ownership checks elsewhere in this codebase.
  if (session.user.role !== "ADMIN") notFound();

  const categories = await findAllCategories();

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-semibold text-ink-900">Categorías y atributos</h1>
        <p className="mt-2 text-ink-500">
          Define la estructura de categorías y sus campos — esto controla el formulario de publicar y
          los filtros de búsqueda sin necesidad de cambiar código.
        </p>
      </div>

      <div className="mb-10 flex flex-col gap-6">
        {categories.map((category) => (
          <div key={category.id} className="rounded-2xl border border-ink-100 bg-white p-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display text-lg font-semibold text-ink-900">{category.name}</h2>
                <p className="text-xs text-ink-500">
                  /{category.slug} {category.parent && `· subcategoría de ${category.parent.name}`}
                </p>
              </div>
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                  category.active ? "bg-accent-50 text-accent-700" : "bg-ink-100 text-ink-500"
                }`}
              >
                {category.active ? "Activa" : "Inactiva"}
              </span>
            </div>

            {category.attributes.length > 0 ? (
              <table className="mt-4 w-full text-left text-sm">
                <thead>
                  <tr className="text-xs uppercase text-ink-400">
                    <th className="pb-2 font-medium">Nombre</th>
                    <th className="pb-2 font-medium">Clave</th>
                    <th className="pb-2 font-medium">Tipo</th>
                    <th className="pb-2 font-medium">Filtrable</th>
                    <th className="pb-2 font-medium">Requerido</th>
                  </tr>
                </thead>
                <tbody>
                  {category.attributes.map((attribute) => (
                    <tr key={attribute.id} className="border-t border-ink-100">
                      <td className="py-2 text-ink-800">
                        {attribute.name}
                        {attribute.unit && <span className="text-ink-400"> ({attribute.unit})</span>}
                      </td>
                      <td className="py-2 font-mono text-xs text-ink-500">{attribute.key}</td>
                      <td className="py-2 text-ink-600">{DATA_TYPE_LABELS[attribute.dataType]}</td>
                      <td className="py-2 text-ink-600">{attribute.filterable ? "Sí" : "No"}</td>
                      <td className="py-2 text-ink-600">{attribute.required ? "Sí" : "No"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="mt-3 text-sm text-ink-400">Sin atributos todavía.</p>
            )}
          </div>
        ))}

        {categories.length === 0 && (
          <p className="rounded-2xl border border-dashed border-ink-200 p-6 text-center text-sm text-ink-500">
            Aún no hay categorías. Crea la primera con el formulario de abajo.
          </p>
        )}
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <CreateCategoryForm
          parentOptions={categories.map((category) => ({ value: category.id, label: category.name }))}
        />
        <CreateAttributeForm
          categoryOptions={categories.map((category) => ({ value: category.id, label: category.name }))}
        />
      </div>
    </div>
  );
}
