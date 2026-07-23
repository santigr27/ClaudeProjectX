import { prisma } from "@/lib/prisma";
import type { LeadInput } from "@/validations/lead";

export async function createLead(input: LeadInput) {
  return prisma.lead.create({
    data: {
      propertyId: input.propertyId,
      agentId: input.agentId,
      name: input.name,
      email: input.email,
      phone: input.phone || null,
      message: input.message,
    },
  });
}
