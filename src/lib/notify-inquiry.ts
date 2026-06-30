import "server-only";

/**
 * Lead notification — emails the owner when a new inquiry is captured, via
 * Resend's REST API (plain fetch, no SDK — matching lib/inquiries.ts).
 *
 * OFF BY DEFAULT / fully inert until ALL three env vars are set, so adding
 * this code changes nothing in production until you opt in:
 *   RESEND_API_KEY  — your Resend API key (re_…)
 *   RESEND_FROM     — verified sender, e.g. "PrintShubh Leads <leads@printshubh.shop>"
 *                     (use onboarding@resend.dev only for quick testing)
 *   RESEND_TO       — where alerts go, e.g. printshop39@gmail.com
 *
 * Best-effort: NEVER throws and never blocks the inquiry from being saved —
 * a failed/slow email must not lose a lead. Bounded by a 6s timeout so a
 * hung Resend call can't hold the form response open.
 */

import type { InquiryInput } from "@/lib/inquiries";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RESEND_FROM = process.env.RESEND_FROM;
const RESEND_TO = process.env.RESEND_TO;

export function inquiryNotifyConfigured(): boolean {
  return Boolean(RESEND_API_KEY && RESEND_FROM && RESEND_TO);
}

function escapeHtml(s: string): string {
  return s.replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] as string,
  );
}

/** Email the owner about a new lead. Inert unless configured; never throws. */
export async function notifyNewInquiry(input: InquiryInput): Promise<void> {
  if (!inquiryNotifyConfigured()) return; // not configured → do nothing

  const fields: Array<[string, string | undefined]> = [
    ["नाव / Name", input.customer_name],
    ["मोबाइल / Mobile", input.mobile],
    ["सेवा / Service", input.service],
    ["जिल्हा / District", input.district],
    ["तालुका / Taluka", input.taluka],
    ["गाव / Village", input.village],
    ["गट / Survey-Gat", input.gat],
    ["टीप / Note", input.note],
  ];
  const present = fields.filter(([, v]) => v && v.trim());

  const text = present.map(([k, v]) => `${k}: ${v}`).join("\n");
  const html =
    `<h2 style="margin:0 0 12px">नवीन lead — PrintShubh</h2>` +
    present
      .map(
        ([k, v]) =>
          `<p style="margin:4px 0"><strong>${k}:</strong> ${escapeHtml(String(v))}</p>`,
      )
      .join("");
  const subject =
    `नवीन lead — ${input.customer_name || "PrintShubh"}` +
    (input.service ? ` · ${input.service}` : "");

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from: RESEND_FROM, to: [RESEND_TO], subject, text, html }),
      cache: "no-store",
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) {
      console.error("[notifyNewInquiry] Resend returned", res.status);
    }
  } catch (err) {
    // Network error / timeout / abort — swallow; the lead is already saved.
    console.error("[notifyNewInquiry] failed:", err);
  }
}
