/**
 * BhuNaksha overlay — client-side file → raster helpers.
 *
 * Images are read directly. PDFs are rendered (page 1 by default) to a PNG data
 * URL using pdfjs-dist, loaded lazily so it never touches SSR or the public
 * bundle. The pdf.js worker is pulled from a CDN matching the installed
 * version, so we don't have to special-case the Next/webpack worker setup.
 *
 * All functions are browser-only (they use Canvas / FileReader).
 */

export interface RasterResult {
  dataUrl: string;
  widthPx: number;
  heightPx: number;
  /** Extracted text from page 1 (admin-only preview), best-effort. */
  textPreview?: string;
}

/** Read an image File into a data URL + natural pixel size. */
export function imageFileToRaster(file: File): Promise<RasterResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read image file."));
    reader.onload = () => {
      const dataUrl = String(reader.result);
      const img = new Image();
      img.onload = () =>
        resolve({ dataUrl, widthPx: img.naturalWidth, heightPx: img.naturalHeight });
      img.onerror = () => reject(new Error("Could not decode image."));
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Render one page of a PDF to a PNG data URL. Page 1 by default.
 * Throws if pdf.js cannot load / render — callers should catch and let the
 * admin upload an image instead.
 */
export async function pdfPageToRaster(
  file: File,
  pageNumber = 1,
  targetWidthPx = 1600,
): Promise<RasterResult> {
  // Lazy, browser-only import.
  const pdfjs = await import("pdfjs-dist");
  // Worker matching the installed pdfjs version (avoids bundler worker setup).
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (pdfjs as any).GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (pdfjs as any).version
  }/build/pdf.worker.min.mjs`;

  const buffer = await file.arrayBuffer();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const doc = await (pdfjs as any).getDocument({ data: buffer }).promise;
  const pageNo = Math.min(Math.max(1, pageNumber), doc.numPages);
  const page = await doc.getPage(pageNo);

  const baseViewport = page.getViewport({ scale: 1 });
  const scale = Math.max(0.5, Math.min(4, targetWidthPx / baseViewport.width));
  const viewport = page.getViewport({ scale });

  const canvas = document.createElement("canvas");
  canvas.width = Math.ceil(viewport.width);
  canvas.height = Math.ceil(viewport.height);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context unavailable.");

  await page.render({ canvasContext: ctx, viewport }).promise;

  // Best-effort text extraction (admin-only preview).
  let textPreview: string | undefined;
  try {
    const tc = await page.getTextContent();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const text = (tc.items as any[]).map((it) => (it && "str" in it ? it.str : "")).join(" ");
    textPreview = text.replace(/\s+/g, " ").trim().slice(0, 600) || undefined;
  } catch {
    textPreview = undefined;
  }

  return {
    dataUrl: canvas.toDataURL("image/png"),
    widthPx: canvas.width,
    heightPx: canvas.height,
    textPreview,
  };
}

/** Dispatch on file type; returns a raster + whether it came from a PDF. */
export async function fileToRaster(
  file: File,
  pageNumber = 1,
): Promise<{ raster: RasterResult; fileType: "pdf" | "image" }> {
  const isPdf =
    file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
  if (isPdf) {
    return { raster: await pdfPageToRaster(file, pageNumber), fileType: "pdf" };
  }
  return { raster: await imageFileToRaster(file), fileType: "image" };
}
