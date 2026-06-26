import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1"],

  async headers() {
    return [
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
