/**
 * Builds the web previews for the wallpaper catalogue.
 *
 *   WALLPAPER_SOURCE_DIR="<folder holding the production masters>" \
 *     node scripts/wallpaper-previews.mjs [WP-001 WP-002 ...]
 *
 * For every design in SAMPLE_SOURCES it writes three WebP sizes (400 / 900 /
 * 1600 px wide) to public/catalogue/wallpapers/. Only these small previews are
 * ever published: the full-resolution production masters stay on the local
 * drive, are never copied into the repository and are never served.
 *
 * Needs `sharp` (already installed with Next.js). Read-only on the source.
 * Phase D replaces this with the admin upload + bulk-ingest workflow; the
 * file naming here (<id>-<width>.webp) is what src/lib/wallpapers/data.ts
 * expects.
 */
import { mkdir, stat } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const SRC = process.env.WALLPAPER_SOURCE_DIR;
if (!SRC) {
  console.error("Set WALLPAPER_SOURCE_DIR to the folder that holds the masters.");
  process.exit(1);
}

const OUT = path.resolve("public", "catalogue", "wallpapers");
const WIDTHS = [400, 900, 1600];

/** Design ID -> master file, relative to WALLPAPER_SOURCE_DIR. */
const SAMPLE_SOURCES = {
  "WP-001": "golden-palm-royale/Golden_Palm_Royale_Wallpaper_8K_7680x4320.jpg",
  "WP-002": "Ivory_Lotus_Luxe_8K_7680x4320.jpg",
  "WP-003": "Botanical_Whispers_8K_7680x4320.jpg",
  "WP-004": "Enchanted_Blossom_Garden_8K_7680x4320.jpg",
  "WP-005": "Botanical_Bird_Poetry_8K_7680x4320.jpg",
  "WP-006": "Mithila_Tree_of_Life_8K_7680x4320.jpg",
  "WP-007": "Peacock_Paradise_Pichwai_8K_7680x4320.jpg",
  "WP-008": "Royal_Mughal_Botanical_Garden_8K_7680x4320.jpg",
  "WP-009": "Abstract_Living_8K_7680x4320.jpg",
  "WP-010": "Abstract_Metallic_Geometry_8K_7680x4320.jpg",
  "WP-011": "misty-mountain-paradise/Misty_Mountain_Paradise_Panoramic_Wallpaper_16000x9000_300dpi.jpg",
  "WP-012": "Golden_Whispering_Forest_8K_7680x4320.jpg",
  "WP-013": "The_Silent_Valley_Wallpaper_8K_7680x4320.jpg",
  "WP-014": "Whimsical_Kids_World_8K_7680x4320.jpg",
  "WP-015": "Safari_Dreams_8K_7680x4320.jpg",
  "WP-016": "Contemporary_Fluid_Marble_8K_7680x4320.jpg",
  "WP-017": "Sculpted_Botanical_Plaster_8K_7680x4320.jpg",
  "WP-018": "Shrinathji_Pichwai_8K_7680x4320.jpg",
  "WP-019": "Zen_Cloud_Symphony_8K_7680x4320.jpg",
};

const only = process.argv.slice(2);
const ids = Object.keys(SAMPLE_SOURCES).filter((id) => only.length === 0 || only.includes(id));

await mkdir(OUT, { recursive: true });
let total = 0;
for (const id of ids) {
  const src = path.join(SRC, SAMPLE_SOURCES[id]);
  const meta = await sharp(src, { limitInputPixels: false }).metadata();
  const sizes = [];
  for (const w of WIDTHS) {
    const file = path.join(OUT, `${id.toLowerCase()}-${w}.webp`);
    // Never enlarge; a master narrower than the target would just be copied.
    const info = await sharp(src, { limitInputPixels: false })
      .resize({ width: Math.min(w, meta.width ?? w), withoutEnlargement: true })
      .webp({ quality: 74, effort: 5 })
      .toFile(file);
    total += info.size;
    sizes.push(`${w}:${info.width}x${info.height}/${Math.round(info.size / 1024)}KB`);
  }
  console.log(id, `(master ${meta.width}x${meta.height})`, sizes.join("  "));
}
console.log(`\n${ids.length} designs, ${(total / 1024 / 1024).toFixed(1)} MB of previews -> ${OUT}`);
await stat(OUT);
