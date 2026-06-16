"use client";

/**
 * Admin — Report Output panel (Section E).
 * Generates the internal report draft + WhatsApp summary, exposes the map
 * screenshot action, and carries the mandatory accuracy disclaimer. Owner
 * details are included in the report ONLY when the admin opts in.
 */

import { Camera, Copy, FileJson, FileText, Map as MapIcon } from "lucide-react";
import { useMemo, useState } from "react";
import type { Lang } from "@/components/language-context";
import {
  buildAdminWhatsAppMessage,
  buildReportDraft,
  OVERLAY_DISCLAIMER,
  type LandReportCase,
} from "@/lib/bhunaksha/report-schema";
import { formatTodayDate } from "@/lib/bhunaksha/overlay-transform";

const L = {
  heading: { mr: "अहवाल आउटपुट", en: "Report Output" },
  screenshot: { mr: "नकाशा स्क्रीनशॉट", en: "Map screenshot" },
  exportJson: { mr: "Overlay JSON export", en: "Export overlay JSON" },
  exportGeoJson: { mr: "GeoJSON export", en: "Export GeoJSON" },
  exportPdf: { mr: "PDF अहवाल", en: "Report PDF" },
  draft: { mr: "अंतर्गत अहवाल मसुदा", en: "Internal report draft" },
  whatsapp: { mr: "WhatsApp संदेश", en: "WhatsApp message" },
  copy: { mr: "कॉपी", en: "Copy" },
  copied: { mr: "कॉपी झाले", en: "Copied" },
  ownerToggle: {
    mr: "अहवालात मालक / खाता तपशील समाविष्ट करा",
    en: "Include owner / Khata details in report",
  },
  reportNotes: { mr: "Admin अहवाल टीप", en: "Admin report notes" },
} satisfies Record<string, Record<Lang, string>>;

function CopyBlock({ label, text, lang }: { label: string; text: string; lang: Lang }) {
  const [copied, setCopied] = useState(false);
  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <span className="text-[12px] font-bold text-slate-600">{label}</span>
        <button
          type="button"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(text);
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            } catch {
              /* clipboard may be blocked — ignore */
            }
          }}
          className="inline-flex items-center gap-1 rounded-md border border-slate-300 px-2 py-1 text-[11px] font-bold text-slate-700 transition hover:bg-slate-50"
        >
          <Copy className="size-3" />
          {copied ? L.copied[lang] : L.copy[lang]}
        </button>
      </div>
      <textarea
        readOnly
        value={text}
        rows={text.split("\n").length + 1}
        className="w-full resize-y rounded-md border border-slate-200 bg-slate-50 px-2.5 py-2 font-mono text-[11.5px] leading-5 text-slate-800"
      />
    </div>
  );
}

export function ReportOutputPanel({
  lang,
  value,
  overlayUsed,
  scaleText,
  onScreenshot,
  onExportJson,
  onExportGeoJson,
  onExportPdf,
  onChange,
}: {
  lang: Lang;
  value: LandReportCase;
  overlayUsed: boolean;
  scaleText: string;
  onScreenshot: () => void;
  onExportJson: () => void;
  onExportGeoJson: () => void;
  onExportPdf: () => void;
  onChange: (patch: Partial<LandReportCase>) => void;
}) {
  const generatedAt = formatTodayDate();
  const draft = useMemo(
    () => buildReportDraft(value, { overlayUsed, scaleText, generatedAt }, lang),
    [value, overlayUsed, scaleText, generatedAt, lang],
  );
  const wa = useMemo(() => buildAdminWhatsAppMessage(value, lang), [value, lang]);

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="mb-3 text-sm font-black text-slate-900">{L.heading[lang]}</h3>

      <div className="mb-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onScreenshot}
          className="inline-flex items-center gap-1.5 rounded-md bg-blue-700 px-3 py-2 text-[12px] font-bold text-white transition hover:bg-blue-800"
        >
          <Camera className="size-3.5" />
          {L.screenshot[lang]}
        </button>
        <button
          type="button"
          onClick={onExportPdf}
          className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 px-3 py-2 text-[12px] font-bold text-slate-700 transition hover:bg-slate-50"
        >
          <FileText className="size-3.5" />
          {L.exportPdf[lang]}
        </button>
        <button
          type="button"
          onClick={onExportGeoJson}
          className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 px-3 py-2 text-[12px] font-bold text-slate-700 transition hover:bg-slate-50"
        >
          <MapIcon className="size-3.5" />
          {L.exportGeoJson[lang]}
        </button>
        <button
          type="button"
          onClick={onExportJson}
          disabled={!overlayUsed}
          className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 px-3 py-2 text-[12px] font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-40"
        >
          <FileJson className="size-3.5" />
          {L.exportJson[lang]}
        </button>
      </div>

      <label className="mb-3 block">
        <span className="mb-1 block text-[12px] font-bold text-slate-600">{L.reportNotes[lang]}</span>
        <textarea
          value={value.reportNotes ?? ""}
          onChange={(e) => onChange({ reportNotes: e.target.value })}
          rows={2}
          className="w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-[13px] text-slate-800 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
        />
      </label>

      <label className="mb-3 flex items-center gap-2 text-[12px] font-semibold text-slate-700">
        <input
          type="checkbox"
          checked={!!value.includeOwnerDetailsInReport}
          onChange={(e) => onChange({ includeOwnerDetailsInReport: e.target.checked })}
          className="size-4 accent-blue-600"
        />
        {L.ownerToggle[lang]}
      </label>

      <div className="space-y-3">
        <CopyBlock label={L.draft[lang]} text={draft} lang={lang} />
        <CopyBlock label={L.whatsapp[lang]} text={wa} lang={lang} />
      </div>

      <p className="mt-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-[11.5px] leading-5 text-amber-900">
        {OVERLAY_DISCLAIMER[lang]}
      </p>
    </section>
  );
}
