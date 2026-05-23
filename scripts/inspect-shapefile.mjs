#!/usr/bin/env node
/**
 * inspect-shapefile.mjs - Step 1 of the village-boundary pipeline.
 *
 * Reads the .dbf header of MAHARASHTRA.shp (or any shapefile passed as arg)
 * and prints field names, sample rows, a guessed semantic mapping, and the
 * CRS detected from .prj.
 *
 * No GIS deps - pure Node stdlib. Run BEFORE build-village-data.mjs.
 *
 * Usage:
 *   node scripts/inspect-shapefile.mjs "<path>/MAHARASHTRA.shp"
 */

import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname, basename } from "node:path";

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

  const decoder = new TextDecoder(encoding === "UTF-8" ? "utf-8" : encoding);
  function readRow(rowIdx) {
    const rowOffset = headerLen + rowIdx * recordLen;
    const flag = String.fromCharCode(buf[rowOffset]);
    if (flag === "*") return null;
    let col = rowOffset + 1;
    const row = {};
    for (const f of fields) {
      const slice = buf.subarray(col, col + f.length);
      const raw = decoder.decode(slice).trim();
      let value = raw;
      if (f.type === "N" || f.type === "F") {
        const n = parseFloat(raw);
        value = Number.isFinite(n) ? n : null;
      } else if (f.type === "L") {
        value = raw.toUpperCase() === "T" || raw.toUpperCase() === "Y";
      }
      row[f.name] = value;
      col += f.length;
    }
    return row;
  }
  return { numRecords, headerLen, recordLen, fields, readRow };
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

function guessMapping(fields) {
  return {
    district: pickColumn(fields, ["DTNAME","DIST_NAME","DISTRICT","DIST","D_NAME","NAME_2","ADM2_EN","district_n"]),
    district_code: pickColumn(fields, ["DTCODE","DIST_CODE","DISTCODE","DT_CEN_CD"]),
    taluka: pickColumn(fields, ["SDTNAME","SUBDIST_NA","TEHSIL","TAHSIL","TALUKA","TEH_NAME","NAME_3","ADM3_EN","BLOCK","sub_dist"]),
    taluka_code: pickColumn(fields, ["SDTCODE","SUBDIST_CO","TEH_CODE","SUB_DIST_C"]),
    village: pickColumn(fields, ["VILNAM","VIL_NAME","VILLAGE","VLGNAME","NAME","V_NAME","NAME_4","ADM4_EN","village_n","vilnam_soi"]),
    village_code: pickColumn(fields, ["VILLCODE","VIL_CODE","VILGCODE","CENS_CODE","CENSUSCODE","LGD_CODE","v_code"]),
    village_mr: pickColumn(fields, ["VILNAM_MR","VIL_NAME_M","VILLAGE_MR","NAME_MR"]),
    taluka_mr: pickColumn(fields, ["SDTNAM_MR","TEH_NAME_M","TALUKA_MR","NAME_MR_3"]),
    district_mr: pickColumn(fields, ["DTNAM_MR","DIST_NAME_M","DISTRICT_M","NAME_MR_2"]),
    area: pickColumn(fields, ["AREA","SHAPE_AREA","AREA_SQKM","TOT_AREA"]),
    population: pickColumn(fields, ["TOT_POP","TOTAL_POP","POPULATION","TOT_P"]),
    state: pickColumn(fields, ["STNAME","STATE","ST_NAME","NAME_1"]),
  };
}

function main() {
  const shpArg = process.argv[2];
  if (!shpArg) {
    console.error("Usage: node scripts/inspect-shapefile.mjs <path-to-shapefile.shp>");
    process.exit(1);
  }
  const shpPath = resolve(shpArg);
  const dir = dirname(shpPath);
  const base = basename(shpPath, ".shp");
  const dbfPath = resolve(dir, base + ".dbf");
  const prjPath = resolve(dir, base + ".prj");
  const cpgPath = resolve(dir, base + ".cpg");

  if (!existsSync(dbfPath)) {
    console.error("Missing sibling .dbf: " + dbfPath);
    process.exit(1);
  }

  const prj = existsSync(prjPath) ? readFileSync(prjPath, "utf8") : "(missing)";
  const cpg = existsSync(cpgPath) ? readFileSync(cpgPath, "utf8").trim() : "";
  const encoding = cpg || "latin1";

  console.log("Shapefile inspection report");
  console.log("===========================");
  console.log("Path:     " + shpPath);
  console.log("Encoding: " + encoding);
  console.log("");
  console.log("-- Projection (.prj) --");
  console.log(prj.trim());
  console.log("");

  const isLcc = /Lambert_Conformal_Conic/i.test(prj);
  const isWgs = /GCS_WGS_1984|EPSG:?4326|WGS_1984/i.test(prj) && !isLcc;
  if (isLcc) {
    console.log("WARN: Lambert Conformal Conic (LCC) detected - must reproject to EPSG:4326.");
    console.log("      Use:  mapshaper IN.shp -proj wgs84 -o OUT.geojson");
  } else if (isWgs) {
    console.log("OK: WGS84 / EPSG:4326 detected - ready for Leaflet/MapLibre.");
  } else {
    console.log("?? Unknown CRS - reproject if needed.");
  }
  console.log("");

  const { numRecords, fields, readRow } = parseDbf(dbfPath, encoding);
  console.log("-- .dbf summary --");
  console.log("Records: " + numRecords.toLocaleString());
  console.log("Fields:  " + fields.length);
  console.log("");
  console.log("Name            Type  Len  Dec");
  console.log("--------------  ----  ---  ---");
  for (const f of fields) {
    console.log(
      f.name.padEnd(14) + "  " + f.type.padEnd(4) + "  " +
      String(f.length).padStart(3) + "  " + String(f.decimals).padStart(3)
    );
  }
  console.log("");

  console.log("-- Sample rows (first 3 active) --");
  let shown = 0;
  for (let i = 0; i < numRecords && shown < 3; i++) {
    const row = readRow(i);
    if (!row) continue;
    console.log(JSON.stringify(row, null, 2));
    shown++;
  }
  console.log("");

  const mapping = guessMapping(fields);
  console.log("-- Guessed semantic mapping --");
  console.log(JSON.stringify(mapping, null, 2));
  console.log("");

  if (!mapping.district || !mapping.taluka || !mapping.village) {
    console.log("WARN: Could not auto-detect every required column.");
    console.log("      Open scripts/build-village-data.mjs and set FIELD_MAP manually.");
  } else {
    console.log("OK: detected district / taluka / village columns. Run build-village-data.mjs next.");
  }
}
main();