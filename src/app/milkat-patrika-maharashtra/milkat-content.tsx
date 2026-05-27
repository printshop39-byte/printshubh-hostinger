"use client";

import {
  ServicePageShell,
  ServiceSection,
  ServiceList,
  ServiceFaq,
} from "@/components/service-page-shell";
import { useLang } from "@/components/language-context";

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
  const { lang } = useLang();

  return (
    <ServicePageShell
      slug="milkat-patrika-maharashtra"
      eyebrow={{ mr: "शहरी मालमत्ता सेवा", en: "Urban Property Service" }}
      title={{
        mr: "मिळकत पत्रिका महाराष्ट्र — Property Card PDF सहाय्य",
        en: "Milkat Patrika Maharashtra — Property Card PDF Assistance",
      }}
      breadcrumb={{ mr: "मिळकत पत्रिका", en: "Property Card" }}
      intro={{
        mr: "महाराष्ट्रातील शहरी मालमत्तेसाठी मिळकत पत्रिका (Property Card) मिळवण्यासाठी WhatsApp सहाय्य. CTS नंबर, City Survey Office आणि सहायक माहिती शेअर करा.",
        en: "Get the Property Card / Milkat Patrika for urban properties in Maharashtra over WhatsApp. Share CTS number, City Survey Office and supporting details.",
      }}
      updatedAt={lang === "mr" ? "मे २०२६" : "May 2026"}
      whatsappMessage={{
        mr: "नमस्कार, मला मिळकत पत्रिका / Property Card हवी आहे.\nजिल्हा / शहर:\nCity Survey Office:\nCTS नंबर:\nमालकाचे नाव (पडताळणीसाठी):",
        en: "Hello, I need a Property Card.\nDistrict / City:\nCity Survey Office:\nCTS number:\nOwner name (for verification):",
      }}
      contentMr={<BodyMr />}
      contentEn={<BodyEn faqPairs={milkatFaqEn} />}
    />
  );
}

function BodyMr() {
  return (
    <>
      <ServiceSection heading="सेवा म्हणजे काय?">
        <p>
          <strong>मिळकत पत्रिका (Property Card)</strong> ही महाराष्ट्र भूमी
          अभिलेख विभागाकडून <em>शहरी</em> मालमत्तेसाठी जारी केली जाते. यात
          CTS नंबर, क्षेत्रफळ, मालकाचे नाव, बोजे, हस्तांतरण इतिहास आणि
          नोंदणी क्रमांक एका दस्तऐवजात मिळतो — फ्लॅट, बंगला, कार्यालय किंवा
          शहरी प्लॉटसाठी हीच अधिकृत मालकी नोंद आहे.
        </p>
        <p>
          PrintShubh टीम City Survey कार्यालयांच्या <strong>ऑनलाइन
          सार्वजनिक स्रोतांवर</strong> उपलब्ध डिजिटल Property Card शोधते आणि
          PDF स्वरूपात WhatsApp वर पाठवते. अधिकृत stamped प्रत आवश्यक असल्यास
          पुढील पाऊल कसे टाकायचे ते मार्गदर्शन करतो.
        </p>
      </ServiceSection>

      <ServiceSection heading="कोणाला उपयोगी?">
        <ServiceList
          items={[
            "फ्लॅट, बंगला, कार्यालय खरेदी–विक्री करणारे.",
            "बँक होम लोन, mortgage किंवा LAP अर्ज करणारे.",
            "शहरी जमिनीचे वारस / सह-मालक.",
            "Redevelopment, society conveyance प्रकरणे.",
            "मुंबई SRA, MHADA संबंधित प्रकरणे.",
            "Builder / developer due diligence टीम.",
          ]}
        />
      </ServiceSection>

      <ServiceSection heading="कोणती माहिती लागते?">
        <ServiceList
          items={[
            "जिल्हा / शहर (e.g. मुंबई, पुणे, ठाणे, नागपूर).",
            "तालुका किंवा City Survey Office नाव.",
            "CTS नंबर — मुख्य संदर्भ.",
            "(पर्यायी) मालकाचे नाव.",
            "(मुंबईसाठी) Ward नंबर / sub-CTS नंबर.",
            "(पर्यायी) Building Name / Society Name.",
          ]}
        />
      </ServiceSection>

      <ServiceSection heading="WhatsApp वर प्रक्रिया कशी होते?">
        <ServiceList
          items={[
            "तुम्ही WhatsApp वर City Survey Office आणि CTS नंबर शेअर करता.",
            "PrintShubh टीम ऑनलाइन उपलब्धता तपासते.",
            "शुल्क सांगून, तुमच्या मंजुरीनंतर UPI पेमेंट.",
            "डिजिटल Property Card PDF WhatsApp वर पाठवली जाते.",
            "Stamped प्रत हवी असल्यास पुढची प्रक्रिया कळवली जाते.",
            "नोंद उपलब्ध नसल्यास परतावा.",
          ]}
        />
      </ServiceSection>

      <ServiceSection heading="PDF / दस्तऐवज सहाय्य">
        <p>
          डिजिटल Property Card PDF print-ready स्वरूपात पाठवली जाते. यात
          मालक-यादी, क्षेत्रफळ, बोजे, transfer history सर्व एका कागदावर.
          आवश्यकता असल्यास आम्ही formatting tidy करून पाठवू.
        </p>
        <p>
          <strong>मुंबईसाठी विशेष नोंद:</strong> ऑनलाइन प्रत संदर्भासाठी, पण
          conveyance / SRA / नोंदणी कामासाठी BCS Office चा stamped print
          आवश्यक. ती प्रक्रिया आम्ही टप्प्या-टप्प्याने सांगतो.
        </p>
      </ServiceSection>

      <ServiceSection heading="महत्त्वाच्या सूचना">
        <ServiceList
          items={[
            "CTS नंबर शहरांनुसार वेगवेगळ्या format मध्ये असू शकतो — 1234/5/A सारखे संयुक्त नंबर.",
            "एका CTS वर अनेक sub-CTS असू शकतात — फ्लॅटसाठी sub-CTS तपासावा.",
            "Society conveyance नंतर सह-मालक यादी अद्ययावत होते — जुनी आणि नवीन प्रत वेगवेगळी असू शकते.",
            "Property Card वर दिसणारे क्षेत्रफळ super-built-up नसून carpet / measured area असते.",
            "Co-op society मालमत्तेसाठी share certificate देखील वेगळा वैध दस्तऐवज.",
          ]}
        />
      </ServiceSection>

      <ServiceSection heading="PrintShubh सरकारी वेबसाइट नाही">
        <p>
          <strong>
            PrintShubh हे सरकारी संकेतस्थळ नाही. आम्ही अधिकृत स्रोतांवर आधारित
            खाजगी सहाय्य सेवा प्रदान करतो.
          </strong>{" "}
          अंतिम कायदेशीर वापरासाठी City Survey Office ची stamped Property
          Card अनिवार्य.
        </p>
      </ServiceSection>

      <ServiceSection heading="वारंवार विचारले जाणारे प्रश्न">
        <ServiceFaq pairs={milkatFaqMr} />
      </ServiceSection>
    </>
  );
}

function BodyEn({ faqPairs }: { faqPairs: Array<{ q: string; a: string }> }) {
  return (
    <>
      <ServiceSection heading="What is this service?">
        <p>
          The <strong>Property Card (Milkat Patrika)</strong> is issued by
          Maharashtra's Bhumi Abhilekh department for <em>urban</em>
          properties. It carries CTS number, area, owner names, encumbrances,
          transfer history and registration entries on one document — for
          flats, bungalows, offices and urban plots this is the formal
          ownership record.
        </p>
        <p>
          The PrintShubh team retrieves the publicly available digital
          Property Card from City Survey offices' <strong>online official
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
