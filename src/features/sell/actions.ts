"use server";

import { auth } from "@/lib/auth";
import {
  createPropertySubmission,
  updateOwnedPropertySubmission,
} from "@/repositories/property-submission.repository";
import { sellPropertySchema, type SellPropertyInput } from "@/validations/sell";

export interface SellActionState {
  success?: boolean;
  slug?: string;
  fieldErrors?: Record<string, string>;
  formError?: string;
  /** Echoes back the raw submitted values so the form can restore them
   * after a validation error instead of reverting every uncontrolled
   * field to its original default. */
  values?: Record<string, string | string[]>;
}

type ParsedSellForm =
  | { success: true; data: SellPropertyInput }
  | { success: false; state: SellActionState };

function parseSellFormData(formData: FormData): ParsedSellForm {
  const amenities = formData.getAll("amenities").map(String);
  const images = formData
    .getAll("images")
    .map(String)
    .filter((value) => value.trim().length > 0);

  const raw: Record<string, unknown> = {
    ...Object.fromEntries(formData.entries()),
    amenities,
    images,
  };

  // Optional numeric fields arrive as "" when left blank; Number("") coerces
  // to 0 rather than "not provided", which would wrongly fail estrato's
  // min(1) check. Treat blank as absent so `.optional()` applies correctly.
  for (const key of ["administrationFee", "estrato"]) {
    if (raw[key] === "") delete raw[key];
  }

  const parsed = sellPropertySchema.safeParse(raw);
  const values = raw as Record<string, string | string[]>;

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0]);
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { success: false, state: { fieldErrors, values } };
  }

  return { success: true, data: parsed.data };
}

export async function submitPropertyAction(
  _prevState: SellActionState,
  formData: FormData,
): Promise<SellActionState> {
  // The route is already gated by proxy.ts, but never trust that alone for
  // a write that assigns ownership — resolve the session server-side here
  // too, and never accept an ownerId from the client.
  const session = await auth();
  if (!session?.user?.id) {
    return { formError: "Debes iniciar sesión para publicar una propiedad." };
  }

  const parsed = parseSellFormData(formData);
  if (!parsed.success) return parsed.state;

  try {
    const property = await createPropertySubmission(parsed.data, session.user.id);
    return { success: true, slug: property.slug };
  } catch {
    return {
      formError: "No pudimos enviar tu publicación. Inténtalo de nuevo.",
      values: Object.fromEntries(formData.entries()) as Record<string, string>,
    };
  }
}

export async function updatePropertyAction(
  _prevState: SellActionState,
  formData: FormData,
): Promise<SellActionState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { formError: "Debes iniciar sesión para editar esta propiedad." };
  }

  const propertyId = String(formData.get("propertyId") ?? "");
  if (!propertyId) {
    return { formError: "No pudimos identificar la propiedad a editar." };
  }

  const parsed = parseSellFormData(formData);
  if (!parsed.success) return parsed.state;

  try {
    const property = await updateOwnedPropertySubmission(propertyId, session.user.id, parsed.data);
    if (!property) {
      // Either the property doesn't exist, or it belongs to someone else —
      // same message either way so we don't leak which id exists.
      return { formError: "No tienes permiso para editar esta propiedad." };
    }
    return { success: true, slug: property.slug };
  } catch {
    return { formError: "No pudimos guardar los cambios. Inténtalo de nuevo." };
  }
}
