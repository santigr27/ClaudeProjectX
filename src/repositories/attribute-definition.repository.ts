import { prisma } from "@/lib/prisma";
import type { AttributeDataType, Prisma } from "@/generated/prisma/client";

export async function findAttributesByCategoryId(categoryId: string) {
  return prisma.attributeDefinition.findMany({
    where: { categoryId },
    orderBy: { sortOrder: "asc" },
  });
}

export interface CreateAttributeDefinitionInput {
  categoryId: string;
  name: string;
  key: string;
  dataType: AttributeDataType;
  required?: boolean;
  filterable?: boolean;
  searchable?: boolean;
  unit?: string | null;
  sortOrder?: number;
  options?: Prisma.InputJsonValue;
  nativeField?: string | null;
}

export async function createAttributeDefinition(input: CreateAttributeDefinitionInput) {
  return prisma.attributeDefinition.create({ data: input });
}
