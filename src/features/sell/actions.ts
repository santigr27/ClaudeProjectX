"use server";

import { createPropertySubmission } from "@/repositories/property-submission.repository";
import { sellPropertySchema } from "@/validations/sell";

export interface SellActionState {
  success?: boolean;
  slug?: string;
  fieldErrors?: Record<string, string>;
  formError?: string;
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

  const raw = {
    ...Object.fromEntries(formData.entries()),
    amenities,
    images,
  };

  const parsed = sellPropertySchema.safeParse(raw);

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0]);
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { fieldErrors };
  }

  try {
    const property = await createPropertySubmission(parsed.data);
    return { success: true, slug: property.slug };
  } catch {
    return { formError: "No pudimos enviar tu publicación. Inténtalo de nuevo." };
  }
}
