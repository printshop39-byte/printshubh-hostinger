/**
 * Static site-search index — the data behind `src/components/site-search.tsx`.
 *
 * Deliberately a small hand-written array, not a generated/fetched index:
 * the site has ~25 indexed destinations total, so a plain substring filter
 * over this list is instant and needs no search library or backend. Service
 * groups are pulled from `SERVICE_GROUPS` (src/lib/shop-services.ts) so their
 * titles can't drift from the homepage pillars; the information-page entries
 * are hand-written here.
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

/* No land-document, map-finder, property-calculator or land-pricing pages are
 * listed here (removed in the shop/print-studio repositioning and finished in
 * the Phase 1 cleanup). Those pages still exist for now but are not promoted
 * from search, the header, the footer, the homepage or the sitemap. */

const infoEntries: SearchIndexEntry[] = [
  { href: "/faq", title: { mr: "वारंवार विचारले जाणारे प्रश्न (FAQ)", en: "FAQ" }, category: infoCategory },
  { href: "/support", title: { mr: "मदत केंद्र", en: "Support" }, category: infoCategory },
  { href: "/about", title: { mr: "आमच्याबद्दल", en: "About" }, category: infoCategory },
  { href: "/contact", title: { mr: "संपर्क", en: "Contact" }, category: infoCategory },
];

export const SITE_SEARCH_INDEX: SearchIndexEntry[] = [
  ...collectionEntries,
  ...serviceEntries,
  ...infoEntries,
];
