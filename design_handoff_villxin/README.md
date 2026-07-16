# Handoff: villxin Artist Site

## Overview
A dark, atmospheric artist site for villxin — a solo ambient-metalcore project. Features a hero landing page with parallax emblem, demo player, release information, mailing list signup, and a linked merch store with product grid + image upload slots. All files are **design references created in HTML** — the task is to recreate these designs in your target codebase (React/Next, Vue, etc.) using that environment's established patterns and libraries.

## Fidelity
**High-fidelity (hifi)**: Pixel-perfect mockups with final colors, typography, spacing, and interactions. Recreate the UI exactly using your codebase's existing libraries and design tokens.

## Screens / Views

### Screen 1: Home (villxin.html)
**Purpose**: Hero landing page with latest release, demo player, about, contact, and entry mailing-list modal.

**Layout**: Full-viewport hero with centered emblem + wordmark; below, stacked sections (release band, listen/demos, about, contact, footer). Fixed social dock bottom-right.

**Key Components**:
- **Hero Section** (full height, parallax on emblem)
  - Emblem: 220–480px responsive, fades in on load (2.2s), glows
  - Wordmark: Solid white Cormorant Garamond, sub-wordmark text fallback
  - Tagline: `Devotion that burns down to the root.`
  - Release teaser pill: "Debut Single · Ashfall · Coming Sep 4, 2026"
  - CTAs: "Join the mailing list" (primary) + "Hear the demos" (link)
  - Scroll hint at bottom: "Scroll" + animated line

- **Release Band Section** (id="release")
  - Cover art slot (1:1, drag-and-drop placeholder)
  - Release type: "Debut Single"
  - Title: "Ashfall" (large display type)
  - Date info + "Pre-save" link

- **Listen Section** (id="listen")
  - Demo player: 3 tracks (Ashfall, Hollow Sun, Tidewreck) with play/pause buttons, progress bars
  - Streaming links grid: Spotify, Apple Music, Bandcamp, YouTube (disabled/grayed if no href)

- **About Section** (id="about")
  - EPK embed: bio text, press quotes (2x), press kit download link
  - Contact cards: booking + general email, 3 DM icons (Instagram, X, Discord)

- **Footer**
  - Brand mark + name
  - Social icons row
  - Copyright + "Back to top" link

- **Social Dock** (fixed, bottom-right, follows scroll)
  - "FOLLOW" label + 6 social icons (Instagram, X, YouTube, TikTok, Facebook, Discord)
  - Brighter white icons, near-opaque background

- **Entry Modal** (greeted on load, dismissible, tracked in sessionStorage)
  - Title: "Join the list"
  - Body text about the mailing list
  - Email input field
  - Submit button

**Typography**:
- Display (all headings, nav, eyebrows): **Cormorant Garamond**, 500–700 weight, mixed case (headings not uppercase), serif
- Body (paragraphs, labels): **Cormorant Garamond**, 400–500 weight
- Mono (small labels, codes): **Cormorant Garamond**, 400–500 weight (same family throughout)

**Colors**:
- Background: `#07050a` (--bg)
- Surface 1: `#0b0710` (--bg-1)
- Surface 2: `#110a18` (--bg-2)
- Text (full): `#ece6f2` (--text)
- Text (dim): `#ded8e6` (--text-dim)
- Text (faint): `#a99cb8` (--text-faint)
- Accent (molten ember): `#d9402a` (--accent, tunable via Tweaks)
- Accent bright: `#ff6a3d` (--accent-bright, derived from accent)
- Accent glow: `#ff7a48` (--accent-glow, derived from accent)
- Accent soft: rgba(217, 64, 42, 0.16) (--accent-soft)
- Accent line: rgba(217, 64, 42, 0.42) (--accent-line)
- Violet (secondary): `#6e2c8f` (--violet, used in demo player gradient)
- Line (borders): rgba(236, 224, 245, 0.09) (--line)
- Line 2 (stronger): rgba(236, 224, 245, 0.16) (--line-2)

**Spacing**:
- Padding (responsive): clamp(20px, 5vw, 64px)
- Section vertical padding: clamp(62px, 9vw, 120px)
- Border radius: 4px (--radius) and 8px (--radius-lg)
- Easing: cubic-bezier(0.22, 0.61, 0.36, 1) (--ease)

### Screen 2: Store (store.html)
**Purpose**: E-commerce grid for merch (tees & hoodies) with drag-and-drop product image slots and Stripe checkout integration.

**Layout**: Short hero intro, 3-column product grid (responsive: 2 cols on tablet, 1 on mobile), fulfillment footer.

**Key Components**:
- **Store Hero**
  - Title: "Merch"
  - Lead: "Printed to order — nothing sits in a warehouse..."
  - Fulfillment notices: "Printed on demand by Printify · Secure checkout by Stripe" + "Ships worldwide · 7–10 days production + transit"

- **Product Grid** (3 cols, 22px gap, tweakable via Sliders)
  - **Product Card** (repeating, 5 items: 3 tees + 2 hoodies)
    - Image slot (4:5 aspect, drag-and-drop)
    - Type label (e.g., "Tee" / "Hoodie")
    - Product name (e.g., "Ashfall Tee")
    - Price (e.g., "$28")
    - Size pills (S, M, L, XL, 2XL) — selectable, highlight on hover
    - CTA: "Buy — $28" button (links to Stripe Payment Link + size param) OR "Checkout soon" placeholder
    - Borders on hover: brighter, slight lift (translateY -3px)

- **Fulfillment Footer** (border-top, two columns of text)
  - Left: Printify/Stripe notice
  - Right: Shipping info

**Typography**: Same as home (Cormorant Garamond throughout).

**Colors**: Same palette as home.

## Interactions & Behavior

### Home Page
- **Hero emblem**: Fades in + scales up on page load (2.2s, respects prefers-reduced-motion)
- **Parallax on scroll**: Emblem moves down 12% of scroll distance, hero inner fades + moves up 4% (offset by scroll)
- **Scroll hint**: Animated line that drops and fades, loops continuously
- **Demo player**: Play/pause toggles track playback (simulated timer in prototype; real app uses <audio> elements)
  - Progress bar updates in real time
  - Stops and resets on track completion
- **Link hover states**: Nav items brighten (color: --accent-bright), cards lift slightly, borders brighten
- **Mailing list form**: Submit validates email, shows success/error inline, disables input on submit
- **Nav highlight**: Current page link shows --accent-bright color (e.g., "Store" is bright on store.html)
- **Mobile nav**: Hamburger menu opens overlay sheet with numbered nav items + mailing list button

### Store Page
- **Size pills**: Click to select; selected pill shows --accent-bright border + --accent-soft background
- **Product card hover**: Border brightens to --accent-line, card lifts 3px, shadow appears
- **Checkout button**: If checkoutUrl is filled in config, button is live and links to Stripe; otherwise shows "Checkout soon" placeholder
- **Responsive grid**: Tweaks panel slider changes column count (2–4)

### Global
- **Entry modal**: Shows on first load (tracked via sessionStorage); can be dismissed or replayed via Tweaks
- **Accent color tuning**: Tweaks panel radio/color picker updates --accent and derived colors (bright, glow, soft, line) in real time
- **Social dock**: Fixed position, follows scroll, blurred background, shows all icons in a tight row with labels

## State Management

### Home (app.jsx)
- `t.entryModal` (bool): Whether to show entry modal on load
- `modalOpen` (bool): Modal visibility state
- `scrolled` (bool): Is page scrolled past 24px? (for header styling)
- `open` (bool): Is mobile nav open?
- Demo player: `active` (track index), `pos` (playback position), timer interval
- Accent tuning: `t.accent` (hex color) → CSS vars

### Store (store.jsx)
- `t.cols` (number): Product grid column count (2–4)
- `t.accent` (hex): Tunable accent color
- `size` (string): Selected product size (S, M, L, XL, 2XL)

### Image Slots
- Drag-and-drop images persist via `.image-slots.state.json` sidecar (omelette host protocol)
- Each slot has a unique `id` attribute for persistence

## Design Tokens

### Colors
```
--bg:             #07050a
--bg-1:           #0b0710
--bg-2:           #110a18
--text:           #ece6f2
--text-dim:       #ded8e6
--text-faint:     #a99cb8
--accent:         #d9402a (tunable)
--accent-bright:  #ff6a3d
--accent-glow:    #ff7a48
--accent-soft:    rgba(217, 64, 42, 0.16)
--accent-line:    rgba(217, 64, 42, 0.42)
--violet:         #6e2c8f
--violet-bright:  #a85fce
--violet-soft:    rgba(110, 44, 143, 0.20)
--violet-line:    rgba(140, 70, 175, 0.38)
--ok:             #6f9e7f
--warn:           #c79a4e
--err:            #e06a5a
--line:           rgba(236, 224, 245, 0.09)
--line-2:         rgba(236, 224, 245, 0.16)
```

### Typography
```
--font-display: "Cormorant Garamond", serif
--font-body:    "Cormorant Garamond", serif
--font-mono:    "Cormorant Garamond", serif
```

### Spacing & Rhythm
```
--maxw:       1180px
--pad:        clamp(20px, 5vw, 64px)
--section-y:  clamp(62px, 9vw, 120px)
--radius:     4px
--radius-lg:  8px
--ease:       cubic-bezier(0.22, 0.61, 0.36, 1)
```

## Assets

- **Emblem** (heart mark): `assets/emblem-cut.png` (used as nav icon, hero emblem, favicon)
- **Wordmark** (VILLXIN text): `assets/wordmark-solid.png` (cropped, solid white)
- **Cover art slot**: Config key `latestRelease.coverArt` — empty → placeholder; drag an image onto the slot on the home page to fill it
- **Press photo slot**: Config key `assets.pressPhoto` — same pattern
- **Product image slots**: On store.html, each product card has a drag-and-drop art slot

## Config (config.js)

All site content is defined in a single static config object (`window.SITE`):

```javascript
{
  artistName: "villxin",
  tagline: "...",
  assets: {
    iconMark: "assets/emblem-cut.png",
    emblem: "assets/emblem-cut.png",
    wordmark: "assets/wordmark-solid.png",
    coverArt: "", // empty -> placeholder
    pressPhoto: "",
    ogImage: "assets/emblem.png",
  },
  latestRelease: {
    type: "Debut Single",
    title: "Ashfall",
    status: "coming-soon", // or "out"
    releaseDate: "2026.09.04",
    releaseDateLabel: "Sep 4, 2026",
    primaryCta: { label: "Pre-save", href: "#" },
  },
  tracks: [
    { title: "Ashfall", note: "Demo / rough mix", duration: "3:48", src: "audio/ashfall.wav" },
    // ... 2 more
  ],
  streaming: [
    { id: "spotify", label: "Spotify", href: "" }, // empty -> disabled
    // ... 3 more
  ],
  social: [
    { id: "instagram", label: "Instagram", href: "" },
    // ... 5 more
  ],
  store: {
    fulfillment: "Printed on demand by Printify · Secure checkout by Stripe",
    shippingNote: "Ships worldwide · 7–10 days production + transit",
    products: [
      {
        id: "ashfall-tee",
        type: "Tee",
        name: "Ashfall Tee",
        price: 28,
        sizes: ["S", "M", "L", "XL", "2XL"],
        checkoutUrl: "", // empty -> "Checkout soon"; fill with Stripe Payment Link
      },
      // ... 4 more
    ],
  },
  about: { genre: "...", lead: "...", body: ["...", "..."] },
  press: [{ quote: "...", source: "..." }, ...],
  pressKit: { label: "Press / EPK Kit", note: "...", href: "#" },
  contact: {
    bookingEmail: "booking@villxin.com",
    bookingNote: "Booking, press, sync & collaboration",
    generalEmail: "hello@villxin.com",
    generalNote: "Everything else",
    dms: [{ id: "instagram", href: "" }, ...],
  },
  footerSocial: ["instagram", "x", "youtube", "bandcamp", "discord"],
}
```

**To go live**: Fill in `href` values for streaming links, social links, Stripe Payment Links (in store products), and image asset paths. Leave empty strings for "coming soon" / disabled items.

## Mailing List (mailing.jsx)

Form POSTs to `/api/subscribe` with `{ email }`. Expects JSON response:
```json
{ "ok": true, "message": "..." }
{ "ok": false, "code": "duplicate", "message": "Already subscribed" }
{ "ok": false, "code": "invalid", "message": "Invalid email" }
```

In development, the prototype does not connect to a real API — form submission is mocked.

### Screen 3: YourArea (yourarea.html)
**Purpose**: Fan community — MySpace-era official artist profile, Mail Center inbox, signup flow. See IMPLEMENTATION_PROMPT.md for the full functional spec (auth, forum, DMs, moderation).

**Views** (hash-routed in the prototype: \`#\` = profile, \`#inbox\` = Mail Center):
- **Official profile**: two-column MySpace layout — left: name + Official badge, "Online Now!" pulse, emblem pic, Contact box (Send Message / Add to Friends / Add Comment / Block), details table, profile song player, member counter. Right: "extended network" banner, bulletins table, blurbs, Top 8 grid (violet-themed), friends-comments wall with optional glitter text.
- **Mail Center**: folder sidebar (Inbox w/ unread count, Message Requests, Sent, Trash); request cards with Accept/Decline; message list (bold unread rows); thread view with chat bubbles, reply box, "Revoke access" (block).
- **Signup strip**: email → verification → username claim, with inline validation states.
- **DM request modal**: 3-phase demo (compose → sent → what the recipient sees).

**Styling**: all in \`yourarea.css\` — \`.yabox\` (bordered box w/ ember header bar; \`--v\` violet variant), thin-bordered tables, italic faint metadata. "2005 jank" tweak toggles glitter text + tiled background (class \`ya--jank\`).

## Files in This Handoff

- `villxin.html` — Home page entry point
- `store.html` — Store page entry point
- `yourarea.html` / `yourarea.css` / `yourarea.jsx` / `yourarea-inbox.jsx` — YourArea community (profile + Mail Center)
- `IMPLEMENTATION_PROMPT.md` — **paste into Claude Code to implement front + back end**
- `styles.css` — Global theme tokens (colors, fonts, spacing, easing)
- `sections.css` — Component styles (hero, cards, modals, forms, footer, etc.)
- `store.css` — Store-specific styles (product grid, card hover states)
- `config.js` — Entire site config (content, asset paths, streaming/social/store data)
- `components.jsx` — Core components (Header, Hero, ReleaseBand, DemoPlayer, etc.)
- `app.jsx` — Home page React app root
- `store.jsx` — Store page React app root
- `modal.jsx` — Mailing list modal component
- `mailing.jsx` — Mailing list form logic
- `panels.jsx` — About, contact, footer sections
- `tweaks-panel.jsx` — In-design Tweaks UI (color picker, toggles, sliders)
- `icons.js` — SVG icon definitions (play, pause, arrow, etc.)
- `image-slot.js` — Drag-and-drop image placeholder component

## Next Steps for Developer

1. **Set up the target environment** (React/Next, Vue, Svelte, etc.) or choose the most appropriate framework for the real codebase.
2. **Copy the design tokens** (colors, fonts, spacing) into the project's theme/design system.
3. **Recreate each screen** using the target framework's components and patterns, referencing the layouts and interactions described above.
4. **Wire up the config** — if the real app has a CMS or API, fetch data from there instead of the static config.js.
5. **Implement the mailing list API** endpoint (`POST /api/subscribe`) if not already present.
6. **Test responsive behavior** — the designs use `clamp()` for fluid scaling; ensure the real app does the same.
7. **Add animations** — parallax, fade-in on load, hover transitions — using the target framework's animation library.
8. **Accessibility**: Ensure semantic HTML, ARIA labels, keyboard navigation, and color contrast meet WCAG 2.1 AA.

---

**Questions?** Contact the design team or reference the HTML prototypes directly for pixel-level details.
