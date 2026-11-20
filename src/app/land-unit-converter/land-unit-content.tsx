"use client";

import { useMemo, useState } from "react";
import { CalculatorPageShell } from "@/components/calculators/calculator-page-shell";
import { NumberField, SelectField, ResultStat } from "@/components/calculators/calculator-fields";
import { ServiceSection, ServiceList, ServiceFaq } from "@/components/service-page-shell";
import {
  allUnitsFor,
  LAND_AREA_UNITS,
  UNIT_LABEL,
  type LandAreaUnit,
} from "@/lib/calculators/land-unit";

/* FAQ — Marathi pairs are exported for the page.tsx FAQPage JSON-LD. */
export const landUnitFaqMr: Array<{ q: string; a: string }> = [
  {
    q: "1 एकर किती गुंठे?",
    a: "1 एकर = 40 गुंठे (अंदाजे). हे कॅल्क्युलेटर 1 एकर = 4046.8564224 चौ. मीटर आणि 1 गुंठा = 101.171 चौ. मीटर या प्रमाण मूल्यांवरून अचूक आकडा दाखवते.",
  },
  {
    q: "1 हेक्टर किती एकर?",
    a: "1 हेक्टर = 10,000 चौ. मीटर = अंदाजे 2.471 एकर = अंदाजे 98.84 गुंठे.",
  },
  {
    q: "गुंठा हे एकक फक्त महाराष्ट्रातच वापरतात का?",
    a: "गुंठा हे एकक महाराष्ट्र व कर्नाटकसह काही भारतीय राज्यांच्या महसूल नोंदींमध्ये (7/12 उतारा) सामान्यपणे वापरले जाते. सातबारा उताऱ्यावरील क्षेत्र गुंठ्यांत किंवा हेक्टर-आर मध्ये दिलेले असते.",
  },
  {
    q: "हे आकडे सातबारा उताऱ्यावरील नोंदीसाठी अधिकृत आहेत का?",
    a: "नाही. हे केवळ एकक-रूपांतरणासाठी मोफत साधन आहे. तुमच्या जमिनीचे नेमके क्षेत्र नेहमी अधिकृत 7/12 उतारा किंवा मोजणी नकाशावरून तपासा.",
  },
];

const landUnitFaqEn: Array<{ q: string; a: string }> = [
  {
    q: "How many guntha in 1 acre?",
    a: "1 acre = 40 guntha (approximately). This calculator computes the exact figure from the standard values 1 acre = 4046.8564224 sq.m and 1 guntha = 101.171 sq.m.",
  },
  {
    q: "How many acres in 1 hectare?",
    a: "1 hectare = 10,000 sq.m = approximately 2.471 acres = approximately 98.84 guntha.",
  },
  {
    q: "Is guntha used only in Maharashtra?",
    a: "Guntha is a common unit in revenue records (7/12 extract) across Maharashtra, Karnataka and a few other Indian states. Area on a satbara extract is usually recorded in guntha or hectare-are.",
  },
  {
    q: "Are these figures official for 7/12 records?",
    a: "No. This is a free unit-conversion tool only. Always confirm your land's exact area from the official 7/12 extract or a survey map.",
  },
];

function LandUnitCalculator() {
  const [value, setValue] = useState(1);
  const [unit, setUnit] = useState<LandAreaUnit>("guntha");

  const results = useMemo(() => allUnitsFor(value, unit), [value, unit]);

  const label = (u: LandAreaUnit) => UNIT_LABEL[u].en;

  const formatValue = (n: number): string => {
    if (!Number.isFinite(n)) return "—";
    // Small units (sq.m/sq.ft) read better with fewer decimals than
    // guntha/acre/hectare, which are usually small fractional numbers.
    const decimals = n >= 100 ? 0 : n >= 1 ? 2 : 4;
    return n.toLocaleString("en-IN", {
      maximumFractionDigits: decimals,
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-5 sm:grid-cols-2">
        <NumberField
          label="Area"
          value={value}
          onChange={setValue}
          min={0}
          step={0.01}
        />
        <SelectField
          label="Unit"
          value={unit}
          onChange={(v) => setUnit(v as LandAreaUnit)}
          options={LAND_AREA_UNITS.map((u) => ({ value: u, label: label(u) }))}
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {LAND_AREA_UNITS.map((u) => (
          <ResultStat
            key={u}
            label={label(u)}
            value={formatValue(results[u])}
            emphasis={u === unit}
          />
        ))}
      </div>
    </div>
  );
}

export function LandUnitContent() {
  return (
    <CalculatorPageShell
      eyebrow="Land-area tool"
      title="Land Unit Converter — Guntha, Acre, Hectare, Sq.ft"
      breadcrumb="Land Unit Converter"
      intro="Enter any unit — guntha, acre, hectare, sq.m or sq.ft — and instantly see the equivalent area in every other unit."
      updatedAt="September 2026"
      calculator={<LandUnitCalculator />}
      content={<Body />}
    />
  );
}

function Body() {
  return (
    <>
      <ServiceSection heading="What are guntha, acre and hectare?">
        <p>
          On a Maharashtra 7/12 extract or property card, land area is usually
          recorded in <strong>guntha</strong>, <strong>hectare-are</strong> or{" "}
          <strong>acre</strong>, while plot/construction area is usually given
          in <strong>square feet</strong>. This tool converts instantly
          between all of them.
        </p>
      </ServiceSection>
      <ServiceSection heading="How to use this tool">
        <ServiceList
          items={[
            "Enter the area figure (e.g. 2.5).",
            "Pick which unit that figure is in (e.g. guntha).",
            "The equivalent area in every other unit appears instantly below.",
          ]}
        />
      </ServiceSection>
      <ServiceSection heading="Important note">
        <ServiceList
          items={[
            "This is a mathematical conversion — always confirm your land's exact area from the official 7/12 extract or a survey map.",
            "For a 7/12 extract or village map, PrintShubh offers WhatsApp assistance.",
          ]}
        />
      </ServiceSection>
      <ServiceSection heading="Frequently asked questions">
        <ServiceFaq pairs={landUnitFaqEn} />
      </ServiceSection>
    </>
  );
}
