"use client";

/**
 * ContactQuickEnquiry — the Contact page's Quick Enquiry Form.
 *
 * WhatsApp-first and stateless: nothing is stored or sent by the website.
 * The form only builds a WhatsApp message, shows it, and opens WhatsApp; the
 * customer presses Send there. Messages go to ENQUIRY_WHATSAPP_NUMBER (owner
 * decision 2026-11-27); every other WhatsApp link keeps the main number.
 *
 * Services come from COLLECTIONS (single source for names) plus CAD Prints
 * and Other / Custom printing.
 */

import { useId, useMemo, useState } from "react";
import { MessageCircle } from "lucide-react";
import { trackWhatsAppLead } from "@/components/meta-pixel";
import { trackFunnelEvent } from "@/lib/analytics";
import { COLLECTIONS } from "@/lib/collections";
import { buildWhatsAppUrl, ENQUIRY_WHATSAPP_NUMBER } from "@/lib/whatsapp";

const SERVICES: { key: string; label: string }[] = [
  ...COLLECTIONS.map((c) => ({ key: c.key, label: c.title.en })),
  { key: "cad-prints", label: "CAD Prints" },
  { key: "other", label: "Other / Custom printing" },
];

const tx = {
  heading: "Quick Enquiry",
  body: "Fill in the form and press the button: WhatsApp opens with your message ready. Nothing is sent until you press Send in WhatsApp.",
  name: "Full name",
  mobile: "WhatsApp number (optional)",
  mobileHint: "Enter a 10-digit mobile number, or leave it empty.",
  service: "Service",
  servicePlaceholder: "Select a service",
  size: "Required size (optional)",
  sizePlaceholder: "e.g. 8 x 10 ft",
  qty: "Quantity (optional)",
  details: "Requirement details (optional)",
  detailsPlaceholder: "Design, room, material or any other details",
  preview: "Your WhatsApp message",
  send: "Send Enquiry on WhatsApp",
  required: "Name and service are required.",
  photos: "You can send photos or artwork in WhatsApp after the message.",
};

const input =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-[15px] text-slate-900 outline-none focus:border-brand-gold";

/** Indian mobile: optional +91 / 0 prefix, then 10 digits starting 6-9. */
const cleanMobile = (v: string) => v.replace(/[\s-]/g, "").replace(/^(\+?91|0)(?=\d{10}$)/, "");
const mobileOk = (v: string) => v.trim() === "" || /^[6-9]\d{9}$/.test(cleanMobile(v));

export function ContactQuickEnquiry() {
  const id = useId();
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [service, setService] = useState("");
  const [size, setSize] = useState("");
  const [qty, setQty] = useState("");
  const [details, setDetails] = useState("");

  const serviceLabel = SERVICES.find((s) => s.key === service)?.label ?? "";
  const validMobile = mobileOk(mobile);
  const ready = name.trim() !== "" && serviceLabel !== "" && validMobile;

  const message = useMemo(() => {
    const lines = [
      "PRINTSHUBH – New Enquiry",
      "Hello PRINTSHUBH Team,",
      "I would like to enquire about your printing services.",
      "",
    ];
    if (name.trim()) lines.push(`Name: ${name.trim()}`);
    if (mobile.trim()) lines.push(`Mobile: ${cleanMobile(mobile)}`);
    if (serviceLabel) lines.push(`Service: ${serviceLabel}`);
    if (size.trim()) lines.push(`Size: ${size.trim()}`);
    if (qty.trim()) lines.push(`Quantity: ${qty.trim()}`);
    if (details.trim()) lines.push("", "Requirement:", details.trim());
    lines.push("", "Please share pricing and available material options. Thank you.");
    // No double blank lines when optional fields are empty.
    return lines.filter((l, i) => !(l === "" && lines[i - 1] === "")).join("\n");
  }, [name, mobile, serviceLabel, size, qty, details]);

  const href = buildWhatsAppUrl({
    message,
    number: ENQUIRY_WHATSAPP_NUMBER,
    campaign: "contact",
    content: "quick-enquiry-form",
  });

  const field = (suffix: string) => `${id}-${suffix}`;

  return (
    <section
      aria-labelledby={field("heading")}
      className="mb-8 rounded-2xl border border-brand-gold-light bg-white p-5 shadow-sm sm:p-7"
    >
      <h2 id={field("heading")} className="text-xl font-black text-slate-950">
        {tx.heading}
      </h2>
      <p className="mt-1.5 max-w-xl text-[14.5px] leading-6 text-slate-600">{tx.body}</p>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <label className="block text-sm" htmlFor={field("name")}>
          <span className="mb-1.5 block font-semibold text-slate-700">{tx.name} *</span>
          <input
            id={field("name")}
            type="text"
            autoComplete="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={input}
          />
        </label>

        <label className="block text-sm" htmlFor={field("mobile")}>
          <span className="mb-1.5 block font-semibold text-slate-700">{tx.mobile}</span>
          <input
            id={field("mobile")}
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            aria-invalid={!validMobile}
            aria-describedby={validMobile ? undefined : field("mobile-hint")}
            className={input}
          />
          {!validMobile && (
            <span id={field("mobile-hint")} className="mt-1 block text-xs font-semibold text-red-700">
              {tx.mobileHint}
            </span>
          )}
        </label>

        <label className="block text-sm" htmlFor={field("service")}>
          <span className="mb-1.5 block font-semibold text-slate-700">{tx.service} *</span>
          <select
            id={field("service")}
            required
            value={service}
            onChange={(e) => setService(e.target.value)}
            className={input}
          >
            <option value="">{tx.servicePlaceholder}</option>
            {SERVICES.map((s) => (
              <option key={s.key} value={s.key}>
                {s.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-sm" htmlFor={field("size")}>
          <span className="mb-1.5 block font-semibold text-slate-700">{tx.size}</span>
          <input
            id={field("size")}
            type="text"
            placeholder={tx.sizePlaceholder}
            value={size}
            onChange={(e) => setSize(e.target.value)}
            className={input}
          />
        </label>

        <label className="block text-sm" htmlFor={field("qty")}>
          <span className="mb-1.5 block font-semibold text-slate-700">{tx.qty}</span>
          <input
            id={field("qty")}
            type="number"
            inputMode="numeric"
            min={1}
            value={qty}
            onChange={(e) => setQty(e.target.value)}
            className={input}
          />
        </label>

        <label className="block text-sm sm:col-span-2" htmlFor={field("details")}>
          <span className="mb-1.5 block font-semibold text-slate-700">{tx.details}</span>
          <textarea
            id={field("details")}
            rows={3}
            placeholder={tx.detailsPlaceholder}
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            className={input}
          />
        </label>
      </div>

      <div className="mt-5">
        <p className="text-xs font-black uppercase tracking-[0.12em] text-slate-500">{tx.preview}</p>
        <pre className="mt-2 max-h-56 overflow-auto whitespace-pre-wrap break-words rounded-lg border border-slate-200 bg-slate-50 p-3 font-sans text-[13.5px] leading-6 text-slate-700">
          {message}
        </pre>
      </div>

      {ready ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => {
            trackWhatsAppLead();
            trackFunnelEvent("enquiry_whatsapp_generated", {
              lang: "en",
              surface: "contact-quick-enquiry",
              service_key: service,
            });
          }}
          className="mt-4 inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-md bg-green-600 px-5 text-sm font-bold text-white shadow-sm transition hover:bg-green-700 sm:w-auto"
        >
          <MessageCircle className="size-4" aria-hidden="true" />
          {tx.send}
        </a>
      ) : (
        <button
          type="button"
          disabled
          aria-disabled="true"
          className="mt-4 inline-flex min-h-[48px] w-full cursor-not-allowed items-center justify-center gap-2 rounded-md bg-slate-300 px-5 text-sm font-bold text-slate-500 shadow-sm sm:w-auto"
        >
          <MessageCircle className="size-4" aria-hidden="true" />
          {tx.send}
        </button>
      )}
      <p className="mt-2 text-xs font-semibold text-slate-500">{ready ? tx.photos : tx.required}</p>
    </section>
  );
}
