import { FormEvent, useCallback, useEffect, useState } from 'react'
import { ApiError } from '../config/api'
import { SiteFlags, Show, ShowStatus, DEFAULT_FLAGS, fetchFlags } from '../config/siteFlags'
import { ShowInput, adminApi, adminLogin, clearAdminToken, getAdminToken } from '../config/siteAdmin'

/* Owner console at #/admin: page flags, shows list, store sync.
   Not linked from anywhere — reachable only by URL, gated by the ADMIN login. */

const EMPTY_SHOW: ShowInput = { showDate: '', venue: '', city: '', ticketUrl: '', note: '', status: 'UPCOMING' }

const FLAG_LABELS: { key: keyof SiteFlags; label: string; hint: string }[] = [
  { key: 'store', label: 'Store', hint: 'Merch tab + store page' },
  { key: 'live', label: 'Live', hint: 'Shows tab + dates list' },
  { key: 'yourarea', label: 'YourArea', hint: 'Community tab' },
]

function LoginForm({ onDone }: { onDone: () => void }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      await adminLogin(email.trim(), password)
      onDone()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Login failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <form className="adm__login" onSubmit={submit}>
      <h1 className="adm__title">Admin</h1>
      <label>
        Email
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" required />
      </label>
      <label>
        Password
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          required
        />
      </label>
      {error && <p className="adm__err">{error}</p>}
      <button className="btn btn--primary" type="submit" disabled={busy}>
        {busy ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  )
}

function FlagsPanel() {
  const [flags, setFlags] = useState<SiteFlags>(DEFAULT_FLAGS)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchFlags().then(setFlags).catch(() => setError('Could not load flags'))
  }, [])

  const toggle = async (key: keyof SiteFlags) => {
    setError('')
    try {
      setFlags(await adminApi.setFlag(key, !flags[key]))
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Update failed')
    }
  }

  return (
    <section className="adm__panel">
      <h2>Pages</h2>
      <p className="adm__hint">Off = hidden from the menu; its link shows the Under Construction page.</p>
      {FLAG_LABELS.map(({ key, label, hint }) => (
        <div className="adm__flag" key={key}>
          <div>
            <b>{label}</b>
            <span>{hint}</span>
          </div>
          <button
            type="button"
            className={'adm__switch' + (flags[key] ? ' on' : '')}
            role="switch"
            aria-checked={flags[key]}
            aria-label={`${label} page`}
            onClick={() => toggle(key)}
          >
            <i />
            {flags[key] ? 'On' : 'Off'}
          </button>
        </div>
      ))}
      {error && <p className="adm__err">{error}</p>}
    </section>
  )
}

function ShowsPanel() {
  const [shows, setShows] = useState<Show[]>([])
  const [form, setForm] = useState<ShowInput>(EMPTY_SHOW)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const reload = useCallback(() => {
    adminApi.allShows().then(setShows).catch(() => setError('Could not load shows'))
  }, [])
  useEffect(reload, [reload])

  const set = (patch: Partial<ShowInput>) => setForm((f) => ({ ...f, ...patch }))

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      if (editingId === null) {
        await adminApi.createShow(form)
      } else {
        await adminApi.updateShow(editingId, form)
      }
      setForm(EMPTY_SHOW)
      setEditingId(null)
      reload()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Save failed')
    } finally {
      setBusy(false)
    }
  }

  const startEdit = (s: Show) => {
    setEditingId(s.id)
    setForm({
      showDate: s.showDate,
      venue: s.venue,
      city: s.city,
      ticketUrl: s.ticketUrl ?? '',
      note: s.note ?? '',
      status: s.status,
    })
  }

  const remove = async (s: Show) => {
    if (!window.confirm(`Delete ${s.venue} — ${s.showDate}?`)) return
    setError('')
    try {
      await adminApi.deleteShow(s.id)
      if (editingId === s.id) {
        setEditingId(null)
        setForm(EMPTY_SHOW)
      }
      reload()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Delete failed')
    }
  }

  const today = new Date().toISOString().slice(0, 10)

  return (
    <section className="adm__panel">
      <h2>Shows</h2>
      <form className="adm__showform" onSubmit={submit}>
        <div className="adm__grid">
          <label>
            Date
            <input type="date" value={form.showDate} onChange={(e) => set({ showDate: e.target.value })} required />
          </label>
          <label>
            Venue
            <input value={form.venue} onChange={(e) => set({ venue: e.target.value })} required maxLength={200} />
          </label>
          <label>
            City
            <input
              value={form.city}
              onChange={(e) => set({ city: e.target.value })}
              placeholder="Nashville, TN"
              required
              maxLength={120}
            />
          </label>
          <label>
            Ticket link
            <input
              type="url"
              value={form.ticketUrl ?? ''}
              onChange={(e) => set({ ticketUrl: e.target.value })}
              placeholder="https://…"
              maxLength={500}
            />
          </label>
          <label>
            Note
            <input
              value={form.note ?? ''}
              onChange={(e) => set({ note: e.target.value })}
              placeholder="with special guests…"
              maxLength={300}
            />
          </label>
          <label>
            Status
            <select value={form.status} onChange={(e) => set({ status: e.target.value as ShowStatus })}>
              <option value="UPCOMING">Upcoming</option>
              <option value="SOLD_OUT">Sold out</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </label>
        </div>
        <div className="adm__formactions">
          <button className="btn btn--primary" type="submit" disabled={busy}>
            {editingId === null ? 'Add show' : 'Save changes'}
          </button>
          {editingId !== null && (
            <button
              className="btn btn--ghost"
              type="button"
              onClick={() => {
                setEditingId(null)
                setForm(EMPTY_SHOW)
              }}
            >
              Cancel edit
            </button>
          )}
        </div>
      </form>
      {error && <p className="adm__err">{error}</p>}
      {shows.length === 0 ? (
        <p className="adm__hint">No shows yet — the Live page shows its empty state.</p>
      ) : (
        <ul className="adm__shows">
          {shows.map((s) => (
            <li key={s.id} className={s.showDate < today ? 'past' : ''}>
              <span className="adm__showdate">{s.showDate}</span>
              <span className="adm__showwhat">
                <b>{s.venue}</b> — {s.city}
                {s.status !== 'UPCOMING' && <em> [{s.status.replace('_', ' ').toLowerCase()}]</em>}
              </span>
              <span className="adm__showops">
                <button type="button" onClick={() => startEdit(s)}>
                  Edit
                </button>
                <button type="button" className="danger" onClick={() => remove(s)}>
                  Delete
                </button>
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

function StorePanel() {
  const [result, setResult] = useState('')
  const [busy, setBusy] = useState(false)

  const sync = async () => {
    setBusy(true)
    setResult('')
    try {
      const r = await adminApi.syncStore()
      setResult(`Done — ${r.synced} product${r.synced === 1 ? '' : 's'} synced, ${r.deactivated} deactivated.`)
    } catch (err) {
      setResult(err instanceof ApiError ? `Sync failed: ${err.message}` : 'Sync failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="adm__panel">
      <h2>Store</h2>
      <p className="adm__hint">
        Pulls the Printify catalog onto the site. Run after changing products or prices in Printify.
      </p>
      <button className="btn btn--primary" type="button" onClick={sync} disabled={busy}>
        {busy ? 'Syncing…' : 'Sync store from Printify'}
      </button>
      {result && <p className="adm__result">{result}</p>}
    </section>
  )
}

function AdminPage() {
  const [authed, setAuthed] = useState(() => Boolean(getAdminToken()))

  // an expired token clears itself on the first 401/403; reflect that here
  useEffect(() => {
    if (!authed) return
    const id = window.setInterval(() => {
      if (!getAdminToken()) setAuthed(false)
    }, 1000)
    return () => window.clearInterval(id)
  }, [authed])

  return (
    <main className="adm">
      <div className="wrap adm__in">
        {!authed ? (
          <LoginForm onDone={() => setAuthed(true)} />
        ) : (
          <>
            <div className="adm__head">
              <h1 className="adm__title">Site admin</h1>
              <button
                className="btn btn--ghost"
                type="button"
                onClick={() => {
                  clearAdminToken()
                  setAuthed(false)
                }}
              >
                Sign out
              </button>
            </div>
            <FlagsPanel />
            <ShowsPanel />
            <StorePanel />
          </>
        )}
      </div>
    </main>
  )
}

export default AdminPage
