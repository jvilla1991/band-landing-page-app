import { API_BASE, ApiError } from './api'
import { SiteFlags, Show, ShowStatus } from './siteFlags'

/* Admin-side API client. Deliberately separate from fetchJson: that helper
   attaches the YourArea community token, while everything here uses the
   ADMIN JWT from /api/auth/login, stored under its own key. */

const ADMIN_TOKEN_KEY = 'villxin_admin_token'

export function getAdminToken(): string | null {
  try {
    return localStorage.getItem(ADMIN_TOKEN_KEY)
  } catch {
    return null
  }
}

export function clearAdminToken() {
  try {
    localStorage.removeItem(ADMIN_TOKEN_KEY)
  } catch {
    /* storage unavailable */
  }
}

async function adminFetch<T>(path: string, options: { method?: string; body?: unknown } = {}): Promise<T> {
  const headers: Record<string, string> = {}
  if (options.body !== undefined) headers['Content-Type'] = 'application/json'
  const token = getAdminToken()
  if (token) headers.Authorization = `Bearer ${token}`

  const res = await fetch(API_BASE + path, {
    method: options.method ?? (options.body !== undefined ? 'POST' : 'GET'),
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  })

  let data: unknown = null
  try {
    data = await res.json()
  } catch {
    /* empty body (e.g. 204 from delete) */
  }

  if (!res.ok) {
    if (res.status === 401 || res.status === 403) clearAdminToken()
    const err = (data ?? {}) as { code?: string; error?: string }
    throw new ApiError(res.status, err.code ?? 'UNKNOWN', err.error ?? `HTTP ${res.status}`)
  }
  return data as T
}

/* ---- auth ---- */

export async function adminLogin(email: string, password: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  const data = (await res.json().catch(() => ({}))) as { token?: string; role?: string; error?: string }
  if (!res.ok || !data.token) {
    throw new ApiError(res.status, 'LOGIN_FAILED', data.error ?? 'Login failed')
  }
  if (data.role !== 'ADMIN') {
    throw new ApiError(403, 'NOT_ADMIN', 'This account is not an admin')
  }
  try {
    localStorage.setItem(ADMIN_TOKEN_KEY, data.token)
  } catch {
    /* storage unavailable */
  }
}

/* ---- site controls ---- */

export interface ShowInput {
  showDate: string
  venue: string
  city: string
  ticketUrl?: string | null
  note?: string | null
  status: ShowStatus
}

export interface SyncResult {
  synced: number
  deactivated: number
}

export const adminApi = {
  setFlag: (name: keyof SiteFlags, enabled: boolean) =>
    adminFetch<SiteFlags>(`/api/site/admin/flags/${name}`, { method: 'PUT', body: { enabled } }),
  allShows: () => adminFetch<Show[]>('/api/site/admin/shows'),
  createShow: (input: ShowInput) => adminFetch<Show>('/api/site/admin/shows', { body: input }),
  updateShow: (id: number, input: ShowInput) =>
    adminFetch<Show>(`/api/site/admin/shows/${id}`, { method: 'PUT', body: input }),
  deleteShow: (id: number) => adminFetch<void>(`/api/site/admin/shows/${id}`, { method: 'DELETE' }),
  syncStore: () => adminFetch<SyncResult>('/api/shop/sync', { method: 'POST' }),
}
