/**
 * Single source of truth for the PrintShubh WhatsApp contact + link building.
 *
 * The business number lives ONLY here. Every website WhatsApp link is built
 * through buildWhatsAppUrl() so the number, encoding, and UTM tagging stay
 * consistent across static and dynamic (form-driven) enquiry surfaces.
 */
export const WHATSAPP_NUMBER = "918625801907";

/** Display form for tel:/print contexts. */
export const WHATSAPP_DISPLAY = "+91 86258 01907";

/** Standard primary CTA label (Marathi-first). */
export const WHATSAPP_CTA = "WhatsApp वर मोफत विचारा — किंमत आधी कळेल";

/** Default pre-filled message for generic WhatsApp links. */
export const WHATSAPP_DEFAULT_MESSAGE =
  "नमस्कार PrintShubh, मला जमीन कागदपत्र सेवेसाठी मदत हवी आहे. कृपया किंमत आणि वेळ सांगा.";

export type WhatsAppLinkOptions = {
  /** Pre-filled (decoded) message. Encoded exactly once by this helper. */
  message?: string;
  /** utm_campaign — identifies the surface (hero, footer, pricing, …). */
  campaign?: string;
  /** utm_source. Defaults to the website. */
  source?: string;
  /** utm_medium. Defaults to the website. */
  medium?: string;
  /** utm_content — only to distinguish two CTAs in the same surface. */
  content?: string;
};

/**
 * Build a canonical https://wa.me/<number> link.
 *
 * - Uses the single canonical business number.
 * - Encodes the message exactly once (encodeURIComponent) — preserves Marathi
 *   Unicode, line breaks, and any intentional trailing spaces; never
 *   double-encodes.
 * - Appends consistent utm_source / utm_medium / utm_campaign (+ optional
 *   utm_content) with a well-formed `?` / `&` chain.
 * - Never mutates caller input and never logs the (possibly user-entered)
 *   message.
 */
export function buildWhatsAppUrl(options: WhatsAppLinkOptions = {}): string {
  const {
    message = "",
    campaign,
    source = "printshubh",
    medium = "website",
    content,
  } = options;

  const params = [`text=${encodeURIComponent(message)}`];
  params.push(`utm_source=${encodeURIComponent(source)}`);
  params.push(`utm_medium=${encodeURIComponent(medium)}`);
  if (campaign) params.push(`utm_campaign=${encodeURIComponent(campaign)}`);
  if (content) params.push(`utm_content=${encodeURIComponent(content)}`);

  return `https://wa.me/${WHATSAPP_NUMBER}?${params.join("&")}`;
}

/**
 * Backwards-compatible convenience wrapper. Delegates to buildWhatsAppUrl so
 * there is a single URL-construction path; callers that need campaign tagging
 * should call buildWhatsAppUrl directly.
 */
export function whatsappHref(message: string = WHATSAPP_DEFAULT_MESSAGE): string {
  return buildWhatsAppUrl({ message });
}
