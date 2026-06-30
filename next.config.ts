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
