#!/usr/bin/env node
/**
 * build-village-data.mjs - Step 2 of the village-boundary pipeline. (PATCHED v2)
 *
 * Reads the source shapefile and produces:
 *   1. public/data/dropdowns/districts.json
 *   2. public/data/dropdowns/talukas/<district_id>.json
 *   3. public/data/dropdowns/villages/<district_id>/<taluka_id>.json
 *   4. public/data/boundaries/villages/<district_id>/<taluka_id>.geojson
 *   5. public/data/audit/missing_marathi_names.csv
 *   6. public/data/audit/missing_english_names.csv
 *   7. public/data/audit/skipped_records.csv         (NEW)
 *   8. public/data/audit/duplicate_village_ids.csv   (NEW)
 *   9. public/data/audit/duplicate_district_names.csv (NEW)
 *  10. public/data/index.json
 *
 * v2 changes:
 *   - village_id is now built from LGD code when available, then English name,
 *     then Marathi name. Eliminates same-name village collisions inside a taluka.
 *   - district_id likewise prefers Dist_LGD code to distinguish e.g.
 *     Mumbai City vs Mumbai Suburban (same English name, different LGD).
 *   - Logs every skipped row and every collision into CSV audit files.
 *   - Prints a counts summary at the end so the math is visible.
 */

import { readFileSync, existsSync, mkdirSync, writeFileSync, unlinkSync } from "node:fs";
import { resolve, dirname, basename, join } from "node:path";
import mapshaper from "mapshaper";

/* ───────────────────────── arg parsing ──────────────────────────────────── */
const args = {};
for (let i = 2; i < process.argv.length; i++) {
  const a = process.argv[i];
  if (a.startsWith("--")) {
    const key = a.replace(/^--/, "");
    const next = process.argv[i + 1];
    if (next && !next.startsWith("--")) { args[key] = next; i++; }
    else { args[key] = "true"; }
  }
}
const SRC = args.src;
const OUT = resolve(args.out || "public/data");
const SIMPLIFY_PCT = Number(args.simplify || 8);
if (!SRC) { console.error("Missing --src <path-to-shapefile.shp>"); process.exit(1); }

/* ───────────────────────── DBF parser ───────────────────────────────────── */
function parseDbf(dbfPath, encoding) {
  const buf = readFileSync(dbfPath);
  const numRecords = buf.readUInt32LE(4);
  const headerLen = buf.readUInt16LE(8);
  const recordLen = buf.readUInt16LE(10);
  const fields = [];
  let offset = 32;
  while (offset < headerLen - 1) {
    if (buf[offset] === 0x0d) break;
    const nameBytes = buf.subarray(offset, offset + 11);
    const nullAt = nameBytes.indexOf(0);
    const name = nameBytes.subarray(0, nullAt === -1 ? 11 : nullAt).toString("latin1").trim();
    const type = String.fromCharCode(buf[offset + 11]);
    const length = buf[offset + 16];
    const decimals = buf[offset + 17];
    fields.push({ name, type, length, decimals });
    offset += 32;
  }
  return { numRecords, fields };
}

function pickColumn(fields, candidates) {
  const names = fields.map((f) => f.name.toLowerCase());
  for (const c of candidates) {
    const ix = names.indexOf(c.toLowerCase());
    if (ix !== -1) return fields[ix].name;
  }
  for (const c of candidates) {
    const ix = names.findIndex((n) => n.includes(c.toLowerCase()));
    if (ix !== -1) return fields[ix].name;
  }
  return null;
}

/* ───────────────────────── helpers ──────────────────────────────────────── */
function slugify(s) {
  return String(s || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\wऀ-ॿ]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}
function looksLatin(s) { return /^[\x00-\x7F\s]+$/.test(String(s || "")); }
function looksDevanagari(s) { return /[ऀ-ॿ]/.test(String(s || "")); }
function safeCode(s) { return String(s || "").trim().replace(/[^\w]/g, ""); }

/* CSV writer that escapes everything as JSON strings — safe for commas, quotes, Devanagari */
function csv(rows, header) {
  if (!rows.length) return header.join(",") + "\n";
  const lines = [header.join(",")];
  for (const r of rows) {
    lines.push(header.map((h) => JSON.stringify(r[h] ?? "")).join(","));
  }
  return lines.join("\n") + "\n";
}

/* ───────────────────────── main ─────────────────────────────────────────── */
async function main() {
  const shpPath = resolve(SRC);
  const dir = dirname(shpPath);
  const base = basename(shpPath, ".shp");
  const dbfPath = resolve(dir, base + ".dbf");
  const cpgPath = resolve(dir, base + ".cpg");
  const encoding = existsSync(cpgPath) ? readFileSync(cpgPath, "utf8").trim() : "latin1";

  const { fields } = parseDbf(dbfPath, encoding);

  const FIELD_MAP = {
    district:      args["district-field"]      || pickColumn(fields, ["DTNAME","DIST_NAME","DISTRICT","DIST","D_NAME","NAME_2","ADM2_EN","district_n"]),
    district_code: args["district-code-field"] || pickColumn(fields, ["DTCODE","DIST_CODE","DISTCODE","DT_CEN_CD","Dist_LGD"]),
    taluka:        args["taluka-field"]        || pickColumn(fields, ["SDTNAME","SUBDIST_NA","TEHSIL","TAHSIL","TALUKA","TEH_NAME","NAME_3","ADM3_EN","BLOCK","Sub_dist"]),
    taluka_code:   args["taluka-code-field"]   || pickColumn(fields, ["SDTCODE","SUBDIST_CO","TEH_CODE","SUB_DIST_C","Subdis_LGD"]),
    village:       args["village-field"]       || pickColumn(fields, ["VILNAM","VIL_NAME","VILLAGE","VLGNAME","NAME","V_NAME","NAME_4","ADM4_EN","Vill_name"]),
    village_code:  args["village-code-field"]  || pickColumn(fields, ["VILLCODE","VIL_CODE","VILGCODE","CENS_CODE","CENSUSCODE","LGD_CODE","Vill_LGD"]),
    village_mr:    args["village-mr-field"]    || pickColumn(fields, ["VILNAM_MR","VIL_NAME_M","VILLAGE_MR","NAME_MR"]),
    taluka_mr:     args["taluka-mr-field"]     || pickColumn(fields, ["SDTNAM_MR","TEH_NAME_M","TALUKA_MR","NAME_MR_3"]),
    district_mr:   args["district-mr-field"]   || pickColumn(fields, ["DTNAM_MR","DIST_NAME_M","DISTRICT_M","NAME_MR_2"]),
  };

  console.log("FIELD_MAP:");
  console.log(JSON.stringify(FIELD_MAP, null, 2));
  if (!FIELD_MAP.district || !FIELD_MAP.taluka || !FIELD_MAP.village) {
    console.error("ERROR: missing district / taluka / village field.");
    process.exit(1);
  }

  /* ── 1. Reproject + simplify via mapshaper.
        NOTE: '-clean' removed — it can merge adjacent identical-attribute polygons.
        Keep raw counts so we can audit feature loss truthfully. ── */
  mkdirSync(OUT, { recursive: true });
  const tmpAll = resolve(OUT, "_tmp_all.geojson");
  console.log("Reprojecting + simplifying via mapshaper (no -clean, preserves count)...");
  await mapshaper.runCommands([
    "-i", shpPath, "encoding=" + encoding,
    "-proj", "wgs84",
    "-simplify", SIMPLIFY_PCT + "%", "keep-shapes",
    "-o", tmpAll, "format=geojson", "precision=0.00001",
  ]);
  console.log("Wrote temp: " + tmpAll);

  /* ── 2. Read reprojected GeoJSON ── */
  const all = JSON.parse(readFileSync(tmpAll, "utf8"));
  const features = all.features || [];
  console.log("Loaded " + features.length + " features from mapshaper.");

  /* ── Tally + audit collections ── */
  const districts = new Map();        // id -> { id, lgd, name_en, name_mr }
  const districtNameCollisions = []; // same English name, different LGD
  const districtLgdToId = new Map();  // LGD code -> chosen district_id

  const talukas = new Map();          // dist_id + "/" + tal_id -> { ... }

  const villages = new Map();         // dist_id + "/" + tal_id + "/" + vil_id -> village row
  const talukaFeatures = new Map();   // dist_id + "/" + tal_id -> features[]

  const skipped = [];                 // skipped rows (no district / no taluka / no village id / invalid geometry)
  const duplicates = [];              // when two features compete for the same village key
  const missingMr = [];
  const missingEn = [];

  let kept = 0;

  for (const feat of features) {
    const p = feat.properties || {};

    /* Raw attribute reads */
    const distEnRaw = p[FIELD_MAP.district] || "";
    const talEnRaw  = p[FIELD_MAP.taluka]   || "";
    const vilEnRaw  = p[FIELD_MAP.village]  || "";
    const distMrRaw = FIELD_MAP.district_mr ? (p[FIELD_MAP.district_mr] || "") : "";
    const talMrRaw  = FIELD_MAP.taluka_mr   ? (p[FIELD_MAP.taluka_mr]   || "") : "";
    const vilMrRaw  = FIELD_MAP.village_mr  ? (p[FIELD_MAP.village_mr]  || "") : "";

    /* If the "English" column actually holds Devanagari (mixed-script datasets), shuffle */
    const distEn = looksLatin(distEnRaw) ? distEnRaw : "";
    const distMr = looksDevanagari(distEnRaw) ? distEnRaw : distMrRaw;
    const talEn  = looksLatin(talEnRaw)  ? talEnRaw  : "";
    const talMr  = looksDevanagari(talEnRaw)  ? talEnRaw  : talMrRaw;
    const vilEn  = looksLatin(vilEnRaw)  ? vilEnRaw  : "";
    const vilMr  = looksDevanagari(vilEnRaw)  ? vilEnRaw  : vilMrRaw;

    /* LGD codes */
    const distLgd = FIELD_MAP.district_code ? safeCode(p[FIELD_MAP.district_code]) : "";
    const talLgd  = FIELD_MAP.taluka_code   ? safeCode(p[FIELD_MAP.taluka_code])   : "";
    const vilLgd  = FIELD_MAP.village_code  ? safeCode(p[FIELD_MAP.village_code])  : "";

    /* ── Build stable IDs:
       districts/talukas: still slug-based (codes are not always useful for URLs).
       But if two districts share a name string, we disambiguate with the LGD suffix.
       villages: ALWAYS prefer LGD code when present — fully eliminates collisions. ── */
    let distId = slugify(distEn || distMr);
    if (!distId && distLgd) distId = "d-" + distLgd;
    let talId = slugify(talEn || talMr);
    if (!talId && talLgd) talId = "t-" + talLgd;
    let vilId = vilLgd ? "v-" + vilLgd : slugify(vilEn || vilMr);
    if (!vilId) vilId = "v-row-" + (kept + skipped.length);

    if (!distId || !talId || !vilId) {
      skipped.push({
        reason: "empty id",
        district_raw: distEnRaw,
        taluka_raw: talEnRaw,
        village_raw: vilEnRaw,
        dist_lgd: distLgd,
        tal_lgd: talLgd,
        vil_lgd: vilLgd,
      });
      continue;
    }

    /* Geometry guard — skip if mapshaper dropped the geometry */
    if (!feat.geometry || !feat.geometry.coordinates) {
      skipped.push({
        reason: "no geometry",
        district_raw: distEnRaw,
        taluka_raw: talEnRaw,
        village_raw: vilEnRaw,
        dist_lgd: distLgd, tal_lgd: talLgd, vil_lgd: vilLgd,
      });
      continue;
    }

    /* District table — track LGD-vs-name collisions */
    if (!districts.has(distId)) {
      districts.set(distId, { id: distId, lgd: distLgd, name_en: distEn, name_mr: distMr });
      if (distLgd) districtLgdToId.set(distLgd, distId);
    } else {
      const existing = districts.get(distId);
      if (distLgd && existing.lgd && existing.lgd !== distLgd) {
        /* Same name slug but different LGD code — Mumbai City vs Mumbai Suburban etc.
           Disambiguate by appending the LGD code. */
        const newId = distId + "-" + distLgd;
        districtNameCollisions.push({
          original_id: distId,
          new_id: newId,
          name_en: distEn,
          name_mr: distMr,
          original_lgd: existing.lgd,
          new_lgd: distLgd,
        });
        distId = newId;
        if (!districts.has(distId)) {
          districts.set(distId, { id: distId, lgd: distLgd, name_en: distEn, name_mr: distMr });
        }
      }
    }

    /* Taluka table */
    const talKey = distId + "/" + talId;
    if (!talukas.has(talKey)) {
      talukas.set(talKey, { id: talId, district_id: distId, lgd: talLgd, name_en: talEn, name_mr: talMr });
    }

    /* Village table — collision detection */
    const vilKey = distId + "/" + talId + "/" + vilId;
    if (villages.has(vilKey)) {
      const prior = villages.get(vilKey);
      duplicates.push({
        district_id: distId,
        taluka_id: talId,
        village_id: vilId,
        prior_name: prior.name_en || prior.name_mr,
        new_name: vilEn || vilMr,
        prior_lgd: prior.code || "",
        new_lgd: vilLgd,
      });
      /* Still keep the new one with a suffix, so we don't lose the polygon. */
      vilId = vilId + "-dup-" + (duplicates.length);
    }

    villages.set(distId + "/" + talId + "/" + vilId, {
      id: vilId,
      district_id: distId,
      taluka_id: talId,
      name_en: vilEn,
      name_mr: vilMr,
      code: vilLgd || null,
    });

    if (!vilMr) missingMr.push({ district: distEn, taluka: talEn, village: vilEn });
    if (!vilEn) missingEn.push({ district: distMr, taluka: talMr, village: vilMr });

    feat.properties = {
      district_id: distId,
      taluka_id: talId,
      village_id: vilId,
      name_en: vilEn,
      name_mr: vilMr,
      taluka_en: talEn,
      taluka_mr: talMr,
      district_en: distEn,
      district_mr: distMr,
      code: vilLgd || null,
    };

    if (!talukaFeatures.has(talKey)) talukaFeatures.set(talKey, []);
    talukaFeatures.get(talKey).push(feat);
    kept++;
  }

  console.log("");
  console.log("──────────── Counts ────────────");
  console.log("Features from mapshaper: " + features.length);
  console.log("Skipped:                 " + skipped.length);
  console.log("Duplicates (renamed):    " + duplicates.length);
  console.log("Kept villages:           " + kept);
  console.log("Districts:               " + districts.size);
  console.log("Talukas:                 " + talukas.size);
  console.log("District name collisions: " + districtNameCollisions.length);
  console.log("────────────────────────────────");
  console.log("");

  /* ── 3. Dropdown JSONs ── */
  const dropdownsDir = join(OUT, "dropdowns");
  mkdirSync(dropdownsDir, { recursive: true });
  const districtsArr = [...districts.values()].map((d) => ({
    district_id: d.id, name_en: d.name_en, name_mr: d.name_mr, lgd: d.lgd || null,
  }));
  writeFileSync(join(dropdownsDir, "districts.json"), JSON.stringify(districtsArr, null, 2));

  mkdirSync(join(dropdownsDir, "talukas"), { recursive: true });
  for (const d of districts.values()) {
    const talukasOfDist = [...talukas.values()]
      .filter((t) => t.district_id === d.id)
      .map((t) => ({
        taluka_id: t.id, district_id: t.district_id,
        name_en: t.name_en, name_mr: t.name_mr,
        lgd: t.lgd || null,
      }));
    writeFileSync(join(dropdownsDir, "talukas", d.id + ".json"), JSON.stringify(talukasOfDist, null, 2));
  }

  mkdirSync(join(dropdownsDir, "villages"), { recursive: true });
  for (const [, tal] of talukas.entries()) {
    const villagesOfTal = [...villages.values()]
      .filter((v) => v.district_id === tal.district_id && v.taluka_id === tal.id)
      .map((v) => ({
        village_id: v.id, district_id: v.district_id, taluka_id: v.taluka_id,
        name_en: v.name_en, name_mr: v.name_mr, code: v.code,
        boundary_file: "/data/boundaries/villages/" + v.district_id + "/" + v.taluka_id + ".geojson",
      }));
    mkdirSync(join(dropdownsDir, "villages", tal.district_id), { recursive: true });
    writeFileSync(join(dropdownsDir, "villages", tal.district_id, tal.id + ".json"), JSON.stringify(villagesOfTal, null, 2));
  }

  /* ── 4. Boundary GeoJSON per taluka ── */
  const boundDir = join(OUT, "boundaries", "villages");
  for (const [talKey, feats] of talukaFeatures.entries()) {
    const [distId, talId] = talKey.split("/");
    const subDir = join(boundDir, distId);
    mkdirSync(subDir, { recursive: true });
    const fc = { type: "FeatureCollection", features: feats };
    writeFileSync(join(subDir, talId + ".geojson"), JSON.stringify(fc));
  }

  /* ── 5. Audit CSVs ── */
  const auditDir = join(OUT, "audit");
  mkdirSync(auditDir, { recursive: true });

  writeFileSync(
    join(auditDir, "missing_marathi_names.csv"),
    csv(missingMr, ["district", "taluka", "village"]),
  );
  writeFileSync(
    join(auditDir, "missing_english_names.csv"),
    csv(missingEn, ["district", "taluka", "village"]),
  );
  writeFileSync(
    join(auditDir, "skipped_records.csv"),
    csv(skipped, ["reason", "district_raw", "taluka_raw", "village_raw", "dist_lgd", "tal_lgd", "vil_lgd"]),
  );
  writeFileSync(
    join(auditDir, "duplicate_village_ids.csv"),
    csv(duplicates, ["district_id", "taluka_id", "village_id", "prior_name", "new_name", "prior_lgd", "new_lgd"]),
  );
  writeFileSync(
    join(auditDir, "duplicate_district_names.csv"),
    csv(districtNameCollisions, ["original_id", "new_id", "name_en", "name_mr", "original_lgd", "new_lgd"]),
  );

  /* ── 6. index.json ── */
  writeFileSync(join(OUT, "index.json"), JSON.stringify({
    generated_at: new Date().toISOString(),
    source_features: features.length,
    counts: {
      districts: districts.size,
      talukas: talukas.size,
      villages: kept,
      skipped: skipped.length,
      duplicates_renamed: duplicates.length,
      district_name_collisions: districtNameCollisions.length,
    },
    simplify_pct: SIMPLIFY_PCT,
    crs: "EPSG:4326",
  }, null, 2));

  try { unlinkSync(tmpAll); } catch {}

  console.log("Done.");
  console.log("");
  console.log("If kept < source_features, review:");
  console.log("  " + join(auditDir, "skipped_records.csv"));
  console.log("  " + join(auditDir, "duplicate_village_ids.csv"));
  console.log("  " + join(auditDir, "duplicate_district_names.csv"));
}
main().catch((e) => { console.error(e); process.exit(1); });