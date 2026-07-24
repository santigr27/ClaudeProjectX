import { Phone, MessageCircle } from "lucide-react";
import { buildWhatsAppLink } from "@/services/whatsapp.service";
import { defaultLeadMessage } from "@/validations/lead";
import type { SellerProfile } from "@/generated/prisma/client";

export function MobileContactBar({
  seller,
  propertyTitle,
}: {
  seller: SellerProfile | null;
  propertyTitle: string;
}) {
  if (!seller) return null;

  const message = `${defaultLeadMessage} (${propertyTitle})`;
  const whatsappLink = seller.whatsapp ? buildWhatsAppLink(seller.whatsapp, message) : null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 flex gap-2 border-t border-ink-100 bg-white p-3 shadow-[0_-4px_12px_rgba(0,0,0,0.08)] lg:hidden">
      <a
        href={`tel:${seller.phone}`}
        className="flex flex-1 items-center justify-center gap-2 rounded-full border border-ink-200 py-3 text-sm font-semibold text-ink-800"
      >
        <Phone className="size-4" aria-hidden />
        Llamar
      </a>
      {whatsappLink && (
        <a
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-1 items-center justify-center gap-2 rounded-full bg-accent-600 py-3 text-sm font-semibold text-white"
        >
          <MessageCircle className="size-4" aria-hidden />
          WhatsApp
        </a>
      )}
      <a
        href="#contact-form"
        className="flex flex-1 items-center justify-center rounded-full bg-brand-600 py-3 text-sm font-semibold text-white"
      >
        Escribir
      </a>
    </div>
  );
}
