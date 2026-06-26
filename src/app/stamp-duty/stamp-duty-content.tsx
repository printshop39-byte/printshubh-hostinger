"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CalculatorPageShell } from "@/components/calculators/calculator-page-shell";
import { NumberField, SelectField, Toggle, ResultStat } from "@/components/calculators/calculator-fields";
import { ServiceSection, ServiceList, ServiceFaq } from "@/components/service-page-shell";
import { useLang } from "@/components/language-context";
import { computeStampDuty } from "@/lib/calculators/stamp-duty";
import { formatINR } from "@/lib/calculators/format";

interface AreaType {
  key: string;
  labelEn: string;
  labelMr: string;
  stampPct: number;
}
interface StampDutyFile {
  effectiveFrom: string;
  note: string;
  noteMr: string;
  areaTypes: AreaType[];
  metroCessPct: number;
  metroCities: string[];
  metroCitiesMr: string[];
  registration: { pct: number; capRupees: number };
  femaleRebatePct: number;
}

export const stampDutyFaqMr: Array<{ q: string; a: string }> = [
  {
    q: "मुद्रांक शुल्क कशावर आकारले जाते?",
    a: "मुद्रांक शुल्क हे करारनामा (व्यवहार) मूल्य किंवा रेडी रेकनर मूल्य, यापैकी जे जास्त असेल त्यावर आकारले जाते. दर हा मालमत्ता कोणत्या स्थानिक स्वराज्य संस्थेच्या हद्दीत आहे (महानगरपालिका / नगरपालिका / ग्रामपंचायत) यावर अवलंबून असतो.",
  },
  {
    q: "मेट्रो सेस म्हणजे काय?",
    a: "मुंबई, पुणे, नागपूर, ठाणे, नवी मुंबई आणि पिंपरी-चिंचवड या शहरांत मुद्रांक शुल्कावर अतिरिक्त 1% मेट्रो सेस (वाहतूक अधिभार) आकारला जातो. इतर भागांत तो लागू होत नाही.",
  },
  {
    q: "महिलांना मुद्रांक शुल्कात सवलत आहे का?",
    a: "होय, निवासी मालमत्ता महिलेच्या नावावर असल्यास सर्वसाधारणपणे 1% कमी मुद्रांक शुल्क लागते (काही अटींसह). हे कॅल्क्युलेटरमध्ये 'महिला खरेदीदार' पर्याय निवडून पाहता येते. अंतिम पात्रता नोंदणी कार्यालयाकडून तपासा.",
  },
  {
    q: "नोंदणी शुल्क किती असते?",
    a: "नोंदणी शुल्क सर्वसाधारणपणे मालमत्ता मूल्याच्या 1% असते, पण कमाल ₹30,000 पर्यंत मर्यादित आहे. म्हणजे ₹30 लाखांवरील मालमत्तेसाठी नोंदणी शुल्क ₹30,000 वरच राहते.",
  },
];

const stampDutyFaqEn: Array<{ q: string; a: string }> = [
  {
    q: "What is stamp duty charged on?",
    a: "Stamp duty is charged on the higher of the agreement (transaction) value and the Ready Reckoner value. The rate depends on the local body in whose limits the property falls — Municipal Corporation, Municipal Council or Gram Panchayat.",
  },
  {
    q: "What is the metro cess?",
    a: "In Mumbai, Pune, Nagpur, Thane, Navi Mumbai and Pimpri-Chinchwad, an additional 1% metro cess (transport surcharge) is levied on top of stamp duty. It does not apply elsewhere.",
  },
  {
    q: "Is there a stamp-duty concession for women?",
    a: "Yes. When residential property is in a woman's name, stamp duty is generally 1% lower (subject to conditions). Toggle 'Female buyer' in the calculator to see it. Confirm final eligibility at the registration office.",
  },
  {
    q: "How much is the registration fee?",
    a: "The registration fee is generally 1% of the property value, capped at ₹30,000. So for property above ₹30 lakh, the registration fee stays at ₹30,000.",
  },
];

function StampDutyCalculator() {
  const { lang } = useLang();
  const mr = lang === "mr";
  const [cfg, setCfg] = useState<StampDutyFile | null>(null);
  const [value, setValue] = useState(5_000_000);
  const [areaKey, setAreaKey] = useState("corporation");
  const [metro, setMetro] = useState(false);
  const [female, setFemale] = useState(false);

  useEffect(() => {
    let alive = true;
    fetch("/data/rates/stamp-duty.json")
      .then((r) => (r.ok ? r.json() : null))
      .then((d: StampDutyFile | null) => {
        if (alive && d) setCfg(d);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  const areaType = cfg?.areaTypes.find((a) => a.key === areaKey) ?? cfg?.areaTypes[0];

  const result = useMemo(() => {
    if (!cfg || !areaType) return null;
    return computeStampDuty({
      value,
      stampPct: areaType.stampPct,
      female,
      femaleRebatePct: cfg.femaleRebatePct,
      applyMetroCess: metro,
      metroCessPct: cfg.metroCessPct,
      registrationPct: cfg.registration.pct,
      registrationCap: cfg.registration.capRupees,
    });
  }, [cfg, areaType, value, female, metro]);

  if (!cfg || !areaType || !result) {
    return <p className="text-sm text-slate-500">{mr ? "लोड होत आहे…" : "Loading…"}</p>;
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-5 sm:grid-cols-2">
        <NumberField
          label={mr ? "मालमत्ता मूल्य (करारनामा / रेडी रेकनरपैकी जास्त)" : "Property value (higher of agreement / ready reckoner)"}
          value={value}
          onChange={setValue}
          min={0}
          step={100000}
          prefix="₹"
        />
        <SelectField
          label={mr ? "स्थानिक स्वराज्य संस्था" : "Local body type"}
          value={areaKey}
          onChange={setAreaKey}
          options={cfg.areaTypes.map((a) => ({
            value: a.key,
            label: `${mr ? a.labelMr : a.labelEn} (${a.stampPct}%)`,
          }))}
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Toggle
          label={mr ? "मेट्रो सेस लागू (+1%)" : "Apply metro cess (+1%)"}
          checked={metro}
          onChange={setMetro}
          hint={(mr ? cfg.metroCitiesMr : cfg.metroCities).join(", ")}
        />
        <Toggle
          label={mr ? `महिला खरेदीदार (−${cfg.femaleRebatePct}%)` : `Female buyer (−${cfg.femaleRebatePct}%)`}
          checked={female}
          onChange={setFemale}
          hint={mr ? "निवासी मालमत्तेसाठी सवलत (अटी लागू)" : "Concession for residential property (conditions apply)"}
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <ResultStat
          label={mr ? `मुद्रांक शुल्क (${result.effectiveStampPct}%)` : `Stamp duty (${result.effectiveStampPct}%)`}
          value={formatINR(result.stampDuty)}
        />
        <ResultStat label={mr ? "मेट्रो सेस" : "Metro cess"} value={formatINR(result.metroCess)} />
        <ResultStat
          label={mr ? "नोंदणी शुल्क" : "Registration"}
          value={formatINR(result.registration)}
        />
        <ResultStat label={mr ? "एकूण" : "Total"} value={formatINR(result.total)} emphasis />
      </div>

      <p className="text-[13px] leading-6 text-slate-600">
        {mr ? "मूल्य माहीत नाही? " : "Don't know the value? "}
        <Link href="/ready-reckoner/" className="font-bold text-blue-700 underline">
          {mr ? "रेडी रेकनर दराने मोजा →" : "Estimate it from Ready Reckoner rates →"}
        </Link>
      </p>
    </div>
  );
}

export function StampDutyContent() {
  return (
    <CalculatorPageShell
      eyebrow={{ mr: "नोंदणी साधन", en: "Registration tool" }}
      title={{
        mr: "मुद्रांक शुल्क कॅल्क्युलेटर — महाराष्ट्र",
        en: "Stamp Duty Calculator — Maharashtra",
      }}
      breadcrumb={{ mr: "मुद्रांक शुल्क", en: "Stamp Duty" }}
      intro={{
        mr: "मालमत्ता मूल्य, स्थानिक स्वराज्य संस्था व पर्याय निवडा — मुद्रांक शुल्क, मेट्रो सेस, नोंदणी शुल्क व एकूण रक्कम लगेच पाहा.",
        en: "Enter property value, local body type and options — see stamp duty, metro cess, registration fee and the total instantly.",
      }}
      updatedAt={{ mr: "जून २०२६", en: "June 2026" }}
      calculator={<StampDutyCalculator />}
      contentMr={<BodyMr />}
      contentEn={<BodyEn />}
    />
  );
}

function BodyMr() {
  return (
    <>
      <ServiceSection heading="मुद्रांक शुल्क कसे ठरते?">
        <p>
          मालमत्ता नोंदणीवेळी भरावे लागणारे <strong>मुद्रांक शुल्क</strong> हे{" "}
          <em>करारनामा मूल्य</em> किंवा <em>रेडी रेकनर मूल्य</em>, यापैकी जे जास्त असेल
          त्यावर आकारले जाते. दर हा मालमत्ता महानगरपालिका, नगरपालिका की ग्रामपंचायत
          हद्दीत आहे यावर अवलंबून असतो. काही शहरांत 1% मेट्रो सेस अधिक लागतो, आणि
          महिलेच्या नावावर निवासी मालमत्तेस 1% सवलत मिळते.
        </p>
      </ServiceSection>
      <ServiceSection heading="हे साधन कसे वापरावे?">
        <ServiceList
          items={[
            "मालमत्ता मूल्य टाका — करारनामा व रेडी रेकनर पैकी जास्त रक्कम.",
            "स्थानिक स्वराज्य संस्था निवडा (महानगरपालिका / नगरपालिका / ग्रामपंचायत).",
            "मालमत्ता मेट्रो शहरात असल्यास 'मेट्रो सेस' निवडा.",
            "खरेदीदार महिला असल्यास 'महिला खरेदीदार' निवडा.",
            "मुद्रांक शुल्क, सेस, नोंदणी व एकूण रक्कम लगेच दिसते.",
          ]}
        />
      </ServiceSection>
      <ServiceSection heading="महत्त्वाच्या सूचना">
        <ServiceList
          items={[
            "दर राज्याच्या अर्थसंकल्पात बदलू शकतात — व्यवहारापूर्वी IGR कार्यालयाकडून पडताळा.",
            "नोंदणी शुल्क 1% पण कमाल ₹30,000 पर्यंत मर्यादित.",
            "गिफ्ट डीड, भाडेकरार, गहाणखत यांचे दर वेगळे असतात — हे साधन विक्री व्यवहारासाठी आहे.",
            "रेडी रेकनर मूल्यासाठी आमचे रेडी रेकनर साधन वापरा.",
          ]}
        />
      </ServiceSection>
      <ServiceSection heading="वारंवार विचारले जाणारे प्रश्न">
        <ServiceFaq pairs={stampDutyFaqMr} />
      </ServiceSection>
    </>
  );
}

function BodyEn() {
  return (
    <>
      <ServiceSection heading="How is stamp duty decided?">
        <p>
          The <strong>stamp duty</strong> payable at registration is charged on the higher
          of the <em>agreement value</em> and the <em>Ready Reckoner value</em>. The rate
          depends on whether the property is within a Municipal Corporation, Municipal
          Council or Gram Panchayat. Some cities add a 1% metro cess, and residential
          property in a woman&apos;s name gets a 1% concession.
        </p>
      </ServiceSection>
      <ServiceSection heading="How to use this tool">
        <ServiceList
          items={[
            "Enter the property value — the higher of agreement and Ready Reckoner.",
            "Select the local body type (Corporation / Council / Gram Panchayat).",
            "Toggle 'metro cess' if the property is in a metro city.",
            "Toggle 'Female buyer' if the buyer is a woman.",
            "Stamp duty, cess, registration and total update instantly.",
          ]}
        />
      </ServiceSection>
      <ServiceSection heading="Important notes">
        <ServiceList
          items={[
            "Rates can change in the state budget — verify at the IGR office before transacting.",
            "Registration fee is 1% but capped at ₹30,000.",
            "Gift deeds, leases and mortgages have different rates — this tool is for sale transactions.",
            "For the Ready Reckoner value, use our Ready Reckoner tool.",
          ]}
        />
      </ServiceSection>
      <ServiceSection heading="Frequently asked questions">
        <ServiceFaq pairs={stampDutyFaqEn} />
      </ServiceSection>
    </>
  );
}
