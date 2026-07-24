import { prisma } from "@/lib/prisma";

export async function findAllCategories() {
  return prisma.category.findMany({
    include: { attributes: { orderBy: { sortOrder: "asc" } }, parent: true },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
}

export async function findCategoryBySlug(slug: string) {
  return prisma.category.findUnique({
    where: { slug },
    include: { attributes: { orderBy: { sortOrder: "asc" } } },
  });
}

export async function findCategoryById(id: string) {
  return prisma.category.findUnique({
    where: { id },
    include: { attributes: { orderBy: { sortOrder: "asc" } } },
  });
}

export async function createCategory(input: {
  name: string;
  slug: string;
  parentId?: string | null;
  icon?: string | null;
  sortOrder?: number;
}) {
  return prisma.category.create({ data: input });
}
