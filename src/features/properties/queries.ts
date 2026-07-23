import {
  findFeaturedProperties,
  findPropertyBySlug,
  findProperties,
  listDistinctLocalitiesWithNeighborhoods,
} from "@/repositories/property.repository";
import type { PropertySearchParams } from "@/validations/property-filters";
import type { PropertyFilters, PropertyType } from "@/types/property";
import { searchConfig } from "@/config/site";

const PROPERTY_TYPE_MAP: Record<string, PropertyType> = {
  apartment: "APARTMENT",
  house: "HOUSE",
  studio: "STUDIO",
  penthouse: "PENTHOUSE",
  commercial: "COMMERCIAL",
  lot: "LOT",
};

export function toPropertyFilters(params: PropertySearchParams): PropertyFilters {
  const propertyTypeRaw = params.propertyType
    ? Array.isArray(params.propertyType)
      ? params.propertyType
      : [params.propertyType]
    : undefined;

  return {
    listingType: params.listingType === "sale" ? "SALE" : params.listingType === "rent" ? "RENT" : undefined,
    propertyType: propertyTypeRaw?.map((value) => PROPERTY_TYPE_MAP[value]).filter(Boolean),
    locality: params.locality,
    neighborhood: params.neighborhood,
    minPrice: params.minPrice,
    maxPrice: params.maxPrice,
    minArea: params.minArea,
    maxArea: params.maxArea,
    bedrooms: params.bedrooms,
    bathrooms: params.bathrooms,
    parkingSpaces: params.parkingSpaces,
    sort: params.sort,
    q: params.q,
    page: params.page,
    pageSize: searchConfig.pageSize,
    bbox:
      params.north !== undefined &&
      params.south !== undefined &&
      params.east !== undefined &&
      params.west !== undefined
        ? { north: params.north, south: params.south, east: params.east, west: params.west }
        : undefined,
  };
}

export async function getPropertySearchResults(params: PropertySearchParams) {
  return findProperties(toPropertyFilters(params));
}

export async function getPropertyDetail(slug: string) {
  return findPropertyBySlug(slug);
}

export async function getFeaturedProperties(limit?: number) {
  return findFeaturedProperties(limit);
}

export async function getPropertyFilterOptions() {
  return listDistinctLocalitiesWithNeighborhoods();
}
