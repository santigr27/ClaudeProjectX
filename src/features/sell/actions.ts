"use server";

import { auth } from "@/lib/auth";
import {
  createPropertySubmission,
  updateOwnedPropertySubmission,
} from "@/repositories/property-submission.repository";
import { countImagesByPropertyId } from "@/repositories/property-image.repository";
import { assertCanAddImages, saveImage, InvalidImageError } from "@/services/property-image.service";
import { findCategoryByNativeValue } from "@/repositories/category.repository";
import { upsertListingAttributeValue } from "@/repositories/listing-attribute-value.repository";
import { sellPropertySchema, type SellPropertyInput } from "@/validations/sell";
import type { AttributeDefinition } from "@/generated/prisma/client";

export interface SellActionState {
  success?: boolean;
  slug?: string;
  fieldErrors?: Record<string, string>;
  formError?: string;
  /** Echoes back the raw submitted values so the form can restore them
   * after a validation error instead of reverting every uncontrolled
   * field to its original default. Never includes files — browsers won't
   * let a file input's value be restored programmatically anyway. */
  values?: Record<string, string | string[]>;
}

type ParsedSellForm =
  | { success: true; data: SellPropertyInput }
  | { success: false; state: SellActionState };

function parseSellFormData(formData: FormData): ParsedSellForm {
  const amenities = formData.getAll("amenities").map(String);

  const raw: Record<string, unknown> = {
    ...Object.fromEntries(formData.entries()),
    amenities,
  };

  // Optional numeric fields arrive as "" when left blank; Number("") coerces
  // to 0 rather than "not provided", which would wrongly fail estrato's
  // min(1) check. Treat blank as absent so `.optional()` applies correctly.
  for (const key of ["administrationFee", "estrato"]) {
    if (raw[key] === "") delete raw[key];
  }

  const parsed = sellPropertySchema.safeParse(raw);

  // The raw entries include any File objects from the image input, which
  // can't be serialized back into `values` (and shouldn't be — file inputs
  // never restore programmatically). Strip them before echoing.
  const values = Object.fromEntries(
    Object.entries(raw).filter(([, value]) => !(value instanceof File)),
  ) as Record<string, string | string[]>;

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

function extractImageFiles(formData: FormData): File[] {
  return formData
    .getAll("imageFiles")
    .filter((entry): entry is File => entry instanceof File && entry.size > 0);
}

/**
 * Saves the category's custom (non-native) attributes for this listing —
 * the true EAV path a new vertical (hardware, food, ...) would use, since
 * real estate's fields (bedrooms, area, ...) all map onto native columns
 * instead (see AttributeDefinition.nativeField and the sell form's
 * category-driven field rendering). Every real-estate category has zero
 * such attributes today, so this is a no-op for the live vertical until an
 * admin adds one via /admin/categories.
 */
async function saveExtraAttributes(
  listingId: string,
  categoryPropertyType: string,
  formData: FormData,
): Promise<void> {
  const category = await findCategoryByNativeValue(categoryPropertyType.toUpperCase());
  if (!category) return;

  const extraAttributes = category.attributes.filter(
    (attribute: AttributeDefinition) => !attribute.nativeField,
  );

  await Promise.all(
    extraAttributes.map(async (attribute: AttributeDefinition) => {
      const fieldName = `attr_${attribute.key}`;

      if (attribute.dataType === "MULTI_SELECT") {
        const values = formData.getAll(fieldName).map(String).filter(Boolean);
        if (values.length > 0) {
          await upsertListingAttributeValue(listingId, attribute.id, values);
        }
        return;
      }

      if (attribute.dataType === "BOOLEAN") {
        await upsertListingAttributeValue(listingId, attribute.id, formData.get(fieldName) != null);
        return;
      }

      const raw = formData.get(fieldName);
      if (raw === null || String(raw).trim() === "") return;
      const value = attribute.dataType === "NUMBER" ? Number(raw) : String(raw);
      await upsertListingAttributeValue(listingId, attribute.id, value);
    }),
  );
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

  const imageFiles = extractImageFiles(formData);

  try {
    // Validate every photo before writing anything, so a bad file never
    // leaves a property with only some of its photos saved.
    await assertCanAddImages(null, imageFiles);
  } catch (error) {
    if (error instanceof InvalidImageError) {
      return { fieldErrors: { images: error.message } };
    }
    throw error;
  }

  try {
    const property = await createPropertySubmission(parsed.data, session.user.id);
    await Promise.all([
      ...imageFiles.map((file, index) => saveImage(property.id, file, index)),
      saveExtraAttributes(property.id, parsed.data.propertyType, formData),
    ]);
    return { success: true, slug: property.slug };
  } catch {
    return { formError: "No pudimos enviar tu publicación. Inténtalo de nuevo." };
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

  const imageFiles = extractImageFiles(formData);

  try {
    await assertCanAddImages(propertyId, imageFiles);
  } catch (error) {
    if (error instanceof InvalidImageError) {
      return { fieldErrors: { images: error.message } };
    }
    throw error;
  }

  try {
    const property = await updateOwnedPropertySubmission(propertyId, session.user.id, parsed.data);
    if (!property) {
      // Either the property doesn't exist, or it belongs to someone else —
      // same message either way so we don't leak which id exists.
      return { formError: "No tienes permiso para editar esta propiedad." };
    }

    const existingImageCount = await countImagesByPropertyId(propertyId);
    await Promise.all([
      ...imageFiles.map((file, index) => saveImage(property.id, file, existingImageCount + index)),
      saveExtraAttributes(property.id, parsed.data.propertyType, formData),
    ]);

    return { success: true, slug: property.slug };
  } catch {
    return { formError: "No pudimos guardar los cambios. Inténtalo de nuevo." };
  }
}
