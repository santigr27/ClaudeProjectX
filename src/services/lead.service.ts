import { createLead } from "@/repositories/lead.repository";
import { leadInputSchema, type LeadInput } from "@/validations/lead";

export interface SubmitLeadResult {
  success: boolean;
  fieldErrors?: Partial<Record<keyof LeadInput, string>>;
  formError?: string;
}

/**
 * Validates and persists a contact-form lead. This is the single seam for
 * lead delivery: forwarding new leads to a CRM or notifying an agent by
 * WhatsApp/email later only requires adding calls here, after the
 * `createLead` write, without changing the contact form itself.
 */
export async function submitLead(raw: unknown): Promise<SubmitLeadResult> {
  const parsed = leadInputSchema.safeParse(raw);

  if (!parsed.success) {
    const fieldErrors: Partial<Record<keyof LeadInput, string>> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as keyof LeadInput | undefined;
      if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { success: false, fieldErrors };
  }

  try {
    await createLead(parsed.data);
    return { success: true };
  } catch {
    return {
      success: false,
      formError: "No pudimos enviar tu mensaje. Inténtalo de nuevo en unos minutos.",
    };
  }
}
