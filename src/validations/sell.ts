import { z } from "zod";

export const sellPropertySchema = z.object({
  listingType: z.enum(["sale", "rent"]),
  // The category is the single source of truth for "type" now — the
  // native `propertyType` enum column (still used for the real-estate
  // vertical's search filters) is derived server-side from the category's
  // nativeValue, never submitted directly. See features/sell/actions.ts.
  categoryId: z.string().min(1, "Selecciona un tipo"),
  title: z.string().trim().min(5, "Escribe un título descriptivo").max(150),
  description: z.string().trim().min(20, "Describe la propiedad con más detalle").max(3000),
  // Location fields are optional at this level because the form omits them
  // entirely (not just leaves them blank) when ENABLE_LOCATION is off, or
  // when the selected category has no location-relevant attribute — see
  // SellPropertyForm. A real-estate submission always has all three.
  address: z.string().trim().min(5, "Ingresa la dirección").optional(),
  locality: z.string().trim().min(1, "Selecciona una localidad").optional(),
  neighborhood: z.string().trim().min(1, "Selecciona un barrio").optional(),
  areaSqm: z.coerce.number().positive("El área debe ser mayor a 0").optional(),
  bedrooms: z.coerce.number().int().nonnegative().default(0),
  bathrooms: z.coerce.number().int().nonnegative().default(0),
  parkingSpaces: z.coerce.number().int().nonnegative().default(0),
  price: z.coerce.number().positive("Ingresa un precio válido"),
  administrationFee: z.coerce.number().nonnegative().optional(),
  estrato: z.coerce.number().int().min(1).max(6).optional(),
  amenities: z.array(z.string()).default([]),
  contactName: z.string().trim().min(2, "Ingresa tu nombre"),
  contactEmail: z.email("Ingresa un correo válido"),
  contactPhone: z
    .string()
    .trim()
    .regex(/^[+\d][\d\s-]{6,20}$/, "Ingresa un teléfono válido"),
});

export type SellPropertyInput = z.infer<typeof sellPropertySchema>;
