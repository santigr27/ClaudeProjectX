import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";

/**
 * Single-row config for the one active marketplace this deployment serves.
 * There is intentionally no "find by tenant" — see prisma/schema.prisma.
 */
export async function findMarketplaceConfig() {
  return prisma.marketplaceConfig.findFirst({ orderBy: { createdAt: "asc" } });
}

export async function updateMarketplaceConfig(
  id: string,
  data: Prisma.MarketplaceConfigUpdateInput,
) {
  return prisma.marketplaceConfig.update({ where: { id }, data });
}
