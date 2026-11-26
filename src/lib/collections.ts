/**
 * PRINTSHUBH – Premium Print & Visual Studio: the seven product collections.
 *
 * Single source of truth for /collections/<slug>/ — each route's page.tsx,
 * the homepage grid (components/shop/collections-grid.tsx), the header/
 * footer/mobile navigation and the search index all read from here, so a
 * collection's name or route can never drift between surfaces.
 *
 * NO PRICES LIVE HERE, ON PURPOSE (owner decision). Every collection is
 * enquiry/quote-only until real, confirmed pricing exists — see
 * ASK_PRICE / pricing-data.ts for the same rule already applied to the
 * land-document services. Do not add a `priceFrom` field and start
 * guessing figures.
 *
 * PHOTOS: no stock photos and no fabricated "this is our finished work"
 * samples (owner decision). Owner-made design images MAY be listed when the
 * collection sets `photosAreDesignPreviews: true`: the page then labels them
 * "Design examples" with an "AI-assisted design previews" note (owner decision
 * 2026-11-26, first used on Wall Paintings & Wall Art). Collections without
 * photos keep the typography-first visual (components/shop/collection-visual.tsx).
 */

import type { Lang } from "@/components/language-context";

export type CollectionKey =
  | "premium-wallpaper-printing"
  | "canvas-printing"
  | "wall-paintings-wall-art"
  | "rexine-pu-leatherette-printing"
  | "satin-fabric-printing"
  | "premium-framed-prints"
  | "premium-vinyl-printing";

/* Real photos of finished work, once they exist. Drop files in
 * /public/collections/<slug>/, list them on the matching Collection below,
 * and CollectionPageShell's gallery section appears automatically (see
 * hasCollectionPhotos()). Until then this stays empty on every entry. */
export interface CollectionPhoto {
  src: string;
  width: number;
  height: number;
  alt: Record<Lang, string>;
}

export interface Collection {
  key: CollectionKey;
  /** Route: /collections/<slug>/ */
  slug: string;
  title: Record<Lang, string>;
  /** Short name for nav/footer/grid cards where space is tight. */
  shortTitle: Record<Lang, string>;
  /** One-line hook shown under the title on the collection page and the grid card. */
  tagline: Record<Lang, string>;
  /** 2–3 sentence intro paragraph. */
  description: Record<Lang, string>;
  /** "Where this is used" — chips/bullets. */
  applications: Record<Lang, string>[];
  /** "What it's printed on / how it's finished" — factual material notes only. */
  materialInfo: Record<Lang, string>[];
  /** Material / Finish dropdown choices for the Stage-3 inline enquiry form —
   * owner-confirmed list per collection (see collections page spec). Do not
   * add or rename an option here without the same confirmation. */
  materialOptions: Record<Lang, string>[];
  photos: CollectionPhoto[];
  /** True when `photos` are design previews (owner-made, AI-assisted), not
   * photos of finished work: the page labels them as such. */
  photosAreDesignPreviews?: boolean;
  /** Pre-filled WhatsApp enquiry message for the main CTA. */
  whatsappMessage: Record<Lang, string>;
  /** Pre-filled WhatsApp message for the "custom size" CTA. */
  customSizeMessage: Record<Lang, string>;
}

export const COLLECTIONS: Collection[] = [
  {
    key: "premium-wallpaper-printing",
    slug: "premium-wallpaper-printing",
    title: { mr: "प्रीमियम वॉलपेपर प्रिंटिंग", en: "Premium Wallpaper Printing" },
    shortTitle: { mr: "वॉलपेपर प्रिंटिंग", en: "Wallpaper Printing" },
    tagline: {
      mr: "घर, ऑफिस किंवा दुकानासाठी सानुकूल डिझाइन वॉलपेपर.",
      en: "Custom-design wallpaper for homes, offices and shopfronts.",
    },
    description: {
      mr: "तुमची स्वतःची डिझाइन, फोटो किंवा पॅटर्न भिंतीच्या मापानुसार प्रिंट करून दिली जाते. Epson SureColor SC-S9130 च्या 11-रंगी तंत्रज्ञानाने बारीक तपशील आणि सौम्य रंगसंक्रमणासह प्रिंट.",
      en: "Your own design, photo or pattern, printed to your wall's exact measurements. Printed on the Epson SureColor SC-S9130's 11-colour technology for fine detail and smooth tonal transitions.",
    },
    applications: [
      { mr: "लिव्हिंग रूम / बेडरूम भिंत", en: "Living room / bedroom wall" },
      { mr: "ऑफिस रिसेप्शन", en: "Office reception" },
      { mr: "दुकान / शोरूम फिचर वॉल", en: "Shop / showroom feature wall" },
      { mr: "हॉटेल व रेस्टॉरंट इंटीरियर", en: "Hotel and restaurant interiors" },
    ],
    materialInfo: [
      { mr: "मापानुसार सानुकूल प्रिंट", en: "Custom print to your exact wall size" },
      { mr: "तुमची डिझाइन/फोटो अपलोड करा, किंवा आमच्याकडून सहाय्य घ्या", en: "Upload your own design/photo, or get help designing one" },
    ],
    materialOptions: [
      { mr: "टेक्स्चर्ड", en: "Textured" },
      { mr: "ग्लॉसी", en: "Glossy" },
    ],
    photos: [],
    whatsappMessage: {
      mr: "नमस्कार PrintShubh, मला प्रीमियम वॉलपेपर प्रिंटिंगबद्दल माहिती हवी आहे.",
      en: "Hello PrintShubh, I'd like to know more about premium wallpaper printing.",
    },
    customSizeMessage: {
      mr: "नमस्कार PrintShubh, मला वॉलपेपर प्रिंटिंगसाठी माझ्या भिंतीच्या मापाप्रमाणे किंमत हवी आहे. माप: ",
      en: "Hello PrintShubh, I'd like a quote for wallpaper printing at my wall's size. Size: ",
    },
  },
  {
    key: "canvas-printing",
    slug: "canvas-printing",
    title: { mr: "कॅनव्हास प्रिंटिंग", en: "Canvas Printing" },
    shortTitle: { mr: "कॅनव्हास प्रिंटिंग", en: "Canvas Printing" },
    tagline: {
      mr: "तुमचा फोटो किंवा आर्टवर्क फाइन-आर्ट कॅनव्हासवर.",
      en: "Your photo or artwork on fine-art canvas.",
    },
    description: {
      mr: "कुटुंबाचा फोटो, लँडस्केप किंवा आर्टवर्क कॅनव्हास फॅब्रिकवर प्रिंट करून, आवश्यक असल्यास स्ट्रेचर फ्रेमवर माउंट करून दिले जाते.",
      en: "A family photo, landscape or artwork printed on canvas fabric, and mounted on a stretcher frame on request.",
    },
    applications: [
      { mr: "घरातील भिंत सजावट", en: "Home wall decor" },
      { mr: "भेटवस्तू / स्मरणिका", en: "Gifts / keepsakes" },
      { mr: "ऑफिस व रिसेप्शन आर्ट", en: "Office and reception art" },
      { mr: "फोटो गॅलरी / प्रदर्शन", en: "Photo gallery / exhibition prints" },
    ],
    materialInfo: [
      { mr: "कॅनव्हास फॅब्रिकवर प्रिंट", en: "Printed on canvas fabric" },
      { mr: "स्ट्रेचर फ्रेम माउंटिंग उपलब्ध (विनंतीनुसार)", en: "Stretcher-frame mounting available on request" },
    ],
    materialOptions: [
      { mr: "ग्लॉसी", en: "Glossy" },
      { mr: "मॅट", en: "Matte" },
    ],
    photos: [
      {
        src: "/collections/canvas-printing/textured-eye-gold-teal-1600.webp",
        width: 1600,
        height: 900,
        alt: {
          mr: "सोनेरी व टील रंगातील टेक्स्चर्ड डोळा — कॅनव्हास डिझाइन प्रिव्ह्यू",
          en: "Textured blue-green eye in gold and teal — canvas design preview",
        },
      },
      {
        src: "/collections/canvas-printing/peony-teal-impasto-1400.webp",
        width: 1400,
        height: 1287,
        alt: {
          mr: "फुलदाणीतील पिओनी फुले, इम्पास्टो शैली — कॅनव्हास डिझाइन प्रिव्ह्यू",
          en: "Peonies in a vase, impasto oil style — canvas design preview",
        },
      },
      {
        src: "/collections/canvas-printing/waterfall-impasto-1200.webp",
        width: 1200,
        height: 1600,
        alt: {
          mr: "इम्पास्टो शैलीतील धबधबा — कॅनव्हास डिझाइन प्रिव्ह्यू",
          en: "Waterfall in textured impasto style — canvas design preview",
        },
      },
      {
        src: "/collections/canvas-printing/luxury-gold-circle-1300.webp",
        width: 1300,
        height: 1414,
        alt: {
          mr: "सोनेरी वर्तुळ, मिनिमल आधुनिक शैली — कॅनव्हास डिझाइन प्रिव्ह्यू",
          en: "Minimal gold circle abstract — canvas design preview",
        },
      },
    ],
    photosAreDesignPreviews: true,
    whatsappMessage: {
      mr: "नमस्कार PrintShubh, मला कॅनव्हास प्रिंटिंगबद्दल माहिती हवी आहे.",
      en: "Hello PrintShubh, I'd like to know more about canvas printing.",
    },
    customSizeMessage: {
      mr: "नमस्कार PrintShubh, मला कॅनव्हास प्रिंटसाठी माझ्या मापाप्रमाणे किंमत हवी आहे. माप: ",
      en: "Hello PrintShubh, I'd like a quote for a canvas print at my size. Size: ",
    },
  },
  {
    key: "wall-paintings-wall-art",
    slug: "wall-paintings-wall-art",
    title: { mr: "वॉल पेंटिंग्स आणि वॉल आर्ट", en: "Wall Paintings & Wall Art" },
    shortTitle: { mr: "वॉल आर्ट", en: "Wall Art" },
    tagline: {
      mr: "घर, ऑफिस किंवा दुकानासाठी सजावटीचे वॉल आर्ट प्रिंट.",
      en: "Decorative wall-art prints for home, office or shop.",
    },
    description: {
      mr: "पेंटिंग-शैलीतील आर्टवर्क किंवा डेकोरेटिव्ह डिझाइन मोठ्या आकारात प्रिंट करून भिंतीसाठी तयार केले जाते — सिंगल पॅनल किंवा मल्टी-पॅनल सेट्स.",
      en: "Painting-style artwork or decorative designs printed large-format and finished for the wall — as a single panel or a multi-panel set.",
    },
    applications: [
      { mr: "लिव्हिंग रूम / हॉल सजावट", en: "Living room / hall decor" },
      { mr: "हॉटेल, कॅफे व रेस्टॉरंट", en: "Hotels, cafes and restaurants" },
      { mr: "ऑफिस इंटीरियर", en: "Office interiors" },
      { mr: "मल्टी-पॅनल (स्प्लिट) सेट्स", en: "Multi-panel (split) sets" },
    ],
    materialInfo: [
      { mr: "सिंगल किंवा मल्टी-पॅनल पर्याय", en: "Single-panel or multi-panel options" },
      { mr: "आकार व फिनिश तुमच्या जागेनुसार", en: "Size and finish matched to your space" },
    ],
    materialOptions: [
      { mr: "सिंगल पॅनल", en: "Single Panel" },
      { mr: "मल्टी पॅनल", en: "Multi Panel" },
    ],
    photos: [
      {
        src: "/collections/wall-paintings-wall-art/geometric-golden-lion-1600.webp",
        width: 1600,
        height: 900,
        alt: {
          mr: "भौमितिक सोनेरी सिंह — वॉल आर्ट डिझाइन प्रिव्ह्यू",
          en: "Geometric golden lion portrait — wall art design preview",
        },
      },
      {
        src: "/collections/wall-paintings-wall-art/heritage-procession-1600.webp",
        width: 1600,
        height: 900,
        alt: {
          mr: "भारतीय लोककलेपासून प्रेरित मिरवणूक — वॉल आर्ट डिझाइन प्रिव्ह्यू",
          en: "Indian heritage-inspired procession in gold on teal — wall art design preview",
        },
      },
      {
        src: "/collections/wall-paintings-wall-art/pichwai-kamadhenu-peacocks-1600.webp",
        width: 1600,
        height: 900,
        alt: {
          mr: "पिछवाई शैलीपासून प्रेरित कामधेनू आणि मोर — वॉल आर्ट डिझाइन प्रिव्ह्यू",
          en: "Pichwai-inspired Kamadhenu with calf and peacocks — wall art design preview",
        },
      },
    ],
    photosAreDesignPreviews: true,
    whatsappMessage: {
      mr: "नमस्कार PrintShubh, मला वॉल आर्ट प्रिंटिंगबद्दल माहिती हवी आहे.",
      en: "Hello PrintShubh, I'd like to know more about wall art printing.",
    },
    customSizeMessage: {
      mr: "नमस्कार PrintShubh, मला वॉल आर्टसाठी माझ्या मापाप्रमाणे किंमत हवी आहे. माप: ",
      en: "Hello PrintShubh, I'd like a quote for wall art at my size. Size: ",
    },
  },
  {
    key: "rexine-pu-leatherette-printing",
    slug: "rexine-pu-leatherette-printing",
    title: { mr: "रेक्झिन / PU लेदरेट प्रिंटिंग", en: "Rexine / PU Leatherette Printing" },
    shortTitle: { mr: "रेक्झिन प्रिंटिंग", en: "Rexine Printing" },
    tagline: {
      mr: "रेक्झिन व PU लेदरेट पृष्ठभागावर सानुकूल प्रिंट.",
      en: "Custom printing on rexine and PU leatherette surfaces.",
    },
    description: {
      mr: "सोफा, हेडबोर्ड, डायरी कव्हर व तत्सम वस्तूंसाठी वापरल्या जाणाऱ्या रेक्झिन/PU लेदरेट मटेरियलवर सानुकूल डिझाइन प्रिंट.",
      en: "Custom design printing on rexine / PU leatherette material — the kind used for sofas, headboards, diary covers and similar finished goods.",
    },
    applications: [
      { mr: "फर्निचर अपहोल्स्ट्री पॅनल", en: "Furniture upholstery panels" },
      { mr: "हेडबोर्ड व वॉल पॅनलिंग", en: "Headboards and wall panelling" },
      { mr: "डायरी / फोल्डर कव्हर", en: "Diary / folder covers" },
    ],
    materialInfo: [
      { mr: "रेक्झिन / PU लेदरेट पृष्ठभाग", en: "Rexine / PU leatherette surface" },
      { mr: "मापानुसार सानुकूल प्रिंट", en: "Custom print to your size" },
    ],
    materialOptions: [
      { mr: "टेक्स्चर्ड", en: "Textured" },
      { mr: "प्लेन", en: "Plain" },
    ],
    photos: [
      {
        src: "/collections/rexine-pu-leatherette-printing/cream-flowers-green-gold-1600.webp",
        width: 1600,
        height: 1127,
        alt: {
          mr: "हिरव्या पानांवर क्रीम फुले, सोनेरी रेषा — रेक्झिन डिझाइन प्रिव्ह्यू",
          en: "Cream flowers on deep green leaves with gold accents — Rexine design preview",
        },
      },
      {
        src: "/collections/rexine-pu-leatherette-printing/blue-gold-marble-1600.webp",
        width: 1600,
        height: 1127,
        alt: {
          mr: "निळा व सोनेरी मार्बल — रेक्झिन डिझाइन प्रिव्ह्यू",
          en: "Blue and gold marble — Rexine design preview",
        },
      },
      {
        src: "/collections/rexine-pu-leatherette-printing/ginkgo-art-deco-1600.webp",
        width: 1600,
        height: 1127,
        alt: {
          mr: "जिंगको पाने, आर्ट-डेको शैली — रेक्झिन डिझाइन प्रिव्ह्यू",
          en: "Ginkgo leaves in an art-deco pattern — Rexine design preview",
        },
      },
      {
        src: "/collections/rexine-pu-leatherette-printing/daisies-3d-relief-1600.webp",
        width: 1600,
        height: 1127,
        alt: {
          mr: "3D रिलीफ शैलीतील डेझी फुले — रेक्झिन डिझाइन प्रिव्ह्यू",
          en: "Daisies in a 3D relief style — Rexine design preview",
        },
      },
    ],
    photosAreDesignPreviews: true,
    whatsappMessage: {
      mr: "नमस्कार PrintShubh, मला रेक्झिन/PU लेदरेट प्रिंटिंगबद्दल माहिती हवी आहे.",
      en: "Hello PrintShubh, I'd like to know more about rexine / PU leatherette printing.",
    },
    customSizeMessage: {
      mr: "नमस्कार PrintShubh, मला रेक्झिन प्रिंटिंगसाठी माझ्या मापाप्रमाणे किंमत हवी आहे. माप: ",
      en: "Hello PrintShubh, I'd like a quote for rexine printing at my size. Size: ",
    },
  },
  {
    key: "satin-fabric-printing",
    slug: "satin-fabric-printing",
    title: { mr: "साटीन फॅब्रिक प्रिंटिंग", en: "Satin Fabric Printing" },
    shortTitle: { mr: "साटीन फॅब्रिक प्रिंटिंग", en: "Satin Fabric Printing" },
    tagline: {
      mr: "साटीन फॅब्रिकवर चमकदार, सौम्य प्रिंट फिनिश.",
      en: "A smooth, lustrous print finish on satin fabric.",
    },
    description: {
      mr: "साटीन फॅब्रिकच्या चमकदार पृष्ठभागावर डिझाइन प्रिंट — बॅनर, बॅकड्रॉप आणि सजावटीच्या फॅब्रिक वापरांसाठी योग्य.",
      en: "Designs printed on satin fabric's smooth, lustrous surface — suited to banners, backdrops and decorative fabric uses.",
    },
    applications: [
      { mr: "इव्हेंट बॅकड्रॉप / बॅनर", en: "Event backdrops / banners" },
      { mr: "स्टेज व डेकोर फॅब्रिक", en: "Stage and decor fabric" },
      { mr: "सजावटीचे फॅब्रिक पॅनल", en: "Decorative fabric panels" },
    ],
    materialInfo: [
      { mr: "साटीन फॅब्रिक पृष्ठभाग", en: "Satin fabric surface" },
      { mr: "मापानुसार सानुकूल प्रिंट", en: "Custom print to your size" },
    ],
    materialOptions: [
      { mr: "प्लेन साटीन", en: "Plain Satin" },
    ],
    photos: [
      {
        src: "/collections/satin-fabric-printing/soft-sunset-hills-1600.webp",
        width: 1600,
        height: 1127,
        alt: {
          mr: "सौम्य सूर्यास्त व डोंगर — साटीन डिझाइन प्रिव्ह्यू",
          en: "Soft sunset over misty hills — satin design preview",
        },
      },
      {
        src: "/collections/satin-fabric-printing/gold-contour-lines-1200.webp",
        width: 1200,
        height: 1703,
        alt: {
          mr: "हिरव्यावर सोनेरी कंटूर रेषा — साटीन डिझाइन प्रिव्ह्यू",
          en: "Gold contour lines on deep green — satin design preview",
        },
      },
      {
        src: "/collections/satin-fabric-printing/folk-fish-pattern-1600.webp",
        width: 1600,
        height: 1127,
        alt: {
          mr: "लोककलेपासून प्रेरित मासे व फुले — साटीन डिझाइन प्रिव्ह्यू",
          en: "Folk-inspired fish and flower pattern — satin design preview",
        },
      },
      {
        src: "/collections/satin-fabric-printing/lotus-on-navy-1600.webp",
        width: 1600,
        height: 1127,
        alt: {
          mr: "नेव्हीवर कमळ पॅटर्न — साटीन डिझाइन प्रिव्ह्यू",
          en: "Lotus pattern on navy — satin design preview",
        },
      },
    ],
    photosAreDesignPreviews: true,
    whatsappMessage: {
      mr: "नमस्कार PrintShubh, मला साटीन फॅब्रिक प्रिंटिंगबद्दल माहिती हवी आहे.",
      en: "Hello PrintShubh, I'd like to know more about satin fabric printing.",
    },
    customSizeMessage: {
      mr: "नमस्कार PrintShubh, मला साटीन फॅब्रिक प्रिंटिंगसाठी माझ्या मापाप्रमाणे किंमत हवी आहे. माप: ",
      en: "Hello PrintShubh, I'd like a quote for satin fabric printing at my size. Size: ",
    },
  },
  {
    key: "premium-framed-prints",
    slug: "premium-framed-prints",
    title: { mr: "प्रीमियम फ्रेम्ड प्रिंट्स", en: "Premium Framed Prints" },
    shortTitle: { mr: "फ्रेम्ड प्रिंट्स", en: "Framed Prints" },
    tagline: {
      mr: "प्रिंट + फ्रेमिंग — भिंतीवर लावण्यासाठी तयार.",
      en: "Print plus framing — ready to hang.",
    },
    description: {
      mr: "तुमचा फोटो किंवा आर्टवर्क प्रिंट करून, निवडलेल्या फ्रेम स्टाइलमध्ये तयार करून दिले जाते — भिंतीवर थेट लावण्यासाठी तयार.",
      en: "Your photo or artwork, printed and finished in a frame style of your choice — ready to hang straight on the wall.",
    },
    applications: [
      { mr: "घर व ऑफिस सजावट", en: "Home and office decor" },
      { mr: "भेटवस्तू व स्मरणिका", en: "Gifts and keepsakes" },
      { mr: "प्रमाणपत्रे व पुरस्कार फ्रेमिंग", en: "Certificate and award framing" },
    ],
    materialInfo: [
      { mr: "फ्रेम स्टाइल व आकार तुमच्या निवडीनुसार", en: "Frame style and size as per your choice" },
      { mr: "भिंतीवर लावण्यासाठी तयार", en: "Ready to hang" },
    ],
    materialOptions: [
      { mr: "ब्लॅक फ्रेम", en: "Black Frame" },
      { mr: "व्हाइट फ्रेम", en: "White Frame" },
    ],
    photos: [],
    whatsappMessage: {
      mr: "नमस्कार PrintShubh, मला प्रीमियम फ्रेम्ड प्रिंट्सबद्दल माहिती हवी आहे.",
      en: "Hello PrintShubh, I'd like to know more about premium framed prints.",
    },
    customSizeMessage: {
      mr: "नमस्कार PrintShubh, मला फ्रेम्ड प्रिंटसाठी माझ्या मापाप्रमाणे किंमत हवी आहे. माप: ",
      en: "Hello PrintShubh, I'd like a quote for a framed print at my size. Size: ",
    },
  },
  {
    key: "premium-vinyl-printing",
    slug: "premium-vinyl-printing",
    title: { mr: "प्रीमियम व्हिनाइल प्रिंटिंग", en: "Premium Vinyl Printing" },
    shortTitle: { mr: "व्हिनाइल प्रिंटिंग", en: "Vinyl Printing" },
    tagline: {
      mr: "दुकान, ऑफिस व इव्हेंटसाठी टिकाऊ व्हिनाइल प्रिंट.",
      en: "Durable vinyl prints for shops, offices and events.",
    },
    description: {
      mr: "साइनेज, बॅनर व भिंत/खिडकी ग्राफिक्ससाठी व्हिनाइलवर प्रिंट — घरातील व बाहेरील दोन्ही वापरांसाठी.",
      en: "Printed on vinyl for signage, banners and wall/window graphics — suited to both indoor and outdoor use.",
    },
    applications: [
      { mr: "दुकान साइनेज", en: "Shop signage" },
      { mr: "बॅनर व होर्डिंग", en: "Banners and hoardings" },
      { mr: "भिंत/खिडकी ग्राफिक्स", en: "Wall / window graphics" },
      { mr: "वाहन व स्टिकर ग्राफिक्स", en: "Vehicle and sticker graphics" },
    ],
    materialInfo: [
      { mr: "व्हिनाइल मटेरियल — इनडोअर/आउटडोअर", en: "Vinyl material — indoor / outdoor" },
      { mr: "मापानुसार सानुकूल प्रिंट", en: "Custom print to your size" },
    ],
    materialOptions: [
      { mr: "इनडोअर", en: "Indoor" },
    ],
    photos: [
      {
        src: "/collections/premium-vinyl-printing/marble-lion-1600.webp",
        width: 1600,
        height: 1128,
        alt: {
          mr: "काळ्या मार्बलवर पांढरा मार्बल सिंह — व्हिनाइल डिझाइन प्रिव्ह्यू",
          en: "White marble lion on black marble — vinyl design preview",
        },
      },
      {
        src: "/collections/premium-vinyl-printing/fossil-stone-relief-1600.webp",
        width: 1600,
        height: 1128,
        alt: {
          mr: "दगडावर पाने व फर्नचा रिलीफ — व्हिनाइल डिझाइन प्रिव्ह्यू",
          en: "Fern and leaf relief in stone — vinyl design preview",
        },
      },
      {
        src: "/collections/premium-vinyl-printing/stone-waves-1600.webp",
        width: 1600,
        height: 1128,
        alt: {
          mr: "मार्बल व दगडाच्या लाटा — व्हिनाइल डिझाइन प्रिव्ह्यू",
          en: "Layered stone and marble waves — vinyl design preview",
        },
      },
      {
        src: "/collections/premium-vinyl-printing/peacock-feathers-1600.webp",
        width: 1600,
        height: 1128,
        alt: {
          mr: "मोरपिसे — व्हिनाइल डिझाइन प्रिव्ह्यू",
          en: "Peacock feathers — vinyl design preview",
        },
      },
    ],
    photosAreDesignPreviews: true,
    whatsappMessage: {
      mr: "नमस्कार PrintShubh, मला व्हिनाइल प्रिंटिंगबद्दल माहिती हवी आहे.",
      en: "Hello PrintShubh, I'd like to know more about vinyl printing.",
    },
    customSizeMessage: {
      mr: "नमस्कार PrintShubh, मला व्हिनाइल प्रिंटिंगसाठी माझ्या मापाप्रमाणे किंमत हवी आहे. माप: ",
      en: "Hello PrintShubh, I'd like a quote for vinyl printing at my size. Size: ",
    },
  },
];

export const hasCollectionPhotos = (c: Collection): boolean => c.photos.length > 0;

export function collectionBySlug(slug: string): Collection | undefined {
  return COLLECTIONS.find((c) => c.slug === slug);
}
