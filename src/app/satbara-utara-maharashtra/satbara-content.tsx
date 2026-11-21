"use client";

import {
  ServicePageShell,
  ServiceSection,
  ServiceList,
  ServiceFaq,
} from "@/components/service-page-shell";
import Link from "next/link";

/** FAQ pairs as plain strings — exported so the server `page.tsx` can hand
 * them to the FAQPage JSON-LD emitter. Keep the answers crawler-friendly:
 * full sentences, no inline links, ~40–80 words each. */
export const satbaraFaqMr: Array<{ q: string; a: string }> = [
  {
    q: "7/12 उतारा म्हणजे काय?",
    a: "7/12 उतारा (सातबारा) हा महाराष्ट्रातील जमीन-मालकीचा प्राथमिक महसूल दस्तऐवज आहे. यात गट नंबर, क्षेत्रफळ, मालकाचे नाव, पीक नोंदी आणि बोजे यांची माहिती असते. जमीन व्यवहार, बँक कर्ज, वारस हक्क व सरकारी योजनांसाठी हा दस्तऐवज लागतो.",
  },
  {
    q: "PrintShubh 7/12 उतारा देते की सरकारी संकेतस्थळ?",
    a: "PrintShubh हे सरकारी संकेतस्थळ नाही. आम्ही Mahabhumi व Bhulekh यांसारख्या अधिकृत सार्वजनिक स्रोतांवर उपलब्ध माहितीच्या आधारे खाजगी सहाय्य पुरवतो. अंतिम कायदेशीर पडताळणी संबंधित तहसील कार्यालय किंवा अधिकृत सरकारी पोर्टलवरून करावी.",
  },
  {
    q: "7/12 उतारा PDF साठी कोणती माहिती लागते?",
    a: "जिल्हा, तालुका, गाव यांसोबत गट नंबर किंवा सर्वे नंबर लागतो. काही गावांमध्ये भूमापन नंबर वापरला जातो. माहिती अपूर्ण असल्यास आम्ही आधी सार्वजनिक स्रोतांवर शोध घेतो आणि उपलब्ध रकम तुम्हाला कळवतो.",
  },
  {
    q: "WhatsApp वर 7/12 PDF कशी मिळते?",
    a: "WhatsApp वर तुमची जिल्हा-तालुका-गाव-गट तपशील पाठवा. आम्ही उपलब्धता तपासून शुल्क सांगतो. तुमच्या मंजुरीनंतर UPI पेमेंट घेऊन PDF WhatsApp वर पाठवतो. नोंद उपलब्ध नसेल तर परतावा धोरणानुसार रक्कम परत मिळते.",
  },
  {
    q: "7/12 आणि 8A मधील फरक कोणता?",
    a: "7/12 हा गट / सर्वे नंबरनिहाय असतो — एका विशिष्ट जमिनीची माहिती दाखवतो. 8A हा खातेदार-निहाय असतो — एका मालकाच्या नावावर असलेल्या सर्व जमिनींची एकत्रित नोंद दाखवतो. दोन्ही एकत्र वापरून मालकीचे संपूर्ण चित्र मिळते.",
  },
  {
    q: "जुने 7/12 उतारे मिळतात का?",
    a: "Mahabhumi वर डिजिटाइज्ड कालावधीतील नोंदी उपलब्ध आहेत. खूप जुन्या मूळ नोंदींसाठी तहसील कार्यालयातील भूमी अभिलेख विभाग संपर्क योग्य ठरतो. आम्ही उपलब्धता आधी तपासून तुम्हाला कळवतो.",
  },
];

const satbaraFaqEn: Array<{ q: string; a: string }> = [
  {
    q: "What is a 7/12 (Satbara) extract?",
    a: "The 7/12 extract is Maharashtra's primary land-ownership revenue document. It lists Gut/Survey number, area, owner name, crop entries and encumbrances. It is required for land transactions, bank loans, inheritance claims and most government schemes.",
  },
  {
    q: "Is PrintShubh a government body for 7/12 issuance?",
    a: "PrintShubh is not a government website. We provide private assistance based on publicly available data on Mahabhumi and Bhulekh. Final legal verification must be done at the relevant Tehsil office or official government portal.",
  },
  {
    q: "What details are needed to retrieve a 7/12 PDF?",
    a: "District, taluka, village plus Gut number or Survey number. Some villages use a Bhumapan number. If details are incomplete we first search the public sources and confirm what is available before any charge.",
  },
  {
    q: "How is the 7/12 PDF delivered on WhatsApp?",
    a: "Share the location and number on WhatsApp. We check availability and quote the fee. Once you approve, UPI payment is taken and the PDF is sent on WhatsApp. If the record is not retrievable, the refund policy applies.",
  },
  {
    q: "What is the difference between 7/12 and 8A?",
    a: "7/12 is Gut/Survey-number-wise — one specific land parcel. 8A is account-holder-wise — a consolidated list of all lands held under one owner's name. Used together they give the full ownership picture.",
  },
  {
    q: "Are old 7/12 extracts available?",
    a: "Digitised records on Mahabhumi cover recent decades. For very old original records the Tehsil office's Bhumi Abhilekh section is the right point of contact. We confirm availability before any payment.",
  },
];

export function SatbaraContent() {
  return (
    <ServicePageShell
      slug="satbara-utara-maharashtra"
      eyebrow="Maharashtra Land Service"
      title="7/12 Extract Maharashtra — Satbara PDF Assistance"
      breadcrumb="7/12 Extract"
      intro="Share district, taluka, village and Gut number — the PrintShubh team checks Mahabhumi and Bhulekh, then delivers the 7/12 (Satbara) extract PDF on WhatsApp."
      updatedAt="May 2026"
      whatsappMessage={"Hello, I need help with a 7/12 extract. My land details:\nDistrict:\nTaluka:\nVillage:\nGut / Survey number:"}
      content={<Body faqPairs={satbaraFaqEn} />}
    />
  );
}

function Body({ faqPairs }: { faqPairs: Array<{ q: string; a: string }> }) {
  return (
    <>
      <ServiceSection heading="What is this service?">
        <p>
          The <strong>7/12 extract</strong> (Marathi: <em>Satbara</em>) is
          Maharashtra&apos;s most important land-ownership document. It carries Gut
          or Survey number, area, owner name, crop entries, encumbrances and
          inheritance notes on one page. It is mandatory for almost every land
          transaction — sale, mortgage, NA permission, inheritance, government
          schemes.
        </p>
        <p>
          PrintShubh is a <strong>private assistance service</strong>. We
          retrieve the publicly available 7/12 record from{" "}
          <strong>official sources</strong> like Mahabhumi and Bhulekh, prepare
          a clean PDF, and deliver it on WhatsApp. We do not create or issue
          7/12 records — we <em>locate</em> them.
        </p>
      </ServiceSection>

      <ServiceSection heading="Who can use this?">
        <ServiceList
          items={[
            "Farmers and investors planning a land purchase or sale.",
            "Anyone applying for a bank loan, mortgage or agri-credit.",
            "Applicants seeking NA permission, building permits or development approvals.",
            "Anyone preparing inheritance, ownership or court-case evidence.",
            "Beneficiaries needing base documents for PM Kisan, crop insurance or subsidies.",
            "NRIs who cannot visit the native village in person.",
          ]}
        />
      </ServiceSection>

      <ServiceSection heading="What details are needed?">
        <p>
          To retrieve a 7/12 extract we need <strong>location detail</strong> +{" "}
          <strong>reference number</strong>:
        </p>
        <ServiceList
          items={[
            "District (e.g. Kolhapur, Pune, Nashik).",
            "Taluka (e.g. Karvir, Haveli, Igatpuri).",
            "Village (e.g. Kanerivadi, Wadgaon Sheri).",
            "Gut number or Survey number — the primary key.",
            "(Optional) Owner name — for verification.",
            "(Optional) Bhumapan number — required for some legacy records.",
          ]}
        />
        <p>
          Don&apos;t have a Gut or Survey number? Use our{" "}
          <Link href="/nakasha-shodh" className="font-bold text-brand-navy underline decoration-brand-gold underline-offset-4 hover:text-brand-navy-dark">
            map finder
          </Link>{" "}
          — pick district → taluka → village and we&apos;ll take it from there.
        </p>
      </ServiceSection>

      <ServiceSection heading="How does WhatsApp delivery work?">
        <ServiceList
          items={[
            "Share district, taluka, village and Gut / Survey number on WhatsApp.",
            "The PrintShubh team checks Mahabhumi / Bhulekh and confirms availability.",
            "Fees are quoted up-front — work proceeds only after your approval.",
            "Payment is taken via UPI (Google Pay, PhonePe, Paytm).",
            "The 7/12 PDF is delivered on WhatsApp, usually the same day.",
            "If the record cannot be retrieved, the refund policy applies.",
          ]}
        />
      </ServiceSection>

      <ServiceSection heading="PDF / document assistance">
        <p>
          The PDF we send is a clean copy of the record from Mahabhumi /
          Bhulekh. On request we tidy it for{" "}
          <strong>readable, print-friendly</strong> output — clear font, right
          margins, A4 ready. Print it on any printer when a hard copy is
          required.
        </p>
        <p>
          The PDF is a <strong>reference</strong>, not a stamped legal copy.
          For court / registration / bank submission you may need a Tehsil
          office <em>signed-and-stamped</em> copy — we&apos;ll guide you on the
          next step in those cases.
        </p>
      </ServiceSection>

      <ServiceSection heading="Important notes">
        <ServiceList
          items={[
            "If the village has been re-surveyed, check both old Survey number and new Gut number.",
            "If owner names don't match, a mutation may be pending — see our E-Ferfar service.",
            "Area shows in sq. metres, hectares or acres — original unit is preserved on the PDF.",
            "Encumbrances / mortgages appear in the 'other rights' column — read the full extract.",
            "For the land's spatial boundary use our Village Map service.",
          ]}
        />
      </ServiceSection>

      <ServiceSection heading="PrintShubh is not a government website">
        <p>
          <strong>
            PrintShubh is not a government website. We provide private
            assistance based on official public sources.
          </strong>{" "}
          We do not approve, issue or alter any 7/12 record. Our role is to
          make publicly available data easy to access. For final legal use,
          please verify at the relevant Tehsil office or on the Mahabhumi
          portal.
        </p>
      </ServiceSection>

      <ServiceSection heading="Frequently asked questions">
        <ServiceFaq pairs={faqPairs} />
      </ServiceSection>
    </>
  );
}
