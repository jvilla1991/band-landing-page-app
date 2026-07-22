import { fetchJson } from './api'

/* Page feature flags (GET /api/site/flags). The site must keep working when
   the API is unreachable, so flags resolve in three layers:
   fresh fetch -> last-known state cached in localStorage -> built-in defaults. */

export interface SiteFlags {
  store: boolean
  live: boolean
  yourarea: boolean
}

/** What a brand-new visitor sees if the very first flags fetch fails. */
export const DEFAULT_FLAGS: SiteFlags = { store: true, live: false, yourarea: false }

const CACHE_KEY = 'villxin_flags'

export function cachedFlags(): SiteFlags {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (raw) return { ...DEFAULT_FLAGS, ...JSON.parse(raw) }
  } catch {
    /* storage unavailable or corrupt cache */
  }
  return DEFAULT_FLAGS
}

export async function fetchFlags(): Promise<SiteFlags> {
  const flags = { ...DEFAULT_FLAGS, ...(await fetchJson<Partial<SiteFlags>>('/api/site/flags')) }
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(flags))
  } catch {
    /* storage unavailable */
  }
  return flags
}

/* ---- shows (public list for the Live page) ---- */

export type ShowStatus = 'UPCOMING' | 'SOLD_OUT' | 'CANCELLED'

export interface Show {
  id: number
  showDate: string // ISO yyyy-mm-dd
  venue: string
  city: string
  ticketUrl?: string | null
  note?: string | null
  status: ShowStatus
}

export const fetchShows = () => fetchJson<Show[]>('/api/site/shows')
