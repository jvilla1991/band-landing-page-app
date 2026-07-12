/* API base + JSON helper shared by the mailing list and the community API.
   The prod default matters: the production host (Cloudflare Pages) does not
   inject VITE_API_URL. */
export const API_BASE: string =
  import.meta.env.VITE_API_URL ??
  (import.meta.env.PROD ? 'https://band-api.villa-dev.com' : 'http://localhost:8080')

/* ---- community session (JWT + username in localStorage) ---- */

const TOKEN_KEY = 'villxin_ya_token'
const USER_KEY = 'villxin_ya_user'

// listeners let useAuth re-render on sign-in/out (incl. a 401 auto sign-out)
const sessionListeners = new Set<() => void>()

export function subscribeSession(listener: () => void): () => void {
  sessionListeners.add(listener)
  return () => {
    sessionListeners.delete(listener)
  }
}

function emitSession() {
  sessionListeners.forEach((l) => l())
}

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export function getStoredUsername(): string | null {
  try {
    return localStorage.getItem(USER_KEY)
  } catch {
    return null
  }
}

export function storeSession(token: string, username: string) {
  try {
    localStorage.setItem(TOKEN_KEY, token)
    localStorage.setItem(USER_KEY, username)
  } catch {
    /* storage unavailable */
  }
  emitSession()
}

export function clearSession() {
  try {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  } catch {
    /* storage unavailable */
  }
  emitSession()
}

/* ---- fetch helper ---- */

/** Error carrying the backend's stable machine-readable code (e.g. USERNAME_TAKEN). */
export class ApiError extends Error {
  status: number
  code: string

  constructor(status: number, code: string, message: string) {
    super(message)
    this.status = status
    this.code = code
  }
}

/** JSON in/out; attaches `Authorization: Bearer <jwt>` when a token is stored;
    throws ApiError (with the backend's error code) on non-2xx. */
export async function fetchJson<T>(
  path: string,
  options: { method?: string; body?: unknown } = {},
): Promise<T> {
  const headers: Record<string, string> = {}
  if (options.body !== undefined) headers['Content-Type'] = 'application/json'
  const token = getToken()
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
    /* empty body */
  }

  if (!res.ok) {
    // expired/invalid token: drop the session so the UI reverts to signed-out
    if (res.status === 401 && token) clearSession()
    const err = (data ?? {}) as { code?: string; error?: string; message?: string }
    throw new ApiError(res.status, err.code ?? 'UNKNOWN', err.error ?? err.message ?? `HTTP ${res.status}`)
  }
  return data as T
}
