/**
 * Conversion-funnel analytics foundation — privacy-safe by construction.
 *
 * This module is the ONLY place funnel events are shaped and sent. It targets
 * Vercel Web Analytics (cookieless) via the browser global `window.va`; the
 * `@vercel/analytics` provider itself is mounted in a separate commit. It does
 * NOT touch the Meta Pixel — `trackWhatsAppLead()` (Contact) stays separate.
 *
 * PRIVACY GUARANTEE:
 *   `trackFunnelEvent` reads ONLY a fixed allowlist of low-risk, categorical
 *   properties (lang, service_key, surface, has_value, step). It never copies
 *   the caller's object, so any extra/unknown key — including personal data a
 *   caller might accidentally pass (name, mobile, district/taluka/village,
 *   survey no., WhatsApp message, coordinates, address, email, URLs) — is never
 *   read and therefore never sent. Malformed allowed values are dropped too.
 *   Rejected values are never logged.
 *
 * SAFETY:
 *   No-op during SSR, no-op outside production, no-op if the provider global is
 *   absent, and every provider call is wrapped so analytics can never throw to
 *   the caller or break the UI. No event call sites exist yet.
 */

import { track } from "@vercel/analytics";

/* Single source of truth for the fixed event taxonomy (drives the type + a
 * runtime allowlist so a caller bypassing TypeScript can't send a stray name). */
const FUNNEL_EVENTS = [
  "hero_primary_cta_click",
  "hero_whatsapp_click",
  "enquiry_form_view",
  "enquiry_service_selected",
  "enquiry_district_selected",
  "enquiry_taluka_selected",
  "enquiry_village_selected",
  "enquiry_whatsapp_generated",
  "sample_section_view",
  "map_promo_whatsapp_click",
  "pricing_whatsapp_click",
] as const;

export type FunnelEventName = (typeof FUNNEL_EVENTS)[number];

const KNOWN_EVENTS: ReadonlySet<string> = new Set(FUNNEL_EVENTS);

/* The ONLY properties any funnel event may carry. All are categorical and
 * low-risk. Never extend this with anything user-entered or identifying. */
export type SafeAnalyticsProperties = {
  lang?: "mr" | "en";
  /** Fixed service slug (enum-like), e.g. "satbara", "8a", "village-map". */
  service_key?: string;
  /** Surface / campaign label, e.g. "hero", "unified-form", "map-promo". */
  surface?: string;
  has_value?: boolean;
  /** Small funnel step index (1–10). */
  step?: number;
};

/* Only lowercase letters, digits, hyphen and underscore; trimmed; <= 64 chars. */
const SLUG_RE = /^[a-z0-9_-]+$/;
const MAX_SLUG_LEN = 64;

function sanitizeSlug(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  if (trimmed.length === 0 || trimmed.length > MAX_SLUG_LEN) return undefined;
  return SLUG_RE.test(trimmed) ? trimmed : undefined;
}

type CleanProperties = Record<string, string | number | boolean>;

/**
 * Build a new object containing ONLY the known allowlisted keys with valid
 * values. Reads each key explicitly — never spreads/copies the input — so
 * unknown keys can never leak, and the caller's object is never mutated.
 */
function sanitizeProperties(input?: SafeAnalyticsProperties): CleanProperties {
  const out: CleanProperties = {};
  if (!input || typeof input !== "object") return out;

  if (input.lang === "mr" || input.lang === "en") out.lang = input.lang;

  const serviceKey = sanitizeSlug(input.service_key);
  if (serviceKey !== undefined) out.service_key = serviceKey;

  const surface = sanitizeSlug(input.surface);
  if (surface !== undefined) out.surface = surface;

  if (typeof input.has_value === "boolean") out.has_value = input.has_value;

  if (
    typeof input.step === "number" &&
    Number.isInteger(input.step) &&
    input.step >= 1 &&
    input.step <= 10
  ) {
    out.step = input.step;
  }

  return out;
}

/**
 * Send a privacy-safe funnel event to Vercel Web Analytics via the official
 * `track()` API.
 *
 * No-op during SSR, outside production, and for unknown event names. Only
 * allowlisted categorical properties are sent; everything else is discarded.
 * Never throws; never blocks navigation.
 */
export function trackFunnelEvent(
  event: FunnelEventName,
  properties?: SafeAnalyticsProperties,
): void {
  if (typeof window === "undefined") return; // SSR
  if (process.env.NODE_ENV !== "production") return; // dev/test: send nothing
  if (!KNOWN_EVENTS.has(event)) return; // stray name (bypassed TS)

  try {
    track(event, sanitizeProperties(properties));
  } catch {
    // Analytics must never affect the UI — swallow any provider error.
  }
}

/**
 * Fire-once guard for future view-tracking (e.g. enquiry_form_view,
 * sample_section_view). Returns a function that yields `true` only the first
 * time it sees a given key. Exported for the upcoming IntersectionObserver
 * commit — intentionally NOT wired to any event yet.
 */
export function createOnceGuard(): (key: string) => boolean {
  const seen = new Set<string>();
  return (key: string): boolean => {
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  };
}
