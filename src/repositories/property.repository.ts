import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { calculatePricePerSqm } from "@/lib/property-math";
import type {
  PropertyFilters,
  PropertySummary,
  PropertyWithRelations,
} from "@/types/property";

const SORT_TO_ORDER_BY: Record<
  NonNullable<PropertyFilters["sort"]>,
  Prisma.PropertyOrderByWithRelationInput[]
> = {
  recommended: [{ featured: "desc" }, { createdAt: "desc" }],
  price_asc: [{ price: "asc" }],
  price_desc: [{ price: "desc" }],
  newest: [{ createdAt: "desc" }],
  price_per_sqm_asc: [{ price: "asc" }], // refined below with in-memory sort (price/area ratio has no DB column)
};

export function buildWhere(filters: PropertyFilters): Prisma.PropertyWhereInput {
  const where: Prisma.PropertyWhereInput = {
    status: "PUBLISHED",
  };

  if (filters.listingType) where.listingType = filters.listingType;
  if (filters.propertyType?.length) where.propertyType = { in: filters.propertyType };
  if (filters.locality) where.locality = filters.locality;
  if (filters.neighborhood) where.neighborhood = filters.neighborhood;
  if (filters.bedrooms !== undefined) where.bedrooms = { gte: filters.bedrooms };
  if (filters.bathrooms !== undefined) where.bathrooms = { gte: filters.bathrooms };
  if (filters.parkingSpaces !== undefined) {
    where.parkingSpaces = { gte: filters.parkingSpaces };
  }

  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    where.price = {
      ...(filters.minPrice !== undefined ? { gte: filters.minPrice } : {}),
      ...(filters.maxPrice !== undefined ? { lte: filters.maxPrice } : {}),
    };
  }

  if (filters.minArea !== undefined || filters.maxArea !== undefined) {
    where.areaSqm = {
      ...(filters.minArea !== undefined ? { gte: filters.minArea } : {}),
      ...(filters.maxArea !== undefined ? { lte: filters.maxArea } : {}),
    };
  }

  if (filters.bbox) {
    where.latitude = { gte: filters.bbox.south, lte: filters.bbox.north };
    where.longitude = { gte: filters.bbox.west, lte: filters.bbox.east };
  }

  if (filters.q?.trim()) {
    const query = filters.q.trim();
    where.OR = [
      { title: { contains: query, mode: "insensitive" } },
      { address: { contains: query, mode: "insensitive" } },
      { neighborhood: { contains: query, mode: "insensitive" } },
      { locality: { contains: query, mode: "insensitive" } },
    ];
  }

  return where;
}

function toSummary(
  property: Prisma.PropertyGetPayload<{ include: { images: true } }>,
): PropertySummary {
  const cover = [...property.images].sort((a, b) => a.sortOrder - b.sortOrder)[0];
  return {
    id: property.id,
    slug: property.slug,
    title: property.title,
    listingType: property.listingType,
    propertyType: property.propertyType,
    price: property.price,
    areaSqm: property.areaSqm,
    bedrooms: property.bedrooms,
    bathrooms: property.bathrooms,
    parkingSpaces: property.parkingSpaces,
    locality: property.locality,
    neighborhood: property.neighborhood,
    latitude: property.latitude,
    longitude: property.longitude,
    featured: property.featured,
    coverImageUrl: cover?.imageUrl ?? null,
  };
}

export async function findProperties(filters: PropertyFilters) {
  const page = filters.page && filters.page > 0 ? filters.page : 1;
  const pageSize = filters.pageSize && filters.pageSize > 0 ? filters.pageSize : 12;
  const where = buildWhere(filters);
  const sort = filters.sort ?? "recommended";

  const [rows, total] = await Promise.all([
    prisma.property.findMany({
      where,
      include: { images: true },
      orderBy: SORT_TO_ORDER_BY[sort],
      // price_per_sqm_asc is computed in-memory below, so over-fetch a stable window
      skip: sort === "price_per_sqm_asc" ? 0 : (page - 1) * pageSize,
      take: sort === "price_per_sqm_asc" ? undefined : pageSize,
    }),
    prisma.property.count({ where }),
  ]);

  let summaries = rows.map(toSummary);

  if (sort === "price_per_sqm_asc") {
    summaries = summaries
      .sort((a, b) => calculatePricePerSqm(a.price, a.areaSqm) - calculatePricePerSqm(b.price, b.areaSqm))
      .slice((page - 1) * pageSize, (page - 1) * pageSize + pageSize);
  }

  return {
    properties: summaries,
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function findPropertyBySlug(
  slug: string,
): Promise<PropertyWithRelations | null> {
  return prisma.property.findUnique({
    where: { slug },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      agent: true,
      amenities: { include: { amenity: true } },
    },
  });
}

export async function findFeaturedProperties(limit = 6): Promise<PropertySummary[]> {
  const rows = await prisma.property.findMany({
    where: { status: "PUBLISHED", featured: true },
    include: { images: true },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
  return rows.map(toSummary);
}

export async function findPropertiesByIds(ids: string[]): Promise<PropertySummary[]> {
  if (ids.length === 0) return [];
  const rows = await prisma.property.findMany({
    where: { id: { in: ids }, status: "PUBLISHED" },
    include: { images: true },
  });
  return rows.map(toSummary);
}

export async function listDistinctLocalities(): Promise<string[]> {
  const rows = await prisma.property.findMany({
    where: { status: "PUBLISHED" },
    select: { locality: true },
    distinct: ["locality"],
    orderBy: { locality: "asc" },
  });
  return rows.map((row) => row.locality);
}

export interface OwnerPropertySummary {
  id: string;
  slug: string;
  title: string;
  listingType: PropertySummary["listingType"];
  status: Prisma.PropertyGetPayload<{ select: { status: true } }>["status"];
  price: number;
  neighborhood: string;
  createdAt: Date;
  coverImageUrl: string | null;
}

/** All of a user's own listings, any status — powers /dashboard. Never
 * exposed to other users; callers must pass the authenticated user's id. */
export async function findPropertiesByOwner(ownerId: string): Promise<OwnerPropertySummary[]> {
  const rows = await prisma.property.findMany({
    where: { ownerId },
    include: { images: true },
    orderBy: { createdAt: "desc" },
  });

  return rows.map((property) => {
    const cover = [...property.images].sort((a, b) => a.sortOrder - b.sortOrder)[0];
    return {
      id: property.id,
      slug: property.slug,
      title: property.title,
      listingType: property.listingType,
      status: property.status,
      price: property.price,
      neighborhood: property.neighborhood,
      createdAt: property.createdAt,
      coverImageUrl: cover?.imageUrl ?? null,
    };
  });
}

export async function countPropertiesByOwnerAndStatus(
  ownerId: string,
): Promise<Record<"PUBLISHED" | "PENDING_REVIEW" | "DRAFT" | "REJECTED", number>> {
  const rows = await prisma.property.groupBy({
    by: ["status"],
    where: { ownerId },
    _count: true,
  });

  const counts = { PUBLISHED: 0, PENDING_REVIEW: 0, DRAFT: 0, REJECTED: 0 };
  for (const row of rows) {
    counts[row.status] = row._count;
  }
  return counts;
}

/** Fetches a property for the edit flow, scoped to its owner — returns
 * null both when the property doesn't exist AND when it belongs to
 * someone else, so callers can't distinguish "not found" from "not
 * yours" and leak which ids exist. */
export async function findOwnedPropertyById(id: string, ownerId: string) {
  return prisma.property.findFirst({
    where: { id, ownerId },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      amenities: { include: { amenity: true } },
    },
  });
}

export interface LocalityWithNeighborhoods {
  locality: string;
  neighborhoods: string[];
}

/**
 * Distinct locality/neighborhood pairs actually present in published
 * listings, used to populate the /properties filter dropdowns so they
 * never offer a combination with zero results.
 */
export async function listDistinctLocalitiesWithNeighborhoods(): Promise<LocalityWithNeighborhoods[]> {
  const rows = await prisma.property.findMany({
    where: { status: "PUBLISHED" },
    select: { locality: true, neighborhood: true },
    distinct: ["locality", "neighborhood"],
    orderBy: [{ locality: "asc" }, { neighborhood: "asc" }],
  });

  const byLocality = new Map<string, string[]>();
  for (const row of rows) {
    const list = byLocality.get(row.locality) ?? [];
    list.push(row.neighborhood);
    byLocality.set(row.locality, list);
  }

  return Array.from(byLocality.entries()).map(([locality, neighborhoods]) => ({
    locality,
    neighborhoods,
  }));
}
