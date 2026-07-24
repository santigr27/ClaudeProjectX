import { prisma } from "@/lib/prisma";

export async function findAllFeatureFlags() {
  return prisma.featureFlag.findMany({ orderBy: { key: "asc" } });
}

export async function setFeatureFlag(key: string, enabled: boolean) {
  return prisma.featureFlag.upsert({
    where: { key },
    update: { enabled },
    create: { key, enabled },
  });
}
