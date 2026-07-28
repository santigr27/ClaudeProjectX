import { prisma } from "@/lib/prisma";
import { findCategoryById } from "@/repositories/category.repository";
import type { SellPropertyInput } from "@/validations/sell";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function findOrCreateSellerForSubmission(input: SellPropertyInput) {
  const existing = await prisma.sellerProfile.findUnique({ where: { email: input.contactEmail } });
  if (existing) return existing;

  return prisma.sellerProfile.create({
    data: {
      name: input.contactName,
      email: input.contactEmail,
      phone: input.contactPhone,
      whatsapp: input.contactPhone,
      title: "Propietario",
    },
  });
}

async function resolveAmenityIds(names: string[]): Promise<string[]> {
  const amenities = await Promise.all(
    names.map((name) =>
      prisma.amenity.upsert({
        where: { name },
        update: {},
        create: { name },
      }),
    ),
  );
  return amenities.map((amenity) => amenity.id);
}

const REAL_ESTATE_TYPES = ["APARTMENT", "HOUSE", "STUDIO", "PENTHOUSE", "COMMERCIAL", "LOT"] as const;
type RealEstateType = (typeof REAL_ESTATE_TYPES)[number];

function isRealEstateType(value: string | null): value is RealEstateType {
  return REAL_ESTATE_TYPES.includes(value as RealEstateType);
}

/**
 * Resolves the submitted categoryId into the fields that actually get
 * written: the native `propertyType` enum (only set when the category maps
 * onto one — see Category.nativeValue) plus Bogotá's default coordinates
 * (only meaningful for that same real-estate vertical; a category with no
 * native equivalent gets no coordinates at all rather than a wrong default).
 */
async function resolveCategoryFields(categoryId: string) {
  const category = await findCategoryById(categoryId);
  const propertyType = isRealEstateType(category?.nativeValue ?? null)
    ? (category!.nativeValue as RealEstateType)
    : null;

  return {
    category,
    propertyType,
    // Coordinates are unknown at submission time for the MVP even for real
    // estate (geocoding can be added later without changing this write
    // path); a non-real-estate vertical simply has no location concept yet.
    latitude: propertyType ? 4.65 : null,
    longitude: propertyType ? -74.1 : null,
  };
}

/**
 * Creates the property row itself. Photos are handled separately by the
 * caller via services/property-image.service.ts — uploaded files need to
 * be validated and persisted independently of this scalar-field write
 * (see features/sell/actions.ts).
 */
export async function createPropertySubmission(input: SellPropertyInput, ownerId: string) {
  const seller = await findOrCreateSellerForSubmission(input);
  const { category, propertyType, latitude, longitude } = await resolveCategoryFields(input.categoryId);

  const slugParts = [input.title, input.neighborhood ?? category?.name, input.areaSqm ? `${Math.round(input.areaSqm)}m2` : null];
  const baseSlug = slugify(slugParts.filter(Boolean).join("-"));
  const slug = `${baseSlug}-${Date.now().toString(36)}`;
  const amenityIds = await resolveAmenityIds(input.amenities);

  return prisma.listing.create({
    data: {
      slug,
      title: input.title,
      description: input.description,
      listingType: input.listingType === "sale" ? "SALE" : "RENT",
      categoryId: input.categoryId,
      propertyType,
      price: input.price,
      administrationFee: input.administrationFee ?? null,
      areaSqm: input.areaSqm ?? null,
      bedrooms: input.bedrooms,
      bathrooms: input.bathrooms,
      parkingSpaces: input.parkingSpaces,
      estrato: input.estrato ?? null,
      address: input.address ?? null,
      locality: input.locality ?? null,
      neighborhood: input.neighborhood ?? null,
      latitude,
      longitude,
      status: "PENDING_REVIEW",
      agentId: seller.id,
      ownerId,
      amenities: {
        create: amenityIds.map((amenityId) => ({ amenityId })),
      },
    },
  });
}

/**
 * Updates a property the caller already verified belongs to `ownerId`
 * (see repositories/property.repository.ts#findOwnedPropertyById). Fields
 * that aren't part of the sell form (status, ownerId, agentId, slug,
 * coordinates) are intentionally left untouched — editing a listing never
 * changes who owns it or its moderation status.
 */
export async function updateOwnedPropertySubmission(
  id: string,
  ownerId: string,
  input: SellPropertyInput,
) {
  const property = await prisma.listing.findFirst({ where: { id, ownerId }, select: { id: true } });
  if (!property) return null;

  const { propertyType } = await resolveCategoryFields(input.categoryId);
  const amenityIds = await resolveAmenityIds(input.amenities);

  return prisma.listing.update({
    where: { id },
    data: {
      title: input.title,
      description: input.description,
      listingType: input.listingType === "sale" ? "SALE" : "RENT",
      categoryId: input.categoryId,
      propertyType,
      price: input.price,
      administrationFee: input.administrationFee ?? null,
      areaSqm: input.areaSqm ?? null,
      bedrooms: input.bedrooms,
      bathrooms: input.bathrooms,
      parkingSpaces: input.parkingSpaces,
      estrato: input.estrato ?? null,
      address: input.address ?? null,
      locality: input.locality ?? null,
      neighborhood: input.neighborhood ?? null,
      amenities: {
        deleteMany: {},
        create: amenityIds.map((amenityId) => ({ amenityId })),
      },
    },
  });
}
