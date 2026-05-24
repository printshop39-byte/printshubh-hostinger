"use client";

import {
  LegalList,
  LegalPageShell,
  LegalSection,
} from "@/components/legal-page-shell";
import { useLang, type Lang } from "@/components/language-context";

export function PrivacyContent() {
  const { lang } = useLang();
  return (
    <LegalPageShell
      title={{ mr: "गोपनीयता धोरण", en: "Privacy Policy" }}
      breadcrumb={{ mr: "गोपनीयता धोरण", en: "Privacy" }}
      intro={{
        mr: "PrintShubh आपल्या वैयक्तिक माहितीची काळजी घेतो. आम्ही कोणती माहिती गोळा करतो, ती कशी वापरतो आणि कशी सुरक्षित ठेवतो हे या धोरणात स्पष्ट केले आहे.",
        en: "PrintShubh respects your privacy. This policy explains what information we collect, how it is used, and how it is protected.",
      }}
      updatedAt="May 2026"
      contentMr={<PrivacyBody lang="mr" />}
      contentEn={<PrivacyBody lang="en" />}
    />
  );
}

function PrivacyBody({ lang }: { lang: Lang }) {
  if (lang === "mr") {
    return (
      <>
        <LegalSection heading="१. आम्ही कोणती माहिती गोळा करतो">
          <p>
            सेवा पुरवण्यासाठी आम्ही खालील माहिती गोळा करू शकतो —
          </p>
          <LegalList
            items={[
              "नाव (तुम्ही पुरवल्यास)",
              "फोन नंबर / WhatsApp नंबर — सेवेसाठी संपर्क करण्यासाठी",
              "जिल्हा, तालुका, गाव — सेवा विनंतीसाठी",
              "गट नंबर / सर्वे नंबर / CTS नंबर / खाता नंबर / फेरफार नंबर — कागदपत्र शोधण्यासाठी",
              "WhatsApp वर पाठवलेले संदेश व कागदपत्रांचे फोटो (तुम्ही पाठवल्यास)",
              "पेमेंट संदर्भ — UPI ID, transaction ID (पेमेंट pavti साठी)",
              "वेबसाइट वापराची तांत्रिक माहिती — IP address, browser, सर्वसामान्य analytics",
            ]}
          />
        </LegalSection>

        <LegalSection heading="२. माहितीचा वापर">
          <LegalList
            items={[
              "तुम्ही विनंती केलेली सेवा पुरवण्यासाठी.",
              "WhatsApp / फोन / ईमेलद्वारे सेवेसंबंधी संवादासाठी.",
              "पेमेंट पडताळणी आणि pavti जारी करण्यासाठी.",
              "सेवेची गुणवत्ता सुधारण्यासाठी अंतर्गत वापर.",
              "कायदेशीर अटी पूर्ण करण्यासाठी (आवश्यक असल्यास).",
            ]}
          />
          <p>
            <strong>आम्ही तुमची माहिती कधीही विकत नाही</strong> — कोणत्याही
            third-party advertiser, marketer किंवा डेटा brokerला नाही.
          </p>
        </LegalSection>

        <LegalSection heading="३. WhatsApp संवाद">
          <p>
            तुम्ही PrintShubh ला WhatsApp वर संपर्क केल्यास, तुमचा फोन नंबर,
            संदेश आणि पाठवलेले PDF / फोटो आमच्या सेवा-संदर्भात save केले जाऊ
            शकतात — हे फक्त सेवा पुरवणी, support आणि follow-up साठी असते. WhatsApp
            संवाद हा Meta-WhatsApp च्या स्वतःच्या गोपनीयता धोरणाने सुरक्षित आहे.
          </p>
        </LegalSection>

        <LegalSection heading="४. संवेदनशील माहिती न देण्याची विनंती">
          <p>
            कृपया आम्हाला <strong>आधार कार्ड, PAN, बँक खाते, OTP, पासवर्ड किंवा
            इतर अतिसंवेदनशील ओळख माहिती</strong> WhatsApp / फॉर्म / ईमेल कुठेही
            पाठवू नका — आमच्या सेवेसाठी ही माहिती आवश्यक नाही. कोणी अशी माहिती
            मागितल्यास ती फसवणूक असू शकते.
          </p>
        </LegalSection>

        <LegalSection heading="५. माहिती किती काळ ठेवली जाते">
          <p>
            सेवा पूर्ण झाल्यानंतर साधारणपणे <strong>१८ महिन्यांपर्यंत</strong>{" "}
            संदर्भासाठी माहिती ठेवली जाते (पेमेंट / सहाय्य / dispute resolution
            साठी). नंतर वैयक्तिक संदर्भ माहिती सुरक्षितपणे delete केली जाते.
            कायदेशीर बंधन असल्यास हा कालावधी बदलू शकतो.
          </p>
        </LegalSection>

        <LegalSection heading="६. तुमचे हक्क">
          <LegalList
            items={[
              "तुमची माहिती बघण्याची विनंती करण्याचा हक्क.",
              "चुकीची माहिती दुरुस्त करण्याची विनंती करण्याचा हक्क.",
              "वैयक्तिक संदर्भ माहिती delete करण्याची विनंती करण्याचा हक्क (कायदेशीर बंधन नसल्यास).",
              "WhatsApp marketing / non-essential संदेशांना थांबवण्याचा हक्क.",
            ]}
          />
          <p>
            या हक्कांसाठी कृपया <a className="font-bold text-blue-700 hover:underline" href="mailto:support@printshubh.shop">support@printshubh.shop</a> वर ईमेल करा.
          </p>
        </LegalSection>

        <LegalSection heading="७. कुकीज व analytics">
          <p>
            वेबसाइट सुधारण्यासाठी सर्वसामान्य analytics (पान भेटी, device प्रकार)
            वापरले जातात. वैयक्तिक ओळख न होणारी ही माहिती असते. तुम्ही तुमच्या
            browser सेटिंगमधून cookies disable करू शकता — परंतु काही फीचर्स
            योग्य काम करणार नाहीत.
          </p>
        </LegalSection>

        <LegalSection heading="८. धोरणातील बदल">
          <p>
            आम्ही या धोरणामध्ये कधीही बदल करू शकतो. महत्त्वाचे बदल वेबसाइटवर
            प्रकाशित केले जातील. वेबसाइट वापरणे चालू ठेवल्यास नवीन धोरण मान्य
            आहे असे समजले जाईल.
          </p>
        </LegalSection>
      </>
    );
  }

  /* English */
  return (
    <>
      <LegalSection heading="1. Information we collect">
        <p>To provide our service we may collect the following:</p>
        <LegalList
          items={[
            "Name (if you provide it)",
            "Phone / WhatsApp number — for service contact",
            "District, taluka, village — for the service request",
            "Gut / survey / CTS / khata / ferfar number — for document lookup",
            "WhatsApp messages and any document photos you send us",
            "Payment references — UPI ID, transaction ID (for receipts)",
            "Standard website analytics — IP address, browser, basic usage data",
          ]}
        />
      </LegalSection>

      <LegalSection heading="2. How we use it">
        <LegalList
          items={[
            "To provide the service you requested.",
            "For service-related communication on WhatsApp / phone / email.",
            "To verify payments and issue receipts.",
            "Internally, to improve service quality.",
            "To meet legal obligations where required.",
          ]}
        />
        <p>
          <strong>We do not sell your data</strong> — not to advertisers, not
          to marketers, not to data brokers.
        </p>
      </LegalSection>

      <LegalSection heading="3. WhatsApp communication">
        <p>
          If you contact PrintShubh on WhatsApp, your phone number, messages
          and any PDFs / photos you send may be stored alongside the service
          request — only for delivery, support and follow-up. WhatsApp
          conversation itself is protected by Meta&apos;s own privacy policy.
        </p>
      </LegalSection>

      <LegalSection heading="4. Please do not share sensitive information">
        <p>
          Please do not send us your{" "}
          <strong>
            Aadhaar, PAN, bank account, OTP, passwords or other highly
            sensitive identity information
          </strong>{" "}
          on WhatsApp, the form, email or anywhere — our service does not
          need them. Anyone asking for such information may be impersonating
          PrintShubh.
        </p>
      </LegalSection>

      <LegalSection heading="5. Retention">
        <p>
          We typically retain service-related information for about{" "}
          <strong>18 months</strong> after completion (for receipts,
          follow-up and dispute resolution). After that, personally
          identifying records are securely deleted, unless a legal obligation
          requires a different period.
        </p>
      </LegalSection>

      <LegalSection heading="6. Your rights">
        <LegalList
          items={[
            "Right to ask what information we hold about you.",
            "Right to ask us to correct inaccurate information.",
            "Right to ask us to delete your personal references (unless a legal hold applies).",
            "Right to opt out of marketing / non-essential WhatsApp messages.",
          ]}
        />
        <p>
          To exercise any of these, please email{" "}
          <a
            className="font-bold text-blue-700 hover:underline"
            href="mailto:support@printshubh.shop"
          >
            support@printshubh.shop
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection heading="7. Cookies and analytics">
        <p>
          We use standard analytics (page visits, device type) to improve the
          site. This data is not personally identifying. You can disable
          cookies in your browser settings, but some features may not work
          correctly afterwards.
        </p>
      </LegalSection>

      <LegalSection heading="8. Changes to this policy">
        <p>
          We may update this policy from time to time. Material changes will
          be posted on the website. Continued use of the site is treated as
          acceptance of the updated policy.
        </p>
      </LegalSection>
    </>
  );
}
