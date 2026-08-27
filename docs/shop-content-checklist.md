# Shop content checklist

The redesign added sections for the physical shop — photos, address, hours,
Google reviews, redacted work samples.

**Status (2026-08-23):** address, opening hours, Google profile link and the
4.9 / 32 rating are filled in from the owner's Google Business Profile.
Still outstanding: shop photos, review cards (need reviewer names), work
samples, and optional geo coordinates. Anything outstanding renders nothing
rather than showing an invented placeholder.

Everything is driven from one file:

```
src/lib/shop-profile.ts
```

Fill in a block, and its section appears. Leave it `null` / `[]`, and the
section stays absent. Nothing else needs to change.

---

## 1. Real shop photos → turns on the "our shop" gallery

**Where:** `SHOP_PHOTOS`
**Also affects:** the hero (photo #1 replaces the illustration), the
`image` property in LocalBusiness structured data.

1. Put the photos in `public/shop/`. WebP or AVIF, roughly 1600px wide.
2. List them:

```ts
export const SHOP_PHOTOS: ShopPhoto[] = [
  {
    src: "/shop/counter.webp",
    width: 1600,
    height: 1200,
    alt: { mr: "PrintShubh दुकानाचा काउंटर", en: "The PrintShubh counter" },
    caption: { mr: "आमचा काउंटर", en: "Our counter" },
  },
];
```

Photographs of **this** shop only. Stock photography of somebody else's
print shop would undo exactly the trust the section is there to build,
which is why the section stays empty until real photos exist.

Worth shooting: shopfront, the xerox machine, the printing setup, the photo
corner, the counter, finished work, a map/plan print.

---

## 2. Address — ✅ DONE (2026-08-23)

**Where:** `SHOP_ADDRESS`

Matches the Google Business Profile:

> B-6, Mahalaxmi Chamber, Near C.B. Stand, Shahupuri, Kolhapur,
> Maharashtra **416001**

### PIN history — read before changing it again

The profile originally read **416003**, and this file followed it. On
2026-08-23 the owner updated the Google Business Profile to **416001** and
this file was updated to match.

**Rule: the Google Business Profile is the source of truth; this file is the
copy.** Change the profile first, then change `SHOP_ADDRESS` here. Never the
other way round — a site PIN that disagrees with the profile splits the
local citations that local ranking is built on.

Two loose ends worth closing:

- The **printed business card still says 416003.** Reprint it, or it becomes
  a third conflicting citation.
- A **Justdial listing** for the same shop says 416001 — that now agrees, so
  nothing to do there.

Still optional here: `geo` (latitude/longitude). Google Maps → right-click
the shop pin → copy coordinates → add it to `SHOP_ADDRESS.geo`. Without it
the address and map still work; the geo block just doesn't enter the schema.

---

## 3. Opening hours — ✅ DONE (2026-08-23)

**Where:** `OPENING_HOURS`

Filled from the profile: **Monday–Saturday 09:00–21:00, Sunday closed.**
Sunday is omitted from `schema` entirely — schema.org expresses "closed" by
absence, and a closed day with no times is invalid.

If the hours change, change them on the Google profile AND here.

`rows` is what visitors read; `schema` is the machine-readable form and must
say the same thing. Both must match the Google Business Profile.

```ts
export const OPENING_HOURS: OpeningHours | null = {
  rows: [
    { days: { mr: "सोम – शनि", en: "Mon – Sat" }, time: { mr: "सकाळी ९ – रात्री ९", en: "9:00 – 21:00" } },
    { days: { mr: "रविवार", en: "Sunday" },       time: { mr: "बंद", en: "Closed" } },
  ],
  schema: ["Mo-Sa 09:00-21:00"], // omit closed days entirely
};
```

---

## 4. Google reviews — 🟡 PARTLY DONE (2026-08-23)

**Where:** `GOOGLE_PROFILE_URL`, `GOOGLE_REVIEWS`, `GOOGLE_RATING`,
`GOOGLE_REVIEW_COUNT`

Filled: the profile link, and the **4.9 ★ / 32 reviews** aggregate.

Still empty: `GOOGLE_REVIEWS`. The review cards need each review's text
**and the reviewer's real display name** — a review published under an
invented name is not that customer's review. Copy them from the profile and
the cards switch on.

⚠ `GOOGLE_PROFILE_URL` was derived from the `ludocid` parameter in the
profile's search URL, not read off the profile directly. Click it once to
confirm it opens PRINTSHUBH JUMBO ZEROX; if not, replace it with the
profile's own Share link.

Three states, and none of them is invented:

| What you fill in | What renders |
| --- | --- |
| Nothing | Nothing |
| `GOOGLE_PROFILE_URL` only | A "read our reviews on Google" link |
| `GOOGLE_REVIEWS` too | The review cards |

Reviews must be copied **verbatim** from the Google Business Profile — same
words, real reviewer name. They are shown untranslated in both languages,
because a translated review is a paraphrase and a paraphrased review is no
longer the customer's words.

`GOOGLE_RATING` and `GOOGLE_REVIEW_COUNT` only render (and only enter
`aggregateRating` structured data) when **both** are set. A rating with no
count behind it is a number with no weight, and Google treats an
unsupported `aggregateRating` as a spam signal.

---

## 5. Work samples → replaces the abstract sample illustration

**Where:** `WORK_SAMPLES`
**Affects:** the "see what you'll get" block on the homepage.

While the list is empty, that block shows a clearly-labelled abstract
illustration plus a live "ask for a sample on WhatsApp" button. (It used to
show a dead "sample coming soon" chip — that promised proof and then
withheld it, so it is gone.)

Every entry is typed `redacted: true`. That is a deliberate speed bump: you
cannot add a sample without stating that a human checked it. Before adding
one, confirm **no** owner name, survey/gut number, phone number, address or
document ID is legible anywhere in the image.

---

## 6. Customer count (optional)

**Where:** `CUSTOMERS_SERVED`

Left `null` because nobody has counted. Set it only to a figure the owner
can stand behind. "Thousands of customers" is a guess, not a statistic, and
guesses do not go on the site — which is why the 30+ years band currently
shows what the shop *does* rather than made-up totals.

---

## What was NOT touched

- Every previously indexed URL still exists and still has its original
  canonical, metadata and content. `src/app/sitemap.ts` gained three new
  entries and lost none.
- Prices: land-document prices still come from `src/lib/pricing-data.ts`.
  Counter prices (xerox, printing, photo) are **not** published anywhere —
  they vary by paper, size and quantity, so every counter surface routes to
  WhatsApp for a quote instead of guessing a number.
- The "not a government website" disclaimer still appears in the hero, the
  land-document section, the footer schema and the digital-services page.
