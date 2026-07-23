import { prisma } from "@/lib/prisma";

export interface CreateImageInput {
  propertyId: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  imageData: Uint8Array<ArrayBuffer>;
  sortOrder: number;
}

/**
 * Two-step create because the served URL embeds the row's own generated
 * id (`/api/property-images/{id}`), which only exists after the insert.
 */
export async function createImage(input: CreateImageInput) {
  const created = await prisma.propertyImage.create({
    data: { ...input, imageUrl: "" },
  });
  return prisma.propertyImage.update({
    where: { id: created.id },
    data: { imageUrl: `/api/property-images/${created.id}` },
  });
}

export async function findImageById(id: string) {
  return prisma.propertyImage.findUnique({ where: { id } });
}

export async function findImagesByPropertyId(propertyId: string) {
  return prisma.propertyImage.findMany({
    where: { propertyId },
    orderBy: { sortOrder: "asc" },
  });
}

export async function countImagesByPropertyId(propertyId: string): Promise<number> {
  return prisma.propertyImage.count({ where: { propertyId } });
}

export async function deleteImageById(id: string) {
  await prisma.propertyImage.deleteMany({ where: { id } });
}
