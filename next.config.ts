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
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "printshubh.shop" }],
        destination: "https://www.printshubh.shop/:path*",
        permanent: true,
      },
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
