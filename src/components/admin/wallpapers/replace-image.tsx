"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { makePreviews } from "./make-previews";

type Pending = {
  name: string;
  bytes: number;
  blobs: Record<number, Blob>;
  width: number;
  height: number;
  /** Object URL of the NEW 900 px preview, for the on-screen review only. */
  url: string;
};

/**
 * Replace the artwork of an existing design (same ID, details unchanged).
 *
 * Three deliberate steps — nothing is uploaded or overwritten on file selection:
 *   1. choose a file  -> previews are prepared in THIS browser only (no network),
 *   2. review         -> current image and the new image side by side,
 *   3. confirm        -> an explicit "Replace image" click (a LIVE design asks once more).
 * Cancel at any point leaves the current image exactly as it was.
 */
export function ReplaceImage({
  id,
  live,
  currentSrc,
  currentAlt,
}: {
  id: string;
  live: boolean;
  currentSrc: string | null;
  currentAlt: string;
}) {
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [phase, setPhase] = useState<"idle" | "preparing" | "review" | "uploading">("idle");
  const [pending, setPending] = useState<Pending | null>(null);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  // Release the temporary preview URL whenever it is replaced or the component goes away.
  useEffect(() => {
    return () => {
      if (pending) URL.revokeObjectURL(pending.url);
    };
  }, [pending]);

  const resetInput = () => {
    if (input.current) input.current.value = "";
  };

  async function onPick(file: File | undefined) {
    setMessage(null);
    if (!file) {
      setPending(null);
      setPhase("idle");
      return;
    }
    setPhase("preparing");
    try {
      const p = await makePreviews(file);
      setPending({
        name: file.name,
        bytes: file.size,
        blobs: p.blobs,
        width: p.width,
        height: p.height,
        url: URL.createObjectURL(p.blobs[900]),
      });
      setPhase("review");
    } catch (e) {
      setPending(null);
      setPhase("idle");
      setMessage({ ok: false, text: e instanceof Error ? e.message : "Could not read this image." });
      resetInput();
    }
  }

  function cancel() {
    setPending(null);
    setPhase("idle");
    setMessage(null);
    resetInput();
  }

  async function confirmReplace() {
    if (!pending || phase === "uploading") return;
    if (
      live &&
      !window.confirm(
        `Replace the LIVE image of ${id}?\n\nCustomers will see the new image immediately. The current image is deleted and cannot be restored.`,
      )
    ) {
      return;
    }
    setPhase("uploading");
    setMessage(null);
    try {
      const fd = new FormData();
      fd.set("replaceId", id);
      fd.set("width", String(pending.width));
      fd.set("height", String(pending.height));
      for (const w of [400, 900, 1600]) fd.set(`w${w}`, pending.blobs[w], `${w}.webp`);
      const res = await fetch("/admin/wallpapers/upload", { method: "POST", body: fd, credentials: "same-origin" });
      const body = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (res.ok && body.ok) {
        setMessage({ ok: true, text: "Image replaced." });
        setPending(null);
        setPhase("idle");
        resetInput();
        router.refresh();
      } else {
        setMessage({ ok: false, text: body.error ?? `Upload failed (${res.status}). The current image was not changed.` });
        setPhase("review");
      }
    } catch (e) {
      setMessage({ ok: false, text: e instanceof Error ? e.message : "Failed. The current image was not changed." });
      setPhase("review");
    }
  }

  const busy = phase === "preparing" || phase === "uploading";
  const mb = (n: number) => `${(n / 1_000_000).toFixed(1)} MB`;

  return (
    <div>
      <input
        ref={input}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        disabled={busy || phase === "review"}
        onChange={(e) => onPick(e.target.files?.[0])}
        aria-label="Choose a replacement image"
        className="block min-h-[44px] w-full text-sm file:mr-3 file:min-h-[44px] file:rounded-lg file:border-0 file:bg-slate-800 file:px-4 file:py-3 file:text-sm file:font-bold file:text-white"
      />

      {phase === "preparing" && <p className="mt-2 text-[12px] font-bold text-slate-500">Preparing preview…</p>}

      {pending && (phase === "review" || phase === "uploading") && (
        <div className="mt-3 rounded-xl border border-slate-300 bg-slate-50 p-3" role="group" aria-label="Review the new image">
          <p className="text-[13px] font-black text-slate-900">Review before replacing</p>
          <div className="mt-2 grid grid-cols-2 gap-3">
            <figure>
              <figcaption className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Current</figcaption>
              {currentSrc ? (
                // eslint-disable-next-line @next/next/no-img-element -- admin review of the stored preview
                <img src={currentSrc} alt={currentAlt} className="mt-1 aspect-video w-full rounded-md border border-slate-200 object-cover" />
              ) : (
                <div className="mt-1 grid aspect-video w-full place-items-center rounded-md border border-slate-200 bg-slate-100 text-[11px] font-bold text-slate-400">no image</div>
              )}
            </figure>
            <figure>
              <figcaption className="text-[11px] font-bold uppercase tracking-wide text-blue-700">New</figcaption>
              {/* eslint-disable-next-line @next/next/no-img-element -- local object URL, cannot use next/image */}
              <img src={pending.url} alt="The new image you selected" className="mt-1 aspect-video w-full rounded-md border-2 border-blue-500 object-cover" />
            </figure>
          </div>
          <p className="mt-2 break-words text-[12px] text-slate-600">
            New file: <b>{pending.name}</b> ({mb(pending.bytes)}) · previews {pending.width}×{pending.height}
          </p>

          {live ? (
            <p role="alert" className="mt-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[12px] font-bold leading-5 text-red-800">
              This design is LIVE. The new image replaces it on the public site immediately and the current image is deleted for good.
            </p>
          ) : (
            <p className="mt-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[12px] leading-5 text-slate-600">
              This design is a draft, so only you see the change.
            </p>
          )}

          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={confirmReplace}
              disabled={phase === "uploading"}
              className={`inline-flex min-h-[44px] items-center rounded-lg px-5 text-[13px] font-black text-white disabled:opacity-60 ${live ? "bg-red-600" : "bg-blue-600"}`}
            >
              {phase === "uploading" ? "Replacing…" : live ? "Replace live image" : "Replace image"}
            </button>
            <button
              type="button"
              onClick={cancel}
              disabled={phase === "uploading"}
              className="inline-flex min-h-[44px] items-center rounded-lg border border-slate-300 bg-white px-5 text-[13px] font-bold text-slate-700 disabled:opacity-60"
            >
              Cancel — keep current image
            </button>
          </div>
        </div>
      )}

      {message && (
        <p className={`mt-2 text-[12px] font-bold ${message.ok ? "text-green-700" : "text-red-700"}`} role="status">
          {message.text}
        </p>
      )}
    </div>
  );
}
