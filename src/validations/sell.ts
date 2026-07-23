import { z } from "zod";

export const sellPropertySchema = z.object({
  listingType: z.enum(["sale", "rent"]),
  propertyType: z.enum([
    "apartment",
    "house",
    "studio",
    "penthouse",
    "commercial",
    "lot",
  ]),
  title: z.string().trim().min(5, "Escribe un título descriptivo").max(150),
  description: z.string().trim().min(20, "Describe la propiedad con más detalle").max(3000),
  address: z.string().trim().min(5, "Ingresa la dirección"),
  locality: z.string().trim().min(1, "Selecciona una localidad"),
  neighborhood: z.string().trim().min(1, "Selecciona un barrio"),
  areaSqm: z.coerce.number().positive("El área debe ser mayor a 0"),
  bedrooms: z.coerce.number().int().nonnegative().default(0),
  bathrooms: z.coerce.number().int().nonnegative().default(0),
  parkingSpaces: z.coerce.number().int().nonnegative().default(0),
  price: z.coerce.number().positive("Ingresa un precio válido"),
  administrationFee: z.coerce.number().nonnegative().optional(),
  estrato: z.coerce.number().int().min(1).max(6).optional(),
  amenities: z.array(z.string()).default([]),
  images: z.array(z.string()).default([]),
  contactName: z.string().trim().min(2, "Ingresa tu nombre"),
  contactEmail: z.email("Ingresa un correo válido"),
  contactPhone: z
    .string()
    .trim()
    .regex(/^[+\d][\d\s-]{6,20}$/, "Ingresa un teléfono válido"),
});

export type SellPropertyInput = z.infer<typeof sellPropertySchema>;
