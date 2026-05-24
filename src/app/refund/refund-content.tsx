"use client";

import { MessageCircle, Phone } from "lucide-react";
import {
  LegalList,
  LegalPageShell,
  LegalSection,
} from "@/components/legal-page-shell";
import { useLang, type Lang } from "@/components/language-context";
import { SITE_CONTACT } from "@/components/site-footer";

export function RefundContent() {
  const { lang } = useLang();
  return (
    <LegalPageShell
      title={{ mr: "परतावा धोरण", en: "Refund Policy" }}
      breadcrumb={{ mr: "परतावा धोरण", en: "Refund" }}
      intro={{
        mr: "PrintShubh वर पेमेंट केल्यानंतर परतावा कधी मिळतो, कधी नाही आणि अडचण आल्यास काय करावे — हे सोप्या भाषेत.",
        en: "When refunds are issued, when they are not, and how to request help if something goes wrong with a payment.",
      }}
      updatedAt="May 2026"
      contentMr={<RefundBody lang="mr" />}
      contentEn={<RefundBody lang="en" />}
    />
  );
}

function RefundBody({ lang }: { lang: Lang }) {
  /** WhatsApp deep-link with a pre-filled refund-support message. */
  const waMsg =
    lang === "mr"
      ? "नमस्कार PrintShubh, मला परतावा / पेमेंट संदर्भात मदत हवी आहे."
      : "Hello PrintShubh, I need help with a refund / payment issue.";
  const waHref = `https://wa.me/${SITE_CONTACT.whatsapp}?text=${encodeURIComponent(
    waMsg,
  )}`;

  const ContactCta = (
    <div className="my-6 grid gap-3 rounded-xl border border-green-200 bg-green-50 p-4 sm:grid-cols-2">
      <a
        href={waHref}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-green-600 text-sm font-black text-white shadow-sm transition hover:bg-green-700"
      >
        <MessageCircle className="size-4" />
        {lang === "mr" ? "WhatsApp वर बोला" : "Chat on WhatsApp"}
      </a>
      <a
        href={`tel:${SITE_CONTACT.phoneTel}`}
        className="inline-flex h-12 items-center justify-center gap-2 rounded-md border-2 border-green-600 bg-white text-sm font-black text-green-800 transition hover:bg-green-100"
      >
        <Phone className="size-4" />
        {SITE_CONTACT.phone}
      </a>
    </div>
  );

  if (lang === "mr") {
    return (
      <>
        <LegalSection heading="१. परतावा कधी मिळू शकतो">
          <LegalList
            items={[
              "तुमचे पेमेंट यशस्वी झाले पण काम अद्याप सुरू झालेले नाही.",
              "अधिकृत पोर्टलवर नोंद उपलब्ध नसल्यामुळे सेवा पूर्ण करता आली नाही.",
              "सरकारी पोर्टल downtime / डेटा maintenance मुळे काम बराच काळ रखडले आहे.",
              "तांत्रिक चुकीमुळे एकाच सेवेसाठी दुहेरी (duplicate) पेमेंट झाले आहे.",
            ]}
          />
        </LegalSection>

        <LegalSection heading="२. परतावा कधी मिळणार नाही">
          <LegalList
            items={[
              "एकदा कागदपत्र शोध / download / processing / सहाय्य पूर्ण झाल्यानंतर परतावा सहसा मिळणार नाही.",
              "वापरकर्त्याने पुरवलेली माहिती (जिल्हा, तालुका, गाव, गट / सर्वे / CTS नंबर) चुकीची असल्यामुळे चुकीचा अहवाल मिळाला असेल — परतावा मिळणार नाही, पण योग्य माहितीने पुन्हा शोध केला जाऊ शकतो.",
              "अहवाल / PDF आधीच WhatsApp वर पाठवला गेला असेल.",
              "तुम्ही WhatsApp वर सेवा confirm केल्यानंतर मनःस्थिती बदलल्यामुळे (change of mind) काम थांबवण्यास सांगितले असेल.",
            ]}
          />
        </LegalSection>

        <LegalSection heading="३. परतावा कसा मागायचा">
          <LegalList
            items={[
              "पेमेंटनंतर ७२ तासांच्या आत समस्या नोंदवावी.",
              "WhatsApp वर पेमेंट screenshot, सेवा request ID (असल्यास), आणि अडचण थोडक्यात सांगा.",
              "आम्ही ४८ कामकाजी तासांत प्रतिसाद देतो.",
              "परतावा मंजूर झाल्यास तीच UPI / बँक account वर ५-७ कामकाजी दिवसांत रक्कम परत केली जाते.",
            ]}
          />
        </LegalSection>

        {ContactCta}

        <LegalSection heading="४. पेमेंट कापले गेले पण सेवा मिळाली नाही">
          <p>
            जर UPI / बँकेकडून पेमेंट कापले गेले पण PrintShubh कडून कोणतीही पावती,
            confirmation किंवा सेवा सुरू झाली नसेल — कृपया ताबडतोब WhatsApp वर
            screenshot सोबत संदेश पाठवा. आम्ही तुमचे पेमेंट UPI / बँकेकडून तपासू
            आणि failed transaction असल्यास UPI / बँक नियमांप्रमाणे रक्कम
            आपोआप परत होते (साधारणपणे ३-७ कामकाजी दिवस).
          </p>
        </LegalSection>

        <LegalSection heading="५. परतावा निर्णय">
          <p>
            प्रत्येक परतावा विनंतीचा{" "}
            <strong>स्वतंत्र case-by-case आधारावर</strong> विचार केला जातो. केलेले
            काम, खर्च झालेला वेळ, पुरवठा साखळी आणि वापरकर्त्याच्या बाजूने झालेली
            चूक यांचा विचार करून अंतिम निर्णय घेतला जातो. PrintShubh चा निर्णय
            अंतिम राहील.
          </p>
        </LegalSection>

        <LegalSection heading="६. सद्भावनेने काम">
          <p>
            PrintShubh वापरकर्त्याच्या समाधानाला महत्त्व देते. जर सेवा देणे शक्य
            नसेल किंवा खरी अडचण आली असेल तर आम्ही प्रामाणिकपणे परतावा देतो किंवा
            सेवा पूर्ण करण्याचा पर्याय देतो. कोणत्याही अडचणीसाठी आधी WhatsApp वर
            संपर्क साधा — आम्ही नेहमी मदत करण्याचा प्रयत्न करू.
          </p>
        </LegalSection>
      </>
    );
  }

  /* English */
  return (
    <>
      <LegalSection heading="1. When a refund may be issued">
        <LegalList
          items={[
            "Your payment was successful but work has not yet started.",
            "The record is not available on the official portal, so the service cannot be completed.",
            "Government portal downtime / data maintenance has held up the work for an extended period.",
            "A duplicate payment was made for the same service due to a technical glitch.",
          ]}
        />
      </LegalSection>

      <LegalSection heading="2. When a refund is not available">
        <LegalList
          items={[
            "Once the document search / download / processing / help has been completed, refunds are generally not available.",
            "If the user supplied incorrect information (district, taluka, village, gut / survey / CTS number) leading to an incorrect report — no refund, but we can re-run the search with corrected input.",
            "The report / PDF has already been delivered on WhatsApp.",
            "You confirmed the service on WhatsApp and then asked us to stop because of change of mind.",
          ]}
        />
      </LegalSection>

      <LegalSection heading="3. How to request a refund">
        <LegalList
          items={[
            "Raise the issue on WhatsApp within 72 hours of payment.",
            "Send the payment screenshot, your service request ID (if any), and a short description of the problem.",
            "We respond within 48 working hours.",
            "If approved, refunds are sent back to the same UPI / bank account within 5-7 working days.",
          ]}
        />
      </LegalSection>

      {ContactCta}

      <LegalSection heading="4. Payment deducted but no service received">
        <p>
          If your UPI / bank shows the payment deducted but PrintShubh has not
          confirmed or started the service, please send a screenshot on
          WhatsApp immediately. We will check the payment with the UPI /
          bank, and if it turns out to be a failed transaction the amount is
          automatically reversed under UPI / bank rules (usually within 3-7
          working days).
        </p>
      </LegalSection>

      <LegalSection heading="5. Refund decision">
        <p>
          Each refund request is reviewed on a{" "}
          <strong>case-by-case basis</strong>. Work performed, time spent,
          upstream sources used, and any error on the user&apos;s side are all
          considered. PrintShubh&apos;s decision is final.
        </p>
      </LegalSection>

      <LegalSection heading="6. Good-faith handling">
        <p>
          PrintShubh values customer satisfaction. If a service genuinely
          cannot be delivered, or you have a real concern, we will either
          refund honestly or offer to complete the service. Please reach out
          on WhatsApp first — we will try to help.
        </p>
      </LegalSection>
    </>
  );
}
