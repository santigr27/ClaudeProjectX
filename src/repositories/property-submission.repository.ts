import { prisma } from "@/lib/prisma";
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

/**
 * Creates the property row itself. Photos are handled separately by the
 * caller via services/property-image.service.ts — uploaded files need to
 * be validated and persisted independently of this scalar-field write
 * (see features/sell/actions.ts).
 */
export async function createPropertySubmission(input: SellPropertyInput, ownerId: string) {
  const seller = await findOrCreateSellerForSubmission(input);
  const baseSlug = slugify(`${input.title}-${input.neighborhood}-${Math.round(input.areaSqm)}m2`);
  const slug = `${baseSlug}-${Date.now().toString(36)}`;
  const amenityIds = await resolveAmenityIds(input.amenities);

  return prisma.listing.create({
    data: {
      slug,
      title: input.title,
      description: input.description,
      listingType: input.listingType === "sale" ? "SALE" : "RENT",
      propertyType: input.propertyType.toUpperCase() as
        | "APARTMENT"
        | "HOUSE"
        | "STUDIO"
        | "PENTHOUSE"
        | "COMMERCIAL"
        | "LOT",
      price: input.price,
      administrationFee: input.administrationFee ?? null,
      areaSqm: input.areaSqm,
      bedrooms: input.bedrooms,
      bathrooms: input.bathrooms,
      parkingSpaces: input.parkingSpaces,
      estrato: input.estrato ?? null,
      address: input.address,
      locality: input.locality,
      neighborhood: input.neighborhood,
      // Coordinates are unknown at submission time for the MVP; geocoding
      // can be added later without changing this write path.
      latitude: 4.65,
      longitude: -74.1,
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

  const amenityIds = await resolveAmenityIds(input.amenities);

  return prisma.listing.update({
    where: { id },
    data: {
      title: input.title,
      description: input.description,
      listingType: input.listingType === "sale" ? "SALE" : "RENT",
      propertyType: input.propertyType.toUpperCase() as
        | "APARTMENT"
        | "HOUSE"
        | "STUDIO"
        | "PENTHOUSE"
        | "COMMERCIAL"
        | "LOT",
      price: input.price,
      administrationFee: input.administrationFee ?? null,
      areaSqm: input.areaSqm,
      bedrooms: input.bedrooms,
      bathrooms: input.bathrooms,
      parkingSpaces: input.parkingSpaces,
      estrato: input.estrato ?? null,
      address: input.address,
      locality: input.locality,
      neighborhood: input.neighborhood,
      amenities: {
        deleteMany: {},
        create: amenityIds.map((amenityId) => ({ amenityId })),
      },
    },
  });
}
