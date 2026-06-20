/**
 * Tiny event bus so "ask price / contact" CTAs anywhere can funnel the visitor
 * into the homepage inquiry form (which captures a saved lead) instead of
 * jumping straight to WhatsApp.
 *
 * The CTA stays an `<a href={whatsappHref}>` so it degrades gracefully: on pages
 * that DON'T have the form (#map-reference absent — service pages, etc.) the
 * click is left alone and WhatsApp opens as before. Only on the homepage, where
 * the form exists, do we intercept the click, open the form, and scroll to it.
 */

export const OPEN_INQUIRY_EVENT = "printshubh:open-inquiry";

export function inquiryCtaClick(e: { preventDefault: () => void }): void {
  if (typeof document === "undefined") return;
  const target = document.getElementById("map-reference");
  if (!target) return; // no form on this page → let the WhatsApp href proceed
  e.preventDefault();
  window.dispatchEvent(new CustomEvent(OPEN_INQUIRY_EVENT));
  target.scrollIntoView({ behavior: "smooth", block: "start" });
}
