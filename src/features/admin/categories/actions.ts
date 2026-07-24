"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { createCategory } from "@/repositories/category.repository";
import { createAttributeDefinition } from "@/repositories/attribute-definition.repository";
import { createCategorySchema, createAttributeSchema } from "@/validations/category";

export interface AdminActionState {
  fieldErrors?: Record<string, string>;
  formError?: string;
}

function fieldErrorsFrom(issues: { path: PropertyKey[]; message: string }[]) {
  const fieldErrors: Record<string, string> = {};
  for (const issue of issues) {
    const key = String(issue.path[0]);
    if (!fieldErrors[key]) fieldErrors[key] = issue.message;
  }
  return fieldErrors;
}

/**
 * Re-checked here even though `/admin/:path*` is also gated at the proxy
 * level (src/proxy.ts) — the route gate only confirms "logged in", never a
 * role, and a Server Action can be invoked directly. Same defense-in-depth
 * pattern as property ownership checks elsewhere in this codebase.
 */
async function requireAdmin(): Promise<AdminActionState | null> {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return { formError: "No tienes permisos de administrador." };
  }
  return null;
}

export async function createCategoryAction(
  _prevState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const denied = await requireAdmin();
  if (denied) return denied;

  const parsed = createCategorySchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    return { fieldErrors: fieldErrorsFrom(parsed.error.issues) };
  }

  await createCategory({
    name: parsed.data.name,
    slug: parsed.data.slug,
    parentId: parsed.data.parentId || null,
    icon: parsed.data.icon || null,
  });

  revalidatePath("/admin/categories");
  return {};
}

export async function createAttributeAction(
  _prevState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const denied = await requireAdmin();
  if (denied) return denied;

  const parsed = createAttributeSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    return { fieldErrors: fieldErrorsFrom(parsed.error.issues) };
  }

  const { categoryId, options, ...rest } = parsed.data;
  const optionList = options
    ? options.split(",").map((option) => option.trim()).filter(Boolean)
    : undefined;

  await createAttributeDefinition({
    categoryId,
    ...rest,
    options: optionList,
  });

  revalidatePath("/admin/categories");
  return {};
}
