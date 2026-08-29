/**
 * Single source of truth for service names + starting prices.
 *
 * Shared by PricingSection (the transparent price table) and the
 * UnifiedRecordForm (record-type picker with auto price badge) so prices
 * are maintained in exactly ONE place.
 */

import type { Lang } from "@/components/language-context";

export type PriceRow = { name: Record<Lang, string>; price: Record<Lang, string> };
export type PriceGroup = { key: "doc" | "map"; title: Record<Lang, string>; rows: PriceRow[] };

export const ASK_PRICE: Record<Lang, string> = {
  mr: "WhatsApp वर किंमत विचारा",
  en: "Ask price on WhatsApp",
};

export const PRICING_GROUPS: PriceGroup[] = [
  {
    key: "doc",
    title: { mr: "डिजिटल दस्तऐवज", en: "Digital Documents" },
    rows: [
      { name: { mr: "7/12 उतारा", en: "7/12 Extract" }, price: { mr: "₹30 पासून", en: "From ₹30" } },
      { name: { mr: "8A उतारा", en: "8A Extract" }, price: { mr: "₹30 पासून", en: "From ₹30" } },
      { name: { mr: "फेरफार", en: "Mutation / Ferfar" }, price: ASK_PRICE },
      { name: { mr: "मिळकत पत्रिका", en: "Property Card" }, price: { mr: "₹100 पासून", en: "From ₹100" } },
      { name: { mr: "मिळकत पत्रिका फेरफार", en: "Property Card Mutation" }, price: ASK_PRICE },
      { name: { mr: "मुंबई प्रॉपर्टी कार्ड", en: "Mumbai Property Card" }, price: ASK_PRICE },
      { name: { mr: "Index II", en: "Index II" }, price: ASK_PRICE },
    ],
  },
  {
    key: "map",
    title: { mr: "नकाशे / प्लॅन", en: "Maps / Plans" },
    rows: [
      { name: { mr: "गाव नकाशा", en: "Village Map" }, price: { mr: "₹300 पासून", en: "From ₹300" } },
      { name: { mr: "स्वामित्व नकाशा", en: "Swamitva Map" }, price: ASK_PRICE },
      { name: { mr: "लोकेशन नकाशा", en: "Location Map" }, price: ASK_PRICE },
      { name: { mr: "नकाशा ओव्हरले", en: "Map Overlay" }, price: ASK_PRICE },
      { name: { mr: "नगर रचना नकाशा", en: "Town Planning Map" }, price: { mr: "₹200 पासून", en: "From ₹200" } },
      { name: { mr: "विकास आराखडा", en: "Development Plan" }, price: { mr: "₹200 पासून", en: "From ₹200" } },
      { name: { mr: "प्रादेशिक आराखडा", en: "Regional Plan" }, price: { mr: "₹200 पासून", en: "From ₹200" } },
      { name: { mr: "Google Map नुसार झोन-निहाय जमीन अहवाल", en: "Google Map Zone-wise Land Report" }, price: { mr: "₹200 पासून", en: "From ₹200" } },
      { name: { mr: "संपूर्ण नकाशा विकास अहवाल", en: "Full Map Development Report" }, price: { mr: "₹200 पासून", en: "From ₹200" } },
    ],
  },
];

/** Lookup by the English row name — e.g. for a card elsewhere that only knows its own English label. */
export const PRICE_ROW_BY_EN: ReadonlyMap<string, PriceRow> = new Map(
  PRICING_GROUPS.flatMap((group) => group.rows.map((row) => [row.name.en, row] as const)),
);

/** Price for a service by its English row name, falling back to ASK_PRICE if the name isn't found. */
export function priceFor(nameEn: string): Record<Lang, string> {
  return PRICE_ROW_BY_EN.get(nameEn)?.price ?? ASK_PRICE;
}
