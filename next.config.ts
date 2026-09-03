import type { NextConfig } from "next";

/* ── Security headers ────────────────────────────────────────────────────
 *
 * Applied to every route. These are the low-risk, no-CSP headers — they
 * don't restrict where scripts/styles/images load from, so they can't
 * break MapLibre tiles, the Spline showcase, the pdf.js worker, or Next's
 * inline hydration scripts.
 *
 * Deliberately NOT here yet: a full Content-Security-Policy. A strict CSP
 * needs per-route allow-lists (OSM/Esri/OpenTopoMap tile hosts, Spline CDN,
 * unpkg pdf worker, Next inline scripts) and must be validated route-by-
 * route — it's a separate, tested change. `frame-ancestors` below gives the
 * clickjacking protection a CSP would, without that risk.
 *
 * Permissions-Policy intentionally ALLOWS geolocation=(self) — the map's
 * "माझे स्थान / My location" button needs it. Blocking it would break that
 * feature. */
const securityHeaders = [
  {
    // HSTS — force HTTPS for a year (the site is HTTPS-only on Vercel).
    // No `preload` so the choice stays reversible.
    key: "Strict-Transport-Security",
    value: "max-age=31536000; includeSubDomains",
  },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    // Modern clickjacking protection (supersedes X-Frame-Options); a CSP
    // with ONLY frame-ancestors restricts framing and nothing else.
    key: "Content-Security-Policy",
    value: "frame-ancestors 'self'",
  },
  {
    key: "Permissions-Policy",
    value: "geolocation=(self), camera=(), microphone=(), payment=()",
  },
];

const RETIRED_HOSTS = ["printshubh.com", "www.printshubh.com"];

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1"],

  /* ── Apex → www, 308 Permanent ───────────────────────────────────────
   *
   * The canonical domain is https://www.printshubh.shop — every canonical
   * tag, the sitemap, robots.txt and the JSON-LD already say so. This makes
   * the apex agree, at the application layer.
   *
   * WHY IN CODE AND NOT AT THE HOST: this redirect is currently performed by
   * Vercel's domain settings, which only apply to traffic that reaches
   * Vercel. The moment DNS is pointed at Hostinger, that redirect stops
   * existing and the apex would serve the site as a second address. Putting
   * it here means it travels with the application to any host.
   *
   * The `has` host condition is what prevents an infinite loop: the rule
   * fires ONLY when the request arrives on the bare apex. A request already
   * on www.printshubh.shop does not match and is served normally.
   *
   * `permanent: true` emits 308 (not 301) so the request method is preserved
   * — see the Next.js redirects docs. Query strings are carried across
   * automatically; `:path*` carries the rest of the pathname.
   *
   * Note: this does not fire on localhost (the host is `localhost:PORT`), so
   * local development and `next start` are unaffected. To exercise it
   * locally, send the header explicitly:
   *   curl -I -H "Host: printshubh.shop" http://localhost:3000/about */
  /* Both forms of the retired domain. Listed once so a rule cannot be added
   * for the apex and quietly forgotten for www. */
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "printshubh.shop" }],
        destination: "https://www.printshubh.shop/:path*",
        permanent: true,
      },
      /*
       * printshubh.com is being retired, and its pages are moved here one by
       * one rather than swept onto the homepage.
       *
       * Why the explicit list: the old site is WordPress, and its slugs are
       * not this site's slugs. A single per-path rule looked right and was
       * mostly wrong — /about-us, /contact-us, /terms-conditions,
       * /privacy-policy-2 and /return-refund-policy would each have landed on
       * a 404 here. The list below is not guesswork: it is every page the old
       * site has, read from its own API (12 pages, no posts, no products).
       *
       * The commerce pages have no equivalent. /shop already redirects to the
       * homepage on the old site and sells nothing; /cart, /checkout and
       * /my-account are session pages with no content and no search value.
       * Those go to the homepage, which is the honest destination.
       *
       * Anything not listed never existed, so it falls through to the general
       * rule and reaches this site's own 404 — the right answer for a URL
       * that was never real.
       *
       * A WordPress URL usually ends in a slash and those take two hops: Next
       * strips the trailing slash on the original host first, then these fire.
       * Both are 308 and the destination is right, but it is a chain.
       * Vercel's per-domain "Redirect to" runs at the edge and avoids it —
       * prefer that if the domain is set up that way; these rules are the
       * version-controlled fallback and do no harm alongside it.
       *
       * None of this does anything until printshubh.com actually points at
       * Vercel and is added to this project. Keep the domain registered — a
       * redirect only works while it is yours.
       */
      ...Object.entries({
        "/about-us": "/about",
        "/contact-us": "/contact",
        "/terms-conditions": "/terms",
        "/privacy-policy-2": "/privacy",
        "/return-refund-policy": "/refund",
        // No shipping on this site; the policies that do apply live here.
        "/shipping-policy": "/terms",
        "/shop": "/",
        "/cart": "/",
        "/checkout": "/",
        "/my-account": "/",
      }).flatMap(([from, to]) =>
        RETIRED_HOSTS.map((host) => ({
          source: from,
          has: [{ type: "host" as const, value: host }],
          destination: `https://www.printshubh.shop${to}`,
          permanent: true,
        })),
      ),

      /* Everything else keeps its path: / and /faq already match, and a URL
       * that never existed deserves a 404 rather than a soft landing. */
      ...RETIRED_HOSTS.map((host) => ({
        source: "/:path*",
        has: [{ type: "host" as const, value: host }],
        destination: "https://www.printshubh.shop/:path*",
        permanent: true,
      })),
    ];
  },

  async headers() {
    return [
      {
        // Security headers on every route.
        source: "/:path*",
        headers: securityHeaders,
      },
      {
        // Static reference data (village boundaries, dropdowns, LGD master)
        // under /public/data. These are immutable per build but keep the same
        // URL across deploys, so we avoid `immutable` (a corrected boundary
        // would otherwise stay stale in a user's browser for the full max-age).
        // 1h fresh + 7d stale-while-revalidate: repeat clicks within a session
        // serve from cache instantly; data fixes propagate within the hour.
        // Default was `max-age=0, must-revalidate` → a network round-trip on
        // every single boundary/dropdown load.
        source: "/data/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=3600, stale-while-revalidate=604800",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
