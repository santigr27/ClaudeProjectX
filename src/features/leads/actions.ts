"use server";

import { submitLead } from "@/services/lead.service";
import type { SubmitLeadResult } from "@/services/lead.service";

export async function submitLeadAction(
  _prevState: SubmitLeadResult | undefined,
  formData: FormData,
): Promise<SubmitLeadResult> {
  const raw = Object.fromEntries(formData.entries());
  return submitLead(raw);
}
