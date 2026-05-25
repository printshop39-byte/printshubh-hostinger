/**
 * Maharashtra display-name maps for PrintShubh.
 *
 * Why this exists:
 *  - The source DBF (MAHARASHTRA shapefile) has UPPERCASE English names and
 *    NO Marathi names at all.
 *  - A few rows came through with byte-corruption where `>` (0x3E) replaced
 *    `A` (0x41) — see KNOWN_NAME_FIXES below. The corruption is confined
 *    entirely to district rows; talukas and villages are clean.
 *
 * Two-step display pipeline (used by displayName() in map-reference-section.tsx):
 *   1. Look up the raw name in KNOWN_NAME_FIXES (recovers bytes we can't infer).
 *   2. Title-case the result, preserving common patterns like "Kh.", "Bk.",
 *      "Mohoj Kh.", "(M Corp)", etc.
 *   3. If language === "mr" AND the title-cased name is in DISTRICT_MR_MAP,
 *      show the Marathi version instead.
 *
 * Extending this file:
 *  - Add taluka/village Marathi names to dedicated maps below as you collect
 *    them. We don't ship a 44k-row Marathi table here — it would inflate the
 *    bundle and most of it would be guesswork. Curate gradually.
 */

/* ── Known byte-corruption fixes ─────────────────────────────────────────────
 * All district rows where `>` replaced a letter (always `A`) plus the one
 * row where the original name dropped to "" during the build.
 * Keys are the *raw* values present in /public/data/dropdowns/districts.json.
 * Values are the clean ASCII uppercase form (further title-cased by helper). */
export const KNOWN_NAME_FIXES: Record<string, string> = {
  "KOLH>PUR": "KOLHAPUR",
  "N>NDED": "NANDED",
  "NANDURB>R": "NANDURBAR",
  "N>SHIK": "NASHIK",
  "S>T>RA": "SATARA",
  // LGD 503 district row arrived with an empty name_en during shapefile build.
  // LGD 503 = Amravati (its talukas are Anjangaon Surji, Achalpur, Chikhaldara…).
  // We recover via district_id below in displayName() — this row stays here so
  // someone scanning the file can see the empty case was deliberate.
};

/* ── district_id → fallback English ───────────────────────────────────────
 * Used in two places:
 *   1. When DistrictRow.name_en is empty (LGD 503 / Amravati was the original
 *      case).
 *   2. As a secondary key inside the MAHA / LGD lookup chain when the raw
 *      name_en is byte-corrupted (e.g. KOLH>PUR — see KNOWN_NAME_FIXES).
 *      The slug is the canonical key in /public/data/dropdowns/, so any
 *      district that appears there must have an entry below for the
 *      localization helpers to find a clean English form. */
export const DISTRICT_ID_FALLBACK_EN: Record<string, string> = {
  "d-503": "AMRAVATI",
  "kolh-pur": "KOLHAPUR",
  "n-nded": "NANDED",
  "nandurb-r": "NANDURBAR",
  "n-shik": "NASHIK",
  "s-t-ra": "SATARA",
};

/* ── Marathi names for every Maharashtra district ────────────────────────────
 * Keys are the *cleaned, title-cased* English form (i.e. the output of
 * titleCaseName(KNOWN_NAME_FIXES[raw] ?? raw)). */
export const DISTRICT_MR_MAP: Record<string, string> = {
  "Ahilyanagar": "अहिल्यानगर",
  "Akola": "अकोला",
  "Amravati": "अमरावती",
  "Beed": "बीड",
  "Bhandara": "भंडारा",
  "Buldhana": "बुलढाणा",
  "Chandrapur": "चंद्रपूर",
  "Chhatrapati Sambhajinagar": "छत्रपती संभाजीनगर",
  "Dharashiv": "धाराशिव",
  "Dhule": "धुळे",
  "Gadchiroli": "गडचिरोली",
  "Gondia": "गोंदिया",
  "Hingoli": "हिंगोली",
  "Jalgaon": "जळगाव",
  "Jalna": "जालना",
  "Kolhapur": "कोल्हापूर",
  "Latur": "लातूर",
  "Mumbai": "मुंबई",
  "Mumbai Suburban": "मुंबई उपनगर",
  "Nagpur": "नागपूर",
  "Nanded": "नांदेड",
  "Nandurbar": "नंदुरबार",
  "Nashik": "नाशिक",
  "Palghar": "पालघर",
  "Parbhani": "परभणी",
  "Pune": "पुणे",
  "Raigad": "रायगड",
  "Ratnagiri": "रत्नागिरी",
  "Sangli": "सांगली",
  "Satara": "सातारा",
  "Sindhudurg": "सिंधुदुर्ग",
  "Solapur": "सोलापूर",
  "Thane": "ठाणे",
  "Wardha": "वर्धा",
  "Washim": "वाशिम",
  "Yavatmal": "यवतमाळ",
};

/* ── (Optional) taluka Marathi mappings — curate over time ────────────────── */
export const TALUKA_MR_MAP: Record<string, string> = {
  // Examples — add as needed:
  // "Karveer": "करवीर",
  // "Gadhinglaj": "गडहिंग्लज",
  // "Jamkhed": "जामखेड",
};

/* ── (Optional) village Marathi mappings — curate over time ───────────────── */
export const VILLAGE_MR_MAP: Record<string, string> = {
  // Examples — add as needed:
  // "Kanerivadi": "कणेरीवाडी",
};
