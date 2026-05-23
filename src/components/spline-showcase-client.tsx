"use client";

import dynamic from "next/dynamic";

const SplineShowcaseSection = dynamic(
  () =>
    import("@/components/spline-showcase-section").then(
      (m) => m.SplineShowcaseSection,
    ),
  {
    ssr: false,
    loading: () => null,
  },
);

export function SplineShowcaseClient() {
  return <SplineShowcaseSection />;
}
