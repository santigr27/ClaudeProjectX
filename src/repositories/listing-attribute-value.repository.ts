import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";

export async function upsertListingAttributeValue(
  listingId: string,
  attributeDefinitionId: string,
  value: Prisma.InputJsonValue,
) {
  return prisma.listingAttributeValue.upsert({
    where: { listingId_attributeDefinitionId: { listingId, attributeDefinitionId } },
    update: { value },
    create: { listingId, attributeDefinitionId, value },
  });
}

export async function findAttributeValuesByListingId(listingId: string) {
  return prisma.listingAttributeValue.findMany({
    where: { listingId },
    include: { attributeDefinition: true },
  });
}
