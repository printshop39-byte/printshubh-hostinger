"use client";

import { AlertTriangle } from "lucide-react";
import {
  LegalList,
  LegalPageShell,
  LegalSection,
} from "@/components/legal-page-shell";
import { useLang, type Lang } from "@/components/language-context";

export function DisclaimerContent() {
  const { lang } = useLang();
  return (
    <LegalPageShell
      title={{ mr: "अस्वीकरण", en: "Disclaimer" }}
      breadcrumb={{ mr: "अस्वीकरण", en: "Disclaimer" }}
      intro={{
        mr: "कृपया हे अस्वीकरण काळजीपूर्वक वाचा. PrintShubh ही खाजगी सहाय्य सेवा आहे — कोणतीही सरकारी संस्था, अधिकृत वेबसाइट किंवा अधिकृत कार्यालय नाही.",
        en: "Please read this disclaimer carefully. PrintShubh is a private assistance service — it is not a government body, official website or government office.",
      }}
      updatedAt="May 2026"
      contentMr={<DisclaimerBody lang="mr" />}
      contentEn={<DisclaimerBody lang="en" />}
    />
  );
}

function DisclaimerBody({ lang }: { lang: Lang }) {
  const Banner = (
    <div className="mb-6 flex items-start gap-3 rounded-lg border-2 border-red-300 bg-red-50 p-4 text-[14px] font-bold leading-7 text-red-900">
      <AlertTriangle className="mt-0.5 size-5 shrink-0 text-red-700" />
      <p>
        {lang === "mr"
          ? "महत्त्वाची सूचना: PrintShubh.shop ही कोणत्याही सरकारी विभागाची, तहसील कार्यालयाची किंवा महसूल विभागाची अधिकृत वेबसाइट नाही. आम्ही फक्त खाजगी कागदपत्र सहाय्य पुरवतो."
          : "Important notice: PrintShubh.shop is NOT the official website of any government department, Tehsil office or revenue office. We provide private document-assistance only."}
      </p>
    </div>
  );

  if (lang === "mr") {
    return (
      <>
        {Banner}

        <LegalSection heading="१. PrintShubh ही सरकारी संस्था नाही">
          <p>
            PrintShubh.shop ही महाराष्ट्रासाठी एक <strong>खाजगी सहाय्य
            सेवा</strong> आहे. आम्ही सरकारच्या भूमि अभिलेख विभागाचे, महसूल
            विभागाचे, IGR कार्यालयाचे, MahaRERA चे, ULB चे किंवा अन्य कोणत्याही
            सरकारी संस्थेचे प्रतिनिधी नाही. आमचे कोणत्याही सरकारी विभागाशी
            अधिकृत संलग्न नाही.
          </p>
        </LegalSection>

        <LegalSection heading="२. माहितीचा स्रोत">
          <p>
            आम्ही जी माहिती तुम्हाला पुरवतो ती{" "}
            <strong>
              अधिकृत सार्वजनिक स्रोतांवर — Mahabhumi, Bhulekh, Bhuvan, iGR, ULB
              DP / TP प्रकाशने, MahaRERA सारख्या सरकारी पोर्टलवर
            </strong>{" "}
            उपलब्ध असलेल्या माहितीवर आधारित आहे. आम्ही कोणतीही नोंद{" "}
            <strong>तयार करत नाही, मंजूर करत नाही किंवा बदलत नाही.</strong>
          </p>
        </LegalSection>

        <LegalSection heading="३. अंतिम पडताळणी अधिकृत पोर्टलवरून आवश्यक">
          <p>
            PrintShubh कडून मिळालेले 7/12, 8A, फेरफार, मिळकत पत्रिका, गाव नकाशा,
            DP / TP नकाशा संदर्भ हे{" "}
            <strong>केवळ प्राथमिक संदर्भासाठी</strong> आहेत. कोणत्याही कायदेशीर
            व्यवहारापूर्वी (विक्री, खरेदी, करार, खटला, बँक कर्ज, NA परवानगी
            इत्यादी) तुम्ही अंतिम नोंद{" "}
            <strong>
              संबंधित तहसील कार्यालय / अधिकृत सरकारी पोर्टल / नोंदणी कार्यालयावरून
              पडताळून पहाणे आवश्यक आहे.
            </strong>
          </p>
        </LegalSection>

        <LegalSection heading="४. नकाशा / map संदर्भाची मर्यादा">
          <LegalList
            items={[
              "वेबसाइटवरील गाव सीमा (village boundary) आणि नकाशा थर हे public GIS स्रोतांवर आधारित आहेत — हे अधिकृत मोजणी नकाशा नाहीत.",
              "Satellite / Hybrid / Terrain layers हे Esri, OpenStreetMap, OpenTopoMap यासारख्या तृतीय-पक्ष सेवांकडून येतात.",
              "वापरकर्त्याने नकाशावर मार्क केलेली प्लॉट सीमा फक्त संदर्भासाठी आहे — अंतिम मोजणी अधिकृत भूमी मोजणी विभागाकडून करावी.",
              "क्षेत्रफळ (एकर / गुंठा / sq.m) हे अंदाजे आहे — अधिकृत 7/12 / मोजणी नकाशामधील क्षेत्रफळावर अवलंबून रहावे.",
            ]}
          />
        </LegalSection>

        <LegalSection heading="५. सरकारी पोर्टलवरील समस्या">
          <p>
            अधिकृत सरकारी पोर्टलमधील <strong>downtime, server समस्या, चुकीच्या
            नोंदी, डेटा maintenance, धोरण बदल किंवा बंद पडलेल्या सेवा</strong>{" "}
            यासाठी PrintShubh कोणत्याही प्रकारे जबाबदार नाही. अशा स्थितीत आम्ही
            तुम्हाला कळवतो आणि परतावा धोरणानुसार सेवा शुल्क परत करू शकतो.
          </p>
        </LegalSection>

        <LegalSection heading="६. कायदेशीर सल्ला नाही">
          <p>
            PrintShubh कोणताही <strong>कायदेशीर सल्ला, कर सल्ला, गुंतवणूक
            सल्ला, मालमत्ता मूल्यांकन सल्ला</strong> देत नाही. आमची माहिती सामान्य
            संदर्भासाठी आहे. कायदेशीर निर्णयांसाठी कृपया वकील, चार्टर्ड
            अकाउंटंट, सरकारी रजिस्ट्रार किंवा संबंधित professional सल्लागाराशी
            संपर्क साधा.
          </p>
        </LegalSection>

        <LegalSection heading="७. तृतीय-पक्ष लिंक्स">
          <p>
            वेबसाइटवर सरकारी पोर्टल किंवा इतर तृतीय-पक्ष वेबसाइटच्या लिंक्स असू
            शकतात. अशा वेबसाइटच्या content, accuracy किंवा privacy practices साठी
            PrintShubh जबाबदार नाही.
          </p>
        </LegalSection>

        <LegalSection heading="८. अनधिकृत वापर">
          <p>
            PrintShubh कडून मिळालेले PDF / अहवाल हे फसवणूक, बनावट कागदपत्र निर्मिती
            किंवा कायद्याच्या विरुद्ध कोणत्याही प्रकारच्या वापरासाठी वापरू नयेत.
            अशा वापरामुळे होणाऱ्या परिणामांसाठी फक्त वापरकर्ता जबाबदार आहे.
          </p>
        </LegalSection>
      </>
    );
  }

  /* English */
  return (
    <>
      {Banner}

      <LegalSection heading="1. PrintShubh is not a government body">
        <p>
          PrintShubh.shop is a <strong>private assistance service</strong>{" "}
          for Maharashtra. We are not a representative of the Bhumi Abhilekh
          Department, Revenue Department, IGR office, MahaRERA, any urban
          local body, or any other government office. We have no official
          affiliation with any government department.
        </p>
      </LegalSection>

      <LegalSection heading="2. Source of information">
        <p>
          The information we share is based entirely on what is already
          published on{" "}
          <strong>
            official public sources — Mahabhumi, Bhulekh, Bhuvan, iGR, ULB
            DP / TP publications, MahaRERA and similar government portals
          </strong>
          . We do <strong>not create, approve or modify</strong> any record.
        </p>
      </LegalSection>

      <LegalSection heading="3. Final verification on official portals is required">
        <p>
          Any 7/12, 8A, eFerfar (mutation), Property Card, village map or DP /
          TP map reference delivered by PrintShubh is{" "}
          <strong>for preliminary reference only</strong>. Before any legal
          transaction (sale, purchase, agreement, litigation, bank loan, NA
          permission, etc.) you must verify the final record at the{" "}
          <strong>
            relevant Tehsil office, official government portal or registration
            office
          </strong>
          .
        </p>
      </LegalSection>

      <LegalSection heading="4. Map / map-reference limitations">
        <LegalList
          items={[
            "Village boundaries and base layers shown on the site come from public GIS sources — they are not authoritative survey maps.",
            "Satellite / Hybrid / Terrain layers are provided by third parties such as Esri, OpenStreetMap and OpenTopoMap.",
            "Plot boundaries marked by the user on the map are for reference only — final measurement must be taken by the authorised land survey department.",
            "Areas (acre / guntha / sq.m) are approximate — the figures on the official 7/12 / survey map are what govern.",
          ]}
        />
      </LegalSection>

      <LegalSection heading="5. Issues on government portals">
        <p>
          PrintShubh is not responsible for{" "}
          <strong>
            downtime, server issues, incorrect entries, scheduled maintenance,
            policy changes or discontinued services
          </strong>{" "}
          on official government portals. In such situations we will inform
          you and may refund the service fee per the Refund Policy.
        </p>
      </LegalSection>

      <LegalSection heading="6. We do not provide legal or financial advice">
        <p>
          PrintShubh does not provide{" "}
          <strong>
            legal advice, tax advice, investment advice or property valuation
          </strong>
          . Our information is for general reference. For legal decisions
          please consult a lawyer, chartered accountant, sub-registrar or
          another qualified professional.
        </p>
      </LegalSection>

      <LegalSection heading="7. Third-party links">
        <p>
          The site may link to government portals and other third-party
          websites. PrintShubh is not responsible for the content, accuracy
          or privacy practices of those sites.
        </p>
      </LegalSection>

      <LegalSection heading="8. Unauthorised use">
        <p>
          PDFs / reports delivered by PrintShubh must not be used for fraud,
          forgery or any unlawful purpose. The user alone is responsible for
          any consequences of such misuse.
        </p>
      </LegalSection>
    </>
  );
}
