import { z } from "zod";

export const listingTypeParam = z.enum(["sale", "rent"]);

export const propertyTypeParam = z.enum([
  "apartment",
  "house",
  "studio",
  "penthouse",
  "commercial",
  "lot",
]);

export const propertySortParam = z.enum([
  "recommended",
  "price_asc",
  "price_desc",
  "newest",
  "price_per_sqm_asc",
]);

/**
 * Schema for the raw `?key=value` search params on /properties.
 * Every field is optional and string-based since that is how URL query
 * parameters arrive; numeric/enum coercion happens here.
 */
export const propertySearchParamsSchema = z.object({
  listingType: listingTypeParam.optional(),
  propertyType: z
    .union([propertyTypeParam, z.array(propertyTypeParam)])
    .optional(),
  locality: z.string().min(1).optional(),
  neighborhood: z.string().min(1).optional(),
  minPrice: z.coerce.number().nonnegative().optional(),
  maxPrice: z.coerce.number().nonnegative().optional(),
  minArea: z.coerce.number().nonnegative().optional(),
  maxArea: z.coerce.number().nonnegative().optional(),
  bedrooms: z.coerce.number().int().nonnegative().optional(),
  bathrooms: z.coerce.number().int().nonnegative().optional(),
  parkingSpaces: z.coerce.number().int().nonnegative().optional(),
  sort: propertySortParam.optional(),
  page: z.coerce.number().int().positive().optional(),
  north: z.coerce.number().optional(),
  south: z.coerce.number().optional(),
  east: z.coerce.number().optional(),
  west: z.coerce.number().optional(),
  q: z.string().optional(),
});

export type PropertySearchParams = z.infer<typeof propertySearchParamsSchema>;
