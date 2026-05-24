"use client";

import {
  LegalList,
  LegalPageShell,
  LegalSection,
} from "@/components/legal-page-shell";
import { useLang, type Lang } from "@/components/language-context";

export function TermsContent() {
  const { lang } = useLang();
  return (
    <LegalPageShell
      title={{ mr: "अटी व शर्ती", en: "Terms & Conditions" }}
      breadcrumb={{ mr: "अटी व शर्ती", en: "Terms" }}
      intro={{
        mr: "PrintShubh.shop वापरून तुम्ही खाली नमूद केलेल्या अटी व शर्तींना सहमती देता. कृपया सेवा वापरण्यापूर्वी काळजीपूर्वक वाचा.",
        en: "By using PrintShubh.shop you agree to the terms below. Please read them carefully before using our services.",
      }}
      updatedAt="May 2026"
      contentMr={<TermsBody lang="mr" />}
      contentEn={<TermsBody lang="en" />}
    />
  );
}

function TermsBody({ lang }: { lang: Lang }) {
  if (lang === "mr") {
    return (
      <>
        <LegalSection heading="१. सेवेचे स्वरूप">
          <p>
            PrintShubh ही एक खाजगी कागदपत्र सहाय्य सेवा आहे. आम्ही जमीन कागदपत्र,
            नकाशे आणि महसूल नोंदींबाबत अधिकृत सार्वजनिक स्रोतांवर उपलब्ध माहितीचा
            संदर्भ शोधून, व्यवस्थित स्वरूपात तुम्हाला पुरवतो.
          </p>
          <p>
            <strong>आम्ही सरकारी विभाग नाही.</strong> PrintShubh कोणतीही सरकारी
            संस्था, तहसील कार्यालय, भूमि अभिलेख विभाग किंवा महसूल कार्यालयाचा
            अधिकृत प्रतिनिधी नाही. आमची सेवा फक्त मार्गदर्शन व सहाय्य पुरवते.
          </p>
        </LegalSection>

        <LegalSection heading="२. अंतिम नोंदींची पडताळणी">
          <p>
            PrintShubh कडून मिळालेले 7/12, 8A, फेरफार, मिळकत पत्रिका, गाव नकाशा
            किंवा कोणतेही अन्य कागदपत्र हे प्राथमिक संदर्भासाठी आहेत. कोणत्याही
            कायदेशीर वापरापूर्वी अंतिम नोंदी{" "}
            <strong>
              अधिकृत सरकारी पोर्टल — Mahabhumi, Bhulekh, iGR, MahaRERA, संबंधित
              तहसील कार्यालय
            </strong>{" "}
            — यावरून पडताळून पाहणे वापरकर्त्याची जबाबदारी आहे.
          </p>
        </LegalSection>

        <LegalSection heading="३. सेवा उपलब्धता">
          <LegalList
            items={[
              "सेवा उपलब्धता ही अधिकृत सरकारी पोर्टलच्या स्थितीवर अवलंबून आहे. पोर्टल downtime, server समस्या किंवा डेटा maintenance यामुळे काही नोंदी मिळू शकत नाहीत.",
              "वापरकर्त्याने पुरवलेली माहिती (जिल्हा, तालुका, गाव, गट / सर्वे / CTS नंबर) अचूक असणे आवश्यक आहे. चुकीच्या माहितीमुळे चुकीचा अहवाल मिळाल्यास PrintShubh जबाबदार नाही.",
              "काही गावे, शहरी भाग किंवा जुन्या नोंदी डिजिटल स्वरूपात उपलब्ध नसू शकतात — अशा प्रकरणी आम्ही नकार देऊ शकतो आणि परतावा प्रक्रिया सुरू करतो.",
            ]}
          />
        </LegalSection>

        <LegalSection heading="४. पेमेंट व शुल्क">
          <LegalList
            items={[
              "प्रत्येक सेवेसाठी शुल्क पेमेंटपूर्वी WhatsApp वर सांगितले जाते.",
              "पेमेंट UPI / बँक हस्तांतरण / WhatsApp द्वारे स्वीकारले जाते.",
              "शुल्क हे माहिती शोध, processing, आणि सहाय्य खर्चासाठी आहे — कोणत्याही सरकारी मंजुरीसाठी नाही.",
              "एकदा सेवा सुरू झाल्यानंतर शुल्क परतावा हा परतावा धोरणाप्रमाणे ठरतो.",
            ]}
          />
        </LegalSection>

        <LegalSection heading="५. कोणतीही हमी नाही">
          <p>
            PrintShubh कोणत्याही सरकारी मंजुरी, दुरुस्ती, फेरफार नोंद, मालकी
            बदलाची किंवा कागदपत्र प्रक्रियेच्या अंतिम मंजुरीची हमी देत नाही. आम्ही
            केवळ माहिती शोधण्यात, समजावून सांगण्यात आणि कागदपत्र प्रक्रियेच्या
            मार्गदर्शनात सहाय्य करतो. अंतिम मंजुरी ही संबंधित सरकारी विभागाच्या
            निर्णयावर अवलंबून आहे.
          </p>
        </LegalSection>

        <LegalSection heading="६. वापरकर्त्याची जबाबदारी">
          <LegalList
            items={[
              "खरी, अचूक आणि कायदेशीर माहितीच पुरवावी.",
              "WhatsApp किंवा इतर माध्यमातून मिळालेले PDF / अहवाल कायदेशीर पडताळणीसाठी अधिकृत पोर्टलवर तपासावेत.",
              "PrintShubh कडून मिळालेले कागदपत्र पुनर्विक्री किंवा फसवणुकीसाठी वापरू नये.",
              "तुमची माहिती (खाता नंबर, पैसे, ओळखपत्र) तृतीय व्यक्तीशी शेअर करू नये.",
            ]}
          />
        </LegalSection>

        <LegalSection heading="७. दायित्व मर्यादा">
          <p>
            अधिकृत पोर्टलवरील चुकीच्या नोंदी, downtime, server समस्या, चुकीचा
            डेटा, किंवा कोणत्याही तृतीय पक्षाच्या कृतीमुळे होणाऱ्या नुकसानीसाठी
            PrintShubh जबाबदार नाही. आमचे जास्तीत जास्त दायित्व हे संबंधित सेवेसाठी
            तुमच्याकडून घेतलेल्या शुल्कापुरते मर्यादित आहे.
          </p>
        </LegalSection>

        <LegalSection heading="८. अटींमध्ये बदल">
          <p>
            PrintShubh या अटी कधीही बदलू शकते. महत्त्वाचे बदल वेबसाइटवर प्रकाशित
            केले जातील. सेवा वापरणे चालू ठेवल्यास नवीन अटी मान्य आहेत असे समजले
            जाईल.
          </p>
        </LegalSection>

        <LegalSection heading="९. लागू कायदा">
          <p>
            या अटी भारतीय कायद्याच्या अधीन आहेत. कोणताही वाद महाराष्ट्र राज्यातील
            संबंधित न्यायालयाच्या अधिकारक्षेत्रात येईल.
          </p>
        </LegalSection>
      </>
    );
  }

  /* English */
  return (
    <>
      <LegalSection heading="1. Nature of the service">
        <p>
          PrintShubh is a private document-assistance service. We help users
          look up land records, maps and revenue entries by referencing
          information already published on official public sources, and we
          deliver that information in a clear, usable form.
        </p>
        <p>
          <strong>We are not a government department.</strong> PrintShubh is
          not a government body, Tehsil office, Bhumi Abhilekh department or
          an authorised representative of any revenue office. Our service is
          guidance and assistance only.
        </p>
      </LegalSection>

      <LegalSection heading="2. Verification of final records">
        <p>
          Any 7/12, 8A, eFerfar (mutation), Property Card, village map or
          other document delivered by PrintShubh is for preliminary reference
          only. Before any legal use, the user must verify the final record
          on the{" "}
          <strong>
            official government portal — Mahabhumi, Bhulekh, iGR, MahaRERA,
            or the relevant Tehsil office
          </strong>
          .
        </p>
      </LegalSection>

      <LegalSection heading="3. Service availability">
        <LegalList
          items={[
            "Availability depends on the status of the official government portals. Downtime, server problems or data maintenance on those portals can prevent us from delivering certain records.",
            "Information supplied by the user (district, taluka, village, gut / survey / CTS number) must be accurate. If incorrect input produces an incorrect report, PrintShubh is not liable.",
            "Some villages, urban areas or older entries may not be digitised — in such cases we may decline and start a refund.",
          ]}
        />
      </LegalSection>

      <LegalSection heading="4. Payment and fees">
        <LegalList
          items={[
            "Fees for each service are confirmed on WhatsApp before payment.",
            "Payments are accepted via UPI / bank transfer / WhatsApp.",
            "Fees cover the cost of lookup, processing and assistance — they are not a charge for any government approval.",
            "Once a service has been started, refunds are governed by our Refund Policy.",
          ]}
        />
      </LegalSection>

      <LegalSection heading="5. No guarantee of approval">
        <p>
          PrintShubh does not guarantee any government approval, correction,
          mutation entry, change of ownership, or final clearance of a
          document workflow. We only help with lookup, explanation and
          guidance. Final approval depends on the decision of the relevant
          government department.
        </p>
      </LegalSection>

      <LegalSection heading="6. User responsibilities">
        <LegalList
          items={[
            "Provide truthful, accurate and lawful information only.",
            "Cross-check PDFs / reports received on WhatsApp against the official portal before any legal use.",
            "Do not use documents received from PrintShubh for resale or fraudulent purposes.",
            "Do not share sensitive information (account numbers, money, ID proofs) with third parties.",
          ]}
        />
      </LegalSection>

      <LegalSection heading="7. Limitation of liability">
        <p>
          PrintShubh is not responsible for losses caused by incorrect
          entries on official portals, downtime, server issues, third-party
          actions or stale data. Our maximum liability is limited to the
          service fee actually paid by the user for the specific service in
          question.
        </p>
      </LegalSection>

      <LegalSection heading="8. Changes to these terms">
        <p>
          PrintShubh may update these terms at any time. Significant changes
          will be posted on the website. Continued use of the service is
          treated as acceptance of the updated terms.
        </p>
      </LegalSection>

      <LegalSection heading="9. Governing law">
        <p>
          These terms are governed by Indian law. Any dispute is subject to
          the exclusive jurisdiction of the competent courts in Maharashtra,
          India.
        </p>
      </LegalSection>
    </>
  );
}
