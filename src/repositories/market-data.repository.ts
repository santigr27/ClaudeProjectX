import { prisma } from "@/lib/prisma";

export async function findMarketData(locality: string, neighborhood: string) {
  return prisma.neighborhoodMarketData.findUnique({
    where: { locality_neighborhood: { locality, neighborhood } },
  });
}

export interface LocalityOption {
  locality: string;
  neighborhoods: string[];
}

export async function listLocalitiesWithNeighborhoods(): Promise<LocalityOption[]> {
  const rows = await prisma.neighborhoodMarketData.findMany({
    orderBy: [{ locality: "asc" }, { neighborhood: "asc" }],
    select: { locality: true, neighborhood: true },
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
