/**
 * UNUSED — replaced by topographic-map-visual.tsx (pure SVG, no texture dependency)
 * This file can be safely deleted. It is no longer imported anywhere.
 *
 * EarthGlobe — Real 3D Earth using Three.js + React Three Fiber
 *
 * Texture files required (place in your project's public/ folder):
 *   public/earth/earth-day.jpg     ← real NASA/satellite Earth photo texture
 *   public/earth/earth-clouds.png  ← optional transparent cloud overlay
 *
 * Free textures:
 *   https://visibleearth.nasa.gov/collection/1484/blue-marble
 *   https://www.solarsystemscope.com/textures/
 *
 * If earth-day.jpg is missing, a clean dark-blue sphere is shown with an info message.
 * No cartoon land patches. No abstract green shapes.
 */

"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";

/* ── Dynamically imported so Canvas/Three.js never runs on the server ── */
const EarthCanvas = dynamic(() => import("./earth-globe-canvas"), {
  ssr: false,
  loading: () => <GlobePlaceholder />,
});

function GlobePlaceholder() {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "radial-gradient(circle at 35% 30%, #1b6eb5 0%, #062c5e 100%)",
        borderRadius: "inherit",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          background: "rgba(255,255,255,0.9)",
          border: "1px solid rgba(147,197,253,0.6)",
          borderRadius: 8,
          padding: "8px 16px",
          fontSize: 13,
          fontWeight: 700,
          color: "#1e3a8a",
        }}
      >
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: "#2563eb",
            display: "inline-block",
          }}
        />
        3D पृथ्वी तयार होत आहे…
      </div>
    </div>
  );
}

/**
 * Drop-in replacement for the cartoonish GlobeStage.
 * Usage: replace <GlobeStage /> in storytelling-section.tsx with <EarthGlobe />.
 * The wrapper keeps the same sizing pattern as the original `relative h-[400px]` div.
 */
export function EarthGlobe({ className = "" }: { className?: string }) {
  return (
    <div className={`relative overflow-hidden rounded-lg border border-blue-100 ${className}`}>
      <Suspense fallback={<GlobePlaceholder />}>
        <EarthCanvas />
      </Suspense>
    </div>
  );
}
