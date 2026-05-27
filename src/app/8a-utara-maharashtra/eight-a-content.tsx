"use client";

import {
  ServicePageShell,
  ServiceSection,
  ServiceList,
  ServiceFaq,
} from "@/components/service-page-shell";
import { useLang } from "@/components/language-context";

export const eightAFaqMr: Array<{ q: string; a: string }> = [
  {
    q: "8A उतारा म्हणजे काय?",
    a: "8A उतारा हा खातेदार-निहाय एकत्रित जमीन नोंद आहे. एका मालकाच्या नावावर गावात असलेल्या सर्व गटांची माहिती एका दस्तऐवजात दिसते — गट नंबर, क्षेत्रफळ, खाते नंबर आणि एकूण होल्डिंग.",
  },
  {
    q: "7/12 आणि 8A मध्ये नेमका फरक काय?",
    a: "7/12 एका विशिष्ट जमिनीसाठी (गट / सर्वे नंबर निहाय) असतो. 8A एका खातेदाराच्या सर्व जमिनींची एकत्रित यादी देतो. जमिनीचे एकूण होल्डिंग, सीलिंग कायद्याचा तपास, किंवा वारसाहक्क पडताळणीसाठी 8A आवश्यक.",
  },
  {
    q: "8A साठी कोणती माहिती लागते?",
    a: "जिल्हा, तालुका, गाव, खाते नंबर किंवा खातेदाराचे संपूर्ण नाव. खाते नंबर माहीत नसेल तर खातेदाराच्या नावाने शोध करता येतो — मात्र अचूकता कमी होऊ शकते.",
  },
  {
    q: "WhatsApp वर 8A PDF कशी मिळते?",
    a: "WhatsApp वर माहिती पाठवा, आम्ही अधिकृत स्रोतांवर तपासू, शुल्क सांगू, मंजुरीनंतर UPI पेमेंट घेऊ आणि PDF WhatsApp वर पाठवू. नोंद उपलब्ध नसल्यास परतावा.",
  },
  {
    q: "एकाच नावाचे दोन खातेदार असल्यास?",
    a: "गावात एकाच नावाचे अनेक खातेदार असू शकतात — वडिलांचे नाव किंवा खाते नंबर शेअर करा. अचूक मॅच नसल्यास आम्ही उपलब्ध option-list कळवतो, तुम्ही योग्य ती निवडता.",
  },
  {
    q: "8A सरकारी कारणासाठी वैध आहे का?",
    a: "Mahabhumi पोर्टलवरून मिळवलेला डिजिटल 8A अनेक उपयोगांसाठी वैध असतो, पण काही कायदेशीर वापरांसाठी तहसील कार्यालयाची सही-शिक्का असलेली प्रत मागितली जाऊ शकते. ती गरज पडल्यास आम्ही पुढील पाऊल कळवतो.",
  },
];

const eightAFaqEn: Array<{ q: string; a: string }> = [
  {
    q: "What is an 8A extract?",
    a: "The 8A extract is an account-holder-wise consolidated land record. It shows every Gut held under one owner's name in a village in one document — Gut numbers, areas, account number and total holding.",
  },
  {
    q: "What is the exact difference between 7/12 and 8A?",
    a: "7/12 is land-parcel-wise (per Gut / Survey number). 8A is owner-wise — a roll-up of every land parcel a single account holder owns in that village. 8A is essential for ceiling-law checks, total-holding analysis and inheritance verification.",
  },
  {
    q: "What details are needed for 8A?",
    a: "District, taluka, village and either the account number or the account holder's full name. If the account number is unknown a name search is possible — though name spelling can affect accuracy.",
  },
  {
    q: "How is 8A delivered on WhatsApp?",
    a: "Share details on WhatsApp; we check official sources, quote a fee, take UPI payment on your approval, and send the PDF. If the record is unavailable the refund policy applies.",
  },
  {
    q: "What if two account holders share the same name?",
    a: "Many villages have repeating names — share the father's name or the account number. If no clean match, we send a candidate list and you pick the right one.",
  },
  {
    q: "Is the 8A valid for government use?",
    a: "Digital 8A from Mahabhumi is valid for many uses. Some legal contexts may still require a Tehsil-stamped copy; if that's needed we guide you to the next step.",
  },
];

export function EightAContent() {
  const { lang } = useLang();

  return (
    <ServicePageShell
      slug="8a-utara-maharashtra"
      eyebrow={{ mr: "महाराष्ट्र जमीन सेवा", en: "Maharashtra Land Service" }}
      title={{
        mr: "8A उतारा महाराष्ट्र — खातेदार-निहाय जमीन नोंद",
        en: "8A Extract Maharashtra — Account-Holder Land Record",
      }}
      breadcrumb={{ mr: "8A उतारा", en: "8A Extract" }}
      intro={{
        mr: "एका खातेदाराच्या नावावर गावात असलेल्या सर्व जमिनींची एकत्रित यादी — 8A. जिल्हा, तालुका, गाव आणि खाते नंबर पाठवा, PDF WhatsApp वर मिळवा.",
        en: "A consolidated list of every land parcel under one account holder's name in a village — that's 8A. Share district, taluka, village and account number; receive the PDF on WhatsApp.",
      }}
      updatedAt={lang === "mr" ? "मे २०२६" : "May 2026"}
      whatsappMessage={{
        mr: "नमस्कार, मला 8A उताऱ्यासाठी मदत हवी आहे.\nजिल्हा:\nतालुका:\nगाव:\nखातेदाराचे नाव / खाते नंबर:",
        en: "Hello, I need help with an 8A extract.\nDistrict:\nTaluka:\nVillage:\nAccount holder name / number:",
      }}
      contentMr={<BodyMr />}
      contentEn={<BodyEn faqPairs={eightAFaqEn} />}
    />
  );
}

function BodyMr() {
  return (
    <>
      <ServiceSection heading="सेवा म्हणजे काय?">
        <p>
          <strong>8A उतारा</strong> हा महाराष्ट्र महसूल विभागाचा{" "}
          <em>खातेदार-निहाय</em> जमीन दस्तऐवज आहे. एका मालकाच्या नावावर गावात
          असलेल्या <strong>सर्व गटांची एकत्रित यादी</strong> या एका कागदावर
          मिळते — गट नंबर, क्षेत्रफळ, खाते नंबर आणि एकूण होल्डिंग.
        </p>
        <p>
          PrintShubh ही खाजगी सहाय्य सेवा आहे — आम्ही{" "}
          <strong>Mahabhumi व अधिकृत सार्वजनिक स्रोतांवर</strong> उपलब्ध 8A
          नोंद शोधून PDF स्वरूपात WhatsApp वर पाठवतो. कोणतीही नोंद आम्ही
          “तयार” किंवा “मंजूर” करत नाही.
        </p>
      </ServiceSection>

      <ServiceSection heading="कोणाला उपयोगी?">
        <ServiceList
          items={[
            "एकूण जमीन होल्डिंग तपासायचे असलेले शेतकरी आणि वारसदार.",
            "जमीन सीलिंग कायद्याअंतर्गत पात्रता तपासणारे मालक.",
            "बँक कर्ज, गहाण किंवा कृषी कर्ज प्रकरणासाठी सर्व जमिनींची एकत्र नोंद हवी असणारे.",
            "वारसा / हिस्सा / कौटुंबिक वाटप प्रक्रियेत असणारे.",
            "उत्तराधिकारी प्रमाणपत्र, सक्सेशन सर्टिफिकेट किंवा कोर्ट प्रकरण असणारे.",
            "करयोग्य जमीन तपासणारे CA / सल्लागार.",
          ]}
        />
      </ServiceSection>

      <ServiceSection heading="कोणती माहिती लागते?">
        <ServiceList
          items={[
            "जिल्हा, तालुका आणि गाव.",
            "खातेदाराचे संपूर्ण नाव (शक्यतो वडिलांच्या नावासह).",
            "खाते नंबर — माहीत असल्यास सर्वोत्तम; नसल्यास नावाने शोध शक्य.",
            "(पर्यायी) एखाद्या ज्ञात गट नंबरचा संदर्भ — पडताळणीसाठी उपयोगी.",
          ]}
        />
      </ServiceSection>

      <ServiceSection heading="WhatsApp वर प्रक्रिया कशी होते?">
        <ServiceList
          items={[
            "तुम्ही WhatsApp वर जिल्हा, तालुका, गाव आणि खाते नंबर / खातेदाराचे नाव शेअर करता.",
            "PrintShubh टीम Mahabhumi वर उपलब्धता तपासते आणि शुल्क सांगते.",
            "तुमच्या मंजुरीनंतर UPI द्वारे पेमेंट घेतले जाते.",
            "8A ची PDF WhatsApp वर पाठवली जाते — सहसा त्याच दिवशी.",
            "नोंद उपलब्ध नसल्यास परतावा धोरणानुसार रक्कम परत.",
          ]}
        />
      </ServiceSection>

      <ServiceSection heading="PDF / दस्तऐवज सहाय्य">
        <p>
          8A च्या PDF मध्ये खातेदाराच्या नावावर असलेल्या सर्व जमिनींची यादी,
          प्रत्येक गटाचे क्षेत्रफळ, आणि एकूण होल्डिंग दिसते. कागदी प्रिंटसाठी
          A4 आकारात योग्य. आम्ही आवश्यकता असल्यास printer-friendly स्वरूपात
          देऊ शकतो.
        </p>
      </ServiceSection>

      <ServiceSection heading="महत्त्वाच्या सूचना">
        <ServiceList
          items={[
            "8A गावनिहाय असतो — एका खातेदाराच्या वेगवेगळ्या गावांतील जमिनींसाठी प्रत्येक गावाचा वेगळा 8A लागतो.",
            "खातेदाराचे नाव चुकीचे स्पेलिंग असल्यास नोंद सापडत नाही — स्थानिक उच्चार लक्षात ठेवा.",
            "वारस नोंद अपूर्ण असल्यास 8A वर मूळ मालकाचेच नाव दिसू शकते — फेरफार प्रक्रिया तपासा.",
            "एका गटावर अनेक खातेदार असल्यास, प्रत्येक मालकाच्या 8A वर हिस्सा-नोंद वेगळी दिसते.",
          ]}
        />
      </ServiceSection>

      <ServiceSection heading="PrintShubh सरकारी वेबसाइट नाही">
        <p>
          <strong>
            PrintShubh हे सरकारी संकेतस्थळ नाही. आम्ही अधिकृत स्रोतांवर आधारित
            खाजगी सहाय्य सेवा प्रदान करतो.
          </strong>{" "}
          अंतिम पडताळणी संबंधित तहसील कार्यालय किंवा Mahabhumi पोर्टलवरून
          करावी.
        </p>
      </ServiceSection>

      <ServiceSection heading="वारंवार विचारले जाणारे प्रश्न">
        <ServiceFaq pairs={eightAFaqMr} />
      </ServiceSection>
    </>
  );
}

function BodyEn({ faqPairs }: { faqPairs: Array<{ q: string; a: string }> }) {
  return (
    <>
      <ServiceSection heading="What is this service?">
        <p>
          The <strong>8A extract</strong> is Maharashtra's{" "}
          <em>account-holder-wise</em> land record. It consolidates{" "}
          <strong>every Gut held by one owner</strong> in a village into one
          document — Gut numbers, areas, account number and total holding.
        </p>
        <p>
          PrintShubh is a private assistance service. We retrieve the publicly
          available 8A record from <strong>Mahabhumi and other official
          sources</strong> and deliver a PDF on WhatsApp. We do not issue or
          approve any record.
        </p>
      </ServiceSection>

      <ServiceSection heading="Who can use this?">
        <ServiceList
          items={[
            "Farmers and heirs needing to verify total land holding.",
            "Owners checking eligibility under land ceiling laws.",
            "Bank loan / mortgage / agri-credit applicants needing consolidated holdings.",
            "Families in the middle of inheritance or partition.",
            "Anyone preparing a succession certificate or court submission.",
            "CAs and advisors verifying taxable agricultural holdings.",
          ]}
        />
      </ServiceSection>

      <ServiceSection heading="What details are needed?">
        <ServiceList
          items={[
            "District, taluka and village.",
            "Account holder's full name (preferably with father's name).",
            "Account number — best when known; name search possible without it.",
            "(Optional) A known Gut number for cross-verification.",
          ]}
        />
      </ServiceSection>

      <ServiceSection heading="How does WhatsApp delivery work?">
        <ServiceList
          items={[
            "Share district, taluka, village and account number / holder name on WhatsApp.",
            "We check Mahabhumi availability and quote a fee.",
            "Once approved, UPI payment is taken.",
            "The 8A PDF is delivered on WhatsApp, usually the same day.",
            "If unretrievable, the refund policy applies.",
          ]}
        />
      </ServiceSection>

      <ServiceSection heading="PDF / document assistance">
        <p>
          The 8A PDF lists every land parcel under that account holder, each
          parcel's area, and the total holding. Print-friendly A4 output; on
          request we tidy formatting before sending.
        </p>
      </ServiceSection>

      <ServiceSection heading="Important notes">
        <ServiceList
          items={[
            "8A is per-village — separate 8A is needed per village for a single holder with land in many villages.",
            "A misspelt name fails the search — keep the local pronunciation in mind.",
            "If a mutation is pending, the 8A may still show the previous owner's name — see E-Ferfar.",
            "When a Gut has multiple owners, each holder's 8A shows their separate share.",
          ]}
        />
      </ServiceSection>

      <ServiceSection heading="PrintShubh is not a government website">
        <p>
          <strong>
            PrintShubh is not a government website. We provide private
            assistance based on official public sources.
          </strong>{" "}
          For final verification use the Tehsil office or the Mahabhumi
          portal.
        </p>
      </ServiceSection>

      <ServiceSection heading="Frequently asked questions">
        <ServiceFaq pairs={faqPairs} />
      </ServiceSection>
    </>
  );
}
