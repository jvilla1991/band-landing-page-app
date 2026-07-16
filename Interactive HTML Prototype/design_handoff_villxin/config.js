/* ============================================================
   villxin — site config  (prototype mirror of src/config/site.ts)
   --------------------------------------------------------------
   In the real Vite app this is a typed module:
       export const site: SiteConfig = { ... }
   Here it's attached to window.SITE so the prototype components can read it.

   EVERYTHING here is NON-API / STATIC CONFIG. Fill values in later
   without touching components. The ONLY thing wired to the backend is
   the mailing-list form (POST /api/subscribe) — see mailing.jsx.
   ============================================================ */

window.SITE = {
  artistName: "villxin",
  tagline:
    "Independent ambient-metalcore. Devotion that burns down to the root.",

  /* asset paths — real brand art wired in; empty slots fall back to placeholders */
  assets: {
    iconMark: "assets/emblem-cut.png",  // molten heart mark — nav + footer + favicon (transparent)
    emblem:   "assets/emblem-cut.png",  // large glowing hero emblem (transparent)
    wordmark: "assets/wordmark-solid.png", // VILLXIN wordmark (cropped, solid white)
    coverArt: "",                    // latest-release cover; empty -> placeholder frame
    pressPhoto: "",                  // EPK press photo; empty -> placeholder frame
    ogImage: "assets/emblem.png",
  },

  /* ---- HERO: latest release (NON-API / static) ----
     Swap this whole object for a real release later. */
  latestRelease: {
    type: "Debut Single",
    title: "Ashfall",
    status: "coming-soon",            // "coming-soon" | "out"
    releaseDate: "2026.09.04",
    releaseDateLabel: "Sep 4, 2026",
    primaryCta: { label: "Pre-save", href: "#" }, // placeholder -> becomes streaming link
  },

  /* ---- LISTEN: local demo tracks (NON-API / static assets in public/audio) ----
     These are static .wav files, NOT served by the API. */
  tracks: [
    { title: "Ashfall",        note: "Demo / rough mix",     duration: "3:48", src: "audio/ashfall.wav" },
    { title: "Hollow Sun",     note: "Demo / instrumental",  duration: "4:12", src: "audio/hollow-sun.wav" },
    { title: "Tidewreck",      note: "Demo / pre-production", duration: "2:57", src: "audio/tidewreck.wav" },
  ],

  /* ---- STREAMING (NON-API / static, placeholder-aware) ----
     href empty/null -> renders as "coming soon / disabled". One-line edit to go live. */
  streaming: [
    { id: "spotify",   label: "Spotify",      href: "" },
    { id: "apple",     label: "Apple Music",  href: "" },
    { id: "bandcamp",  label: "Bandcamp",     href: "" },
    { id: "youtube",   label: "YouTube",      href: "" },
  ],

  /* ---- SOCIAL (NON-API / static, placeholder-aware) ---- */
  social: [
    { id: "instagram", label: "Instagram", href: "" },
    { id: "x",         label: "X",         href: "" },
    { id: "youtube",   label: "YouTube",   href: "" },
    { id: "tiktok",    label: "TikTok",    href: "" },
    { id: "facebook",  label: "Facebook",  href: "" },
    { id: "discord",   label: "Discord",   href: "" },
  ],

  /* ---- ABOUT / EPK / PRESS (NON-API / static) ---- */
  about: {
    genre: "Independent ambient-metalcore",
    lead: "villxin is the solo project of a writer chasing the space between stillness and collapse.",
    body: [
      "Built from layered guitar drones, field recordings and slow-burning percussion, villxin sits where ambient texture meets the weight of metalcore. Tracks open in near-silence and end underwater.",
      "Self-produced and unsigned, the project is releasing its first body of work in 2026 — a study in restraint and rupture.",
    ],
  },

  /* ---- PRESS quotes (NON-API / static placeholder) ---- */
  press: [
    { quote: "Glacial, immense, and quietly devastating.", source: "Pull-quote slot — add press here" },
    { quote: "Ambient music with teeth.", source: "Pull-quote slot — add press here" },
  ],

  pressKit: {
    label: "Press / EPK Kit",
    note: "Bio, hi-res photos, logos, stage plot",
    href: "#", // placeholder -> link a real .zip / PDF later
  },

  /* ---- CONTACT (NON-API / static) — no contact API; mailto path only ---- */
  contact: {
    bookingEmail: "booking@villxin.com",
    bookingNote: "Booking, press, sync & collaboration",
    generalEmail: "hello@villxin.com",
    generalNote: "Everything else",
    dms: [
      { id: "instagram", href: "" },
      { id: "x",         href: "" },
      { id: "discord",   href: "" },
    ],
  },

  /* ---- STORE (NON-API / static, placeholder-aware) ----
     checkout: Stripe Payment Links + Printify fulfillment.
     Paste each product's Stripe Payment Link into checkoutUrl to go live;
     empty -> renders as "checkout soon". Product art: drag an image onto
     the card's art slot on the store page (persists). ---- */
  store: {
    fulfillment: "Printed on demand by Printify · Secure checkout by Stripe",
    shippingNote: "Ships worldwide · 7–10 days production + transit",
    products: [
      { id: "ashfall-tee",    type: "Tee",    name: "Ashfall Tee",    price: 28, sizes: ["S","M","L","XL","2XL"], checkoutUrl: "" },
      { id: "emblem-tee",     type: "Tee",    name: "Emblem Tee",     price: 28, sizes: ["S","M","L","XL","2XL"], checkoutUrl: "" },
      { id: "hollow-sun-tee", type: "Tee",    name: "Hollow Sun Tee", price: 28, sizes: ["S","M","L","XL","2XL"], checkoutUrl: "" },
      { id: "ashfall-hoodie", type: "Hoodie", name: "Ashfall Hoodie", price: 52, sizes: ["S","M","L","XL","2XL"], checkoutUrl: "" },
      { id: "emblem-hoodie",  type: "Hoodie", name: "Emblem Hoodie",  price: 52, sizes: ["S","M","L","XL","2XL"], checkoutUrl: "" },
    ],
  },

  footerSocial: ["instagram", "x", "youtube", "bandcamp", "discord"],
};
