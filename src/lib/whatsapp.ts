/**
 * Single source of truth for the PrintShubh WhatsApp contact.
 *
 * The number is already used inline across the components (hero, footer,
 * service shell, etc.). New code should import from here so there is one
 * place to change it. Existing inline usages already use this same number.
 */
export const WHATSAPP_NUMBER = "918625801907";

/** Display form for tel:/print contexts. */
export const WHATSAPP_DISPLAY = "+91 86258 01907";

/** Standard primary CTA label (Marathi-first). */
export const WHATSAPP_CTA = "WhatsApp वर मोफत विचारा — किंमत आधी कळेल";

/** Default pre-filled message for generic WhatsApp links. */
export const WHATSAPP_DEFAULT_MESSAGE =
  "नमस्कार PrintShubh, मला जमीन कागदपत्र सेवेसाठी मदत हवी आहे. कृपया किंमत आणि वेळ सांगा.";

/** Build a wa.me link with an optional custom (decoded) message. */
export function whatsappHref(message: string = WHATSAPP_DEFAULT_MESSAGE): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
