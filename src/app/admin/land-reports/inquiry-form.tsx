"use client";

/**
 * Simple admin land-report inquiry form. Collects the essentials and opens a
 * pre-filled WhatsApp chat via the shared `whatsappHref` helper (same number /
 * mechanism as the public site). No map, no GIS — the stable, fast workflow.
 * The advanced overlay tool lives separately at /admin/land-reports-gis.
 */

import { useMemo, useState } from "react";
import { Copy, LogOut, MapPinned, Send } from "lucide-react";
import { whatsappHref } from "@/lib/whatsapp";
import { logoutAction } from "./actions";

const SERVICES = [
  "सातबारा उतारा",
  "८अ उतारा",
  "मिळकत पत्रिका",
  "ई-फेरफार",
  "गाव नकाशा",
  "DP नकाशा",
  "जमीन अहवाल (Land report)",
  "इतर",
];

const onlyDigits = (s: string) => s.replace(/\D/g, "");

export function LandReportInquiryForm() {
  const [customerName, setCustomerName] = useState("");
  const [mobile, setMobile] = useState("");
  const [service, setService] = useState(SERVICES[0]);
  const [district, setDistrict] = useState("");
  const [taluka, setTaluka] = useState("");
  const [village, setVillage] = useState("");
  const [gat, setGat] = useState("");
  const [note, setNote] = useState("");
  const [copied, setCopied] = useState(false);

  const mobileValid = onlyDigits(mobile).length >= 10;
  const ready = customerName.trim().length > 0 && mobileValid;

  const message = useMemo(() => {
    const line = (label: string, v: string) => (v.trim() ? `${label}: ${v.trim()}` : null);
    return [
      "नमस्कार PrintShubh, नवीन चौकशी —",
      "",
      line("नाव", customerName),
      line("मोबाइल", mobile),
      line("सेवा", service),
      line("जिल्हा", district),
      line("तालुका", taluka),
      line("गाव / शहर", village),
      line("गट / सर्वे / Plot / CTS", gat),
      line("टीप", note),
    ]
      .filter(Boolean)
      .join("\n");
  }, [customerName, mobile, service, district, taluka, village, gat, note]);

  const sendWhatsApp = () => {
    if (!ready) return;
    window.open(whatsappHref(message), "_blank", "noopener,noreferrer");
  };

  const copyMessage = async () => {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard blocked — ignore */
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <header className="mb-5 flex flex-wrap items-center gap-3">
        <h1 className="text-xl font-black text-slate-900">जमीन अहवाल — चौकशी</h1>
        <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-black uppercase tracking-wide text-amber-800">
          फक्त admin
        </span>
        <form action={logoutAction} className="ml-auto">
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 px-2.5 py-1.5 text-[12px] font-bold text-slate-700 transition hover:bg-slate-50"
          >
            <LogOut className="size-3.5" /> बाहेर पडा
          </button>
        </form>
      </header>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="ग्राहक नाव *" value={customerName} onChange={setCustomerName} placeholder="उदा. रमेश पाटील" />
          <Field
            label="मोबाइल नंबर *"
            value={mobile}
            onChange={setMobile}
            placeholder="10-अंकी क्रमांक"
            inputMode="tel"
            invalid={mobile.length > 0 && !mobileValid}
          />

          <label className="block">
            <span className="mb-1 block text-[12px] font-bold text-slate-600">सेवा</span>
            <select
              value={service}
              onChange={(e) => setService(e.target.value)}
              className="h-10 w-full rounded-md border border-slate-300 bg-white px-2.5 text-[14px] text-slate-800 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
            >
              {SERVICES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </label>

          <Field label="जिल्हा" value={district} onChange={setDistrict} />
          <Field label="तालुका" value={taluka} onChange={setTaluka} />
          <Field label="गाव / शहर" value={village} onChange={setVillage} />
          <Field label="गट / सर्वे / Plot / CTS" value={gat} onChange={setGat} />
        </div>

        <label className="mt-3 block">
          <span className="mb-1 block text-[12px] font-bold text-slate-600">टीप</span>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            className="w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-[14px] text-slate-800 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
          />
        </label>

        {/* Live preview of the WhatsApp message */}
        <div className="mt-4">
          <span className="mb-1 block text-[12px] font-bold text-slate-600">WhatsApp संदेश (पूर्वावलोकन)</span>
          <pre className="max-h-48 overflow-auto whitespace-pre-wrap rounded-md border border-slate-200 bg-slate-50 px-3 py-2 font-sans text-[13px] leading-6 text-slate-700">
            {message}
          </pre>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={sendWhatsApp}
            disabled={!ready}
            className="inline-flex items-center gap-2 rounded-md bg-green-600 px-4 py-2.5 text-[14px] font-bold text-white transition hover:bg-green-700 disabled:opacity-40"
          >
            <Send className="size-4" /> WhatsApp वर पाठवा
          </button>
          <button
            type="button"
            onClick={copyMessage}
            className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-4 py-2.5 text-[14px] font-bold text-slate-700 transition hover:bg-slate-50"
          >
            <Copy className="size-4" /> {copied ? "कॉपी झाले" : "संदेश कॉपी करा"}
          </button>
        </div>

        {!mobileValid && mobile.length > 0 && (
          <p className="mt-2 text-[12px] font-semibold text-amber-700">मोबाइल किमान 10 अंकी हवा.</p>
        )}
      </section>

      <a
        href="/admin/land-reports-gis"
        className="mt-4 inline-flex items-center gap-1.5 text-[12px] font-bold text-blue-700 hover:underline"
      >
        <MapPinned className="size-3.5" /> प्रगत GIS overlay tool उघडा →
      </a>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  inputMode,
  invalid,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  inputMode?: "text" | "tel";
  invalid?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[12px] font-bold text-slate-600">{label}</span>
      <input
        type="text"
        inputMode={inputMode}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={`h-10 w-full rounded-md border px-2.5 text-[14px] text-slate-800 focus:outline-none focus:ring-2 ${
          invalid
            ? "border-red-300 focus:border-red-400 focus:ring-red-100"
            : "border-slate-300 focus:border-blue-400 focus:ring-blue-100"
        }`}
      />
    </label>
  );
}
