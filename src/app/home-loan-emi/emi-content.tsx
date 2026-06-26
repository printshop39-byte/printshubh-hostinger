"use client";

import { useEffect, useMemo, useState } from "react";
import { CalculatorPageShell } from "@/components/calculators/calculator-page-shell";
import { NumberField, SliderField, ResultStat } from "@/components/calculators/calculator-fields";
import { ServiceSection, ServiceList, ServiceFaq } from "@/components/service-page-shell";
import { useLang } from "@/components/language-context";
import { computeEmi, formatINR } from "@/lib/calculators/emi";

interface BankRate {
  name: string;
  nameMr: string;
  roiFrom: number;
  maxTenureYears: number;
}
interface BankRatesFile {
  effectiveFrom: string;
  note: string;
  noteMr: string;
  banks: BankRate[];
}

/* FAQ — Marathi pairs are exported for the page.tsx FAQPage JSON-LD. */
export const emiFaqMr: Array<{ q: string; a: string }> = [
  {
    q: "EMI कशी मोजली जाते?",
    a: "EMI = P × r × (1+r)^n ÷ ((1+r)^n − 1) या सूत्राने मोजली जाते. यात P म्हणजे कर्जरक्कम, r म्हणजे मासिक व्याजदर (वार्षिक दर ÷ 12 ÷ 100) आणि n म्हणजे एकूण हप्त्यांची संख्या (वर्षे × 12). हे रिड्युसिंग-बॅलन्स पद्धतीवर आधारित आहे.",
  },
  {
    q: "हे व्याजदर अधिकृत आहेत का?",
    a: "नाही. दाखवलेले दर तुलनेसाठी अंदाजे सुरुवातीचे दर आहेत. प्रत्यक्ष दर तुमचा CIBIL स्कोअर, उत्पन्न, कर्जरक्कम आणि बँकेच्या धोरणावर अवलंबून असतो. अर्ज करण्यापूर्वी संबंधित बँकेकडून चालू दर पडताळा.",
  },
  {
    q: "कर्जाची मुदत वाढवली तर काय होते?",
    a: "मुदत वाढवल्यास मासिक EMI कमी होते, पण एकूण व्याज जास्त भरावे लागते. मुदत कमी ठेवल्यास EMI जास्त पण एकूण व्याज कमी. कॅल्क्युलेटरमध्ये मुदत बदलून दोन्ही परिणाम लगेच पाहता येतात.",
  },
  {
    q: "PrintShubh कर्ज देते का?",
    a: "नाही. PrintShubh कर्ज देत नाही किंवा कोणत्याही बँकेचे प्रतिनिधित्व करत नाही. हे फक्त एक मोफत माहिती-साधन आहे ज्याने तुम्ही EMI चा अंदाज घेऊ शकता. कर्जासाठी थेट बँकेशी संपर्क साधावा.",
  },
];

const emiFaqEn: Array<{ q: string; a: string }> = [
  {
    q: "How is EMI calculated?",
    a: "EMI = P × r × (1+r)^n ÷ ((1+r)^n − 1), where P is the loan amount, r is the monthly interest rate (annual rate ÷ 12 ÷ 100) and n is the total number of instalments (years × 12). It follows the reducing-balance method.",
  },
  {
    q: "Are these interest rates official?",
    a: "No. The rates shown are indicative starting rates for comparison. Your actual rate depends on your CIBIL score, income, loan amount and the bank's policy. Confirm the current rate with the bank before applying.",
  },
  {
    q: "What happens if I extend the tenure?",
    a: "A longer tenure lowers the monthly EMI but increases the total interest you pay. A shorter tenure means a higher EMI but less total interest. Change the tenure in the calculator to see both effects instantly.",
  },
  {
    q: "Does PrintShubh provide loans?",
    a: "No. PrintShubh does not lend money or represent any bank. This is a free informational tool to estimate your EMI. For a loan, contact a bank directly.",
  },
];

function EmiCalculator() {
  const { lang } = useLang();
  const mr = lang === "mr";

  const [amount, setAmount] = useState(2_500_000);
  const [rate, setRate] = useState(8.5);
  const [years, setYears] = useState(20);
  const [banks, setBanks] = useState<BankRatesFile | null>(null);

  useEffect(() => {
    let alive = true;
    fetch("/data/rates/bank-rates.json")
      .then((r) => (r.ok ? r.json() : null))
      .then((d: BankRatesFile | null) => alive && setBanks(d))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  const result = useMemo(
    () => computeEmi({ principal: amount, annualRatePct: rate, tenureMonths: years * 12 }),
    [amount, rate, years],
  );

  const bankRows = useMemo(() => {
    if (!banks) return [];
    return [...banks.banks]
      .sort((a, b) => a.roiFrom - b.roiFrom)
      .map((b) => ({
        ...b,
        emi: computeEmi({ principal: amount, annualRatePct: b.roiFrom, tenureMonths: years * 12 }).emi,
      }));
  }, [banks, amount, years]);

  return (
    <div className="space-y-6">
      <div className="grid gap-5 sm:grid-cols-3">
        <NumberField
          label={mr ? "कर्जरक्कम" : "Loan amount"}
          value={amount}
          onChange={setAmount}
          min={0}
          step={50000}
          prefix="₹"
        />
        <NumberField
          label={mr ? "व्याजदर (वार्षिक)" : "Interest rate (p.a.)"}
          value={rate}
          onChange={setRate}
          min={0}
          max={20}
          step={0.05}
          suffix="%"
        />
        <SliderField
          label={mr ? "मुदत" : "Tenure"}
          value={years}
          onChange={setYears}
          min={1}
          max={30}
          step={1}
          display={mr ? `${years} वर्षे` : `${years} yr`}
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <ResultStat label={mr ? "मासिक EMI" : "Monthly EMI"} value={formatINR(result.emi)} emphasis />
        <ResultStat label={mr ? "एकूण व्याज" : "Total interest"} value={formatINR(result.totalInterest)} />
        <ResultStat label={mr ? "एकूण परतफेड" : "Total payment"} value={formatINR(result.totalPayment)} />
      </div>

      {bankRows.length > 0 && (
        <div>
          <h3 className="mb-2 text-[15px] font-black text-slate-900">
            {mr ? "बँकनिहाय EMI तुलना" : "Bank-wise EMI comparison"}
          </h3>
          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full text-left text-[14px]">
              <thead className="bg-slate-50 text-[12px] font-bold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-3 py-2.5">{mr ? "बँक" : "Bank"}</th>
                  <th className="px-3 py-2.5 text-right">{mr ? "दर पासून" : "Rate from"}</th>
                  <th className="px-3 py-2.5 text-right">{mr ? "मासिक EMI" : "Monthly EMI"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bankRows.map((b) => (
                  <tr key={b.name} className="hover:bg-blue-50/40">
                    <td className="px-3 py-2.5 font-semibold text-slate-800">{mr ? b.nameMr : b.name}</td>
                    <td className="px-3 py-2.5 text-right font-semibold text-slate-600">{b.roiFrom}%</td>
                    <td className="px-3 py-2.5 text-right font-black text-blue-800">{formatINR(b.emi)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {banks && (
            <p className="mt-2 text-[12px] leading-5 text-slate-500">
              {mr ? banks.noteMr : banks.note}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export function EmiContent() {
  return (
    <CalculatorPageShell
      eyebrow={{ mr: "गृहकर्ज साधन", en: "Home-loan tool" }}
      title={{
        mr: "गृहकर्ज EMI कॅल्क्युलेटर — बँक तुलना",
        en: "Home-loan EMI Calculator — Bank Comparison",
      }}
      breadcrumb={{ mr: "गृहकर्ज EMI", en: "Home-loan EMI" }}
      intro={{
        mr: "कर्जरक्कम, व्याजदर आणि मुदत टाका — मासिक EMI, एकूण व्याज आणि बँकनिहाय तुलना लगेच पाहा.",
        en: "Enter loan amount, interest rate and tenure — see your monthly EMI, total interest and a bank-wise comparison instantly.",
      }}
      updatedAt={{ mr: "जून २०२६", en: "June 2026" }}
      calculator={<EmiCalculator />}
      contentMr={<BodyMr />}
      contentEn={<BodyEn />}
    />
  );
}

function BodyMr() {
  return (
    <>
      <ServiceSection heading="EMI म्हणजे काय?">
        <p>
          <strong>EMI (Equated Monthly Instalment)</strong> म्हणजे कर्ज फेडण्यासाठी
          दर महिन्याला भरावी लागणारी ठरलेली रक्कम. यात मुद्दल आणि व्याज दोन्ही समाविष्ट
          असतात. सुरुवातीला व्याजाचा भाग जास्त असतो आणि मुदतीच्या शेवटी मुद्दलाचा भाग
          वाढत जातो — याला <em>रिड्युसिंग बॅलन्स</em> पद्धत म्हणतात.
        </p>
      </ServiceSection>
      <ServiceSection heading="हे साधन कसे वापरावे?">
        <ServiceList
          items={[
            "कर्जरक्कम टाका (उदा. ₹25,00,000).",
            "बँकेचा वार्षिक व्याजदर टाका (उदा. 8.5%).",
            "मुदत स्लायडरने निवडा (1 ते 30 वर्षे).",
            "मासिक EMI, एकूण व्याज आणि एकूण परतफेड लगेच दिसते.",
            "खालील तक्त्यात प्रत्येक बँकेच्या सुरुवातीच्या दरावर EMI ची तुलना करा.",
          ]}
        />
      </ServiceSection>
      <ServiceSection heading="महत्त्वाच्या सूचना">
        <ServiceList
          items={[
            "दाखवलेले बँक दर अंदाजे आहेत — प्रत्यक्ष दर CIBIL स्कोअर व उत्पन्नावर अवलंबून.",
            "प्रोसेसिंग फी, विमा आणि इतर शुल्क EMI मध्ये धरलेले नाहीत.",
            "फ्लोटिंग दरात रेपो दर बदलल्यास EMI किंवा मुदत बदलू शकते.",
            "स्टॅम्प ड्युटी व नोंदणी शुल्कासाठी आमचे स्टॅम्प ड्युटी कॅल्क्युलेटर वापरा.",
          ]}
        />
      </ServiceSection>
      <ServiceSection heading="वारंवार विचारले जाणारे प्रश्न">
        <ServiceFaq pairs={emiFaqMr} />
      </ServiceSection>
    </>
  );
}

function BodyEn() {
  return (
    <>
      <ServiceSection heading="What is an EMI?">
        <p>
          An <strong>EMI (Equated Monthly Instalment)</strong> is the fixed amount you
          pay every month to repay a loan. It includes both principal and interest. Early
          on, the interest portion is larger; towards the end the principal portion grows —
          this is the <em>reducing-balance</em> method.
        </p>
      </ServiceSection>
      <ServiceSection heading="How to use this tool">
        <ServiceList
          items={[
            "Enter the loan amount (e.g. ₹25,00,000).",
            "Enter the bank's annual interest rate (e.g. 8.5%).",
            "Pick the tenure with the slider (1 to 30 years).",
            "Monthly EMI, total interest and total payment update instantly.",
            "Compare the EMI at each bank's starting rate in the table below.",
          ]}
        />
      </ServiceSection>
      <ServiceSection heading="Important notes">
        <ServiceList
          items={[
            "Bank rates shown are indicative — your actual rate depends on CIBIL score and income.",
            "Processing fees, insurance and other charges are not included in the EMI.",
            "On a floating rate, a change in the repo rate can change your EMI or tenure.",
            "For stamp duty and registration charges, use our Stamp Duty calculator.",
          ]}
        />
      </ServiceSection>
      <ServiceSection heading="Frequently asked questions">
        <ServiceFaq pairs={emiFaqEn} />
      </ServiceSection>
    </>
  );
}
