"use client";

import {
  ServicePageShell,
  ServiceSection,
  ServiceList,
  ServiceFaq,
} from "@/components/service-page-shell";

export const jameenReportFaqMr: Array<{ q: string; a: string }> = [
  {
    q: "जमीन अहवाल म्हणजे काय?",
    a: "जमीन अहवाल (Land Report) हा एका जमिनीसाठी सर्व प्रमुख दस्तऐवजांचे एकत्रित संकलन — 7/12 उतारा, 8A उतारा, फेरफार इतिहास, गाव नकाशा / गट नकाशा, बोजे आणि DP/TP संदर्भ. खरेदी / कर्ज / कोर्ट प्रकरणासाठी एकाच जागी सर्व माहिती मिळते.",
  },
  {
    q: "हा अहवाल कधी लागतो?",
    a: "जमीन खरेदी due diligence, बँक लोन अर्ज, कोर्ट प्रकरण, वारस वाटप, project financing आणि शेतजमीन गुंतवणूक यांसाठी जमीन अहवाल अत्यंत उपयोगी आहे.",
  },
  {
    q: "अहवालासाठी कोणती माहिती लागते?",
    a: "जिल्हा, तालुका, गाव, गट / सर्वे / CTS नंबर आणि मालकाचे नाव. प्रकरणाचा उद्देश (खरेदी / लोन / कोर्ट) सांगितल्यास आम्ही अहवालाची व्याप्ती योग्य ठरवू शकतो.",
  },
  {
    q: "अहवालात काय असते?",
    a: "PDF अहवालात साधारणपणे: 7/12 उतारा, 8A उतारा, फेरफार सारांश, गाव/गट नकाशा, बोजे, ओनरशिप चेन आणि indicative DP/TP/झोन माहिती. आवश्यकता असल्यास टीप-टिप्पणी जोडली जाते.",
  },
  {
    q: "अहवाल किती दिवसांत मिळतो?",
    a: "बहुतेक प्रकरणांत 24–72 तासांत. खूप जुन्या नोंदी, जटिल वारस-चेन किंवा एकाहून अधिक गावांच्या प्रकरणांत 3–5 दिवस लागू शकतात.",
  },
  {
    q: "अहवाल कायदेशीर पुरावा आहे का?",
    a: "अहवालातील नोंदी अधिकृत सार्वजनिक स्रोतांवरून आहेत. कायदेशीर वापरासाठी संबंधित तहसील / City Survey कार्यालयाची stamped प्रत आवश्यक. आम्ही ती प्रक्रिया कशी पूर्ण करायची ते मार्गदर्शन करतो.",
  },
];

const jameenReportFaqEn: Array<{ q: string; a: string }> = [
  {
    q: "What is a land report?",
    a: "A land report is a compiled bundle of the key documents for one parcel — 7/12 extract, 8A extract, mutation history, village / Gut map, encumbrances and DP/TP references. One place for all the information needed for purchase / loan / court matters.",
  },
  {
    q: "When is it needed?",
    a: "Purchase due diligence, bank loans, court cases, inheritance partition, project financing, farmland investments — anywhere a single consolidated dossier helps the decision.",
  },
  {
    q: "What details do you need?",
    a: "District, taluka, village, Gut / Survey / CTS number and owner name. Telling us the purpose (purchase / loan / court) helps us scope the report correctly.",
  },
  {
    q: "What does the report contain?",
    a: "A typical PDF carries 7/12, 8A, a mutation summary, village/Gut map, encumbrances, ownership chain and indicative DP/TP/zone notes. Annotations are added on request.",
  },
  {
    q: "How many days does it take?",
    a: "Usually 24–72 hours. Very old records, complex inheritance chains or multi-village cases can take 3–5 days.",
  },
  {
    q: "Is the report legal evidence?",
    a: "All entries come from publicly available official sources. For legal use, stamped copies from the relevant Tehsil / City Survey office are required. We guide you through the next step when required.",
  },
];

export function JameenReportContent() {
  return (
    <ServicePageShell
      slug="jameen-report-maharashtra"
      eyebrow="Land Due Diligence"
      title="Land Report Maharashtra — Compiled Document Bundle"
      breadcrumb="Land Report"
      intro="7/12, 8A, mutation history, village / Gut map and DP/TP references — bundled into one land report. The full picture for purchase, loan or court matters, delivered on WhatsApp."
      updatedAt="May 2026"
      whatsappMessage={"Hello, I need a complete land report.\nDistrict:\nTaluka:\nVillage:\nGut / Survey / CTS number:\nPurpose (purchase / loan / court):"}
      content={<Body faqPairs={jameenReportFaqEn} />}
    />
  );
}

function Body({ faqPairs }: { faqPairs: Array<{ q: string; a: string }> }) {
  return (
    <>
      <ServiceSection heading="What is this service?">
        <p>
          A <strong>Land Report</strong> is a bundled dossier for a single
          parcel: 7/12, 8A, mutation history, village / Gut map,
          encumbrances, ownership chain and DP / TP zone notes. Useful
          before any significant decision — purchase, loan, court matter or
          family partition.
        </p>
        <p>
          The PrintShubh team gathers data from <strong>Mahabhumi,
          Bhulekh, Bhuvan, sanctioned DP publications</strong> and other{" "}
          <strong>official public sources</strong>, compiles a readable
          PDF, and delivers it on WhatsApp.
        </p>
      </ServiceSection>

      <ServiceSection heading="Who can use this?">
        <ServiceList
          items={[
            "Buyers doing land due diligence — ownership, encumbrance, reservation in one document.",
            "Home loan / agri-loan / LAP applicants.",
            "Anyone gathering evidence for court / arbitration / mediation.",
            "Families working through inheritance or partition.",
            "Developers, builders and investors doing due diligence.",
            "NRIs assembling complete information about their native village land.",
          ]}
        />
      </ServiceSection>

      <ServiceSection heading="What details do you need?">
        <ServiceList
          items={[
            "District, taluka, village.",
            "Gut / Survey number (rural) or CTS number (urban).",
            "Owner name — for verification.",
            "Purpose — purchase / loan / court / inheritance.",
            "(Optional) Known earlier entry, Ferfar number or date range.",
          ]}
        />
      </ServiceSection>

      <ServiceSection heading="How does WhatsApp delivery work?">
        <ServiceList
          items={[
            "Share all details + purpose on WhatsApp.",
            "The PrintShubh team scopes the report and quotes a fee.",
            "Once approved, UPI payment.",
            "PDF report delivered on WhatsApp in 24–72 hours.",
            "Follow-up clarifications are provided on chat.",
          ]}
        />
      </ServiceSection>

      <ServiceSection heading="PDF / document assistance">
        <p>
          A typical report bundles the following sections — adjustable to
          your purpose:
        </p>
        <ServiceList
          items={[
            "Ownership summary.",
            "Current 7/12 extract.",
            "8A extract — account-holder roll-up.",
            "Mutation history — ownership change trail.",
            "Village / Gut map — boundary and neighbours.",
            "Encumbrance / mortgage notes (if any).",
            "(For urban) Property Card and CTS details.",
            "(Optional) DP / TP / zoning indicative notes.",
            "Annotations and recommended next steps.",
          ]}
        />
      </ServiceSection>

      <ServiceSection heading="Important notes">
        <ServiceList
          items={[
            "This is a compiled report — not a title certificate. For legal title opinion, an advocate is required.",
            "Differences arising from very old records or resurvey are clearly noted.",
            "Lands across multiple villages are each handled in separate sections.",
            "Fee depends on case complexity — quote is shared on the first message.",
            "Reports are private and confidential — never shared without permission.",
          ]}
        />
      </ServiceSection>

      <ServiceSection heading="PrintShubh is not a government website">
        <p>
          <strong>
            PrintShubh is not a government website. We provide private
            assistance based on official public sources.
          </strong>{" "}
          This report is not a legal title opinion or a government
          certificate — for court / registration / bank use, official
          stamped copies are required.
        </p>
      </ServiceSection>

      <ServiceSection heading="Frequently asked questions">
        <ServiceFaq pairs={faqPairs} />
      </ServiceSection>
    </>
  );
}
