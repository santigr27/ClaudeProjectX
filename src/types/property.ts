import type {
  Agent,
  ListingType,
  Property,
  PropertyImage,
  PropertyType,
} from "@/generated/prisma/client";

export type { ListingType, PropertyType };

export type PropertyWithRelations = Property & {
  images: PropertyImage[];
  agent: Agent | null;
  amenities: { amenity: { id: string; name: string } }[];
};

export type PropertySummary = Pick<
  Property,
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
};

export interface PropertyFilters {
  listingType?: ListingType;
  propertyType?: PropertyType[];
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
