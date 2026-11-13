import { FormEvent, PointerEvent as ReactPointerEvent, useCallback, useEffect, useRef, useState } from 'react'
import { API_BASE, ApiError } from '../config/api'
import { SiteFlags, Show, ShowStatus, DEFAULT_FLAGS, fetchFlags } from '../config/siteFlags'
import {
  MailingListStatus,
  ShowInput,
  adminApi,
  adminLogin,
  clearAdminToken,
  getAdminToken,
} from '../config/siteAdmin'
import { AboutPhotoDto } from '../config/sitePhotos'

/* Owner console at #/admin: page flags, shows list, About photos, mailing list sync, store sync.
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

function plural(n: number, word: string) {
  return `${n} ${word}${n === 1 ? '' : 's'}`
}

function StorePanel() {
  const [result, setResult] = useState('')
  const [busy, setBusy] = useState<'sync' | 'unlock' | null>(null)

  const sync = async () => {
    setBusy('sync')
    setResult('')
    try {
      const r = await adminApi.syncStore()
      setResult(`Done — ${plural(r.synced, 'product')} synced, ${r.deactivated} deactivated.`)
    } catch (err) {
      setResult(err instanceof ApiError ? `Sync failed: ${err.message}` : 'Sync failed')
    } finally {
      setBusy(null)
    }
  }

  const releaseLocks = async () => {
    setBusy('unlock')
    setResult('')
    try {
      const r = await adminApi.releaseLocks()
      const parts = [
        r.released > 0
          ? `Unlocked ${plural(r.released, 'product')} — you can edit prices and delete them in Printify now.`
          : 'Nothing was locked.',
      ]
      if (r.failures.length) parts.push(`Couldn't unlock: ${r.failures.join('; ')}`)
      setResult(parts.join(' '))
    } catch (err) {
      setResult(err instanceof ApiError ? `Unlock failed: ${err.message}` : 'Unlock failed')
    } finally {
      setBusy(null)
    }
  }

  return (
    <section className="adm__panel">
      <h2>Store</h2>
      <p className="adm__hint">
        Pulls the Printify catalog onto the site. Run after changing products or prices in Printify.
      </p>
      <button className="btn btn--primary" type="button" onClick={sync} disabled={busy !== null}>
        {busy === 'sync' ? 'Syncing…' : 'Sync store from Printify'}
      </button>
      <p className="adm__hint adm__hint--spaced">
        Printify freezes a product when you press Publish there, blocking price edits and deletes.
        This releases those locks — the site never needed Printify&apos;s publishing.
      </p>
      <button className="btn btn--ghost adm__unlock" type="button" onClick={releaseLocks} disabled={busy !== null}>
        {busy === 'unlock' ? 'Releasing…' : 'Release Printify locks'}
      </button>
      {result && <p className="adm__result">{result}</p>}
    </section>
  )
}

/* Mailchimp's free plan holds every send once the audience passes this many
   contacts (unsubscribed ones count too, so treat it as a ceiling, not a target). */
const MAILCHIMP_FREE_LIMIT = 250

function MailingListPanel() {
  const [status, setStatus] = useState<MailingListStatus | null>(null)
  const [result, setResult] = useState('')
  const [rejections, setRejections] = useState<string[]>([])
  const [error, setError] = useState('')
  const [busy, setBusy] = useState<'retry' | 'import' | null>(null)

  const reload = useCallback(() => {
    adminApi
      .mailingListStatus()
      .then(setStatus)
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Could not load mailing list status'))
  }, [])
  useEffect(reload, [reload])

  const run = async (includeLegacy: boolean) => {
    setBusy(includeLegacy ? 'import' : 'retry')
    setResult('')
    setRejections([])
    setError('')
    try {
      const r = await adminApi.syncMailingList(includeLegacy)
      const parts = [`Done — ${plural(r.synced, 'subscriber')} sent to Mailchimp.`]
      if (r.rejected) parts.push(`Mailchimp refused ${r.rejected}.`)
      if (r.retryLater) parts.push(`${r.retryLater} couldn't reach Mailchimp and are still queued — try again later.`)
      setResult(parts.join(' '))
      setRejections(r.rejections)
    } catch (err) {
      setError(err instanceof ApiError ? `Sync failed: ${err.message}` : 'Sync failed')
    } finally {
      setBusy(null)
      reload()
    }
  }

  const importLegacy = () => {
    const n = status?.counts.LEGACY ?? 0
    const ok = window.confirm(
      `Import ${plural(n, 'early subscriber')} into Mailchimp?\n\n` +
        'They signed up when the list promised "the first release, and nothing else". ' +
        'They will be tagged "legacy-first-release" — send them the notice email explaining the wider list ' +
        '(with a clear unsubscribe) before any other campaign.\n\n' +
        'This cannot be undone from here.',
    )
    if (ok) void run(true)
  }

  const c = status?.counts
  const overLimit = (status?.total ?? 0) > MAILCHIMP_FREE_LIMIT

  return (
    <section className="adm__panel">
      <h2>Mailing list</h2>
      {!status ? (
        <p className="adm__hint">{error ? '' : 'Loading…'}</p>
      ) : (
        <>
          <p className="adm__hint">
            {status.enabled
              ? 'New signups are copied to Mailchimp as they arrive. Campaigns are written and sent in Mailchimp.'
              : 'Mailchimp sync is off — band-api has no MAILCHIMP_API_KEY / MAILCHIMP_AUDIENCE_ID. Signups are still saved.'}
          </p>
          <dl className="adm__counts">
            <div>
              <dt>In Mailchimp</dt>
              <dd>{c?.SYNCED ?? 0}</dd>
            </div>
            <div>
              <dt>Waiting to sync</dt>
              <dd>{c?.PENDING ?? 0}</dd>
            </div>
            <div>
              <dt>Early, not imported</dt>
              <dd>{c?.LEGACY ?? 0}</dd>
            </div>
            <div>
              <dt>Refused</dt>
              <dd>{c?.REJECTED ?? 0}</dd>
            </div>
          </dl>
          <p className={'adm__hint' + (overLimit ? ' adm__warn' : '')}>
            {status.total} of {MAILCHIMP_FREE_LIMIT} on the free plan
            {overLimit && ' — over the limit: Mailchimp will hold every send until contacts are archived'}.
          </p>
          <div className="adm__formactions">
            <button
              className="btn btn--primary"
              type="button"
              onClick={() => run(false)}
              disabled={!status.enabled || busy !== null || (c?.PENDING ?? 0) === 0}
            >
              {busy === 'retry' ? 'Syncing…' : 'Retry waiting signups'}
            </button>
            <button
              className="btn btn--ghost adm__unlock"
              type="button"
              onClick={importLegacy}
              disabled={!status.enabled || busy !== null || (c?.LEGACY ?? 0) === 0}
            >
              {busy === 'import' ? 'Importing…' : 'Import early subscribers'}
            </button>
          </div>
        </>
      )}
      {error && <p className="adm__err">{error}</p>}
      {result && <p className="adm__result">{result}</p>}
      {rejections.length > 0 && (
        <ul className="adm__rejections">
          {rejections.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
      )}
    </section>
  )
}

/* Parse a CSS object-position string ("50% 62%", "center 62%", "left top") into
   x/y percentages for the focal-point handle. Anything unparseable centres. */
function parseFocus(focus?: string | null): { x: number; y: number } {
  const def = { x: 50, y: 50 }
  if (!focus) return def
  const tokens = focus.trim().split(/\s+/)
  const word: Record<string, number> = { left: 0, top: 0, center: 50, right: 100, bottom: 100 }
  const toPct = (t: string | undefined, fallback: number): number => {
    if (t === undefined) return fallback
    if (t in word) return word[t]
    const n = parseFloat(t)
    return Number.isFinite(n) ? Math.max(0, Math.min(100, n)) : fallback
  }
  return { x: toPct(tokens[0], 50), y: toPct(tokens[1], 50) }
}

/** The focal-point "crop" editor for one photo: a live 4:3 carousel frame with
    a draggable handle. Dragging sets object-position, previewed exactly as the
    public carousel renders it. */
function PhotoEditor({
  photo,
  onSaved,
  onError,
}: {
  photo: AboutPhotoDto
  onSaved: () => void
  onError: (msg: string) => void
}) {
  const [alt, setAlt] = useState(photo.alt)
  const [point, setPoint] = useState(() => parseFocus(photo.focus))
  const [busy, setBusy] = useState(false)
  const frameRef = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)

  // reset local state when a different row is opened
  useEffect(() => {
    setAlt(photo.alt)
    setPoint(parseFocus(photo.focus))
  }, [photo.id, photo.alt, photo.focus])

  const focus = `${Math.round(point.x)}% ${Math.round(point.y)}%`

  const moveTo = useCallback((clientX: number, clientY: number) => {
    const el = frameRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const x = ((clientX - r.left) / r.width) * 100
    const y = ((clientY - r.top) / r.height) * 100
    setPoint({ x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) })
  }, [])

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    dragging.current = true
    e.currentTarget.setPointerCapture(e.pointerId)
    moveTo(e.clientX, e.clientY)
  }
  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (dragging.current) moveTo(e.clientX, e.clientY)
  }
  const onPointerUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    dragging.current = false
    try {
      e.currentTarget.releasePointerCapture(e.pointerId)
    } catch {
      /* pointer already released */
    }
  }

  const save = async () => {
    setBusy(true)
    try {
      await adminApi.updatePhoto(photo.id, { alt: alt.trim(), focus, sortOrder: photo.sortOrder })
      onSaved()
    } catch (err) {
      onError(err instanceof ApiError ? err.message : 'Save failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="adm__photoedit">
      <div
        className="adm__focusframe"
        ref={frameRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      >
        <img src={API_BASE + photo.imageUrl} alt="" style={{ objectPosition: focus }} draggable={false} />
        <span className="adm__focusdot" style={{ left: `${point.x}%`, top: `${point.y}%` }} aria-hidden="true" />
      </div>
      <div className="adm__focusctl">
        <p className="adm__hint">Drag the dot to choose which part of the photo stays in frame.</p>
        <label className="adm__focuslabel">
          Alt text
          <input value={alt} onChange={(e) => setAlt(e.target.value)} maxLength={200} />
        </label>
        <code className="adm__focusval">object-position: {focus}</code>
        <button className="btn btn--primary" type="button" onClick={save} disabled={busy}>
          {busy ? 'Saving…' : 'Save crop'}
        </button>
      </div>
    </div>
  )
}

function PhotosPanel() {
  const [photos, setPhotos] = useState<AboutPhotoDto[]>([])
  const [alt, setAlt] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [openId, setOpenId] = useState<number | null>(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const reload = useCallback(() => {
    adminApi
      .allPhotos()
      .then((list) => setPhotos([...list].sort((a, b) => a.sortOrder - b.sortOrder)))
      .catch(() => setError('Could not load photos'))
  }, [])
  useEffect(reload, [reload])

  const upload = async (e: FormEvent) => {
    e.preventDefault()
    if (!file) {
      setError('Choose an image first')
      return
    }
    setBusy(true)
    setError('')
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('alt', alt.trim())
      await adminApi.createPhoto(fd)
      setAlt('')
      setFile(null)
      if (fileRef.current) fileRef.current.value = ''
      reload()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Upload failed')
    } finally {
      setBusy(false)
    }
  }

  const remove = async (p: AboutPhotoDto) => {
    if (!window.confirm(`Delete this photo${p.alt ? ` (“${p.alt}”)` : ''}?`)) return
    setError('')
    try {
      await adminApi.deletePhoto(p.id)
      if (openId === p.id) setOpenId(null)
      reload()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Delete failed')
    }
  }

  // Swap sortOrder with the neighbour in the given direction, then persist both.
  const move = async (index: number, dir: -1 | 1) => {
    const a = photos[index]
    const b = photos[index + dir]
    if (!a || !b) return
    setError('')
    try {
      await adminApi.updatePhoto(a.id, { alt: a.alt, focus: a.focus ?? null, sortOrder: b.sortOrder })
      await adminApi.updatePhoto(b.id, { alt: b.alt, focus: b.focus ?? null, sortOrder: a.sortOrder })
      reload()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Reorder failed')
    }
  }

  return (
    <section className="adm__panel">
      <h2>About photos</h2>
      <p className="adm__hint">The carousel in the About section. Upload a photo, then drag its crop point.</p>
      <form className="adm__photoform" onSubmit={upload}>
        <label>
          Image file
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
        </label>
        <label>
          Alt text
          <input
            value={alt}
            onChange={(e) => setAlt(e.target.value)}
            placeholder="villxin on a bridge over the river"
            maxLength={200}
          />
        </label>
        <button className="btn btn--primary" type="submit" disabled={busy}>
          {busy ? 'Uploading…' : 'Add photo'}
        </button>
      </form>
      {error && <p className="adm__err">{error}</p>}
      {photos.length === 0 ? (
        <p className="adm__hint">No photos yet — the About section uses the built-in fallback images.</p>
      ) : (
        <ul className="adm__photos">
          {photos.map((p, i) => (
            <li key={p.id}>
              <div className="adm__photorow">
                <img
                  className="adm__thumb"
                  src={API_BASE + p.imageUrl}
                  alt=""
                  style={p.focus ? { objectPosition: p.focus } : undefined}
                />
                <span className="adm__photoalt">{p.alt || <em>No alt text</em>}</span>
                <span className="adm__photoops">
                  <button type="button" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move up">
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => move(i, 1)}
                    disabled={i === photos.length - 1}
                    aria-label="Move down"
                  >
                    ↓
                  </button>
                  <button type="button" onClick={() => setOpenId(openId === p.id ? null : p.id)}>
                    {openId === p.id ? 'Close' : 'Crop'}
                  </button>
                  <button type="button" className="danger" onClick={() => remove(p)}>
                    Delete
                  </button>
                </span>
              </div>
              {openId === p.id && (
                <PhotoEditor
                  photo={p}
                  onSaved={() => {
                    setOpenId(null)
                    reload()
                  }}
                  onError={setError}
                />
              )}
            </li>
          ))}
        </ul>
      )}
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
            <PhotosPanel />
            <MailingListPanel />
            <StorePanel />
          </>
        )}
      </div>
    </main>
  )
}

export default AdminPage
