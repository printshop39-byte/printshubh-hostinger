"use client";

/**
 * Admin — Case Details panel (Section A).
 *
 * Shows the enquiry details for a land-report case. In Phase 1 there is no
 * backend store, so fields are editable (the admin pastes/edits the enquiry
 * coming from the public WhatsApp form). Owner name / Khata are admin-only and
 * never rendered on the public site.
 */

import type { Lang } from "@/components/language-context";
import type { LandReportCase, LandReportCaseStatus } from "@/lib/bhunaksha/report-schema";

const L = {
  heading: { mr: "केस तपशील", en: "Case Details" },
  customerName: { mr: "ग्राहक नाव", en: "Customer name" },
  mobile: { mr: "मोबाइल नंबर", en: "Mobile number" },
  service: { mr: "सेवा", en: "Service" },
  district: { mr: "जिल्हा", en: "District" },
  taluka: { mr: "तालुका", en: "Taluka" },
  village: { mr: "गाव / शहर", en: "Village / City" },
  gat: { mr: "गट / सर्वे / Plot / CTS", en: "Gat / Survey / Plot / CTS" },
  gmap: { mr: "Google Map link", en: "Google Map link" },
  note: { mr: "ग्राहक टीप", en: "Customer note" },
  status: { mr: "केस स्थिती", en: "Case status" },
  adminOnly: { mr: "फक्त admin", en: "admin-only" },
} satisfies Record<string, Record<Lang, string>>;

const STATUS_LABELS: Record<LandReportCaseStatus, Record<Lang, string>> = {
  new: { mr: "नवीन", en: "New" },
  in_review: { mr: "तपासणीत", en: "In review" },
  overlay_done: { mr: "Overlay पूर्ण", en: "Overlay done" },
  report_ready: { mr: "अहवाल तयार", en: "Report ready" },
  sent: { mr: "पाठवले", en: "Sent" },
};

const STATUS_ORDER: LandReportCaseStatus[] = [
  "new",
  "in_review",
  "overlay_done",
  "report_ready",
  "sent",
];

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value?: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[12px] font-bold text-slate-600">{label}</span>
      <input
        type="text"
        value={value ?? ""}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 w-full rounded-md border border-slate-300 bg-white px-2.5 text-[13px] text-slate-800 transition focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
      />
    </label>
  );
}

export function LandReportCasePanel({
  value,
  onChange,
  lang,
}: {
  value: LandReportCase;
  onChange: (patch: Partial<LandReportCase>) => void;
  lang: Lang;
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="text-sm font-black text-slate-900">{L.heading[lang]}</h3>
        <select
          value={value.status}
          onChange={(e) => onChange({ status: e.target.value as LandReportCaseStatus })}
          className="h-8 rounded-md border border-slate-300 bg-white px-2 text-[12px] font-bold text-slate-700"
          aria-label={L.status[lang]}
        >
          {STATUS_ORDER.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s][lang]}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        <Field label={L.customerName[lang]} value={value.customerName} onChange={(v) => onChange({ customerName: v })} />
        <Field label={L.mobile[lang]} value={value.mobile} onChange={(v) => onChange({ mobile: v })} />
        <Field label={L.service[lang]} value={value.serviceType} onChange={(v) => onChange({ serviceType: v })} />
        <Field label={L.district[lang]} value={value.district} onChange={(v) => onChange({ district: v })} />
        <Field label={L.taluka[lang]} value={value.taluka} onChange={(v) => onChange({ taluka: v })} />
        <Field label={L.village[lang]} value={value.villageOrCity} onChange={(v) => onChange({ villageOrCity: v })} />
        <Field
          label={L.gat[lang]}
          value={value.gatSurveyPlotCts}
          onChange={(v) => onChange({ gatSurveyPlotCts: v })}
        />
        <Field label={L.gmap[lang]} value={value.googleMapLink} onChange={(v) => onChange({ googleMapLink: v })} />
      </div>

      <label className="mt-2.5 block">
        <span className="mb-1 block text-[12px] font-bold text-slate-600">{L.note[lang]}</span>
        <textarea
          value={value.customerNote ?? ""}
          onChange={(e) => onChange({ customerNote: e.target.value })}
          rows={2}
          className="w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-[13px] text-slate-800 transition focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
        />
      </label>
    </section>
  );
}
