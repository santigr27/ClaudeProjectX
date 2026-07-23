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

async function findOrCreateAgentForSubmission(input: SellPropertyInput) {
  const existing = await prisma.agent.findUnique({ where: { email: input.contactEmail } });
  if (existing) return existing;

  return prisma.agent.create({
    data: {
      name: input.contactName,
      email: input.contactEmail,
      phone: input.contactPhone,
      whatsapp: input.contactPhone,
      title: "Propietario",
    },
  });
}

export async function createPropertySubmission(input: SellPropertyInput, ownerId: string) {
  const agent = await findOrCreateAgentForSubmission(input);
  const baseSlug = slugify(`${input.title}-${input.neighborhood}-${Math.round(input.areaSqm)}m2`);
  const slug = `${baseSlug}-${Date.now().toString(36)}`;

  const amenityRecords = await Promise.all(
    input.amenities.map((name) =>
      prisma.amenity.upsert({
        where: { name },
        update: {},
        create: { name },
      }),
    ),
  );

  return prisma.property.create({
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
      agentId: agent.id,
      ownerId,
      images: {
        create: input.images.map((imageUrl, index) => ({ imageUrl, sortOrder: index })),
      },
      amenities: {
        create: amenityRecords.map((amenity) => ({ amenityId: amenity.id })),
      },
    },
  });
}
