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
  /** Stripe Payment Link. Empty string renders as "Checkout soon". */
  checkoutUrl: string
  /** Product art path. Empty string renders a placeholder frame. */
  image: string
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
    primaryCta: { label: string; href: string }
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
    emblem: '/images/villxin-logo.png',
    wordmark: '/images/villxin-title-2.png',
    coverArt: '', // empty -> placeholder frame
    pressPhoto: '', // empty -> placeholder frame
    ogImage: '/images/og-image.jpg',
  },

  latestRelease: {
    type: 'Debut Single',
    title: 'Ashfall',
    status: 'coming-soon',
    releaseDate: '2026.09.04',
    releaseDateLabel: 'Sep 4, 2026',
    primaryCta: { label: 'Pre-save', href: '#' },
  },

  tracks: [
    { title: 'Moonlight', note: 'Demo · coming soon', src: '/audio/Moonlight (Demo).wav' },
    { title: 'Freed From Chains', note: 'Demo preview', src: '/audio/Freed From Chains (Demo).wav' },
    { title: 'Up In Smoke', note: 'Demo preview', src: '/audio/Up In Smoke (Demo).wav' },
  ],

  /* href empty -> renders as "coming soon" / disabled */
  streaming: [
    { id: 'spotify', label: 'Spotify', href: '' },
    { id: 'apple', label: 'Apple Music', href: '' },
    { id: 'bandcamp', label: 'Bandcamp', href: '' },
    { id: 'youtube', label: 'YouTube', href: '' },
  ],

  social: [
    { id: 'instagram', label: 'Instagram', href: 'https://www.instagram.com/villxin_music/' },
    { id: 'x', label: 'X', href: 'https://x.com/villxin_music' },
    { id: 'youtube', label: 'YouTube', href: 'https://www.youtube.com/@villxin-music' },
    { id: 'tiktok', label: 'TikTok', href: 'https://www.tiktok.com/@villxin_music' },
    { id: 'facebook', label: 'Facebook', href: 'https://www.facebook.com/villxin.music' },
    { id: 'discord', label: 'Discord', href: 'https://discord.gg/DVtjsUPrJQ' },
  ],

  about: {
    genre: 'Independent ambient-metalcore',
    lead: 'villxin is the solo project of a writer chasing the space between stillness and collapse.',
    body: [
      'Built from layered guitar drones, field recordings and slow-burning percussion, villxin sits where ambient texture meets the weight of metalcore. Tracks open in near-silence and end underwater.',
      'Self-produced and unsigned, the project is releasing its first body of work in 2026 — a study in restraint and rupture.',
    ],
  },

  press: [
    { quote: 'Glacial, immense, and quietly devastating.', source: 'Pull-quote slot — add press here' },
    { quote: 'Ambient music with teeth.', source: 'Pull-quote slot — add press here' },
  ],

  pressKit: {
    label: 'Press / EPK Kit',
    note: 'Bio, hi-res photos, logos, stage plot',
    href: '#', // link a real .zip / PDF later
  },

  contact: {
    bookingEmail: 'booking@villxin.com',
    bookingNote: 'Booking, press, sync & collaboration',
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
    shippingNote: 'Ships worldwide · 7–10 days production + transit',
    products: [
      { id: 'ashfall-tee', type: 'Tee', name: 'Ashfall Tee', price: 28, sizes: ['S', 'M', 'L', 'XL', '2XL'], checkoutUrl: '', image: '' },
      { id: 'emblem-tee', type: 'Tee', name: 'Emblem Tee', price: 28, sizes: ['S', 'M', 'L', 'XL', '2XL'], checkoutUrl: '', image: '' },
      { id: 'hollow-sun-tee', type: 'Tee', name: 'Hollow Sun Tee', price: 28, sizes: ['S', 'M', 'L', 'XL', '2XL'], checkoutUrl: '', image: '' },
      { id: 'ashfall-hoodie', type: 'Hoodie', name: 'Ashfall Hoodie', price: 52, sizes: ['S', 'M', 'L', 'XL', '2XL'], checkoutUrl: '', image: '' },
      { id: 'emblem-hoodie', type: 'Hoodie', name: 'Emblem Hoodie', price: 52, sizes: ['S', 'M', 'L', 'XL', '2XL'], checkoutUrl: '', image: '' },
    ],
  },

  seo: {
    title: 'villxin — independent ambient-metalcore',
    description:
      'villxin — independent ambient-metalcore. Devotion that burns down to the root. Debut single coming 2026. Join the mailing list.',
    url: 'https://villxin.com',
  },
}
