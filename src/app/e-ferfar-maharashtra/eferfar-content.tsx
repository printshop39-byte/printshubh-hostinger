"use client";

import {
  ServicePageShell,
  ServiceSection,
  ServiceList,
  ServiceFaq,
} from "@/components/service-page-shell";
import { useLang } from "@/components/language-context";

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
  const { lang } = useLang();

  return (
    <ServicePageShell
      slug="e-ferfar-maharashtra"
      eyebrow={{ mr: "महसूल नोंद सेवा", en: "Revenue Record Service" }}
      title={{
        mr: "ई-फेरफार महाराष्ट्र — Mutation नोंद सहाय्य",
        en: "E-Ferfar Maharashtra — Mutation Entry Assistance",
      }}
      breadcrumb={{ mr: "ई-फेरफार", en: "E-Ferfar" }}
      intro={{
        mr: "जमिनीच्या मालकी / हक्कांतील बदलाची ई-फेरफार नोंद तपासायची आहे? जिल्हा, तालुका, गाव आणि गट नंबर शेअर करा — आम्ही Mahabhumi वर शोधून PDF WhatsApp वर पाठवतो.",
        en: "Need to check the mutation (E-Ferfar) record of an ownership change? Share district, taluka, village and Gut number — we look it up on Mahabhumi and send the PDF on WhatsApp.",
      }}
      updatedAt={lang === "mr" ? "मे २०२६" : "May 2026"}
      whatsappMessage={{
        mr: "नमस्कार, मला ई-फेरफार नोंद तपासायची आहे.\nजिल्हा:\nतालुका:\nगाव:\nगट / सर्वे नंबर:\nफेरफार क्रमांक (असल्यास):",
        en: "Hello, I need to check the E-Ferfar (mutation) record.\nDistrict:\nTaluka:\nVillage:\nGut / Survey number:\nFerfar number (if known):",
      }}
      contentMr={<BodyMr />}
      contentEn={<BodyEn faqPairs={eFerfarFaqEn} />}
    />
  );
}

function BodyMr() {
  return (
    <>
      <ServiceSection heading="सेवा म्हणजे काय?">
        <p>
          <strong>ई-फेरफार (Mutation)</strong> ही जमिनीच्या मालकी / हक्कांत
          झालेल्या बदलाची शासकीय नोंद आहे. खरेदी–विक्री, वारस, गहाण,
          हस्तांतरण, बक्षीसपत्र — कोणताही बदल झाल्यावर तलाठी कार्यालयात
          फेरफार नोंद होते. मंजुरीनंतर ती 7/12 च्या हक्क रकान्यात प्रतिबिंबित
          होते आणि नवीन 7/12 वर दिसते.
        </p>
        <p>
          PrintShubh टीम <strong>Mahabhumi व Bhulekh</strong> या{" "}
          <strong>अधिकृत सार्वजनिक स्रोतांवर</strong> उपलब्ध फेरफार नोंद
          शोधते, मंजुरीची स्थिती तपासते आणि PDF स्वरूपात WhatsApp वर पाठवते.
        </p>
      </ServiceSection>

      <ServiceSection heading="कोणाला उपयोगी?">
        <ServiceList
          items={[
            "जमीन खरेदी करण्यापूर्वी ownership history तपासणारे.",
            "वारसा / हिस्सा / कौटुंबिक वाटप पुढे जाण्यापूर्वी नोंद पडताळणी.",
            "बँक कर्ज / होम लोन साठी मालकी पुरावा गोळा करणारे.",
            "कोर्ट केस, मध्यस्थी, किंवा कायदेशीर विवादात असणारे.",
            "7/12 वर जुने नाव दिसते आहे म्हणून त्रास होणारे.",
            "Society conveyance / NA / बांधकाम परवाना प्रक्रिया करणारे.",
          ]}
        />
      </ServiceSection>

      <ServiceSection heading="कोणती माहिती लागते?">
        <ServiceList
          items={[
            "जिल्हा, तालुका, गाव.",
            "गट नंबर किंवा सर्वे नंबर.",
            "फेरफार क्रमांक — असल्यास सर्वोत्तम.",
            "(पर्यायी) मालकाचे नाव.",
            "(पर्यायी) तारीख-कालावधी — विशिष्ट फेरफार शोधण्यास उपयोगी.",
          ]}
        />
      </ServiceSection>

      <ServiceSection heading="WhatsApp वर प्रक्रिया कशी होते?">
        <ServiceList
          items={[
            "WhatsApp वर जिल्हा, तालुका, गाव, गट नंबर शेअर करा.",
            "PrintShubh टीम Mahabhumi वर फेरफार नोंदी तपासते — मंजूर, अद्ययावत किंवा प्रलंबित अशी स्थिती कळवते.",
            "शुल्क सांगून तुमच्या मंजुरीनंतर UPI पेमेंट.",
            "फेरफार PDF WhatsApp वर पाठवली जाते.",
            "नोंद अद्ययावत नसल्यास तलाठी कार्यालयात पुढच्या पावलांचे मार्गदर्शन.",
          ]}
        />
      </ServiceSection>

      <ServiceSection heading="PDF / दस्तऐवज सहाय्य">
        <p>
          फेरफार PDF मध्ये फेरफार क्रमांक, तारीख, बदलाचे स्वरूप (खरेदी / वारस
          / गहाण), जुना मालक, नवीन मालक, आणि मंजुरीची स्थिती दाखवली जाते.
          आवश्यकता असल्यास आम्ही ती <strong>7/12 आणि 8A सोबत एकत्र</strong>{" "}
          पाठवतो — संपूर्ण नोंद-चित्र एकाच ठिकाणी मिळते.
        </p>
      </ServiceSection>

      <ServiceSection heading="महत्त्वाच्या सूचना">
        <ServiceList
          items={[
            "फेरफार प्रलंबित असल्यास 7/12 वर जुने नाव दिसते — खरेदी आधी हे तपासणे आवश्यक.",
            "वारस फेरफार करण्यासाठी मृत्यू दाखला, वारस यादी, NOC आणि नोंदणी कागदपत्रे लागतात.",
            "गहाण फेरफार बँकेच्या NOC नंतरच मंजूर होते.",
            "Society conveyance नंतर अनेक फेरफार एकाच वेळी होतात — सर्व क्रमांक तपासावे.",
            "विवादित फेरफार रद्द होऊ शकते — कोर्ट निकालावर अवलंबून.",
          ]}
        />
      </ServiceSection>

      <ServiceSection heading="PrintShubh सरकारी वेबसाइट नाही">
        <p>
          <strong>
            PrintShubh हे सरकारी संकेतस्थळ नाही. आम्ही अधिकृत स्रोतांवर आधारित
            खाजगी सहाय्य सेवा प्रदान करतो.
          </strong>{" "}
          फेरफार अर्ज मंजुरी / आक्षेप / अंतिम निर्णय हे संबंधित तलाठी / तहसील
          कार्यालयाचेच अधिकार आहेत.
        </p>
      </ServiceSection>

      <ServiceSection heading="वारंवार विचारले जाणारे प्रश्न">
        <ServiceFaq pairs={eFerfarFaqMr} />
      </ServiceSection>
    </>
  );
}

function BodyEn({ faqPairs }: { faqPairs: Array<{ q: string; a: string }> }) {
  return (
    <>
      <ServiceSection heading="What is this service?">
        <p>
          <strong>E-Ferfar (mutation)</strong> is the official record of any
          change in land ownership or rights. Sale, inheritance, mortgage,
          transfer, gift — each change is registered with the Talathi's
          office. Once sanctioned, the mutation reflects in the 7/12
          extract's 'other rights' column.
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
