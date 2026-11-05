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
import { COLLECTIONS } from "@/lib/collections";

export interface SearchIndexEntry {
  href: string;
  title: { mr: string; en: string };
  category: { mr: string; en: string };
}

const servicesCategory = { mr: "सेवा", en: "Services" };
const collectionsCategory = { mr: "Collections", en: "Collections" };
const toolsCategory = { mr: "मोफत साधने", en: "Free Tools" };
const infoCategory = { mr: "माहिती", en: "Info" };

const serviceEntries: SearchIndexEntry[] = SERVICE_GROUPS.map((group) => ({
  href: group.href,
  title: group.title,
  category: servicesCategory,
}));

/* Generated from lib/collections.ts (the single source of truth for the 7
 * premium-print routes) so these entries can never list a slug/title that
 * doesn't match the actual page. */
const collectionEntries: SearchIndexEntry[] = COLLECTIONS.map((c) => ({
  href: `/collections/${c.slug}/`,
  title: c.title,
  category: collectionsCategory,
}));

/* The 8 land-document/map pages (7/12, 8A, eFerfar, Village Map, Property
 * Card, DP/TP Map, Land Report, Map Search) were removed from this search
 * index as part of the shop/print-studio repositioning (owner decision) —
 * they are no longer promoted from search, header, footer or the homepage.
 * The pages themselves, their sitemap.ts entries and /nakasha-shodh's
 * Supabase-backed enquiry flow are untouched; see the land-records audit
 * report for the full list and a traffic/redirect plan before any of them
 * are deleted. */

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
  ...collectionEntries,
  ...toolEntries,
  ...serviceEntries,
  ...infoEntries,
];
