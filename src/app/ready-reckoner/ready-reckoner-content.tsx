"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { CalculatorPageShell } from "@/components/calculators/calculator-page-shell";
import { SelectField, NumberField, ResultStat } from "@/components/calculators/calculator-fields";
import { ServiceSection, ServiceList, ServiceFaq } from "@/components/service-page-shell";
import { useLang } from "@/components/language-context";
import { formatINR } from "@/lib/calculators/format";

interface Category {
  key: string;
  labelEn: string;
  labelMr: string;
}
interface TalukaRR {
  en: string;
  mr: string;
  rates: Record<string, number>;
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
    a: "एका तालुक्यात किंवा शहरात वेगवेगळ्या भागांचे (झोन) दर वेगळे असतात — मुख्य रस्त्यालगत जास्त, आतल्या भागात कमी. अधिकृत ASR मध्ये प्रत्येक झोनसाठी स्वतंत्र दर असतो. हे साधन सध्या तालुक्यासाठी एक प्रातिनिधिक दर दाखवते.",
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
    a: "Within a taluka or city, different areas (zones) have different rates — higher along main roads, lower in interior areas. The official ASR lists a separate rate per zone. This tool currently shows one representative rate per taluka.",
  },
  {
    q: "How is the value calculated?",
    a: "Value = rate (per square metre) × area (square metres). Use built-up area for construction and plot area for land. This value can then be used in the Stamp Duty calculator.",
  },
];

function SampleBanner({ mr, note }: { mr: boolean; note: string }) {
  return (
    <div className="flex gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-[13.5px] leading-6 text-red-900">
      <AlertTriangle className="mt-0.5 size-4 shrink-0 text-red-600" />
      <p>
        <strong>{mr ? "नमुना आकडेवारी — अधिकृत नाही. " : "Sample data — not official. "}</strong>
        {note}
      </p>
    </div>
  );
}

function ReadyReckonerLookup() {
  const { lang } = useLang();
  const mr = lang === "mr";
  const [data, setData] = useState<ReadyReckonerFile | null>(null);
  const [talukaIdx, setTalukaIdx] = useState(0);
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
  const rate = taluka?.rates[category] ?? 0;
  const value = useMemo(() => rate * (area > 0 ? area : 0), [rate, area]);

  if (!data) {
    return <p className="text-sm text-slate-500">{mr ? "लोड होत आहे…" : "Loading…"}</p>;
  }

  return (
    <div className="space-y-6">
      {data.sample && <SampleBanner mr={mr} note={mr ? data.noteMr : data.note} />}

      <div className="grid gap-5 sm:grid-cols-2">
        <SelectField
          label={mr ? `तालुका (जिल्हा: ${data.district.mr})` : `Taluka (District: ${data.district.en})`}
          value={String(talukaIdx)}
          onChange={(v) => setTalukaIdx(Number(v))}
          options={data.talukas.map((t, i) => ({ value: String(i), label: mr ? t.mr : t.en }))}
        />
        <SelectField
          label={mr ? "वर्ग" : "Category"}
          value={category}
          onChange={setCategory}
          options={data.categories.map((c) => ({ value: c.key, label: mr ? c.labelMr : c.labelEn }))}
        />
      </div>

      {/* All four category rates for the selected taluka. */}
      <div className="grid gap-3 sm:grid-cols-4">
        {data.categories.map((c) => (
          <ResultStat
            key={c.key}
            label={mr ? c.labelMr : c.labelEn}
            value={`${formatINR(taluka?.rates[c.key] ?? 0)}/m²`}
            emphasis={c.key === category}
          />
        ))}
      </div>

      <div className="grid items-end gap-5 sm:grid-cols-2">
        <NumberField
          label={mr ? "क्षेत्रफळ" : "Area"}
          value={area}
          onChange={setArea}
          min={0}
          step={10}
          suffix="m²"
        />
        <ResultStat
          label={mr ? "अंदाजे रेडी रेकनर मूल्य" : "Estimated Ready Reckoner value"}
          value={formatINR(value)}
          emphasis
        />
      </div>

      <p className="text-[13px] leading-6 text-slate-600">
        {mr
          ? "मुद्रांक शुल्क हे करारनामा मूल्य किंवा या रेडी रेकनर मूल्यापैकी जास्त रकमेवर लागते. "
          : "Stamp duty applies on the higher of the agreement value and this Ready Reckoner value. "}
        <Link href="/stamp-duty/" className="font-bold text-blue-700 underline">
          {mr ? "मुद्रांक शुल्क मोजा →" : "Calculate stamp duty →"}
        </Link>
      </p>
    </div>
  );
}

export function ReadyReckonerContent() {
  return (
    <CalculatorPageShell
      eyebrow={{ mr: "जमीन-मूल्य साधन", en: "Land-value tool" }}
      title={{
        mr: "रेडी रेकनर दर — कोल्हापूर (नमुना)",
        en: "Ready Reckoner Rates — Kolhapur (Sample)",
      }}
      breadcrumb={{ mr: "रेडी रेकनर", en: "Ready Reckoner" }}
      intro={{
        mr: "तालुका व वर्ग निवडा — प्रति चौरस मीटर सरकारी दर आणि क्षेत्रफळावरून अंदाजे मूल्य पाहा. (सध्या नमुना दर.)",
        en: "Pick a taluka and category — see the government rate per square metre and an estimated value from the area. (Currently sample rates.)",
      }}
      updatedAt={{ mr: "जून २०२६", en: "June 2026" }}
      calculator={<ReadyReckonerLookup />}
      contentMr={<BodyMr />}
      contentEn={<BodyEn />}
      disclaimerExtra={{
        mr: "या पानावरील दर नमुना आहेत; खरे ASR दर भरेपर्यंत व्यवहारासाठी वापरू नका.",
        en: "Rates on this page are sample values; do not use for a transaction until real ASR rates are filled in.",
      }}
    />
  );
}

function BodyMr() {
  return (
    <>
      <ServiceSection heading="रेडी रेकनर म्हणजे काय?">
        <p>
          <strong>रेडी रेकनर दर</strong> (वार्षिक दर विवरणपत्र / ASR) हे IGR
          महाराष्ट्रने दरवर्षी जाहीर केलेले किमान सरकारी जमीन-मूल्य आहेत. कोणत्याही
          मालमत्तेच्या नोंदणीवेळी मुद्रांक शुल्क हे <em>करारनामा मूल्य</em> किंवा{" "}
          <em>रेडी रेकनर मूल्य</em>, यापैकी जे जास्त असेल त्यावर आकारले जाते.
        </p>
      </ServiceSection>
      <ServiceSection heading="हे साधन कसे वापरावे?">
        <ServiceList
          items={[
            "तालुका निवडा (सध्या कोल्हापूर जिल्हा नमुना म्हणून).",
            "वर्ग निवडा — शेतजमीन, निवासी भूखंड, निवासी बांधकाम किंवा व्यापारी बांधकाम.",
            "क्षेत्रफळ (चौरस मीटर) टाका — अंदाजे मूल्य लगेच दिसते.",
            "हेच मूल्य मुद्रांक शुल्क कॅल्क्युलेटरमध्ये वापरा.",
          ]}
        />
      </ServiceSection>
      <ServiceSection heading="वारंवार विचारले जाणारे प्रश्न">
        <ServiceFaq pairs={readyReckonerFaqMr} />
      </ServiceSection>
    </>
  );
}

function BodyEn() {
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
