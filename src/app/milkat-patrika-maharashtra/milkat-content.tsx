"use client";

import {
  ServicePageShell,
  ServiceSection,
  ServiceList,
  ServiceFaq,
} from "@/components/service-page-shell";

export const milkatFaqMr: Array<{ q: string; a: string }> = [
  {
    q: "मिळकत पत्रिका म्हणजे काय?",
    a: "मिळकत पत्रिका (Property Card) हा महाराष्ट्र भूमी अभिलेख विभागाकडून नगरीय भागासाठी दिला जाणारा मालकी दस्तऐवज आहे. यात CTS नंबर, शहरी मालमत्तेचे क्षेत्रफळ, मालकाचे नाव, बोजे आणि नोंदणी इतिहास असतो.",
  },
  {
    q: "7/12 आणि मिळकत पत्रिका मध्ये फरक काय?",
    a: "7/12 मुख्यतः ग्रामीण कृषी जमिनींसाठी (गट / सर्वे नंबर निहाय) असतो. मिळकत पत्रिका शहरी (City Survey) क्षेत्रासाठी CTS नंबरनिहाय असते — फ्लॅट, बंगला, कार्यालय किंवा शहरी प्लॉटसाठी हीच नोंद असते.",
  },
  {
    q: "Property Card साठी कोणती माहिती लागते?",
    a: "जिल्हा, शहर / तालुका, City Survey Office नाव आणि CTS नंबर. (मुंबईसाठी) Ward नंबर देखील उपयोगी. मालकाचे नाव दिले तर पडताळणी सोपी होते.",
  },
  {
    q: "मुंबई Property Card कशी मिळते?",
    a: "मुंबईसाठी SRA, MHADA आणि बृहन्मुंबई शहर सर्वेक्षण विभागाच्या stamped Property Card ची प्रत्यक्ष प्रत आवश्यक. आम्ही ऑनलाइन उपलब्ध डिजिटल प्रत आणि अधिकृत प्रत मिळवण्याची प्रक्रिया दोन्ही समजावून देतो.",
  },
  {
    q: "एका CTS वर अनेक मालक असल्यास?",
    a: "Property Card वर सर्व सह-मालकांचे नाव, त्यांचा हिस्सा आणि नोंदणी क्रमांक दिसतो. अपार्टमेंट कॉम्प्लेक्ससाठी प्रत्येक फ्लॅटची स्वतंत्र मिळकत पत्रिका असू शकते (sub-CTS).",
  },
  {
    q: "Property Card कायदेशीर वापरासाठी वैध आहे का?",
    a: "City Survey कार्यालयाकडून मिळणारी stamped Property Card मालकीचा अधिकृत पुरावा. ऑनलाइन डिजिटल प्रत संदर्भासाठी, पण कोर्ट / नोंदणी / बँक कागदपत्रांसाठी stamped प्रत आवश्यक.",
  },
];

const milkatFaqEn: Array<{ q: string; a: string }> = [
  {
    q: "What is a Property Card (Milkat Patrika)?",
    a: "The Property Card is the ownership document issued by Maharashtra's Bhumi Abhilekh department for urban areas. It carries CTS number, urban property area, owner name, encumbrances and registration history.",
  },
  {
    q: "Difference between 7/12 and Property Card?",
    a: "7/12 is primarily for rural agricultural land (Gut / Survey number). The Property Card is for urban City Survey areas, keyed by CTS number — flats, bungalows, offices, urban plots use this record.",
  },
  {
    q: "What details are needed?",
    a: "District, city / taluka, City Survey Office name and CTS number. For Mumbai the Ward number also helps. Owner name aids verification.",
  },
  {
    q: "How do I get a Mumbai Property Card?",
    a: "Mumbai needs a stamped copy from SRA, MHADA or the Brihanmumbai City Survey department for legal use. We help with both the online digital copy and the process to obtain a stamped copy.",
  },
  {
    q: "What if a CTS has multiple owners?",
    a: "The Property Card lists every co-owner, their share and registration entry. Apartment complexes often have sub-CTS records per flat.",
  },
  {
    q: "Is the Property Card legally valid?",
    a: "A stamped copy from the City Survey office is the formal proof of ownership. Online digital copies are useful references; for court / registration / bank use the stamped copy is required.",
  },
];

export function MilkatContent() {
  return (
    <ServicePageShell
      slug="milkat-patrika-maharashtra"
      eyebrow="Urban Property Service"
      title="Milkat Patrika Maharashtra — Property Card PDF Assistance"
      breadcrumb="Property Card"
      intro="Get the Property Card / Milkat Patrika for urban properties in Maharashtra over WhatsApp. Share CTS number, City Survey Office and supporting details."
      updatedAt="May 2026"
      whatsappMessage={"Hello, I need a Property Card.\nDistrict / City:\nCity Survey Office:\nCTS number:\nOwner name (for verification):"}
      content={<Body faqPairs={milkatFaqEn} />}
    />
  );
}

function Body({ faqPairs }: { faqPairs: Array<{ q: string; a: string }> }) {
  return (
    <>
      <ServiceSection heading="What is this service?">
        <p>
          The <strong>Property Card (Milkat Patrika)</strong> is issued by
          Maharashtra&apos;s Bhumi Abhilekh department for <em>urban</em>
          properties. It carries CTS number, area, owner names, encumbrances,
          transfer history and registration entries on one document — for
          flats, bungalows, offices and urban plots this is the formal
          ownership record.
        </p>
        <p>
          The PrintShubh team retrieves the publicly available digital
          Property Card from City Survey offices&apos; <strong>online official
          sources</strong> and sends a PDF on WhatsApp. When a stamped copy
          is needed we guide on the next step.
        </p>
      </ServiceSection>

      <ServiceSection heading="Who can use this?">
        <ServiceList
          items={[
            "Buyers and sellers of flats, bungalows, offices.",
            "Anyone applying for home loan, mortgage or LAP.",
            "Heirs and co-owners of urban properties.",
            "Redevelopment and society-conveyance matters.",
            "SRA / MHADA related cases in Mumbai.",
            "Builder / developer due-diligence teams.",
          ]}
        />
      </ServiceSection>

      <ServiceSection heading="What details are needed?">
        <ServiceList
          items={[
            "District / city (Mumbai, Pune, Thane, Nagpur, etc.).",
            "Taluka or City Survey Office name.",
            "CTS number — the primary reference.",
            "(Optional) Owner name.",
            "(Mumbai) Ward number / sub-CTS.",
            "(Optional) Building Name / Society Name.",
          ]}
        />
      </ServiceSection>

      <ServiceSection heading="How does WhatsApp delivery work?">
        <ServiceList
          items={[
            "Share City Survey Office and CTS number on WhatsApp.",
            "We check online availability.",
            "Fee quoted, UPI payment after approval.",
            "Digital Property Card PDF sent on WhatsApp.",
            "If a stamped copy is needed we share the process.",
            "Refund if the record cannot be retrieved.",
          ]}
        />
      </ServiceSection>

      <ServiceSection heading="PDF / document assistance">
        <p>
          The digital Property Card PDF is print-ready — owner list, area,
          encumbrances and transfer history on one page. On request we tidy
          formatting.
        </p>
        <p>
          <strong>Mumbai note:</strong> the online copy is fine as a
          reference; for conveyance / SRA / registration a BCS Office
          stamped print is required. We share the step-by-step process.
        </p>
      </ServiceSection>

      <ServiceSection heading="Important notes">
        <ServiceList
          items={[
            "CTS numbers vary by city — composites like 1234/5/A are common.",
            "One CTS may have many sub-CTS — for a flat, check the sub-CTS.",
            "Co-owner lists update after society conveyance; old and new copies can differ.",
            "Area on the Property Card is carpet / measured, not super-built-up.",
            "For co-op society property the share certificate is a separate, also-valid document.",
          ]}
        />
      </ServiceSection>

      <ServiceSection heading="PrintShubh is not a government website">
        <p>
          <strong>
            PrintShubh is not a government website. We provide private
            assistance based on official public sources.
          </strong>{" "}
          For final legal use, a stamped Property Card from the City Survey
          Office is mandatory.
        </p>
      </ServiceSection>

      <ServiceSection heading="Frequently asked questions">
        <ServiceFaq pairs={faqPairs} />
      </ServiceSection>
    </>
  );
}
