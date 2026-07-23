import { prisma } from "@/lib/prisma";

export async function isFavorited(propertyId: string, sessionId: string): Promise<boolean> {
  const favorite = await prisma.favorite.findUnique({
    where: { propertyId_sessionId: { propertyId, sessionId } },
  });
  return favorite !== null;
}

export async function listFavoritedPropertyIds(sessionId: string): Promise<string[]> {
  const favorites = await prisma.favorite.findMany({
    where: { sessionId },
    select: { propertyId: true },
  });
  return favorites.map((favorite) => favorite.propertyId);
}

export async function addFavorite(propertyId: string, sessionId: string) {
  await prisma.favorite.upsert({
    where: { propertyId_sessionId: { propertyId, sessionId } },
    update: {},
    create: { propertyId, sessionId },
  });
}

export async function removeFavorite(propertyId: string, sessionId: string) {
  await prisma.favorite.deleteMany({ where: { propertyId, sessionId } });
}
