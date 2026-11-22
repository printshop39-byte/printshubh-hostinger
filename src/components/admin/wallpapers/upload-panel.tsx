"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { makePreviews, titleFromFilename } from "./make-previews";

type Row = {
  name: string;
  state: "queued" | "working" | "done" | "error";
  text?: string;
  id?: string;
};

const UPLOAD_URL = "/admin/wallpapers/upload";

/** Posts one design's previews + details; resolves with the server's answer. */
async function sendDesign(fields: Record<string, string>, blobs: Record<number, Blob>, width: number, height: number) {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) fd.set(k, v);
  fd.set("width", String(width));
  fd.set("height", String(height));
  for (const w of [400, 900, 1600]) fd.set(`w${w}`, blobs[w], `${w}.webp`);
  const res = await fetch(UPLOAD_URL, { method: "POST", body: fd, credentials: "same-origin" });
  let body: { ok?: boolean; id?: string; error?: string } = {};
  try {
    body = await res.json();
  } catch {
    /* non-JSON error page */
  }
  return { ok: res.ok && body.ok === true, id: body.id, error: body.error ?? `Upload failed (${res.status}).` };
}

/**
 * Upload one or many designs. Each image is shrunk in THIS browser; only small
 * WebP previews are sent. New designs always start as drafts — publish them
 * from the list once you have checked the preview.
 */
export function UploadPanel({ categories }: { categories: { slug: string; name: string }[] }) {
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [category, setCategory] = useState(categories[0]?.slug ?? "");
  const [tags, setTags] = useState("");
  const [rows, setRows] = useState<Row[]>([]);
  const [busy, setBusy] = useState(false);

  const patch = (i: number, p: Partial<Row>) => setRows((r) => r.map((x, j) => (j === i ? { ...x, ...p } : x)));

  async function start() {
    if (busy || files.length === 0 || !category) return;
    setBusy(true);
    setRows(files.map((f) => ({ name: f.name, state: "queued" })));
    for (let i = 0; i < files.length; i++) {
      patch(i, { state: "working", text: "Preparing previews…" });
      try {
        const { blobs, width, height } = await makePreviews(files[i]);
        patch(i, { text: "Uploading…" });
        const out = await sendDesign(
          { title: titleFromFilename(files[i].name), categorySlug: category, tags, featured: "false" },
          blobs,
          width,
          height,
        );
        patch(i, out.ok ? { state: "done", id: out.id, text: `Saved as draft ${out.id}` } : { state: "error", text: out.error });
      } catch (e) {
        patch(i, { state: "error", text: e instanceof Error ? e.message : "Failed." });
      }
    }
    setBusy(false);
    setFiles([]);
    if (input.current) input.current.value = "";
    router.refresh();
  }

  const field =
    "h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-900 outline-none focus:border-blue-500";
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm" aria-labelledby="wp-upload">
      <h2 id="wp-upload" className="text-base font-black text-slate-900">
        Upload designs
      </h2>
      <p className="mt-1 text-[13px] leading-5 text-slate-600">
        Pick one or many JPG / PNG masters (at least 1600 px wide). Each is shrunk in your browser and only small
        previews are uploaded — the original never leaves your computer. New designs start as <b>drafts</b>.
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="text-[12px] font-bold text-slate-600">
          Category
          <select value={category} onChange={(e) => setCategory(e.target.value)} className={`${field} mt-1`}>
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label className="text-[12px] font-bold text-slate-600">
          Tags for all (optional, comma separated)
          <input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="premium, floral" className={`${field} mt-1`} />
        </label>
      </div>

      <div className="mt-3">
        <input
          ref={input}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          disabled={busy}
          onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
          className="block min-h-[44px] w-full text-sm file:mr-3 file:min-h-[44px] file:rounded-lg file:border-0 file:bg-blue-600 file:px-4 file:py-3 file:text-sm file:font-bold file:text-white"
          aria-label="Choose design images"
        />
      </div>

      <button
        type="button"
        onClick={start}
        disabled={busy || files.length === 0 || !category}
        className="mt-4 inline-flex min-h-[44px] items-center rounded-lg bg-blue-600 px-5 text-sm font-black text-white disabled:opacity-50"
      >
        {busy ? "Uploading…" : files.length > 1 ? `Upload ${files.length} designs as drafts` : "Upload as draft"}
      </button>

      {rows.length > 0 && (
        <ul className="mt-4 divide-y divide-slate-100 rounded-lg border border-slate-200 text-sm" aria-live="polite">
          {rows.map((r, i) => (
            <li key={`${r.name}-${i}`} className="flex flex-wrap items-center justify-between gap-2 px-3 py-2.5">
              <span className="min-w-0 truncate font-semibold text-slate-800">{r.name}</span>
              <span
                className={`text-[12px] font-bold ${
                  r.state === "done" ? "text-green-700" : r.state === "error" ? "text-red-700" : "text-slate-500"
                }`}
              >
                {r.text ?? (r.state === "queued" ? "Waiting…" : "")}
                {r.state === "done" && r.id && (
                  <>
                    {" · "}
                    <Link href={`/admin/wallpapers/${r.id}`} className="inline-flex min-h-[44px] items-center underline">
                      Review &amp; publish
                    </Link>
                  </>
                )}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
