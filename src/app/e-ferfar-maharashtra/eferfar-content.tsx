"use client";

import {
  ServicePageShell,
  ServiceSection,
  ServiceList,
  ServiceFaq,
} from "@/components/service-page-shell";

export const eFerfarFaqMr: Array<{ q: string; a: string }> = [
  {
    q: "ई-फेरफार म्हणजे काय?",
    a: "ई-फेरफार (Mutation) ही जमिनीच्या मालकी / हक्कांत झालेल्या बदलाची शासकीय नोंद आहे — खरेदी, वारस हक्क, गहाण, हस्तांतरण किंवा कोणताही अन्य बदल झाल्यावर तलाठी कार्यालयाकडून फेरफार नोंद घेतली जाते, आणि ती मंजुरीनंतर 7/12 वर प्रतिबिंबित होते.",
  },
  {
    q: "फेरफार नोंद का तपासावी?",
    a: "जमीन खरेदीपूर्वी / कर्ज मंजुरीपूर्वी / वारसा प्रकरणात फेरफार इतिहास तपासणे आवश्यक. फेरफार नोंद अपूर्ण असल्यास 7/12 वर जुने नाव दिसू शकते आणि नवीन मालकाचे नाव अद्ययावत झालेले नसते.",
  },
  {
    q: "फेरफार साठी कोणती माहिती लागते?",
    a: "जिल्हा, तालुका, गाव, गट / सर्वे नंबर आणि शक्य असल्यास फेरफार क्रमांक. क्रमांक नसेल तर मालकाचे नाव किंवा तारीख-कालावधी देऊ शकता.",
  },
  {
    q: "WhatsApp वर फेरफार PDF कशी मिळते?",
    a: "WhatsApp वर माहिती शेअर करा, आम्ही Mahabhumi / Bhulekh वर तपासू, उपलब्धता आणि शुल्क कळवू, मंजुरीनंतर UPI पेमेंट घेऊन PDF पाठवू.",
  },
  {
    q: "नामांतर अद्ययावत नसल्यास काय करावे?",
    a: "तलाठी कार्यालयात नामांतर अर्ज भरावा, नोंदणी कागदपत्र, मृत्यू दाखला (वारस प्रकरणात) आणि इतर पुरावे जोडावे. आम्ही या प्रक्रियेचा क्रम सोप्या भाषेत समजावून देतो.",
  },
  {
    q: "फेरफार नोंद कायदेशीर वैध आहे का?",
    a: "मंजूर फेरफार 7/12 च्या हक्क रकान्यात नोंद होते आणि शासकीय पुरावा. विवाद असल्यास तहसील कार्यालयाची सही-शिक्का असलेली प्रत आवश्यक.",
  },
];

const eFerfarFaqEn: Array<{ q: string; a: string }> = [
  {
    q: "What is E-Ferfar (mutation)?",
    a: "E-Ferfar is the official record of any change in land ownership or rights — sale, inheritance, mortgage, transfer — registered with the Talathi's office. Once sanctioned, the mutation reflects in the 7/12 extract.",
  },
  {
    q: "Why check the mutation record?",
    a: "Before any land purchase, loan or inheritance step, mutation history must be checked. If a mutation is pending, the 7/12 may still show the previous owner's name instead of the new one.",
  },
  {
    q: "What details are needed?",
    a: "District, taluka, village, Gut / Survey number and ideally the Ferfar number. Without it, owner name or a date range helps narrow the search.",
  },
  {
    q: "How is the E-Ferfar PDF delivered on WhatsApp?",
    a: "Share details on WhatsApp; we check Mahabhumi / Bhulekh, quote a fee, take UPI payment, and send the PDF.",
  },
  {
    q: "What if the mutation is not updated?",
    a: "File a mutation application at the Talathi office with registration documents, death certificate (for inheritance) and other proofs. We explain the sequence step by step.",
  },
  {
    q: "Is a mutation entry legally valid?",
    a: "A sanctioned mutation entered in the 'other rights' column of 7/12 is an official record. For disputed matters, a stamped copy from the Tehsil office is required.",
  },
];

export function EFerfarContent() {
  return (
    <ServicePageShell
      slug="e-ferfar-maharashtra"
      eyebrow="Revenue Record Service"
      title="E-Ferfar Maharashtra — Mutation Entry Assistance"
      breadcrumb="E-Ferfar"
      intro="Need to check the mutation (E-Ferfar) record of an ownership change? Share district, taluka, village and Gut number — we look it up on Mahabhumi and send the PDF on WhatsApp."
      updatedAt="May 2026"
      whatsappMessage={"Hello, I need to check the E-Ferfar (mutation) record.\nDistrict:\nTaluka:\nVillage:\nGut / Survey number:\nFerfar number (if known):"}
      content={<Body faqPairs={eFerfarFaqEn} />}
    />
  );
}

function Body({ faqPairs }: { faqPairs: Array<{ q: string; a: string }> }) {
  return (
    <>
      <ServiceSection heading="What is this service?">
        <p>
          <strong>E-Ferfar (mutation)</strong> is the official record of any
          change in land ownership or rights. Sale, inheritance, mortgage,
          transfer, gift — each change is registered with the Talathi&apos;s
          office. Once sanctioned, the mutation reflects in the 7/12
          extract&apos;s &apos;other rights&apos; column.
        </p>
        <p>
          The PrintShubh team retrieves the publicly available mutation
          record from <strong>Mahabhumi and Bhulekh</strong>, checks
          sanction status, and delivers a PDF on WhatsApp.
        </p>
      </ServiceSection>

      <ServiceSection heading="Who can use this?">
        <ServiceList
          items={[
            "Buyers verifying ownership history before purchase.",
            "Families verifying records before inheritance / partition.",
            "Loan / home-loan applicants gathering ownership proof.",
            "Anyone in a court case, arbitration or land dispute.",
            "Owners frustrated because the 7/12 still shows an old name.",
            "Anyone working through society conveyance / NA / building permits.",
          ]}
        />
      </ServiceSection>

      <ServiceSection heading="What details are needed?">
        <ServiceList
          items={[
            "District, taluka, village.",
            "Gut number or Survey number.",
            "Ferfar number — best when known.",
            "(Optional) Owner name.",
            "(Optional) Date range — useful when one specific entry is sought.",
          ]}
        />
      </ServiceSection>

      <ServiceSection heading="How does WhatsApp delivery work?">
        <ServiceList
          items={[
            "Share district, taluka, village, Gut number on WhatsApp.",
            "We check Mahabhumi mutation entries and report sanctioned / pending / updated status.",
            "Fee quoted, UPI payment after approval.",
            "Ferfar PDF delivered on WhatsApp.",
            "If a mutation is pending we guide you to the Talathi office next step.",
          ]}
        />
      </ServiceSection>

      <ServiceSection heading="PDF / document assistance">
        <p>
          The Ferfar PDF shows mutation number, date, change type (sale /
          inheritance / mortgage), previous owner, new owner and sanction
          status. On request we send it bundled with the{" "}
          <strong>7/12 and 8A</strong> for a complete ownership picture.
        </p>
      </ServiceSection>

      <ServiceSection heading="Important notes">
        <ServiceList
          items={[
            "If a mutation is pending the 7/12 still shows the old name — check before buying.",
            "Inheritance mutation needs death certificate, heir list, NOCs and registration papers.",
            "Mortgage mutation is sanctioned only after the bank's NOC.",
            "Society conveyance triggers multiple mutations together — check every number.",
            "Disputed mutations may be reversed by court order.",
          ]}
        />
      </ServiceSection>

      <ServiceSection heading="PrintShubh is not a government website">
        <p>
          <strong>
            PrintShubh is not a government website. We provide private
            assistance based on official public sources.
          </strong>{" "}
          Approval, objection and final mutation decisions are the
          authority of the Talathi / Tehsil office.
        </p>
      </ServiceSection>

      <ServiceSection heading="Frequently asked questions">
        <ServiceFaq pairs={faqPairs} />
      </ServiceSection>
    </>
  );
}
