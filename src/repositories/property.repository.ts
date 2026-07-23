import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
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

function buildWhere(filters: PropertyFilters): Prisma.PropertyWhereInput {
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
      .sort((a, b) => a.price / a.areaSqm - b.price / b.areaSqm)
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
