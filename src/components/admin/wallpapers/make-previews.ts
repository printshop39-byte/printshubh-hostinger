/**
 * Browser-side preview maker.
 *
 * The artwork you pick is decoded and shrunk HERE, in your browser. Only the
 * three small WebP previews are sent to the server — the original file (often
 * tens of megabytes) never leaves your computer, so there is no way for a
 * production master to end up on the website.
 */

export const PREVIEW_WIDTHS = [400, 900, 1600] as const;
/** Smallest source accepted: the biggest preview is 1600 px wide and we never enlarge. */
export const MIN_SOURCE_WIDTH = 1600;
const QUALITY = 0.78;

export interface Previews {
  blobs: Record<number, Blob>;
  width: number;
  height: number;
}

function toWebp(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b && b.type === "image/webp" ? resolve(b) : reject(new Error("This browser cannot create WebP images."))), "image/webp", QUALITY),
  );
}

export async function makePreviews(file: File): Promise<Previews> {
  if (!/^image\/(jpeg|png|webp)$/.test(file.type)) {
    throw new Error("Choose a JPG, PNG or WebP image (TIFF masters: use the JPG next to them).");
  }
  // 1. Real pixel width from the file header (cheap) — reject masters that are too small.
  const natural = await new Promise<number>((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img.naturalWidth);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(0);
    };
    img.src = url;
  });
  if (!natural) throw new Error("Could not read this image.");
  if (natural < MIN_SOURCE_WIDTH) {
    throw new Error(`The image is only ${natural} px wide. Use the master (at least ${MIN_SOURCE_WIDTH} px wide).`);
  }

  // 2. Decode straight to the largest preview size: the full master is never held in memory.
  let source: ImageBitmap;
  try {
    source = await createImageBitmap(file, { resizeWidth: 1600, resizeQuality: "high" });
  } catch {
    throw new Error("Could not read this image.");
  }
  const ratio = source.height / source.width;

  const blobs: Record<number, Blob> = {};
  for (const w of PREVIEW_WIDTHS) {
    const h = Math.round(w * ratio);
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas is not available in this browser.");
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(source, 0, 0, w, h);
    blobs[w] = await toWebp(canvas);
  }
  source.close();
  return { blobs, width: 1600, height: Math.round(1600 * ratio) };
}

/** "Golden_Palm_Royale_Wallpaper_8K_7680x4320.jpg" -> "Golden Palm Royale" */
export function titleFromFilename(name: string): string {
  const base = name
    .replace(/\.[a-z0-9]+$/i, "")
    .replace(/[_-]+/g, " ")
    .replace(/\b\d{3,5}\s?x\s?\d{3,5}\b/gi, " ")
    .replace(/\b(8k|4k|300dpi|100ppi|master|wallpaper|final|copy)\b/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
  return (base || name).replace(/\b\w/g, (c) => c.toUpperCase()).slice(0, 120);
}
