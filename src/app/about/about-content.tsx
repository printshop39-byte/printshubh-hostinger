"use client";

import { ShieldCheck } from "lucide-react";
import {
  LegalList,
  LegalPageShell,
  LegalSection,
} from "@/components/legal-page-shell";
import { useLang, type Lang } from "@/components/language-context";

const trustLine: Record<Lang, string> = {
  mr: "मागील ३० वर्षांपासून नकाशे, जमीन अभिलेख आणि सरकारी कागदपत्र प्रक्रियेचा अनुभव असलेल्या टीमकडून महाराष्ट्रासाठी विश्वासार्ह सहाय्य.",
  en: "Trusted assistance for Maharashtra, backed by 30 years of experience in maps, land records, and government document workflows.",
};

export function AboutContent() {
  const { lang } = useLang();

  return (
    <LegalPageShell
      title={{ mr: "आमच्याबद्दल", en: "About PrintShubh" }}
      breadcrumb={{ mr: "आमच्याबद्दल", en: "About Us" }}
      intro={{
        mr: "PrintShubh ही महाराष्ट्रासाठी मराठी-प्रथम खाजगी सहाय्य सेवा आहे — जमीन कागदपत्र, नकाशे आणि महसूल नोंदी सोप्या भाषेत मिळवून देणारी टीम.",
        en: "PrintShubh is a Marathi-first private assistance service for Maharashtra — a team that helps users navigate land records, maps and revenue documents in plain language.",
      }}
      updatedAt="May 2026"
      contentMr={<AboutBody lang="mr" />}
      contentEn={<AboutBody lang="en" />}
    />
  );
}

function AboutBody({ lang }: { lang: Lang }) {
  /* Top trust banner — same blue style used on Home + Contact for consistency. */
  const TrustBanner = (
    <div className="mb-6 flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4 text-[14px] font-semibold leading-7 text-blue-900">
      <ShieldCheck className="mt-0.5 size-5 shrink-0 text-blue-700" />
      <p>{trustLine[lang]}</p>
    </div>
  );

  if (lang === "mr") {
    return (
      <>
        {TrustBanner}

        <LegalSection heading="आम्ही कोण आहोत">
          <p>
            PrintShubh ही एक खाजगी सहाय्य सेवा आहे — सरकारी संस्था नाही, सरकारी
            संकेतस्थळ नाही. आम्ही जमीन कागदपत्र, नकाशे, मालकी नोंद आणि शहर
            सर्वेक्षण माहितीबाबत मराठीतून मदत पुरवतो. आमचा उद्देश सोपा आहे —
            अधिकृत सार्वजनिक स्रोतांवर असलेली माहिती सामान्य नागरिकाला सहज आणि
            समजेल अशा स्वरूपात उपलब्ध करून देणे.
          </p>
        </LegalSection>

        <LegalSection heading="आम्ही काय करतो">
          <LegalList
            items={[
              "7/12 (सातबारा) उतारा शोधणे आणि व्यवस्थित स्वरूपात PDF देणे.",
              "8A उतारा आणि होल्डिंग माहिती तपासणी.",
              "ई-फेरफार / Mutation नोंदी आणि त्यांचा अर्थ सोप्या भाषेत समजावून देणे.",
              "गाव नकाशा, गट नकाशा आणि सर्वे नंबर संदर्भ.",
              "DP / TP नकाशा संदर्भ — झोन, आरक्षण, रस्ता रुंदी इत्यादी समजावून देणे.",
              "मिळकत पत्रिका (Property Card) आणि CTS नंबर संदर्भ.",
              "जमीन अहवाल आणि कागदपत्र संदर्भासाठी मार्गदर्शन.",
            ]}
          />
        </LegalSection>

        <LegalSection heading="आमचे काम कसे चालते">
          <LegalList
            items={[
              "तुम्ही WhatsApp किंवा वेबसाइटवरून जिल्हा, तालुका, गाव आणि गट / सर्वे / CTS नंबर शेअर करता.",
              "आम्ही अधिकृत सार्वजनिक स्रोतांवर माहिती तपासतो आणि उपलब्धता तुम्हाला कळवतो.",
              "तुमच्या मंजुरीनंतर UPI द्वारे पेमेंट घेतले जाते.",
              "अहवाल / PDF शक्य तेथे WhatsApp वर पाठवला जातो.",
              "जर माहिती मिळू शकत नसेल, तर परतावा धोरणानुसार रक्कम परत केली जाते.",
            ]}
          />
        </LegalSection>

        <LegalSection heading="आमच्या टीमचा अनुभव">
          <p>
            PrintShubh टीमकडे नकाशे, जमीन अभिलेख आणि सरकारी कागदपत्र प्रक्रियेचा
            <strong> मागील ३० वर्षांचा अनुभव </strong>आहे. महसूल नोंदी, सर्वे
            नंबर, DP / TP योजना, मिळकत पत्रिका आणि फेरफार प्रक्रिया यांचे
            व्यवहारिक ज्ञान आमच्या प्रत्येक सेवेच्या मागे आहे — त्यामुळेच आमचे
            उत्तर केवळ कागदी नसून प्रत्यक्ष कामासाठी उपयुक्त असते.
          </p>
        </LegalSection>

        <LegalSection heading="आम्ही कोणत्या स्रोतांवर अवलंबून आहोत">
          <p>
            आमच्या सहाय्याचा आधार म्हणजे Mahabhumi, Bhulekh, Bhuvan, अधिकृत TP /
            DP प्रकाशने आणि इतर सार्वजनिक सरकारी स्रोत. आम्ही नोंदी “तयार” करत
            नाही — आम्ही अधिकृत स्रोतांवर असलेली माहिती शोधून, व्यवस्थित स्वरूपात
            सादर करून, तुमच्यापर्यंत पोहोचवतो.
          </p>
        </LegalSection>

        <LegalSection heading="आमचे मूल्य">
          <LegalList
            items={[
              "पारदर्शकता — सेवा घेण्याआधी सर्व माहिती तपासली जाते, शुल्क आधी सांगितले जाते.",
              "स्थानिक भाषा — मराठी प्रथम, इंग्रजी पर्याय उपलब्ध.",
              "खाजगीपणा — तुमची माहिती फक्त सेवेपुरतीच वापरली जाते.",
              "जबाबदारी — चुकीसाठी प्रामाणिक परतावा / दुरुस्ती धोरण.",
            ]}
          />
        </LegalSection>

        <LegalSection heading="आमची मर्यादा — कृपया लक्षात ठेवा">
          <p>
            PrintShubh ही सरकारी संस्था नाही आणि आम्ही कोणतीही सरकारी नोंद
            “मंजूर” किंवा “तयार” करत नाही. आम्ही फक्त अधिकृत सार्वजनिक स्रोतांवर
            उपलब्ध माहितीचा संदर्भ देतो. अंतिम मालकी, क्षेत्रफळ, सीमा किंवा
            कायदेशीर वापरासाठी संबंधित तहसील कार्यालय / अधिकृत सरकारी पोर्टलवर
            पडताळणी करणे आवश्यक आहे.
          </p>
        </LegalSection>
      </>
    );
  }

  /* English */
  return (
    <>
      {TrustBanner}

      <LegalSection heading="Who we are">
        <p>
          PrintShubh is a private assistance service — not a government body
          and not a government website. We help users with land records, maps,
          ownership entries and city-survey information in plain Marathi (and
          English). Our purpose is simple: take publicly available information
          from official sources and present it in a clear, usable form for
          ordinary citizens.
        </p>
      </LegalSection>

      <LegalSection heading="What we do">
        <LegalList
          items={[
            "Look up 7/12 (Satbara) extracts and deliver clean PDFs.",
            "Verify 8A extracts and holding details.",
            "Explain eFerfar / Mutation entries in plain language.",
            "Provide Village Map, Gut Map and Survey-number references.",
            "Reference DP / TP zoning, reservations and road widths.",
            "Help with Property Card and CTS number lookups.",
            "Guide you through land report and document workflows.",
          ]}
        />
      </LegalSection>

      <LegalSection heading="How we work">
        <LegalList
          items={[
            "Share district, taluka, village and Gut / Survey / CTS number via WhatsApp or our website.",
            "We check availability on official public sources and confirm with you.",
            "Once you approve, payment is accepted via UPI.",
            "Reports / PDFs are delivered on WhatsApp wherever possible.",
            "If a record cannot be retrieved, a refund is issued per our refund policy.",
          ]}
        />
      </LegalSection>

      <LegalSection heading="Our team's experience">
        <p>
          The PrintShubh team brings
          <strong> 30 years of experience </strong>working with maps, land
          records and government document workflows — revenue entries, survey
          numbers, DP / TP plans, property cards, and mutation procedures. That
          practical familiarity is behind every service we offer, which is why
          our answers tend to be useful in real-world office and field
          situations, not just on paper.
        </p>
      </LegalSection>

      <LegalSection heading="Sources we rely on">
        <p>
          Our assistance is grounded in Mahabhumi, Bhulekh, Bhuvan, official
          TP / DP publications and other public government sources. We do not
          create records — we locate publicly available information on official
          portals, organise it clearly, and deliver it to you.
        </p>
      </LegalSection>

      <LegalSection heading="Our values">
        <LegalList
          items={[
            "Transparency — every request is verified before payment; fees are confirmed up-front.",
            "Local language — Marathi-first, English available.",
            "Privacy — your information is used only for the service requested.",
            "Accountability — honest refund and correction policy.",
          ]}
        />
      </LegalSection>

      <LegalSection heading="What we are not — please remember">
        <p>
          PrintShubh is not a government body and we do not issue or approve
          any government record. We only reference data already published on
          official portals. For final ownership, area, boundary or any legal
          use, verification at the relevant Tehsil office or official
          government portal is mandatory.
        </p>
      </LegalSection>
    </>
  );
}
