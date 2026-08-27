/**
 * Conversion-funnel analytics foundation — privacy-safe by construction.
 *
 * This module is the ONLY place funnel events are shaped and sent, and it is
 * deliberately provider-agnostic: the site is hosted on Hostinger, so it can
 * carry no dependency on a host-injected endpoint.
 *
 * Events are dispatched as a DOM CustomEvent on `window` (see FUNNEL_CHANNEL).
 * That costs nothing, makes no network request, and gives a tag manager or a
 * self-hosted analytics snippet a single place to subscribe:
 *
 *   window.addEventListener("printshubh:funnel", (e) => {
 *     // e.detail = { event, properties }  ← already sanitised, see below
 *   });
 *
 * With no listener attached this is a safe no-op, which is the current state.
 * It does NOT touch the Meta Pixel — `trackWhatsAppLead()` (Contact) stays
 * separate.
 *
 * HISTORY: this previously called `track()` from `@vercel/analytics`. On
 * Hostinger that endpoint (/_vercel/insights/script.js) 404s, so every event
 * was silently dropped and each page view logged a console error. Do not
 * reintroduce a host-specific provider here.
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
 *   No-op during SSR and outside production, and the dispatch is wrapped so a
 *   throwing subscriber can never break the UI or block a navigation.
 */

import { useEffect, useRef, type RefObject } from "react";

/** DOM event name every funnel event is dispatched under. Public API —
 * anything subscribing to funnel events keys off this string. */
export const FUNNEL_CHANNEL = "printshubh:funnel";

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
 * Emit a privacy-safe funnel event on the FUNNEL_CHANNEL DOM channel.
 *
 * No-op during SSR, outside production, and for unknown event names. Only
 * allowlisted categorical properties are included; everything else is
 * discarded. Never throws; never blocks navigation; makes no network request
 * of its own — delivery is entirely up to whatever subscribes.
 */
export function trackFunnelEvent(
  event: FunnelEventName,
  properties?: SafeAnalyticsProperties,
): void {
  if (typeof window === "undefined") return; // SSR
  if (process.env.NODE_ENV !== "production") return; // dev/test: send nothing
  if (!KNOWN_EVENTS.has(event)) return; // stray name (bypassed TS)

  try {
    window.dispatchEvent(
      new CustomEvent(FUNNEL_CHANNEL, {
        detail: { event, properties: sanitizeProperties(properties) },
      }),
    );
  } catch {
    // Analytics must never affect the UI — swallow any subscriber error.
  }
}

/**
 * Fire-once guard for view-tracking (enquiry_form_view, sample_section_view).
 * Returns a function that yields `true` only the first time it sees a given
 * key. Used by useFunnelViewEvent below.
 */
export function createOnceGuard(): (key: string) => boolean {
  const seen = new Set<string>();
  return (key: string): boolean => {
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  };
}

/* Module-level guard so each view event fires at most once per page session
 * (survives re-renders, language switches, and scroll-away-and-back). */
const viewOnce = createOnceGuard();

/**
 * Fire a view funnel event once, the first time `ref` is >= ~50% visible.
 *
 * Client-only (the effect never runs during SSR), disconnects the observer as
 * soon as it fires, and is deduplicated once per page session via `viewOnce` —
 * so it never refires on re-render, language switch, or scrolling away and
 * back. Produces no layout change and sends no PII (only the allowlisted
 * `properties` reach `trackFunnelEvent`, which itself is prod-only).
 */
export function useFunnelViewEvent<T extends Element>(
  ref: RefObject<T | null>,
  event: FunnelEventName,
  properties?: SafeAnalyticsProperties,
): void {
  // Keep the latest props without re-subscribing the observer on each render.
  // Written in an effect (never during render) so the value is current by the
  // time the observer fires, whichever language is active then.
  const propertiesRef = useRef(properties);
  useEffect(() => {
    propertiesRef.current = properties;
  });

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry && entry.isIntersecting && entry.intersectionRatio >= 0.5) {
          if (viewOnce(event)) {
            trackFunnelEvent(event, propertiesRef.current);
          }
          observer.disconnect();
        }
      },
      { threshold: 0.5 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref, event]);
}
