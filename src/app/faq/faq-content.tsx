"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { LegalPageShell } from "@/components/legal-page-shell";
import { useLang, type Lang } from "@/components/language-context";

interface Qa { q: string; a: string }

const faqs: Record<Lang, Qa[]> = {
  mr: [
    {
      q: "PrintShubh म्हणजे काय? तुम्ही सरकारी आहात का?",
      a: "PrintShubh ही सरकारी संस्था नाही. आम्ही एक खाजगी सहाय्य सेवा आहोत. Mahabhumi, Bhulekh, Bhuvan, TP/DP आणि इतर अधिकृत सार्वजनिक स्रोतांवर उपलब्ध माहितीच्या आधारे आम्ही तुम्हाला उतारा, नकाशा किंवा संदर्भ शोधण्यात मदत करतो.",
    },
    {
      q: "7/12 (सातबारा) उतारा कसा मिळेल?",
      a: "WhatsApp किंवा वेबसाइटवरून जिल्हा, तालुका, गाव आणि गट / सर्वे नंबर शेअर करा. आम्ही उपलब्धता तपासतो, तुमच्या मंजुरीनंतर UPI द्वारे पेमेंट घेतो आणि PDF WhatsApp वर पाठवतो. साधारणतः सेवा त्याच दिवशी पूर्ण होते.",
    },
    {
      q: "8A उतारा 7/12 पेक्षा वेगळा कसा?",
      a: "7/12 ही जमिनीच्या एका विशिष्ट गट / सर्वे नंबरची नोंद आहे — मालक, क्षेत्रफळ, पीक, बोजा वगैरे. 8A ही एका खातेदाराकडे असलेल्या त्या गावातील सर्व जमिनींची एकत्रित नोंद आहे (होल्डिंग). दोन्ही उतारे वेगवेगळ्या कामासाठी लागतात.",
    },
    {
      q: "ई-फेरफार / Mutation म्हणजे काय? आम्ही करून देता का?",
      a: "फेरफार म्हणजे जमिनीच्या मालकीत किंवा हक्कात झालेला बदल नोंदवण्याची प्रक्रिया — खरेदी, वारस, गहाण, इत्यादी. PrintShubh ही नोंद “तयार करत” नाही — ती तलाठी कार्यालयाची प्रक्रिया आहे. आम्ही उपलब्ध फेरफार नोंदी शोधून आणि त्यांचा अर्थ सोप्या भाषेत समजावून देण्यास मदत करतो.",
    },
    {
      q: "गाव नकाशा / गट नकाशा कसा मिळेल?",
      a: "वेबसाइटवर जिल्हा → तालुका → गाव निवडा. गावाची सीमा नकाशावर हायलाइट होते आणि तुम्ही तुमच्या प्लॉटची अंदाजे सीमा मार्क करू शकता. WhatsApp वर पाठवल्यास आम्ही संबंधित गाव नकाशा, गट नकाशा किंवा survey-level reference देऊ.",
    },
    {
      q: "DP / TP नकाशा म्हणजे काय?",
      a: "DP (Development Plan) आणि TP (Town Planning) नकाशे महानगरपालिका / नगरपरिषद / TP authority यांच्याकडून प्रसिद्ध होतात — झोन, आरक्षण, रस्ता रुंदी, FSI इत्यादी दाखवतात. PrintShubh अधिकृत स्रोतांवरून तुमच्या प्लॉटसंदर्भात zoning summary आणि नकाशा संदर्भ शोधून देतो.",
    },
    {
      q: "अहवाल / PDF कसे पाठवले जाते?",
      a: "सर्व अहवाल आणि PDF कागदपत्रे WhatsApp वर पाठवली जातात. ईमेल हवा असल्यास सांगा — आम्ही दोन्ही पाठवू.",
    },
    {
      q: "पेमेंट कसे करावे? किती शुल्क आहे?",
      a: "पेमेंट UPI / QR / GPay / PhonePe / Paytm द्वारे केले जाते. शुल्क प्रत्येक सेवेनुसार वेगळे आहे आणि माहिती तपासल्यानंतरच आम्ही तुम्हाला आकडा कळवतो — सेवा घेण्याआधी रक्कम पूर्णपणे कळेल.",
    },
    {
      q: "पेमेंट केल्यानंतर अहवाल नाही मिळाला तर परतावा मिळेल का?",
      a: "होय. जर पेमेंट झाल्यानंतर अहवाल / दस्तऐवज उपलब्ध झाला नाही किंवा आमच्याकडून सेवा पूर्ण होऊ शकली नाही, तर ग्राहकास परतावा दिला जाऊ शकतो. चुकीची माहिती ग्राहकाने दिल्यास किंवा अधिकृत पोर्टलवर माहिती उपलब्ध नसल्यास परताव्याचा निर्णय केस-बाय-केस घेतला जाईल. अधिक तपशीलासाठी /refund पहा.",
    },
    {
      q: "अंतिम मालकी किंवा कायदेशीर वापरासाठी हाच अहवाल पुरेसा आहे का?",
      a: "नाही. PrintShubh ने पुरवलेल्या अहवालांचा वापर प्राथमिक संदर्भासाठी आहे. अंतिम मालकी, क्षेत्रफळ, सीमा, खरेदी-विक्री किंवा कोर्ट कामासाठी संबंधित तहसील कार्यालय / अधिकृत पोर्टलवर पडताळणी करणे आवश्यक आहे.",
    },
    {
      q: "माझी वैयक्तिक माहिती सुरक्षित आहे का?",
      a: "होय. तुम्ही दिलेले फोन नंबर, गाव, सर्वे नंबर आणि इतर तपशील फक्त तुमच्या सेवेसाठीच वापरले जातात — विकले जात नाहीत, जाहिरातीसाठी वापरले जात नाहीत. अधिक तपशीलासाठी /privacy पहा.",
    },
  ],
  en: [
    {
      q: "What is PrintShubh? Are you a government body?",
      a: "PrintShubh is not a government body. We are a private assistance service. We help you locate extracts, maps and references using publicly available information from Mahabhumi, Bhulekh, Bhuvan, TP/DP and other official portals.",
    },
    {
      q: "How do I get a 7/12 (Satbara) extract?",
      a: "Share district, taluka, village and Gut / Survey number on WhatsApp or via the website. We check availability, confirm the fee, accept UPI payment after your approval, and deliver the PDF on WhatsApp — usually same day.",
    },
    {
      q: "How is the 8A extract different from 7/12?",
      a: "7/12 is the record for a specific Gut / Survey number — owner, area, crop, encumbrance. 8A is the consolidated holding of a single khatedar across all their land in that village. Both are needed for different purposes.",
    },
    {
      q: "What is eFerfar / Mutation? Do you create it?",
      a: "Ferfar / Mutation is the entry that records a change in ownership or rights — sale, inheritance, mortgage, etc. PrintShubh does NOT create these entries — that is a Talathi office process. We help locate existing mutation entries and explain them in plain language.",
    },
    {
      q: "How do I get a Village Map / Gut Map?",
      a: "On the website, pick District → Taluka → Village. The village boundary highlights and you can sketch your plot. Send the WhatsApp message and we will share the village map, gut map or survey-level reference.",
    },
    {
      q: "What are DP / TP maps?",
      a: "DP (Development Plan) and TP (Town Planning) maps are published by Municipal Corporations / Councils / TP authorities — they show zoning, reservations, road widths, FSI, etc. We reference the relevant zoning summary and map for your plot from official sources.",
    },
    {
      q: "How are reports / PDFs delivered?",
      a: "All reports and PDFs are delivered on WhatsApp. If you need them by email too, just tell us — we will send both.",
    },
    {
      q: "How do I pay? What are your fees?",
      a: "Payment is via UPI / QR / GPay / PhonePe / Paytm. Fees vary by service and are confirmed only after we verify the request — you will know the full amount before paying.",
    },
    {
      q: "If I pay but the report cannot be generated, will I get a refund?",
      a: "Yes. If after payment the report / document cannot be retrieved or the service cannot be completed, a refund may be issued. If the customer provided incorrect information, or if the data is not available on official portals, the refund is decided case-by-case. See /refund for full policy.",
    },
    {
      q: "Is this report enough for final ownership or legal use?",
      a: "No. Reports from PrintShubh are for preliminary reference only. For final ownership, area, boundary, sale, purchase or court matters, verification at the relevant Tehsil office or official portal is mandatory.",
    },
    {
      q: "Is my personal information safe?",
      a: "Yes. The phone, village, survey number and other details you share are used only for the requested service — never sold, never used for advertising. See /privacy for full policy.",
    },
  ],
};

export function FaqContent() {
  const { lang } = useLang();
  const items = faqs[lang];
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <LegalPageShell
      title={{ mr: "वारंवार विचारले जाणारे प्रश्न", en: "Frequently Asked Questions" }}
      breadcrumb={{ mr: "FAQ", en: "FAQ" }}
      intro={{
        mr: "7/12, 8A, फेरफार, गाव नकाशा, DP/TP, पेमेंट आणि परताव्यासंदर्भात सर्व सामान्य प्रश्नांची उत्तरे एका ठिकाणी.",
        en: "Common questions about 7/12, 8A, mutation, village maps, DP/TP, payment and refund — all in one place.",
      }}
      updatedAt="May 2026"
      contentMr={<FaqList items={items} openIdx={openIdx} setOpenIdx={setOpenIdx} />}
      contentEn={<FaqList items={items} openIdx={openIdx} setOpenIdx={setOpenIdx} />}
    />
  );
}

function FaqList({
  items,
  openIdx,
  setOpenIdx,
}: {
  items: Qa[];
  openIdx: number | null;
  setOpenIdx: (n: number | null) => void;
}) {
  return (
    <div className="divide-y divide-slate-200">
      {items.map((it, i) => {
        const open = openIdx === i;
        return (
          <div key={i} className="py-3">
            <button
              type="button"
              onClick={() => setOpenIdx(open ? null : i)}
              aria-expanded={open}
              className="flex w-full items-start justify-between gap-3 text-left"
            >
              <span className="text-[15px] font-black leading-7 text-slate-950">
                {it.q}
              </span>
              <ChevronDown
                className={`mt-1 size-4 shrink-0 text-slate-500 transition-transform ${
                  open ? "rotate-180" : ""
                }`}
              />
            </button>
            {open && (
              <p className="mt-2 pr-7 text-[15px] leading-7 text-slate-700">{it.a}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
