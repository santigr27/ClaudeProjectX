import { z } from "zod";

export const leadInputSchema = z.object({
  propertyId: z.string().min(1).optional(),
  agentId: z.string().min(1).optional(),
  name: z.string().trim().min(2, "Ingresa tu nombre completo").max(120),
  email: z.email("Ingresa un correo válido"),
  phone: z
    .string()
    .trim()
    .regex(/^[+\d][\d\s-]{6,20}$/, "Ingresa un teléfono válido")
    .optional()
    .or(z.literal("")),
  message: z.string().trim().min(5, "Cuéntanos brevemente qué necesitas").max(1000),
});

export type LeadInput = z.infer<typeof leadInputSchema>;

export const defaultLeadMessage = "Hola, estoy interesado en esta propiedad.";
