"use server";

import { createPropertySubmission } from "@/repositories/property-submission.repository";
import { sellPropertySchema } from "@/validations/sell";

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

export async function submitPropertyAction(
  _prevState: SellActionState,
  formData: FormData,
): Promise<SellActionState> {
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

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0]);
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { fieldErrors, values: raw as Record<string, string | string[]> };
  }

  try {
    const property = await createPropertySubmission(parsed.data);
    return { success: true, slug: property.slug };
  } catch {
    return {
      formError: "No pudimos enviar tu publicación. Inténtalo de nuevo.",
      values: raw as Record<string, string | string[]>,
    };
  }
}
