/**
 * Static site-search index — the data behind `src/components/site-search.tsx`.
 *
 * Deliberately a small hand-written array, not a generated/fetched index:
 * the site has ~25 indexed destinations total, so a plain substring filter
 * over this list is instant and needs no search library or backend. Service
 * groups are pulled from `SERVICE_GROUPS` (src/lib/shop-services.ts) so their
 * titles can't drift from the homepage pillars; land-document and page
 * entries are hand-written here, matching how tools-section.tsx and
 * mobile-service-shortcuts.tsx already each keep their own short list rather
 * than sharing one array.
 */

import { SERVICE_GROUPS } from "@/lib/shop-services";

export interface SearchIndexEntry {
  href: string;
  title: { mr: string; en: string };
  category: { mr: string; en: string };
}

const servicesCategory = { mr: "सेवा", en: "Services" };
const landDocsCategory = { mr: "जमीन कागदपत्रे", en: "Land Documents" };
const toolsCategory = { mr: "मोफत साधने", en: "Free Tools" };
const infoCategory = { mr: "माहिती", en: "Info" };

const serviceEntries: SearchIndexEntry[] = SERVICE_GROUPS.map((group) => ({
  href: group.href,
  title: group.title,
  category: servicesCategory,
}));

const landDocEntries: SearchIndexEntry[] = [
  { href: "/satbara-utara-maharashtra/", title: { mr: "सातबारा उतारा (7/12)", en: "7/12 Extract" }, category: landDocsCategory },
  { href: "/8a-utara-maharashtra/", title: { mr: "८अ उतारा", en: "8A Extract" }, category: landDocsCategory },
  { href: "/e-ferfar-maharashtra/", title: { mr: "ई-फेरफार", en: "Mutation / eFerfar" }, category: landDocsCategory },
  { href: "/gav-nakasha-maharashtra/", title: { mr: "गाव नकाशा", en: "Village Map" }, category: landDocsCategory },
  { href: "/milkat-patrika-maharashtra/", title: { mr: "मिळकत पत्रिका", en: "Property Card" }, category: landDocsCategory },
  { href: "/dp-map-maharashtra/", title: { mr: "विकास व नगर रचना नकाशा (DP/TP)", en: "DP / TP Map" }, category: landDocsCategory },
  { href: "/jameen-report-maharashtra/", title: { mr: "जमीन अहवाल", en: "Land Report" }, category: landDocsCategory },
  { href: "/nakasha-shodh", title: { mr: "नकाशा शोध (जिल्हा/तालुका/गाव)", en: "Map Search" }, category: landDocsCategory },
];

const toolEntries: SearchIndexEntry[] = [
  { href: "/home-loan-emi/", title: { mr: "गृहकर्ज EMI कॅल्क्युलेटर", en: "Home-loan EMI Calculator" }, category: toolsCategory },
  { href: "/stamp-duty/", title: { mr: "मुद्रांक शुल्क कॅल्क्युलेटर", en: "Stamp Duty Calculator" }, category: toolsCategory },
  { href: "/ready-reckoner/", title: { mr: "रेडी रेकनर दर शोध", en: "Ready Reckoner Rate Lookup" }, category: toolsCategory },
  { href: "/land-unit-converter/", title: { mr: "जमीन क्षेत्र रूपांतरक", en: "Land Unit Converter" }, category: toolsCategory },
];

const infoEntries: SearchIndexEntry[] = [
  { href: "/pricing", title: { mr: "किंमत", en: "Pricing" }, category: infoCategory },
  { href: "/faq", title: { mr: "वारंवार विचारले जाणारे प्रश्न (FAQ)", en: "FAQ" }, category: infoCategory },
  { href: "/support", title: { mr: "मदत केंद्र", en: "Support" }, category: infoCategory },
  { href: "/about", title: { mr: "आमच्याबद्दल", en: "About" }, category: infoCategory },
  { href: "/contact", title: { mr: "संपर्क", en: "Contact" }, category: infoCategory },
];

export const SITE_SEARCH_INDEX: SearchIndexEntry[] = [
  ...landDocEntries,
  ...toolEntries,
  ...serviceEntries,
  ...infoEntries,
];
