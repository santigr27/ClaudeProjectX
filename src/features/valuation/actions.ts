"use server";

import { estimatePropertyValue, ValuationDataUnavailableError } from "@/services/valuation.service";
import { valuationInputSchema } from "@/validations/valuation";
import type { ValuationResult } from "@/services/valuation.service";

export interface ValuationActionState {
  result?: ValuationResult;
  fieldErrors?: Record<string, string>;
  formError?: string;
}

export async function estimateValuationAction(
  _prevState: ValuationActionState,
  formData: FormData,
): Promise<ValuationActionState> {
  const raw = Object.fromEntries(formData.entries());
  const parsed = valuationInputSchema.safeParse(raw);

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0]);
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { fieldErrors };
  }

  try {
    const result = await estimatePropertyValue(parsed.data);
    return { result };
  } catch (error) {
    if (error instanceof ValuationDataUnavailableError) {
      return {
        formError:
          "Todavía no tenemos datos de mercado para ese barrio. Intenta con otro barrio cercano.",
      };
    }
    return { formError: "No pudimos calcular el estimado. Inténtalo de nuevo." };
  }
}
