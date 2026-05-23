"use client";

import dynamic from "next/dynamic";

const VillageMap = dynamic(
  () => import("@/components/village-map").then((m) => m.VillageMap),
  { ssr: false, loading: () => null },
);

export function VillageMapClient() {
  return <VillageMap />;
}
