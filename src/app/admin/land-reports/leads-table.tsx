"use client";

/**
 * Interactive client leads table. Each row is collapsed to a one-line summary;
 * clicking it expands the full inquiry detail inline with immediate actions
 * (WhatsApp reply + call), so the admin can act without leaving the list.
 */

import { useState } from "react";
import { ChevronDown, MessageCircle, Phone } from "lucide-react";
import type { Inquiry } from "@/lib/inquiries";

function intlMobile(m: string): string {
  const d = m.replace(/\D/g, "");
  return d.length === 10 ? `91${d}` : d;
}

function clientWhatsApp(i: Inquiry): string {
  const msg = `नमस्कार ${i.customer_name}, PrintShubh कडून संपर्क. आपल्या "${i.service ?? "जमीन सेवा"}" चौकशीबद्दल बोलूया.`;
  return `https://wa.me/${intlMobile(i.mobile)}?text=${encodeURIComponent(msg)}`;
}

function placeOf(i: Inquiry): string {
  return [i.village, i.taluka, i.district].filter(Boolean).join(", ") || "—";
}

function fmtTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export function LeadsTable({ rows }: { rows: Inquiry[] }) {
  const [openId, setOpenId] = useState<string | null>(null);

  if (rows.length === 0) {
    return (
      <p className="rounded-md bg-slate-50 px-3 py-6 text-center text-[13px] font-semibold text-slate-500">
        अजून एकही चौकशी आलेली नाही.
      </p>
    );
  }

  return (
    <div className="divide-y divide-slate-100">
      {rows.map((i) => {
        const open = openId === i.id;
        return (
          <div key={i.id}>
            <button
              type="button"
              onClick={() => setOpenId(open ? null : i.id)}
              aria-expanded={open}
              className="flex w-full items-center gap-3 px-2 py-3 text-left transition hover:bg-slate-50"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                  <span className="font-bold text-slate-800">{i.customer_name}</span>
                  <span className="text-[12px] font-semibold text-slate-500">{i.mobile}</span>
                </div>
                <div className="truncate text-[12px] text-slate-500">
                  {(i.service ?? "—")} · {placeOf(i)}
                </div>
              </div>
              <span className="hidden whitespace-nowrap text-[11px] text-slate-400 sm:block">
                {fmtTime(i.created_at)}
              </span>
              <ChevronDown className={`size-4 shrink-0 text-slate-400 transition ${open ? "rotate-180" : ""}`} />
            </button>

            {open && (
              <div className="border-t border-slate-100 bg-slate-50 px-4 py-4">
                <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-[13px] sm:grid-cols-3">
                  <Detail label="सेवा" value={i.service} />
                  <Detail label="जिल्हा" value={i.district} />
                  <Detail label="तालुका" value={i.taluka} />
                  <Detail label="गाव / शहर" value={i.village} />
                  <Detail label="गट / सर्वे / Plot / CTS" value={i.gat} />
                  <Detail label="वेळ" value={fmtTime(i.created_at)} />
                </dl>
                {i.note ? (
                  <p className="mt-2 text-[13px] text-slate-700">
                    <span className="font-bold text-slate-500">टीप: </span>
                    {i.note}
                  </p>
                ) : null}

                <div className="mt-3 flex flex-wrap gap-2">
                  <a
                    href={clientWhatsApp(i)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-md bg-green-600 px-3 py-2 text-[13px] font-bold text-white transition hover:bg-green-700"
                  >
                    <MessageCircle className="size-4" /> WhatsApp
                  </a>
                  <a
                    href={`tel:+${intlMobile(i.mobile)}`}
                    className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-2 text-[13px] font-bold text-slate-700 transition hover:bg-slate-50"
                  >
                    <Phone className="size-4" /> कॉल करा
                  </a>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function Detail({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <dt className="text-[11px] font-bold uppercase tracking-wide text-slate-400">{label}</dt>
      <dd className="font-semibold text-slate-800">{value?.trim() ? value : "—"}</dd>
    </div>
  );
}
