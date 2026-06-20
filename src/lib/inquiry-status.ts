/**
 * Inquiry status vocabulary + display metadata. Plain module (no server-only),
 * so both the server list and the client table can import it.
 */

export const INQUIRY_STATUSES = ["new", "pending", "process", "complete"] as const;
export type InquiryStatus = (typeof INQUIRY_STATUSES)[number];

export const STATUS_META: Record<InquiryStatus, { label: string; chip: string; dot: string }> = {
  new: { label: "नवीन", chip: "bg-blue-100 text-blue-800", dot: "bg-blue-500" },
  pending: { label: "प्रलंबित", chip: "bg-amber-100 text-amber-800", dot: "bg-amber-500" },
  process: { label: "प्रक्रिया", chip: "bg-violet-100 text-violet-800", dot: "bg-violet-500" },
  complete: { label: "पूर्ण", chip: "bg-green-100 text-green-800", dot: "bg-green-600" },
};

/** Coerce any stored value to a known status (defaults to "new"). */
export function asStatus(s?: string | null): InquiryStatus {
  return (INQUIRY_STATUSES as readonly string[]).includes(s ?? "") ? (s as InquiryStatus) : "new";
}
