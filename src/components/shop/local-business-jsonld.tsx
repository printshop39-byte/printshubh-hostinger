/**
 * LocalBusinessJsonLd — THE structured-data node for the business.
 *
 * Rendered from src/app/layout.tsx, so it appears on every route and there
 * is exactly one local-business entity across the site. It replaced the
 * ProfessionalService node that used to sit in the layout; two un-linked
 * business nodes at one URL split the entity signals in Google's eyes.
 *
 * Server component (no hooks, no "use client") so the markup ships in the
 * initial HTML, which is what crawlers read.
 *
 * WHAT IT EMITS
 *   - PrintShop            — always. A LocalBusiness subtype that names the
 *                            counter services; this is the entity a "jumbo
 *                            xerox near me" search should match.
 *   - PostalAddress + geo  — only when SHOP_ADDRESS is filled in.
 *   - openingHoursSpec     — only when OPENING_HOURS is filled in.
 *   - aggregateRating      — only when BOTH the rating and the review count
 *                            are filled in.
 *
 * Google penalises structured data that asserts things the page does not
 * show, so every optional block above is gated on the same data the visible
 * sections are gated on. An address that is not on the page is not in the
 * schema either.
 *
 * The root layout also emits Organization (#organization) and WebSite
 * (#website); this node links to the first via parentOrganization, and the
 * service pages point their `provider` at #printshop. One business, one
 * description, three linked nodes.
 */

import {
  ESTABLISHED,
  GBP_NAME,
  GOOGLE_PROFILE_URL,
  GOOGLE_RATING,
  GOOGLE_REVIEW_COUNT,
  OPENING_HOURS,
  SHOP_ADDRESS,
  SHOP_PHOTOS,
  SOCIAL_PROFILES,
  hasAggregateRating,
} from "@/lib/shop-profile";
import { SERVICE_GROUPS } from "@/lib/shop-services";

const SITE_URL = "https://www.printshubh.shop";

/* Inlined contact strings — kept in sync with SITE_CONTACT in
 * src/components/site-footer.tsx. Not imported from there because that file
 * is a "use client" module and this is a server component. */
const CONTACT = {
  phone: "+91 86258 01907",
  email: "support@printshubh.shop",
} as const;

/** "Mo-Sa 09:00-21:00" → an OpeningHoursSpecification object. */
function parseOpeningHours(spec: string) {
  const dayMap: Record<string, string> = {
    Mo: "Monday",
    Tu: "Tuesday",
    We: "Wednesday",
    Th: "Thursday",
    Fr: "Friday",
    Sa: "Saturday",
    Su: "Sunday",
  };
  const order = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

  const [daysPart, timePart] = spec.trim().split(/\s+/);
  const [opens, closes] = (timePart ?? "").split("-");

  // "Mo-Sa" expands to the run of days; "Mo,We" and a bare "Su" also work.
  const days: string[] = [];
  for (const chunk of (daysPart ?? "").split(",")) {
    const [from, to] = chunk.split("-");
    if (to) {
      const start = order.indexOf(from);
      const end = order.indexOf(to);
      if (start >= 0 && end >= start) {
        for (let i = start; i <= end; i += 1) days.push(dayMap[order[i]]);
      }
    } else if (dayMap[from]) {
      days.push(dayMap[from]);
    }
  }

  return {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: days,
    opens,
    closes,
  };
}

export function LocalBusinessJsonLd() {
  const localBusinessLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "PrintShop",
    "@id": `${SITE_URL}/#printshop`,
    // Literally the Google Business Profile name — see GBP_NAME. Schema and
    // profile must agree character for character or the citation does not
    // match.
    name: GBP_NAME,
    alternateName: ["PrintShubh", "PRINTSHUBH JUMBO XEROX"],
    foundingDate: ESTABLISHED,
    url: `${SITE_URL}/`,
    telephone: CONTACT.phone,
    email: CONTACT.email,
    description:
      "PrintShubh (Jumbo Xerox) is a print shop offering jumbo xerox, colour and black-and-white photocopying, A4/A3 and poster printing, scanning, binding, lamination, passport and ID photos, and private assistance with Maharashtra land documents. PrintShubh is not a government website.",
    // The counter services, in the same order the site presents them.
    makesOffer: SERVICE_GROUPS.flatMap((group) =>
      group.items.map((item) => ({
        "@type": "Offer",
        itemOffered: { "@type": "Service", name: item.label.en },
      })),
    ),
    areaServed: { "@type": "State", name: "Maharashtra" },
    // Joins the graph declared in src/app/layout.tsx. Both @ids are
    // permanent — changing one silently detaches the entity.
    parentOrganization: { "@id": `${SITE_URL}/#organization` },
  };

  // Address / geo / map link — only when the owner has confirmed them.
  if (SHOP_ADDRESS) {
    localBusinessLd.address = {
      "@type": "PostalAddress",
      ...SHOP_ADDRESS.postal,
    };
    localBusinessLd.hasMap = SHOP_ADDRESS.directionsUrl;
    if (SHOP_ADDRESS.geo) {
      localBusinessLd.geo = {
        "@type": "GeoCoordinates",
        latitude: SHOP_ADDRESS.geo.latitude,
        longitude: SHOP_ADDRESS.geo.longitude,
      };
    }
  }

  if (OPENING_HOURS) {
    localBusinessLd.openingHoursSpecification =
      OPENING_HOURS.schema.map(parseOpeningHours);
  }

  if (SHOP_PHOTOS.length > 0) {
    localBusinessLd.image = SHOP_PHOTOS.map((photo) => `${SITE_URL}${photo.src}`);
  }

  /* sameAs — every other place on the web that is verifiably this same
   * business: the Google listing plus any social accounts the owner runs.
   * Emitted only when there is at least one, so the key never appears empty. */
  const sameAs = [GOOGLE_PROFILE_URL, ...SOCIAL_PROFILES].filter(
    (url): url is string => typeof url === "string" && url.length > 0,
  );
  if (sameAs.length > 0) {
    localBusinessLd.sameAs = sameAs;
  }

  // A rating with no review count behind it is a number with no weight, and
  // Google treats an unsupported aggregateRating as a spam signal.
  if (hasAggregateRating()) {
    localBusinessLd.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: GOOGLE_RATING,
      reviewCount: GOOGLE_REVIEW_COUNT,
    };
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessLd) }}
    />
  );
}
