export type PlatformId =
  | 'spotify'
  | 'apple'
  | 'bandcamp'
  | 'youtube'
  | 'instagram'
  | 'x'
  | 'tiktok'
  | 'facebook'
  | 'discord'
  | 'tidal'
  | 'amazon'
  | 'soundcloud'
  | 'deezer'

export interface LinkItem {
  id: PlatformId
  label: string
  /** Empty string renders as a disabled "coming soon" tile. */
  href: string
}

export interface Track {
  title: string
  note: string
  src: string
}

export interface Product {
  id: string
  type: string
  name: string
  price: number
  sizes: string[]
  /** Product art path. Empty string renders a placeholder frame. */
  image: string
}

export interface YourAreaBulletin {
  date: string
  title: string
}

export interface YourAreaComment {
  user: string
  date: string
  /** Renders as animated gradient text when the "2005 jank" toggle is on. */
  glitter: boolean
  text: string
}

export interface YourAreaConfig {
  name: string
  tag: string
  memberCount: number
  onlineNow: number
  profile: {
    status: string
    lastLogin: string
    memberSince: string
    hereFor: string
    location: string
    mood: string
    /** Profile song — a real demo track played via <audio>. */
    song: Track
  }
  blurb: { about: string; meet: string }
  bulletins: YourAreaBulletin[]
  top8: string[]
  comments: YourAreaComment[]
  commentCount: number
}

export interface SiteConfig {
  artistName: string
  tagline: string
  assets: {
    iconMark: string
    emblem: string
    wordmark: string
    coverArt: string
    pressPhoto: string
    ogImage: string
  }
  latestRelease: {
    type: string
    title: string
    status: 'coming-soon' | 'out'
    releaseDate: string
    releaseDateLabel: string
    /** disabled -> rendered as a non-clickable button (e.g. pre-save not open yet). */
    primaryCta: { label: string; href: string; disabled?: boolean }
  }
  tracks: Track[]
  streaming: LinkItem[]
  social: LinkItem[]
  about: {
    genre: string
    lead: string
    body: string[]
  }
  press: { quote: string; source: string }[]
  pressKit: { label: string; note: string; href: string }
  contact: {
    bookingEmail: string
    bookingNote: string
    generalEmail: string
    generalNote: string
    dms: { id: PlatformId; href: string }[]
  }
  store: {
    fulfillment: string
    shippingNote: string
    products: Product[]
  }
  yourarea: YourAreaConfig
  seo: {
    title: string
    description: string
    url: string
  }
}

export const site: SiteConfig = {
  artistName: 'villxin',
  tagline:
    'Independent ambient-metalcore. Devotion that burns down to the root.',

  assets: {
    iconMark: '/images/villxin-logo.png',
    emblem: '/images/villxin_heart_transparent_cropped.png',
    wordmark: '/images/title-white-cropped.png',
    coverArt: '/images/moonlight-cover.jpg',
    pressPhoto: '/images/villxin-press-cropped.png',
    ogImage: '/images/og-image.jpg',
  },

  latestRelease: {
    type: 'Debut Single',
    title: 'Moonlight',
    status: 'coming-soon',
    releaseDate: '2026.08.14',
    releaseDateLabel: 'Aug 14, 2026',
    primaryCta: { label: 'Pre-Save (Coming soon)', href: '#', disabled: true },
  },

  tracks: [
    { title: 'Moonlight', note: 'Demo · out Aug 14, 2026', src: '/audio/Moonlight (Demo).wav' },
    { title: 'Freed From Chains', note: 'Demo · mid September', src: '/audio/Freed From Chains (Demo).wav' },
    { title: 'Up In Smoke', note: 'Demo · coming soon', src: '/audio/Up In Smoke (Demo).wav' },
  ],

  /* href empty -> renders as "coming soon" / disabled */
  streaming: [
    { id: 'spotify', label: 'Spotify', href: '' },
    { id: 'apple', label: 'Apple Music', href: '' },
    { id: 'amazon', label: 'Amazon Music', href: '' },
    { id: 'tidal', label: 'Tidal', href: '' },
    { id: 'deezer', label: 'Deezer', href: '' },
    { id: 'soundcloud', label: 'SoundCloud', href: '' },
    { id: 'bandcamp', label: 'Bandcamp', href: '' },
    { id: 'youtube', label: 'YouTube', href: '' },
  ],

  social: [
    { id: 'instagram', label: 'Instagram', href: 'https://www.instagram.com/villxin_music/' },
    { id: 'x', label: 'X', href: 'https://x.com/villxin_music' },
    { id: 'youtube', label: 'YouTube', href: 'https://www.youtube.com/@villxin-music/shorts' },
    { id: 'tiktok', label: 'TikTok', href: 'https://www.tiktok.com/@villxin_music' },
    { id: 'facebook', label: 'Facebook', href: 'https://www.facebook.com/villxin.music' },
  ],

  about: {
    genre: 'Independent ambient-metalcore',
    lead: 'VILLXIN is the embraced duality of being human.',
    body: [
      'Driven by a percussive low end, but without sacrificing the crispness that guitar brings to metal, villxin sits where ambient texture meets the weight of metal and metalcore. Tracks open like scenes from a dark romance movie gone right.',
      'The roots of Villxin trace back as early as 2019. Now, highly collaborative and unsigned, the project is releasing its first body of work in 2026.',
    ],
  },

  press: [
    { quote: 'something something Darkside.', source: 'Emporer Palpatine' },
    { quote: 'They always win sometimes.', source: 'Jesus H. Christ' },
  ],

  pressKit: {
    label: 'Press / EPK Kit',
    note: 'Bio, hi-res photos, logos, stage plot',
    href: '#', // link a real .zip / PDF later
  },

  contact: {
    bookingEmail: 'management@villxin.com',
    bookingNote: '',
    generalEmail: 'hello@villxin.com',
    generalNote: 'Everything else',
    dms: [
      { id: 'instagram', href: 'https://www.instagram.com/villxin_music/' },
      { id: 'x', href: 'https://x.com/villxin_music' },
      { id: 'discord', href: 'https://discord.gg/DVtjsUPrJQ' },
    ],
  },

  store: {
    fulfillment: 'Printed on demand by Printify · Secure checkout by Stripe',
    shippingNote: 'Ships in the US · 7–10 days production + transit',
    /* Static API-down fallback only. Live product data (real Printify art,
       variant IDs/prices) comes from GET /api/shop/products — see
       src/config/shop.ts and StorePage's fetch effect. These render with
       variants: [] so their cards fall back to "Checkout soon". */
    products: [
      { id: 'ashfall-tee', type: 'Tee', name: 'Ashfall Tee', price: 28, sizes: ['S', 'M', 'L', 'XL', '2XL'], image: '' },
      { id: 'emblem-tee', type: 'Tee', name: 'Emblem Tee', price: 28, sizes: ['S', 'M', 'L', 'XL', '2XL'], image: '' },
      { id: 'hollow-sun-tee', type: 'Tee', name: 'Hollow Sun Tee', price: 28, sizes: ['S', 'M', 'L', 'XL', '2XL'], image: '' },
      { id: 'ashfall-hoodie', type: 'Hoodie', name: 'Ashfall Hoodie', price: 52, sizes: ['S', 'M', 'L', 'XL', '2XL'], image: '' },
      { id: 'emblem-hoodie', type: 'Hoodie', name: 'Emblem Hoodie', price: 52, sizes: ['S', 'M', 'L', 'XL', '2XL'], image: '' },
    ],
  },

  /* YourArea community — static demo data (no backend yet); signup, DMs
     and the inbox are local-state demos of the eventual flows */
  yourarea: {
    name: 'YourArea',
    tag: 'a villxin space',
    memberCount: 47,
    onlineNow: 6,
    profile: {
      status: 'Online Now!',
      lastLogin: 'Today',
      memberSince: '2026.07',
      hereFor: 'The quiet and the collapse',
      location: 'The space between',
      mood: 'smoldering',
      song: { title: 'Moonlight', note: 'profile song · demo', src: '/audio/Moonlight (Demo).wav' },
    },
    blurb: {
      about:
        'This is the official villxin profile. Bulletins, demos and pre-release things land here first. Leave a comment, claim a corner, be kind to each other.',
      meet: 'People who write lyrics in the margins of other things. People who stay after the last song.',
    },
    bulletins: [
      { date: 'Jul 09 2026', title: 'Ashfall pre-save goes live next week' },
      { date: 'Jul 02 2026', title: 'New demo on the Listen page — Tidewreck rough' },
      { date: 'Jun 24 2026', title: 'YourArea is open. Claim your username.' },
    ],
    top8: [
      'emberwitch', 'hollow.sun.kid', 'tidewrecked', 'grave.bloom',
      'static.saint', 'vesperlight', 'rootburn', 'ashenveil',
    ],
    comments: [
      { user: 'emberwitch', date: 'Jul 10 2026 · 11:42 PM', glitter: true, text: 'FIRST. thanks for the add!! ashfall demo has not left my head in a week' },
      { user: 'tidewrecked', date: 'Jul 08 2026 · 1:14 AM', glitter: false, text: 'the outro of hollow sun sounds like drowning in the best way. posting this from the bathtub' },
      { user: 'grave.bloom', date: 'Jul 05 2026 · 9:03 PM', glitter: true, text: '~*~ devotion that burns down to the root ~*~ putting this on my wall' },
      { user: 'static.saint', date: 'Jun 30 2026 · 2:37 AM', glitter: false, text: 'who else is up. come talk about the tidewreck bridge in the boards' },
    ],
    commentCount: 27,
  },

  seo: {
    title: 'villxin — independent ambient-metalcore',
    description:
      'villxin — independent ambient-metalcore. Devotion that burns down to the root. Debut single coming 2026. Join the mailing list.',
    url: 'https://villxin.com',
  },
}
