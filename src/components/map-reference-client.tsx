"use client";

import dynamic from "next/dynamic";

const MapReferenceSection = dynamic(
  () => import("@/components/map-reference-section").then((m) => m.MapReferenceSection),
  { ssr: false, loading: () => <div className="h-96" /> },
);

export { MapReferenceSection };
