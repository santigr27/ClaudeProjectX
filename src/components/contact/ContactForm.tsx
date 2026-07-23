"use client";

import { useActionState, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { Input, Textarea } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { SegmentedToggle } from "@/components/ui/SegmentedToggle";
import { submitLeadAction } from "@/features/leads/actions";
import { defaultLeadMessage } from "@/validations/lead";
import type { SubmitLeadResult } from "@/services/lead.service";

const initialState: SubmitLeadResult = { success: false };

export function ContactForm({
  propertyId,
  agentId,
  propertyTitle,
}: {
  propertyId?: string;
  agentId?: string;
  propertyTitle: string;
}) {
  const [state, formAction, isPending] = useActionState(submitLeadAction, initialState);
  const [intent, setIntent] = useState<"contact" | "visit">("contact");

  // `state.success` only ever flips true->true->... across submissions; it
  // can't be cleared by a plain UI click. Track dismissal separately so
  // "send another message" actually brings the form back.
  const [priorState, setPriorState] = useState(state);
  const [showSuccess, setShowSuccess] = useState(false);
  if (priorState !== state) {
    setPriorState(state);
    if (state.success) setShowSuccess(true);
  }

  if (showSuccess) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-xl bg-accent-50 px-4 py-6 text-center">
        <CheckCircle2 className="size-8 text-accent-600" aria-hidden />
        <p className="font-medium text-accent-800">¡Mensaje enviado!</p>
        <p className="text-sm text-accent-700">El agente se pondrá en contacto contigo pronto.</p>
        <button
          type="button"
          onClick={() => setShowSuccess(false)}
          className="mt-2 text-sm font-medium text-accent-700 underline"
        >
          Enviar otro mensaje
        </button>
      </div>
    );
  }

  const defaultMessage =
    intent === "visit"
      ? `Hola, quisiera agendar una visita para conocer esta propiedad (${propertyTitle}).`
      : `${defaultLeadMessage} (${propertyTitle})`;

  return (
    <form key={intent} action={formAction} className="flex flex-col gap-3">
      {propertyId && <input type="hidden" name="propertyId" value={propertyId} />}
      {agentId && <input type="hidden" name="agentId" value={agentId} />}

      <SegmentedToggle
        name="Motivo del mensaje"
        value={intent}
        onChange={(value) => setIntent(value as "contact" | "visit")}
        options={[
          { value: "contact", label: "Contactar agente" },
          { value: "visit", label: "Solicitar visita" },
        ]}
      />

      <Input label="Nombre" name="name" placeholder="Tu nombre completo" error={state.fieldErrors?.name} required />
      <Input
        label="Correo electrónico"
        name="email"
        type="email"
        placeholder="tucorreo@ejemplo.com"
        error={state.fieldErrors?.email}
        required
      />
      <Input
        label="Teléfono (opcional)"
        name="phone"
        type="tel"
        placeholder="+57 300 000 0000"
        error={state.fieldErrors?.phone}
      />
      <Textarea
        label="Mensaje"
        name="message"
        defaultValue={defaultMessage}
        error={state.fieldErrors?.message}
        required
      />

      {state.formError && (
        <p role="alert" className="text-sm text-red-600">
          {state.formError}
        </p>
      )}

      <Button type="submit" fullWidth disabled={isPending}>
        {isPending ? "Enviando..." : intent === "visit" ? "Solicitar visita" : "Contactar agente"}
      </Button>
    </form>
  );
}
