"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { makePreviews } from "./make-previews";

/** Replace the artwork of an existing design (same ID, details unchanged). */
export function ReplaceImage({ id }: { id: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  async function onPick(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    setMessage(null);
    try {
      const { blobs, width, height } = await makePreviews(file);
      const fd = new FormData();
      fd.set("replaceId", id);
      fd.set("width", String(width));
      fd.set("height", String(height));
      for (const w of [400, 900, 1600]) fd.set(`w${w}`, blobs[w], `${w}.webp`);
      const res = await fetch("/admin/wallpapers/upload", { method: "POST", body: fd, credentials: "same-origin" });
      const body = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (res.ok && body.ok) {
        setMessage({ ok: true, text: "Image replaced." });
        router.refresh();
      } else {
        setMessage({ ok: false, text: body.error ?? `Upload failed (${res.status}).` });
      }
    } catch (e) {
      setMessage({ ok: false, text: e instanceof Error ? e.message : "Failed." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp"
        disabled={busy}
        onChange={(e) => onPick(e.target.files?.[0])}
        aria-label="Choose a replacement image"
        className="block w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-slate-800 file:px-4 file:py-2.5 file:text-sm file:font-bold file:text-white"
      />
      {busy && <p className="mt-2 text-[12px] font-bold text-slate-500">Uploading…</p>}
      {message && (
        <p className={`mt-2 text-[12px] font-bold ${message.ok ? "text-green-700" : "text-red-700"}`} role="status">
          {message.text}
        </p>
      )}
    </div>
  );
}
