import { z } from "zod";

export const createCategorySchema = z.object({
  name: z.string().trim().min(2, "Escribe un nombre").max(80),
  slug: z
    .string()
    .trim()
    .min(2, "Escribe un slug")
    .max(80)
    .regex(/^[a-z0-9-]+$/, "Usa minúsculas, números y guiones, sin espacios"),
  parentId: z.string().trim().optional(),
  icon: z.string().trim().max(50).optional(),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;

export const attributeDataTypes = ["TEXT", "NUMBER", "BOOLEAN", "SELECT", "MULTI_SELECT", "DATE"] as const;

export const createAttributeSchema = z.object({
  categoryId: z.string().min(1, "Selecciona una categoría"),
  name: z.string().trim().min(2, "Escribe un nombre").max(80),
  key: z
    .string()
    .trim()
    .min(2, "Escribe una clave")
    .max(50)
    .regex(/^[a-z][a-zA-Z0-9]*$/, "Usa camelCase, ej. voltage"),
  dataType: z.enum(attributeDataTypes),
  required: z
    .union([z.literal("on"), z.literal("true")])
    .optional()
    .transform((value) => value !== undefined),
  filterable: z
    .union([z.literal("on"), z.literal("true")])
    .optional()
    .transform((value) => value !== undefined),
  searchable: z
    .union([z.literal("on"), z.literal("true")])
    .optional()
    .transform((value) => value !== undefined),
  unit: z.string().trim().max(20).optional(),
  // Comma-separated list, only meaningful for SELECT/MULTI_SELECT.
  options: z.string().trim().max(500).optional(),
});

export type CreateAttributeInput = z.infer<typeof createAttributeSchema>;
