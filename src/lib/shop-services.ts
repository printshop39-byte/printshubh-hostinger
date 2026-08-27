/**
 * The PrintShubh service catalogue — shop-counter services (printing, xerox,
 * photo, digital help) plus the existing land-document services.
 *
 * NO PRICES LIVE HERE. Land-document prices are published in
 * src/lib/pricing-data.ts because they are confirmed; counter prices vary by
 * paper, size and quantity and have never been published, so every counter
 * surface routes the visitor to WhatsApp for a quote instead of guessing.
 *
 * `href` always points at a route that exists. Land-document entries reuse
 * the original indexed URLs — those must not change.
 */

import type { Lang } from "@/components/language-context";
import type { ServiceIconKey } from "@/components/shop/service-icons";

export type ServiceGroupKey = "printing" | "photo" | "land" | "digital";

export interface ServiceItem {
  label: Record<Lang, string>;
  /** Only set when the item has its own indexed page. */
  href?: string;
}

export interface ServiceGroup {
  key: ServiceGroupKey;
  /** Landing route for the whole group. */
  href: string;
  emoji: string;
  /** Illustrated icon shown on the homepage pillar card. */
  iconKey: ServiceIconKey;
  title: Record<Lang, string>;
  /** One-line promise shown under the card title. */
  blurb: Record<Lang, string>;
  items: ServiceItem[];
  cta: Record<Lang, string>;
  /** Pre-filled WhatsApp message when the visitor asks about this group. */
  whatsapp: Record<Lang, string>;
}

export const SERVICE_GROUPS: ServiceGroup[] = [
  {
    key: "printing",
    href: "/printing-xerox",
    emoji: "🖨️",
    iconKey: "printer",
    title: { mr: "प्रिंटिंग व झेरॉक्स", en: "Printing & Xerox" },
    blurb: {
      mr: "जंबो झेरॉक्सपासून A3 रंगीत प्रिंटपर्यंत — दुकानातच, त्याच वेळी.",
      en: "From jumbo xerox to A3 colour prints — at the counter, same visit.",
    },
    items: [
      { label: { mr: "जंबो झेरॉक्स", en: "Jumbo Xerox" } },
      { label: { mr: "ब्लॅक अँड व्हाइट झेरॉक्स", en: "B/W Xerox" } },
      { label: { mr: "रंगीत झेरॉक्स", en: "Colour Xerox" } },
      { label: { mr: "A4 / A3 प्रिंटिंग", en: "A4 / A3 Printing" } },
      { label: { mr: "स्कॅनिंग", en: "Scanning" } },
      { label: { mr: "बाइंडिंग", en: "Binding" } },
      { label: { mr: "लॅमिनेशन", en: "Lamination" } },
      { label: { mr: "पोस्टर प्रिंट", en: "Poster Print" } },
    ],
    cta: { mr: "प्रिंटिंग सेवा पहा", en: "See printing services" },
    whatsapp: {
      mr: "नमस्कार PrintShubh, मला प्रिंटिंग / झेरॉक्स सेवेबद्दल विचारायचे आहे. काम: ",
      en: "Hello PrintShubh, I have a printing / xerox job. Details: ",
    },
  },
  {
    key: "photo",
    href: "/photo-services",
    emoji: "📸",
    iconKey: "photo",
    title: { mr: "फोटो सेवा", en: "Photo Services" },
    blurb: {
      mr: "पासपोर्ट, ID व मिनी फोटो — काढून, संपादित करून, प्रिंट करून.",
      en: "Passport, ID and mini photos — shot, edited and printed.",
    },
    items: [
      { label: { mr: "पासपोर्ट फोटो", en: "Passport Photo" } },
      { label: { mr: "ID फोटो", en: "ID Photo" } },
      { label: { mr: "मिनी फोटो", en: "Mini Photo" } },
      { label: { mr: "फोटो प्रिंटिंग", en: "Photo Printing" } },
      { label: { mr: "फोटो एडिटिंग", en: "Photo Editing" } },
    ],
    cta: { mr: "फोटो सेवा पहा", en: "See photo services" },
    whatsapp: {
      mr: "नमस्कार PrintShubh, मला फोटो सेवेबद्दल विचारायचे आहे. काम: ",
      en: "Hello PrintShubh, I need a photo service. Details: ",
    },
  },
  {
    key: "land",
    href: "/#land-documents",
    emoji: "🗺️",
    iconKey: "land",
    title: { mr: "जमीन कागदपत्रे", en: "Land Documents" },
    blurb: {
      mr: "7/12, 8अ, फेरफार, गाव नकाशा व मिळकत पत्रिका — अधिकृत स्रोतांवर आधारित.",
      en: "7/12, 8A, mutation, village map and property card — from official sources.",
    },
    items: [
      { label: { mr: "7/12 उतारा", en: "7/12 Extract" }, href: "/satbara-utara-maharashtra/" },
      { label: { mr: "8अ उतारा", en: "8A Extract" }, href: "/8a-utara-maharashtra/" },
      { label: { mr: "फेरफार", en: "Mutation / Ferfar" }, href: "/e-ferfar-maharashtra/" },
      { label: { mr: "गाव नकाशा", en: "Village Map" }, href: "/gav-nakasha-maharashtra/" },
      { label: { mr: "मिळकत पत्रिका", en: "Property Card" }, href: "/milkat-patrika-maharashtra/" },
      { label: { mr: "DP / TP नकाशा", en: "DP / TP Map" }, href: "/dp-map-maharashtra/" },
    ],
    cta: { mr: "कागदपत्र सेवा पहा", en: "See document services" },
    whatsapp: {
      mr: "नमस्कार PrintShubh, मला जमीन कागदपत्र सेवेसाठी मदत हवी आहे. ",
      en: "Hello PrintShubh, I need help with a land-document service. ",
    },
  },
  {
    key: "digital",
    href: "/digital-services",
    emoji: "💻",
    iconKey: "digital",
    title: { mr: "डिजिटल सेवा", en: "Digital Services" },
    blurb: {
      mr: "ऑनलाइन फॉर्म, PDF काम आणि WhatsApp वरून प्रिंट — बसल्या जागी.",
      en: "Online forms, PDF work and printing over WhatsApp — without queuing.",
    },
    items: [
      { label: { mr: "ऑनलाइन फॉर्म भरणे", en: "Online Forms" } },
      { label: { mr: "कागदपत्र सहाय्य", en: "Document Assistance" } },
      { label: { mr: "PDF सेवा", en: "PDF Services" } },
      { label: { mr: "WhatsApp प्रिंटिंग", en: "WhatsApp Printing" } },
      { label: { mr: "डिजिटल कागदपत्र मदत", en: "Digital Document Help" } },
    ],
    cta: { mr: "डिजिटल सेवा पहा", en: "See digital services" },
    whatsapp: {
      mr: "नमस्कार PrintShubh, मला डिजिटल सेवेबद्दल विचारायचे आहे. काम: ",
      en: "Hello PrintShubh, I need a digital service. Details: ",
    },
  },
];

export function serviceGroup(key: ServiceGroupKey): ServiceGroup {
  const group = SERVICE_GROUPS.find((g) => g.key === key);
  if (!group) throw new Error(`Unknown service group: ${key}`);
  return group;
}

/* ── Quick-service strip (below the hero) ────────────────────────────────
 * Short labels only — this is a scan-in-two-seconds strip, not a catalogue.
 * `href` is optional; a chip without one is a label, not a dead link. */
export const QUICK_SERVICES: { label: Record<Lang, string>; href?: string }[] = [
  { label: { mr: "जंबो झेरॉक्स", en: "Jumbo Xerox" }, href: "/printing-xerox" },
  { label: { mr: "रंगीत झेरॉक्स", en: "Colour Xerox" }, href: "/printing-xerox" },
  { label: { mr: "फोटो प्रिंट", en: "Photo Print" }, href: "/photo-services" },
  { label: { mr: "पासपोर्ट फोटो", en: "Passport Photo" }, href: "/photo-services" },
  { label: { mr: "पोस्टर प्रिंट", en: "Poster Print" }, href: "/printing-xerox" },
  { label: { mr: "लॅमिनेशन", en: "Lamination" }, href: "/printing-xerox" },
  { label: { mr: "स्कॅनिंग", en: "Scanning" }, href: "/printing-xerox" },
  { label: { mr: "जमीन कागदपत्रे", en: "Land Documents" }, href: "/#land-documents" },
];
