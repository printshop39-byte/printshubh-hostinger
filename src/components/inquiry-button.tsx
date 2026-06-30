"use client";

/**
 * InquiryButton — a no-WhatsApp alternative CTA.
 *
 * Opens a small modal form (name + mobile required; service / place / note
 * optional) that POSTs to the EXISTING /api/inquiries endpoint, so these leads
 * land in the same Supabase table + admin panel as every other inquiry. For
 * visitors who don't want to chat on WhatsApp.
 *
 * `variant="link"` renders a subtle inline link (use under a WhatsApp CTA);
 * `variant="button"` renders a full secondary button.
 */

import { useEffect, useRef, useState } from "react";
import { ClipboardList, Loader2, X } from "lucide-react";
import { useLang, type Lang } from "@/components/language-context";

type Status = "idle" | "pending" | "success" | "error";

const t: Record<
  Lang,
  {
    linkLabel: string;
    buttonLabel: string;
    title: string;
    subtitle: string;
    name: string;
    mobile: string;
    service: string;
    servicePlaceholder: string;
    place: string;
    note: string;
    submit: string;
    sending: string;
    successTitle: string;
    successBody: string;
    errorBody: string;
    close: string;
    required: string;
    services: string[];
  }
> = {
  mr: {
    linkLabel: "WhatsApp नको? सोपा फॉर्म भरा",
    buttonLabel: "फॉर्म भरून माहिती पाठवा",
    title: "माहिती भरा — आम्ही संपर्क करू",
    subtitle: "WhatsApp शिवाय. नाव व मोबाइल द्या, बाकी ऐच्छिक.",
    name: "तुमचे नाव",
    mobile: "मोबाइल नंबर",
    service: "सेवा (ऐच्छिक)",
    servicePlaceholder: "सेवा निवडा",
    place: "गाव / शहर (ऐच्छिक)",
    note: "टीप / तपशील (ऐच्छिक)",
    submit: "पाठवा",
    sending: "पाठवत आहे…",
    successTitle: "धन्यवाद!",
    successBody: "तुमची माहिती मिळाली. आम्ही लवकरच तुमच्याशी संपर्क करू.",
    errorBody: "क्षमस्व, पाठवता आले नाही. कृपया पुन्हा प्रयत्न करा किंवा WhatsApp वापरा.",
    close: "बंद करा",
    required: "नाव व मोबाइल आवश्यक आहेत.",
    services: [
      "7/12 उतारा",
      "8A उतारा",
      "गाव नकाशा",
      "DP / TP नकाशा",
      "मिळकत पत्रिका",
      "ई-फेरफार",
      "जमीन अहवाल",
      "इतर",
    ],
  },
  en: {
    linkLabel: "Prefer not to use WhatsApp? Fill a quick form",
    buttonLabel: "Send details via form",
    title: "Share your details — we'll reach out",
    subtitle: "No WhatsApp needed. Name & mobile required, rest optional.",
    name: "Your name",
    mobile: "Mobile number",
    service: "Service (optional)",
    servicePlaceholder: "Choose a service",
    place: "Village / City (optional)",
    note: "Note / details (optional)",
    submit: "Send",
    sending: "Sending…",
    successTitle: "Thank you!",
    successBody: "We've received your details and will contact you shortly.",
    errorBody: "Sorry, couldn't send. Please try again or use WhatsApp.",
    close: "Close",
    required: "Name and mobile are required.",
    services: [
      "7/12 Extract",
      "8A Extract",
      "Village Map",
      "DP / TP Map",
      "Property Card",
      "eFerfar (Mutation)",
      "Land Report",
      "Other",
    ],
  },
};

export function InquiryButton({
  variant = "link",
  className = "",
}: {
  variant?: "link" | "button";
  className?: string;
}) {
  const { lang } = useLang();
  const tx = t[lang];
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [errMsg, setErrMsg] = useState("");
  const firstFieldRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    firstFieldRef.current?.focus();
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  function reset() {
    setOpen(false);
    setStatus("idle");
    setErrMsg("");
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    // Honeypot — bots fill "company"; pretend success and drop.
    if (String(fd.get("company") ?? "").trim() !== "") {
      setStatus("success");
      return;
    }
    const customer_name = String(fd.get("customer_name") ?? "").trim();
    const mobile = String(fd.get("mobile") ?? "").replace(/\D/g, "");
    if (!customer_name || mobile.length < 10) {
      setErrMsg(tx.required);
      return;
    }
    setErrMsg("");
    setStatus("pending");
    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          customer_name,
          mobile,
          service: String(fd.get("service") ?? ""),
          village: String(fd.get("village") ?? ""),
          note: String(fd.get("note") ?? ""),
          company: "",
        }),
      });
      const data = (await res.json().catch(() => ({ ok: false }))) as { ok?: boolean };
      setStatus(res.ok && data.ok ? "success" : "error");
    } catch {
      setStatus("error");
    }
  }

  const trigger =
    variant === "button" ? (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`inline-flex h-12 items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-5 text-sm font-bold text-slate-800 shadow-sm transition hover:bg-slate-50 ${className}`}
      >
        <ClipboardList className="size-4" />
        {tx.buttonLabel}
      </button>
    ) : (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`inline-flex items-center gap-1.5 text-sm font-bold underline-offset-2 hover:underline ${className}`}
      >
        <ClipboardList className="size-4" />
        {tx.linkLabel}
      </button>
    );

  return (
    <>
      {trigger}

      {open && (
        <div
          className="fixed inset-0 z-[60] flex items-end justify-center bg-slate-900/50 p-0 sm:items-center sm:p-4"
          onClick={reset}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="inquiry-title"
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-t-2xl bg-white p-6 shadow-xl sm:rounded-2xl"
          >
            <div className="mb-1 flex items-start justify-between gap-3">
              <h2 id="inquiry-title" className="text-lg font-black text-slate-900">
                {tx.title}
              </h2>
              <button
                type="button"
                onClick={reset}
                aria-label={tx.close}
                className="inline-flex size-9 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100"
              >
                <X className="size-5" />
              </button>
            </div>

            {status === "success" ? (
              <div className="py-6 text-center">
                <p className="text-base font-black text-green-700">{tx.successTitle}</p>
                <p className="mt-2 text-sm leading-7 text-slate-600">{tx.successBody}</p>
                <button
                  type="button"
                  onClick={reset}
                  className="mt-5 inline-flex h-11 items-center justify-center rounded-md bg-blue-600 px-6 text-sm font-bold text-white hover:bg-blue-700"
                >
                  {tx.close}
                </button>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="space-y-3">
                <p className="text-[13px] font-semibold text-slate-500">{tx.subtitle}</p>

                {/* Honeypot — visually hidden, off-screen, not tab-focusable */}
                <input
                  type="text"
                  name="company"
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                  className="absolute left-[-9999px] h-0 w-0 opacity-0"
                />

                <label className="block">
                  <span className="mb-1 block text-[12px] font-bold text-slate-600">
                    {tx.name} <span className="text-red-500">*</span>
                  </span>
                  <input
                    ref={firstFieldRef}
                    name="customer_name"
                    required
                    autoComplete="name"
                    className="h-11 w-full rounded-md border border-slate-300 px-3 text-[14px] focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  />
                </label>

                <label className="block">
                  <span className="mb-1 block text-[12px] font-bold text-slate-600">
                    {tx.mobile} <span className="text-red-500">*</span>
                  </span>
                  <input
                    name="mobile"
                    type="tel"
                    inputMode="numeric"
                    required
                    autoComplete="tel"
                    className="h-11 w-full rounded-md border border-slate-300 px-3 text-[14px] focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  />
                </label>

                <label className="block">
                  <span className="mb-1 block text-[12px] font-bold text-slate-600">{tx.service}</span>
                  <select
                    name="service"
                    defaultValue=""
                    className="h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-[14px] focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="" disabled>
                      {tx.servicePlaceholder}
                    </option>
                    {tx.services.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="mb-1 block text-[12px] font-bold text-slate-600">{tx.place}</span>
                  <input
                    name="village"
                    className="h-11 w-full rounded-md border border-slate-300 px-3 text-[14px] focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  />
                </label>

                <label className="block">
                  <span className="mb-1 block text-[12px] font-bold text-slate-600">{tx.note}</span>
                  <textarea
                    name="note"
                    rows={2}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-[14px] focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  />
                </label>

                {(errMsg || status === "error") && (
                  <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-[12px] font-bold text-red-700">
                    {errMsg || tx.errorBody}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={status === "pending"}
                  className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-md bg-blue-600 text-sm font-bold text-white transition hover:bg-blue-700 disabled:opacity-60"
                >
                  {status === "pending" ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      {tx.sending}
                    </>
                  ) : (
                    tx.submit
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
