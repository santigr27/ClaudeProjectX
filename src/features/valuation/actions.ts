"use server";

import { estimatePropertyValue, ValuationDataUnavailableError } from "@/services/valuation.service";
import { valuationInputSchema, type ValuationInput } from "@/validations/valuation";
import type { ValuationResult } from "@/services/valuation.service";

export interface ValuationActionState {
  result?: ValuationResult;
  /** Echoes back the last submitted (parsed) input so the form can restore
   * its fields to what was actually submitted after a server round-trip. */
  submittedInput?: ValuationInput;
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
    return { result, submittedInput: parsed.data };
  } catch (error) {
    if (error instanceof ValuationDataUnavailableError) {
      return {
        submittedInput: parsed.data,
        formError:
          "Todavía no tenemos datos de mercado para ese barrio. Intenta con otro barrio cercano.",
      };
    }
    return {
      submittedInput: parsed.data,
      formError: "No pudimos calcular el estimado. Inténtalo de nuevo.",
    };
  }
}
