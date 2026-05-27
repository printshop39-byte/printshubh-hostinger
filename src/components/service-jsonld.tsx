/**
 * ServiceJsonLd
 *
 * Server-rendered JSON-LD `<script>` triplet for a single service page:
 *   - Service           — describes the service the page is about
 *   - BreadcrumbList    — Home › Services › <this page>
 *   - FAQPage           — emitted only when faqPairs are provided
 *
 * Why a single component for all three:
 *   Keeps the page file readable (one import, one JSX node) and keeps
 *   the structured data colocated with the page's metadata export, which
 *   is how Google's Rich Results Test expects to find it (in <head> or
 *   near it). React 19 hoists application/ld+json scripts; we still
 *   render them via dangerouslySetInnerHTML so the JSON is emitted
 *   verbatim without React's HTML escaping mangling the JSON.
 *
 * Server component on purpose — no useState/useEffect — so the markup
 * ships in the initial HTML response (which is what crawlers see).
 */

/* Inlined contact strings — kept in sync with SITE_CONTACT in
 * src/components/site-footer.tsx. We don't import from there because
 * site-footer.tsx is a "use client" module; this is a server component
 * and importing across the boundary can confuse the bundler. */
const SITE_CONTACT = {
  phone: "+91 86258 01907",
  email: "support@printshubh.shop",
} as const;

const SITE_URL = "https://www.printshubh.shop";

export interface ServiceJsonLdProps {
  /** Page-relative URL, e.g. "/satbara-utara-maharashtra/". */
  path: string;
  /** Marathi service name shown to users — used as the Service.name. */
  serviceName: string;
  /** English Service.alternateName so non-Marathi crawlers index too. */
  serviceNameEn: string;
  /** Short Service.description (1–2 sentences). English is the better
   *  language for schema.org descriptions because Google's NLU is
   *  strongest there; we keep the user-facing copy Marathi-first
   *  separately. */
  description: string;
  /** Breadcrumb label for the current page (typically the H1 text). */
  breadcrumbLabel: string;
  /** Optional FAQ pairs — when provided, a FAQPage JSON-LD is emitted. */
  faqPairs?: Array<{ q: string; a: string }>;
}

export function ServiceJsonLd({
  path,
  serviceName,
  serviceNameEn,
  description,
  breadcrumbLabel,
  faqPairs,
}: ServiceJsonLdProps) {
  const url = `${SITE_URL}${path}`;

  const serviceLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: serviceName,
    alternateName: serviceNameEn,
    serviceType: serviceNameEn,
    url,
    provider: {
      "@type": "ProfessionalService",
      name: "PrintShubh",
      url: `${SITE_URL}/`,
      telephone: SITE_CONTACT.phone,
      email: SITE_CONTACT.email,
    },
    areaServed: {
      "@type": "State",
      name: "Maharashtra",
    },
    description,
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
      { "@type": "ListItem", position: 2, name: "Services", item: `${SITE_URL}/` },
      { "@type": "ListItem", position: 3, name: breadcrumbLabel, item: url },
    ],
  };

  const faqLd =
    faqPairs && faqPairs.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqPairs.map((p) => ({
            "@type": "Question",
            name: p.q,
            acceptedAnswer: {
              "@type": "Answer",
              text: p.a,
            },
          })),
        }
      : null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      {faqLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
        />
      )}
    </>
  );
}
