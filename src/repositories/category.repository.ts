import { prisma } from "@/lib/prisma";

export async function findAllCategories() {
  return prisma.category.findMany({
    include: { attributes: { orderBy: { sortOrder: "asc" } }, parent: true },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
}

/**
 * Active, top-level categories with their attributes — what the sell form
 * and search filters render as the "type" selector. Excludes subcategories
 * (parentId set) since neither surface has a drill-down UI yet.
 */
export async function findActiveTopLevelCategories() {
  return prisma.category.findMany({
    where: { active: true, parentId: null },
    include: { attributes: { orderBy: { sortOrder: "asc" } } },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
}

export async function findCategoryBySlug(slug: string) {
  return prisma.category.findUnique({
    where: { slug },
    include: { attributes: { orderBy: { sortOrder: "asc" } } },
  });
}

/** Resolves the Category a native enum value (e.g. "APARTMENT") maps to —
 * see Category.nativeValue. Used server-side by the sell actions to find
 * which non-native attributes to save for a submission's selected type. */
export async function findCategoryByNativeValue(nativeValue: string) {
  return prisma.category.findFirst({
    where: { nativeValue },
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
