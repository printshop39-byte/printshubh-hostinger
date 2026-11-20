"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { CalculatorPageShell } from "@/components/calculators/calculator-page-shell";
import { SelectField, NumberField, ResultStat } from "@/components/calculators/calculator-fields";
import { ServiceSection, ServiceList, ServiceFaq } from "@/components/service-page-shell";
import { formatINR } from "@/lib/calculators/format";

interface Category {
  key: string;
  labelEn: string;
  labelMr: string;
}
interface ZoneRR {
  en: string;
  mr: string;
  survey?: string;
  rates: Record<string, number>;
}
interface TalukaRR {
  en: string;
  mr: string;
  zones: ZoneRR[];
}
interface ReadyReckonerFile {
  sample?: boolean;
  effectiveFrom: string;
  district: { en: string; mr: string };
  note: string;
  noteMr: string;
  categories: Category[];
  talukas: TalukaRR[];
}

export const readyReckonerFaqMr: Array<{ q: string; a: string }> = [
  {
    q: "रेडी रेकनर दर म्हणजे काय?",
    a: "रेडी रेकनर (वार्षिक दर विवरणपत्र / ASR) हे महाराष्ट्र नोंदणी व मुद्रांक विभागाने (IGR) दरवर्षी जाहीर केलेले किमान सरकारी जमीन-मूल्य दर आहेत. मुद्रांक शुल्क करारनामा मूल्य किंवा रेडी रेकनर मूल्य, यापैकी जे जास्त असेल त्यावर आकारले जाते.",
  },
  {
    q: "या पानावरील दर अधिकृत आहेत का?",
    a: "नाही. सध्या या पानावर फक्त नमुना (placeholder) दर दाखवले आहेत — कार्यपद्धती दाखवण्यासाठी. खरे ASR दर IGR महाराष्ट्रच्या अधिकृत विवरणपत्रातून भरले जातील. तोपर्यंत हे दर कोणत्याही व्यवहारासाठी वापरू नका.",
  },
  {
    q: "रेडी रेकनर दर झोननिहाय का असतात?",
    a: "एका तालुक्यात किंवा शहरात वेगवेगळ्या भागांचे (झोन) दर वेगळे असतात — मुख्य रस्त्यालगत जास्त, आतल्या भागात कमी. अधिकृत ASR मध्ये प्रत्येक झोनसाठी (गाव + सर्व्हे/CTS श्रेणी) स्वतंत्र दर असतो. हे साधन तालुका → गाव/झोन निवडून दर दाखवते; तुम्ही गरजेनुसार अधिक झोन भरू शकता.",
  },
  {
    q: "मूल्य कसे मोजले जाते?",
    a: "मूल्य = दर (प्रति चौरस मीटर) × क्षेत्रफळ (चौरस मीटर). बांधकामासाठी बांधीव क्षेत्र आणि जमिनीसाठी भूखंड क्षेत्र वापरा. हे मूल्य मुद्रांक शुल्क कॅल्क्युलेटरमध्ये वापरता येते.",
  },
];

const readyReckonerFaqEn: Array<{ q: string; a: string }> = [
  {
    q: "What is the Ready Reckoner rate?",
    a: "The Ready Reckoner (Annual Statement of Rates / ASR) is the minimum government land value published every year by Maharashtra's IGR (Registration & Stamps) department. Stamp duty is charged on the higher of the agreement value and the Ready Reckoner value.",
  },
  {
    q: "Are the rates on this page official?",
    a: "No. This page currently shows sample (placeholder) rates to demonstrate the workflow. The real ASR rates will be filled in from IGR Maharashtra's official statement. Until then, do not use these rates for any transaction.",
  },
  {
    q: "Why are Ready Reckoner rates zone-wise?",
    a: "Within a taluka or city, different areas (zones) have different rates — higher along main roads, lower in interior areas. The official ASR lists a separate rate per zone (village + survey/CTS range). This tool lets you pick taluka → village/zone to see the rate, and you can add more zones as needed.",
  },
  {
    q: "How is the value calculated?",
    a: "Value = rate (per square metre) × area (square metres). Use built-up area for construction and plot area for land. This value can then be used in the Stamp Duty calculator.",
  },
];

function SampleBanner({ note }: { note: string }) {
  return (
    <div className="flex gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-[13.5px] leading-6 text-red-900">
      <AlertTriangle className="mt-0.5 size-4 shrink-0 text-red-600" />
      <p>
        <strong>{"Sample data — not official. "}</strong>
        {note}
      </p>
    </div>
  );
}

function ReadyReckonerLookup() {
  const [data, setData] = useState<ReadyReckonerFile | null>(null);
  const [talukaIdx, setTalukaIdx] = useState(0);
  const [zoneIdx, setZoneIdx] = useState(0);
  const [category, setCategory] = useState("residentialBuiltup");
  const [area, setArea] = useState(100);

  useEffect(() => {
    let alive = true;
    fetch("/data/rates/ready-reckoner-kolhapur.json")
      .then((r) => (r.ok ? r.json() : null))
      .then((d: ReadyReckonerFile | null) => alive && setData(d))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  const taluka = data?.talukas[talukaIdx];
  // Zone index can go stale when the taluka changes (new taluka may have
  // fewer zones), so clamp before indexing.
  const safeZoneIdx = taluka ? Math.min(zoneIdx, taluka.zones.length - 1) : 0;
  const zone = taluka?.zones[safeZoneIdx];
  const rate = zone?.rates[category] ?? 0;
  const value = useMemo(() => rate * (area > 0 ? area : 0), [rate, area]);

  if (!data) {
    return <p className="text-sm text-slate-500">Loading…</p>;
  }

  return (
    <div className="space-y-6">
      {data.sample && <SampleBanner note={data.note} />}

      <div className="grid gap-5 sm:grid-cols-3">
        <SelectField
          label={`Taluka (District: ${data.district.en})`}
          value={String(talukaIdx)}
          onChange={(v) => {
            setTalukaIdx(Number(v));
            setZoneIdx(0);
          }}
          options={data.talukas.map((t, i) => ({ value: String(i), label: t.en }))}
        />
        <SelectField
          label="Village / zone"
          value={String(safeZoneIdx)}
          onChange={(v) => setZoneIdx(Number(v))}
          options={(taluka?.zones ?? []).map((z, i) => ({ value: String(i), label: z.en }))}
        />
        <SelectField
          label="Category"
          value={category}
          onChange={setCategory}
          options={data.categories.map((c) => ({ value: c.key, label: c.labelEn }))}
        />
      </div>

      {zone?.survey && (
        <p className="-mt-2 text-[12px] text-slate-500">
          {"Zone reference: "}
          {zone.survey}
        </p>
      )}

      {/* All four category rates for the selected zone. */}
      <div className="grid gap-3 sm:grid-cols-4">
        {data.categories.map((c) => (
          <ResultStat
            key={c.key}
            label={c.labelEn}
            value={`${formatINR(zone?.rates[c.key] ?? 0)}/m²`}
            emphasis={c.key === category}
          />
        ))}
      </div>

      <div className="grid items-end gap-5 sm:grid-cols-2">
        <NumberField
          label="Area"
          value={area}
          onChange={setArea}
          min={0}
          step={10}
          suffix="m²"
        />
        <ResultStat
          label="Estimated Ready Reckoner value"
          value={formatINR(value)}
          emphasis
        />
      </div>

      <p className="text-[13px] leading-6 text-slate-600">
        {"Stamp duty applies on the higher of the agreement value and this Ready Reckoner value. "}
        <Link href="/stamp-duty/" className="font-bold text-blue-700 underline">
          Calculate stamp duty →
        </Link>
      </p>
    </div>
  );
}

export function ReadyReckonerContent() {
  return (
    <CalculatorPageShell
      eyebrow="Land-value tool"
      title="Ready Reckoner Rates — Kolhapur (Sample)"
      breadcrumb="Ready Reckoner"
      intro="Pick a taluka and category — see the government rate per square metre and an estimated value from the area. (Currently sample rates.)"
      updatedAt="June 2026"
      calculator={<ReadyReckonerLookup />}
      content={<Body />}
      disclaimerExtra="Rates on this page are sample values; do not use for a transaction until real ASR rates are filled in."
    />
  );
}

function Body() {
  return (
    <>
      <ServiceSection heading="What is the Ready Reckoner?">
        <p>
          The <strong>Ready Reckoner rate</strong> (Annual Statement of Rates / ASR) is the
          minimum government land value published every year by IGR Maharashtra. At
          registration, stamp duty is charged on the higher of the <em>agreement value</em>{" "}
          and the <em>Ready Reckoner value</em>.
        </p>
      </ServiceSection>
      <ServiceSection heading="How to use this tool">
        <ServiceList
          items={[
            "Select a taluka (currently Kolhapur district as a sample).",
            "Select a village / zone — like the real ASR, the rate varies by zone.",
            "Select a category — agricultural, residential plot, residential built-up or commercial.",
            "Enter the area in square metres — the estimated value updates instantly.",
            "Use the same value in the Stamp Duty calculator.",
          ]}
        />
      </ServiceSection>
      <ServiceSection heading="Frequently asked questions">
        <ServiceFaq pairs={readyReckonerFaqEn} />
      </ServiceSection>
    </>
  );
}
