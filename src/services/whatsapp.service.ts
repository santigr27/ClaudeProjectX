/**
 * WhatsApp integration layer.
 *
 * For the MVP this only builds a `wa.me` deep link, which requires no API
 * credentials. When real WhatsApp Business Cloud API integration is added,
 * swap `buildWhatsAppLink`'s implementation (or add a `sendWhatsAppMessage`
 * function here that calls the Graph API using WHATSAPP_API_TOKEN /
 * WHATSAPP_PHONE_NUMBER_ID) without touching any calling component.
 */

function sanitizePhoneForWaLink(phone: string): string {
  return phone.replace(/[^\d]/g, "");
}

export function buildWhatsAppLink(phone: string, message: string): string {
  const digits = sanitizePhoneForWaLink(phone);
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${digits}?text=${encodedMessage}`;
}
