import { z } from "zod";

export const valuationModeSchema = z.enum(["sale", "rent"]);

export const propertyTypeInputSchema = z.enum([
  "apartment",
  "house",
  "studio",
  "penthouse",
  "commercial",
  "lot",
]);

export const valuationInputSchema = z.object({
  mode: valuationModeSchema,
  locality: z.string().min(1, "Selecciona una localidad"),
  neighborhood: z.string().min(1, "Selecciona un barrio"),
  propertyType: propertyTypeInputSchema,
  areaSqm: z.coerce.number().positive("El área debe ser mayor a 0"),
  bedrooms: z.coerce.number().int().nonnegative().default(0),
  bathrooms: z.coerce.number().int().nonnegative().default(0),
  parkingSpaces: z.coerce.number().int().nonnegative().default(0),
  propertyAge: z.coerce.number().int().nonnegative().default(0),
});

export type ValuationInput = z.infer<typeof valuationInputSchema>;
