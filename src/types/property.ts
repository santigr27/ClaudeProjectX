import type {
  SellerProfile,
  ListingType,
  Listing,
  ListingImage,
  PropertyType,
  AttributeDefinition,
} from "@/generated/prisma/client";

export type { ListingType, PropertyType };

export type PropertyWithRelations = Listing & {
  images: ListingImage[];
  seller: SellerProfile | null;
  amenities: { amenity: { id: string; name: string } }[];
  category: { name: string } | null;
  attributeValues: {
    value: unknown;
    attributeDefinition: AttributeDefinition;
  }[];
};

export type PropertySummary = Pick<
  Listing,
  | "id"
  | "slug"
  | "title"
  | "listingType"
  | "propertyType"
  | "price"
  | "areaSqm"
  | "bedrooms"
  | "bathrooms"
  | "parkingSpaces"
  | "locality"
  | "neighborhood"
  | "latitude"
  | "longitude"
  | "featured"
> & {
  coverImageUrl: string | null;
  /** Universal type label — read this instead of `propertyType` wherever
   * possible, since it's set for every listing (real estate included, via
   * backfill) while `propertyType` only exists for the native enum values. */
  categoryName: string | null;
};

export interface PropertyFilters {
  listingType?: ListingType;
  propertyType?: PropertyType[];
  /** Generic category filter — works for any category regardless of
   * whether it has a native propertyType equivalent (see
   * Category.nativeValue). */
  categoryId?: string;
  locality?: string;
  neighborhood?: string;
  minPrice?: number;
  maxPrice?: number;
  minArea?: number;
  maxArea?: number;
  bedrooms?: number;
  bathrooms?: number;
  parkingSpaces?: number;
  bbox?: { north: number; south: number; east: number; west: number };
  q?: string;
  page?: number;
  pageSize?: number;
  sort?: PropertySort;
}

export type PropertySort =
  | "recommended"
  | "price_asc"
  | "price_desc"
  | "newest"
  | "price_per_sqm_asc";

export interface PropertySearchResult {
  properties: PropertySummary[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
