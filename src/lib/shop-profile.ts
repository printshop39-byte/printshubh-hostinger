/**
 * Single source of truth for the PHYSICAL PrintShubh shop.
 *
 * ─────────────────────────────────────────────────────────────────────────
 *  SOURCE OF TRUTH: the Google Business Profile
 * ─────────────────────────────────────────────────────────────────────────
 *  Every value below was transcribed from the owner's own Google Business
 *  Profile for PRINTSHUBH JUMBO ZEROX (Kolhapur) on 2026-08-23. Local search
 *  ranks on name/address/phone matching across the web, so when the profile
 *  changes, change it HERE and nowhere else — the address block, the footer,
 *  the mobile Directions tab and the PrintShop JSON-LD all read from here.
 *
 *  Anything still `null` / `[]` is data that was NOT on the profile. Those
 *  sections keep rendering nothing rather than showing a guess. Do not fill
 *  one in from memory.
 * ─────────────────────────────────────────────────────────────────────────
 */

import type { Lang } from "@/components/language-context";

/* ── Brand identity ────────────────────────────────────────────────────
 *
 * Two names, on purpose:
 *
 *   BRAND_NAME / BRAND_LINE — the wordmark, as it appears in the hero and
 *     the header. "XEROX" is the correct English spelling.
 *
 *   GBP_NAME — the business name EXACTLY as registered on the Google
 *     Business Profile, spelling included. This is the string that goes into
 *     structured data, because NAP consistency is matched literally: schema
 *     that says "XEROX" while the profile says "ZEROX" is a mismatched
 *     citation.
 *
 * NOTE FOR THE OWNER: the profile reads "ZEROX", the printed business card
 * reads "PRINTSHUB" (no H), and the domain is printshubh.shop. Three
 * spellings of one business weakens every citation. Pick one and make the
 * profile, the card and this file agree — then update GBP_NAME here. */
export const BRAND_NAME = "PRINTSHUBH";
export const BRAND_LINE = "JUMBO XEROX";
export const GBP_NAME = "PRINTSHUBH JUMBO ZEROX";

/** Google Business Profile "Opening date". Used for schema `foundingDate`
 *  and as the source for the experience claim below. */
export const ESTABLISHED = "1996-06-29";

/** Years in business — now VERIFIED, not asserted: the profile records an
 *  opening date of 29 June 1996, which is 30 years as of 2026. Recompute
 *  from ESTABLISHED when it rolls over rather than rounding up early. */
export const YEARS_EXPERIENCE = 30;

/* Cumulative customers served. Left null because nobody has counted.
 * The trust section renders the tile ONLY when this is a real figure the
 * owner can stand behind — "thousands of customers" is not a statistic,
 * it is a guess, and guesses do not go on the site. */
export const CUSTOMERS_SERVED: number | null = null;

/* ── Shop address ──────────────────────────────────────────────────────
 * Fill in ONLY with the address exactly as it appears on the Google
 * Business Profile — NAP consistency (name/address/phone) is what local
 * SEO ranks on, and a mismatch actively hurts.
 *
 *   mapsEmbedUrl  → Google Maps → Share → Embed a map → copy the src="…"
 *   directionsUrl → Google Maps → Directions → copy the URL
 *
 * While this is null: the "Visit our shop" section, the Directions tab in
 * the mobile bottom bar, and the LocalBusiness address schema are all
 * omitted. The site keeps describing itself as a service-area business. */
export interface ShopAddress {
  /** Street lines, in display order. Marathi + English. */
  lines: Record<Lang, string[]>;
  /** Google Maps "Embed a map" iframe src. */
  mapsEmbedUrl: string;
  /** Google Maps directions deep-link. */
  directionsUrl: string;
  /** Structured fields for LocalBusiness JSON-LD (schema.org PostalAddress). */
  postal: {
    streetAddress: string;
    addressLocality: string;
    addressRegion: string;
    postalCode: string;
    addressCountry: "IN";
  };
  /** Optional — enables the geo block in LocalBusiness schema. */
  geo?: { latitude: number; longitude: number };
}

/* Transcribed from the Google Business Profile "Business location" field:
 *   "B-6, Mahalaxmi Chamber, Near C.B. Stand,, Shahupuri, Kolhapur,
 *    Maharashtra, kolhapur, Maharashtra 416001"
 * (duplicated city and the stray comma are the profile's own; cleaned here
 * for display, with the postal fields kept literal for schema).
 *
 * PIN — 416001, set by the owner on 2026-08-23 AFTER updating the Google
 * Business Profile to match. The profile previously read 416003 and this
 * file followed it; the owner then changed the profile, so this file
 * followed it again. That order matters: the profile is the source of
 * truth, and the site is the copy.
 *
 * The printed business card still says 416003 — reprint it, or the card
 * becomes a third conflicting citation.
 *
 * `geo` is deliberately absent: the profile screenshots do not show
 * coordinates and guessing a lat/lng would put a pin on the wrong shop. Add
 * it from Google Maps → right-click the pin → copy coordinates.
 *
 * `mapsEmbedUrl` uses the keyless `?q=…&output=embed` form so the map works
 * without a Maps API key. To use the official embed instead: Maps → Share →
 * Embed a map → copy the src="…" value over this one. */
export const SHOP_ADDRESS: ShopAddress | null = {
  lines: {
    mr: [
      "B-6, महालक्ष्मी चेंबर्स",
      "सी.बी. स्टँड जवळ, शाहूपुरी",
      "कोल्हापूर, महाराष्ट्र ४१६००१",
    ],
    en: [
      "B-6, Mahalaxmi Chamber",
      "Near C.B. Stand, Shahupuri",
      "Kolhapur, Maharashtra 416001",
    ],
  },
  mapsEmbedUrl:
    "https://maps.google.com/maps?q=" +
    encodeURIComponent(
      "PRINTSHUBH JUMBO ZEROX, B-6, Mahalaxmi Chamber, Near C.B. Stand, Shahupuri, Kolhapur, Maharashtra 416001",
    ) +
    "&output=embed",
  directionsUrl:
    "https://www.google.com/maps/dir/?api=1&destination=" +
    encodeURIComponent(
      "PRINTSHUBH JUMBO ZEROX, B-6, Mahalaxmi Chamber, Near C.B. Stand, Shahupuri, Kolhapur, Maharashtra 416001",
    ),
  postal: {
    streetAddress: "B-6, Mahalaxmi Chamber, Near C.B. Stand, Shahupuri",
    addressLocality: "Kolhapur",
    addressRegion: "Maharashtra",
    postalCode: "416001",
    addressCountry: "IN",
  },
};

/* ── Opening hours ─────────────────────────────────────────────────────
 * `schema` uses schema.org openingHours syntax ("Mo-Sa 09:00-21:00") and
 * must match the Google Business Profile exactly. Leave null if unsure. */
export interface OpeningHours {
  rows: { days: Record<Lang, string>; time: Record<Lang, string> }[];
  schema: string[];
}

/* Google Business Profile → Hours: Monday–Saturday 09:00–21:00, Sunday
 * closed. `schema` omits Sunday entirely — schema.org expresses "closed" by
 * absence, and listing a closed day with no times is invalid. */
export const OPENING_HOURS: OpeningHours | null = {
  rows: [
    {
      days: { mr: "सोमवार – शनिवार", en: "Monday – Saturday" },
      time: { mr: "सकाळी ९ ते रात्री ९", en: "9:00 am – 9:00 pm" },
    },
    {
      days: { mr: "रविवार", en: "Sunday" },
      time: { mr: "बंद", en: "Closed" },
    },
  ],
  schema: ["Mo-Sa 09:00-21:00"],
};

/* ── Google Business Profile ───────────────────────────────────────────
 * `profileUrl`  → the public "See all reviews" / maps place link.
 * `reviews`     → REAL, verbatim reviews copied from that profile only.
 *                 Never write a review yourself, never paraphrase, never
 *                 invent a name. Leave the array empty if you have none.
 * `rating` / `reviewCount` → copy the live numbers from the profile, or
 *                 leave null. They are only rendered (and only put into
 *                 AggregateRating schema) when BOTH are set. */
export interface GoogleReview {
  author: string;
  rating: 1 | 2 | 3 | 4 | 5;
  /** Verbatim review text. Not translated — reviews are quoted as written. */
  text: string;
}

/* Built from the profile's CID (ludocid=356093302010606742, taken from the
 * Google search URL for the profile). ?cid= is Google's canonical permalink
 * form for a place.
 *
 * ⚠ VERIFY ONCE: click this link and confirm it opens PRINTSHUBH JUMBO
 * ZEROX. If it does not, replace it with the "Share" link from the profile.
 * It was derived from a URL parameter, not read off the profile directly. */
export const GOOGLE_PROFILE_URL: string | null =
  "https://www.google.com/maps?cid=356093302010606742";

/* Aggregate figures read off the profile on 2026-08-23: "4.9 ★ 32 Google
 * reviews". Both are set, so the rating renders AND enters aggregateRating
 * in the PrintShop schema. Refresh them together — a stale count next to a
 * live rating is what Google flags. */
export const GOOGLE_RATING: number | null = 4.9;
export const GOOGLE_REVIEW_COUNT: number | null = 32;

/* Still empty, deliberately. Only one review was legible in the screenshots
 * — "I Give 5 For service and the Fine Quality of work." (5★) — and the
 * reviewer's NAME was not visible, only an avatar initial. Publishing a real
 * person's words under a name I invented is not something to guess at.
 *
 * To switch the review cards on: open the profile → Read reviews → copy each
 * review verbatim with the reviewer's actual display name. Until then the
 * section shows the 4.9/32 aggregate and a link to read them on Google,
 * which is accurate on its own. */
export const GOOGLE_REVIEWS: GoogleReview[] = [];

/* ── Social profiles ───────────────────────────────────────────────────
 * Google Business Profile → Contact → "Social profiles". These feed the
 * `sameAs` array in the PrintShop schema, which is how a search engine
 * confirms that this website, this Google listing and these social accounts
 * are all the same business.
 *
 * Only accounts the owner actually controls. An unofficial fan page or a
 * lookalike handle in `sameAs` links the entity to something they cannot
 * vouch for. */
export const SOCIAL_PROFILES: string[] = [
  "https://www.instagram.com/printshubh_digital_printing/",
];

/* ── Real shop photographs ─────────────────────────────────────────────
 * Put the actual PrintShubh photos in /public/shop/ and list them here.
 * Stock photography is NOT allowed — the whole point of this section is
 * "we are a real shop you can walk into".
 *
 * Use WebP or AVIF, and give the true intrinsic pixel width/height so
 * next/image reserves the right space (no layout shift). */
export interface ShopPhoto {
  src: string;
  width: number;
  height: number;
  alt: Record<Lang, string>;
  caption: Record<Lang, string>;
}

/* Still empty: the Google profile has shopfront photos, but the image files
 * themselves are not in this repo and cannot be pulled from Google. Export
 * them from the profile (or reshoot), drop them in /public/shop/, and list
 * them here — then the hero leads with a real photo and the gallery appears. */
export const SHOP_PHOTOS: ShopPhoto[] = [];

/* ── Work samples ──────────────────────────────────────────────────────
 * Previews of real output (a print, a photo sheet, a map). Every sample
 * MUST be redacted: no owner names, survey numbers, phone numbers,
 * addresses or document IDs may be legible. Anything not fully redacted
 * does not go in this list. */
export interface WorkSample {
  src: string;
  width: number;
  height: number;
  alt: Record<Lang, string>;
  label: Record<Lang, string>;
  /** Set true only after a human has confirmed the image is redacted. */
  redacted: true;
}

export const WORK_SAMPLES: WorkSample[] = [];

/* ── Derived helpers ───────────────────────────────────────────────────
 * Sections call these instead of testing the raw exports, so the "should
 * I render?" rule lives in exactly one place. */
export const hasAddress = (): boolean => SHOP_ADDRESS !== null;
export const hasHours = (): boolean => OPENING_HOURS !== null;
export const hasShopPhotos = (): boolean => SHOP_PHOTOS.length > 0;
export const hasWorkSamples = (): boolean => WORK_SAMPLES.length > 0;
export const hasReviews = (): boolean => GOOGLE_REVIEWS.length > 0;
export const hasAggregateRating = (): boolean =>
  GOOGLE_RATING !== null && GOOGLE_REVIEW_COUNT !== null;
