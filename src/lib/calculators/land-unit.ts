/**
 * Land-area unit conversions — pure, framework-free, unit-testable.
 *
 * Single source of truth for guntha/acre/hectare/sq.ft figures shown by the
 * /land-unit-converter tool AND by map-reference-section.tsx's drawn-polygon
 * area readout, so the two never drift apart. All conversions go through
 * square metres as the common base.
 *
 * acre and guntha are the exact values map-reference-section.tsx used
 * inline before this module existed — kept identical on purpose.
 */

export type LandAreaUnit = "sqm" | "sqft" | "guntha" | "acre" | "hectare";

export const LAND_AREA_UNITS: LandAreaUnit[] = [
  "sqm",
  "sqft",
  "guntha",
  "acre",
  "hectare",
];

const SQM_PER_UNIT: Record<LandAreaUnit, number> = {
  sqm: 1,
  sqft: 0.09290304,
  guntha: 101.171,
  acre: 4046.8564224,
  hectare: 10000,
};

export const UNIT_LABEL: Record<LandAreaUnit, { mr: string; en: string }> = {
  sqm: { mr: "चौ. मीटर", en: "sq.m" },
  sqft: { mr: "चौ. फूट", en: "sq.ft" },
  guntha: { mr: "गुंठा", en: "guntha" },
  acre: { mr: "एकर", en: "acre" },
  hectare: { mr: "हेक्टर", en: "hectare" },
};

function toSqm(value: number, unit: LandAreaUnit): number {
  if (!Number.isFinite(value) || value < 0) return 0;
  return value * SQM_PER_UNIT[unit];
}

function fromSqm(sqm: number, unit: LandAreaUnit): number {
  if (!Number.isFinite(sqm) || sqm < 0) return 0;
  return sqm / SQM_PER_UNIT[unit];
}

/** Convert a value from one land-area unit to another. */
export function convertLandArea(
  value: number,
  from: LandAreaUnit,
  to: LandAreaUnit,
): number {
  return fromSqm(toSqm(value, from), to);
}

/** All five units for a given input, keyed for a results table/list. */
export function allUnitsFor(
  value: number,
  from: LandAreaUnit,
): Record<LandAreaUnit, number> {
  const sqm = toSqm(value, from);
  const out = {} as Record<LandAreaUnit, number>;
  for (const unit of LAND_AREA_UNITS) out[unit] = fromSqm(sqm, unit);
  return out;
}

/** Bilingual "sq.m · acre · guntha" summary string. Moved here from
 * map-reference-section.tsx so the constants live in exactly one place. */
export function formatAcreGuntha(sqm: number, lang: "mr" | "en"): string {
  const acre = fromSqm(sqm, "acre");
  const guntha = fromSqm(sqm, "guntha");
  if (lang === "mr") {
    return `${sqm.toFixed(0)} वर्ग मीटर · ${acre.toFixed(3)} एकर · ${guntha.toFixed(2)} गुंठा`;
  }
  return `${sqm.toFixed(0)} sq.m · ${acre.toFixed(3)} acre · ${guntha.toFixed(2)} guntha`;
}
