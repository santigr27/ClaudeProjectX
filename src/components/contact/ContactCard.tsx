import Image from "next/image";
import { Phone, MessageCircle } from "lucide-react";
import { ContactForm } from "./ContactForm";
import { buildWhatsAppLink } from "@/services/whatsapp.service";
import { defaultLeadMessage } from "@/validations/lead";
import type { Agent } from "@/generated/prisma/client";

export function ContactCard({
  agent,
  propertyId,
  propertyTitle,
}: {
  agent: Agent | null;
  propertyId: string;
  propertyTitle: string;
}) {
  if (!agent) return null;

  const message = `${defaultLeadMessage} (${propertyTitle})`;
  const whatsappLink = agent.whatsapp ? buildWhatsAppLink(agent.whatsapp, message) : null;

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-ink-100 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="relative size-12 shrink-0 overflow-hidden rounded-full bg-ink-100">
          {agent.imageUrl && <Image src={agent.imageUrl} alt={agent.name} fill className="object-cover" />}
        </div>
        <div>
          <p className="font-semibold text-ink-900">{agent.name}</p>
          <p className="text-xs text-ink-500">{agent.title ?? "Asesor inmobiliario"}</p>
        </div>
      </div>

      <div className="flex gap-2">
        <a
          href={`tel:${agent.phone}`}
          className="flex flex-1 items-center justify-center gap-2 rounded-full border border-ink-200 py-2.5 text-sm font-semibold text-ink-800 hover:bg-ink-50"
        >
          <Phone className="size-4" aria-hidden />
          Llamar
        </a>
        {whatsappLink && (
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-1 items-center justify-center gap-2 rounded-full bg-accent-600 py-2.5 text-sm font-semibold text-white hover:bg-accent-700"
          >
            <MessageCircle className="size-4" aria-hidden />
            WhatsApp
          </a>
        )}
      </div>

      <hr className="border-ink-100" />

      <ContactForm propertyId={propertyId} agentId={agent.id} propertyTitle={propertyTitle} />
    </div>
  );
}
