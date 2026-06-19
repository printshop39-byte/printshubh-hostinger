"use client";

/**
 * Public landing-page inquiry form. A client fills it; on submit we POST to
 * /api/inquiries (stored in Supabase so it shows in the admin panel), then offer
 * a WhatsApp hand-off so the existing fast workflow still works. Mirrors the
 * admin inquiry form's fields, minus anything admin-only.
 */

import { useMemo, useState } from "react";
import { CheckCircle2, Send } from "lucide-react";
import { whatsappHref } from "@/lib/whatsapp";

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

export function PublicInquiryForm() {
  const [customerName, setCustomerName] = useState("");
  const [mobile, setMobile] = useState("");
  const [service, setService] = useState(SERVICES[0]);
  const [district, setDistrict] = useState("");
  const [taluka, setTaluka] = useState("");
  const [village, setVillage] = useState("");
  const [note, setNote] = useState("");
  const [company, setCompany] = useState(""); // honeypot
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");

  const mobileValid = onlyDigits(mobile).length >= 10;
  const ready = customerName.trim().length > 0 && mobileValid && status !== "sending";

  const waMessage = useMemo(() => {
    const line = (label: string, v: string) => (v.trim() ? `${label}: ${v.trim()}` : null);
    return [
      "नमस्कार PrintShubh, मला चौकशी करायची आहे —",
      "",
      line("नाव", customerName),
      line("मोबाइल", mobile),
      line("सेवा", service),
      line("जिल्हा", district),
      line("तालुका", taluka),
      line("गाव / शहर", village),
      line("टीप", note),
    ]
      .filter(Boolean)
      .join("\n");
  }, [customerName, mobile, service, district, taluka, village, note]);

  async function submit() {
    if (!ready) return;
    setStatus("sending");
    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customer_name: customerName, mobile, service, district, taluka, village, note, company }),
      });
      setStatus(res.ok ? "done" : "error");
    } catch {
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center">
        <CheckCircle2 className="mx-auto mb-2 size-8 text-emerald-600" />
        <p className="text-base font-black text-emerald-900">धन्यवाद! तुमची चौकशी मिळाली.</p>
        <p className="mt-1 text-[13px] font-semibold text-emerald-800">आम्ही लवकरच WhatsApp / कॉलवर संपर्क करू.</p>
        <a
          href={whatsappHref(waMessage)}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center gap-2 rounded-md bg-green-600 px-4 py-2.5 text-[14px] font-bold text-white transition hover:bg-green-700"
        >
          <Send className="size-4" /> लगेच WhatsApp वर पाठवा
        </a>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <h3 className="text-lg font-black text-slate-900">मोफत चौकशी करा</h3>
      <p className="mb-4 text-[13px] font-semibold text-slate-500">तपशील भरा — आम्ही किंमत व वेळ कळवू.</p>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label="तुमचं नाव *" value={customerName} onChange={setCustomerName} placeholder="उदा. रमेश पाटील" />
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
      </div>

      <label className="mt-3 block">
        <span className="mb-1 block text-[12px] font-bold text-slate-600">टीप (पर्यायी)</span>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={2}
          className="w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-[14px] text-slate-800 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
        />
      </label>

      {/* Honeypot — visually hidden; real users leave it empty. */}
      <input
        type="text"
        tabIndex={-1}
        autoComplete="off"
        value={company}
        onChange={(e) => setCompany(e.target.value)}
        className="hidden"
        aria-hidden="true"
      />

      {status === "error" && (
        <p className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-[12px] font-bold text-red-700">
          काहीतरी चुकलं. कृपया पुन्हा प्रयत्न करा किंवा थेट WhatsApp वर संपर्क करा.
        </p>
      )}

      <button
        type="button"
        onClick={submit}
        disabled={!ready}
        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-3 text-[15px] font-bold text-white transition hover:bg-blue-700 disabled:opacity-40 sm:w-auto"
      >
        <Send className="size-4" /> {status === "sending" ? "पाठवत आहे…" : "चौकशी पाठवा"}
      </button>

      {!mobileValid && mobile.length > 0 && (
        <p className="mt-2 text-[12px] font-semibold text-amber-700">मोबाइल किमान 10 अंकी हवा.</p>
      )}
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
