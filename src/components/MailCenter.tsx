import { useEffect, useState, FormEvent } from 'react'
import { ApiError } from '../config/api'
import { communityApi, fmtDate, fmtDateTime } from '../config/community'
import type { DmRequestDto, InboxThreadDto, SentFolderDto, ThreadMessagesDto } from '../config/community'
import useAuth from '../hooks/useAuth'

type Note = { k: 'ok' | 'dim' | 'err'; t: string } | null

const CANT_REACH: Note = { k: 'err', t: "Can't reach the Mail Center — try again in a minute." }

/* Signed in -> the real DM backend; signed out -> the local-state demo,
   labeled as a preview. */
function MailCenter() {
  const { signedIn } = useAuth()
  return signedIn ? <LiveMailCenter /> : <DemoMailCenter />
}

/* ============================================================
   Live Mail Center — request-gated DMs via band-api
   ============================================================ */
function LiveMailCenter() {
  const { username: me } = useAuth()
  const [folder, setFolder] = useState<'inbox' | 'requests' | 'sent' | 'trash'>('inbox')
  const [inbox, setInbox] = useState<InboxThreadDto[] | null>(null)
  const [requests, setRequests] = useState<DmRequestDto[] | null>(null)
  const [sent, setSent] = useState<SentFolderDto | null>(null)
  const [trash, setTrash] = useState<InboxThreadDto[] | null>(null)
  const [thread, setThread] = useState<ThreadMessagesDto | null>(null)
  const [reply, setReply] = useState('')
  const [busy, setBusy] = useState(false)
  const [note, setNote] = useState<Note>(null)

  function loadCore() {
    communityApi
      .dmInbox()
      .then(setInbox)
      .catch(() => setNote(CANT_REACH))
    communityApi
      .dmRequests()
      .then(setRequests)
      .catch(() => {})
  }

  useEffect(loadCore, [])

  // sent/trash load fresh each time their folder is opened
  useEffect(() => {
    if (folder === 'sent')
      communityApi
        .dmSent()
        .then(setSent)
        .catch(() => setNote(CANT_REACH))
    if (folder === 'trash')
      communityApi
        .dmTrash()
        .then(setTrash)
        .catch(() => setNote(CANT_REACH))
  }, [folder])

  async function openThread(id: number) {
    setNote(null)
    try {
      const t = await communityApi.dmThread(id)
      setThread(t)
      setReply('')
      // the GET marked it read server-side; mirror locally
      setInbox((xs) => (xs ? xs.map((x) => (x.id === id ? { ...x, unreadCount: 0 } : x)) : xs))
    } catch {
      setNote(CANT_REACH)
    }
  }

  async function decide(id: number, accepted: boolean) {
    const req = requests?.find((r) => r.id === id)
    if (!req || busy) return
    setBusy(true)
    try {
      if (accepted) {
        await communityApi.dmAccept(id)
        setNote({ k: 'ok', t: 'Accepted — ' + req.from.username + "'s message moved to your inbox." })
        loadCore()
      } else {
        await communityApi.dmDecline(id)
        setNote({ k: 'dim', t: 'Declined. ' + req.from.username + " isn't notified — the request just quietly expires." })
      }
      setRequests((rs) => (rs ? rs.filter((r) => r.id !== id) : rs))
    } catch {
      setNote(CANT_REACH)
    } finally {
      setBusy(false)
    }
  }

  async function sendReply(e: FormEvent) {
    e.preventDefault()
    const body = reply.trim()
    if (!thread || !body || busy) return
    setBusy(true)
    try {
      const m = await communityApi.dmPostMessage(thread.id, body)
      setThread((t) => (t ? { ...t, messages: [...t.messages, m] } : t))
      setReply('')
    } catch (err) {
      setNote(
        err instanceof ApiError && err.code === 'THREAD_CLOSED'
          ? { k: 'dim', t: 'This thread is closed.' }
          : CANT_REACH,
      )
    } finally {
      setBusy(false)
    }
  }

  async function revoke() {
    if (!thread || busy) return
    setBusy(true)
    try {
      await communityApi.dmRevoke(thread.id)
      setNote({
        k: 'dim',
        t:
          'Access revoked. The thread is closed on both ends — ' +
          thread.with.username +
          " can't message you again unless you reopen it.",
      })
      setThread(null)
      loadCore()
    } catch {
      setNote(CANT_REACH)
    } finally {
      setBusy(false)
    }
  }

  async function reopen() {
    if (!thread || busy) return
    setBusy(true)
    try {
      await communityApi.dmReopen(thread.id)
      const t = await communityApi.dmThread(thread.id)
      setThread(t)
      setNote({ k: 'ok', t: 'Thread reopened — you can both message again.' })
      loadCore()
    } catch (err) {
      setNote(
        err instanceof ApiError && err.code === 'NOT_REVOKER'
          ? { k: 'dim', t: 'Only the person who revoked the thread can reopen it.' }
          : CANT_REACH,
      )
    } finally {
      setBusy(false)
    }
  }

  async function trashThread() {
    if (!thread || busy) return
    setBusy(true)
    try {
      await communityApi.dmTrashThread(thread.id)
      setNote({ k: 'dim', t: 'Thread moved to Trash.' })
      setThread(null)
      loadCore()
    } catch {
      setNote(CANT_REACH)
    } finally {
      setBusy(false)
    }
  }

  async function restore(id: number) {
    if (busy) return
    setBusy(true)
    try {
      await communityApi.dmRestore(id)
      setTrash((xs) => (xs ? xs.filter((x) => x.id !== id) : xs))
      setNote({ k: 'ok', t: 'Thread restored to your inbox.' })
      loadCore()
    } catch {
      setNote(CANT_REACH)
    } finally {
      setBusy(false)
    }
  }

  const unread = inbox ? inbox.filter((t) => t.unreadCount > 0).length : 0
  const folders = [
    { id: 'inbox', label: 'Inbox', count: unread },
    { id: 'requests', label: 'Message Requests', count: requests?.length ?? 0 },
    { id: 'sent', label: 'Sent', count: 0 },
    { id: 'trash', label: 'Trash', count: 0 },
  ] as const

  const loading = <p style={{ fontStyle: 'italic', color: 'var(--text-faint)' }}>Loading…</p>

  return (
    <div className="wrap ya__page ya__page--inbox">
      {/* ---------- folder sidebar ---------- */}
      <div>
        <section className="yabox" style={{ marginBottom: 18 }}>
          <div className="yabox__hd">Mail Center</div>
          <nav className="ya__folders" aria-label="Mail folders">
            {folders.map((f) => (
              <button
                key={f.id}
                type="button"
                className={folder === f.id ? 'is-here' : undefined}
                onClick={() => {
                  setFolder(f.id)
                  setThread(null)
                  setNote(null)
                }}
              >
                {f.label}
                {f.count ? <b>{f.count}</b> : null}
              </button>
            ))}
          </nav>
        </section>
        <p className="ya__counter" style={{ textAlign: 'left' }}>
          DMs open by request only.
          <br />
          Accepts are revocable — block
          <br />
          from any thread, any time.
        </p>
      </div>

      {/* ---------- main pane ---------- */}
      <div>
        {note && (
          <p className={'ya__note ' + note.k} style={{ margin: '0 0 12px' }}>
            {note.t}
          </p>
        )}

        {folder === 'requests' && (
          <section className="yabox yabox--v">
            <div className="yabox__hd">Message requests ({requests?.length ?? 0})</div>
            {requests === null && <div className="yabox__bd">{loading}</div>}
            {requests && requests.length === 0 && (
              <div className="yabox__bd">
                <p style={{ fontStyle: 'italic', color: 'var(--text-faint)' }}>No pending requests. Peace.</p>
              </div>
            )}
            {requests?.map((r) => (
              <div className="ya__req" key={r.id}>
                <div className="who">
                  <span className="av">{r.from.username[0].toUpperCase()}</span>
                  <div className="nm">{r.from.username}</div>
                </div>
                <div>
                  <div className="when">{fmtDate(r.createdAt)} · wants to message you</div>
                  <div className="txt">{`"${r.preview}"`}</div>
                  <div className="ya__req-row">
                    <button className="btn btn--primary" type="button" disabled={busy} onClick={() => void decide(r.id, true)}>
                      Accept
                    </button>
                    <button className="btn" type="button" disabled={busy} onClick={() => void decide(r.id, false)}>
                      Decline
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </section>
        )}

        {folder === 'inbox' && !thread && (
          <section className="yabox">
            <div className="yabox__hd">Inbox — {unread} unread</div>
            {inbox === null && <div className="yabox__bd">{loading}</div>}
            {inbox && inbox.length === 0 && (
              <div className="yabox__bd">
                <p style={{ fontStyle: 'italic', color: 'var(--text-faint)' }}>
                  No conversations yet — accept a request, or send one from the profile.
                </p>
              </div>
            )}
            {inbox && inbox.length > 0 && (
              <table className="ya__mail">
                <tbody>
                  {inbox.map((t) => (
                    <tr key={t.id} className={t.unreadCount > 0 ? 'unread' : undefined} onClick={() => void openThread(t.id)}>
                      <td className="frm">
                        {t.with.username}
                        {t.with.official && (
                          <span className="ya__official" style={{ marginLeft: 6 }}>
                            Official
                          </span>
                        )}
                      </td>
                      <td className="sub">
                        {/* keyboard path into the thread (the row itself is mouse-only) */}
                        <a
                          href="#/yourarea/inbox"
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            void openThread(t.id)
                          }}
                        >
                          {t.status === 'REVOKED' ? '(revoked) ' : ''}
                          {t.lastMessagePreview}
                        </a>
                      </td>
                      <td className="dt">{fmtDateTime(t.lastActivityAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        )}

        {folder === 'inbox' && thread && (
          <section className="yabox">
            <div className="yabox__hd ya__thread-hd">
              <button type="button" className="bk" onClick={() => setThread(null)}>
                ← Inbox
              </button>
              <span>
                {thread.with.username}
                {thread.status === 'REVOKED' ? ' — revoked' : ''}
              </span>
              <button type="button" className="bk" disabled={busy} onClick={() => void trashThread()}>
                Trash
              </button>
              {thread.status === 'OPEN' ? (
                <button type="button" className="blk" disabled={busy} onClick={() => void revoke()}>
                  Revoke access
                </button>
              ) : (
                <button type="button" className="blk" disabled={busy} onClick={() => void reopen()}>
                  Reopen
                </button>
              )}
            </div>
            <div className="yabox__bd">
              {thread.messages.map((m) => (
                <div key={m.id} className={'ya__bubble' + (m.from === me ? ' me' : '')}>
                  <div className="when">{m.from === me ? 'you' : m.from}</div>
                  <div className="txt">{m.body}</div>
                </div>
              ))}
              {thread.status === 'OPEN' ? (
                <form className="ya__reply" onSubmit={sendReply}>
                  <input
                    type="text"
                    value={reply}
                    maxLength={5000}
                    placeholder={'reply to ' + thread.with.username + '…'}
                    aria-label="Reply"
                    onChange={(e) => setReply(e.target.value)}
                  />
                  <button className="btn btn--primary" type="submit" disabled={busy || !reply.trim()}>
                    Send
                  </button>
                </form>
              ) : (
                <p className="yadm__hint">This thread is closed. Reopen it to keep talking.</p>
              )}
              <p className="yadm__hint">Auto-filter is on — flagged words are starred out before delivery.</p>
            </div>
          </section>
        )}

        {folder === 'sent' && (
          <section className="yabox">
            <div className="yabox__hd">Sent</div>
            {sent === null && <div className="yabox__bd">{loading}</div>}
            {sent && sent.requests.length === 0 && sent.messages.length === 0 && (
              <div className="yabox__bd">
                <p style={{ fontStyle: 'italic', color: 'var(--text-faint)' }}>Nothing here yet.</p>
              </div>
            )}
            {sent && (sent.requests.length > 0 || sent.messages.length > 0) && (
              <table className="ya__mail ya__mail--static">
                <tbody>
                  {sent.requests.map((r) => (
                    <tr key={'r' + r.id}>
                      <td className="frm">to {r.to.username}</td>
                      <td className="sub">request — {r.preview}</td>
                      <td className="dt">{fmtDateTime(r.sentAt)}</td>
                    </tr>
                  ))}
                  {sent.messages.map((m, i) => (
                    <tr key={'m' + m.threadId + '-' + i}>
                      <td className="frm">to {m.to.username}</td>
                      <td className="sub">{m.body}</td>
                      <td className="dt">{fmtDateTime(m.sentAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        )}

        {folder === 'trash' && (
          <section className="yabox">
            <div className="yabox__hd">Trash</div>
            {trash === null && <div className="yabox__bd">{loading}</div>}
            {trash && trash.length === 0 && (
              <div className="yabox__bd">
                <p style={{ fontStyle: 'italic', color: 'var(--text-faint)' }}>Nothing here yet.</p>
              </div>
            )}
            {trash && trash.length > 0 && (
              <table className="ya__mail ya__mail--static">
                <tbody>
                  {trash.map((t) => (
                    <tr key={t.id}>
                      <td className="frm">{t.with.username}</td>
                      <td className="sub">{t.lastMessagePreview}</td>
                      <td className="dt">
                        <button type="button" className="ya__rowact" disabled={busy} onClick={() => void restore(t.id)}>
                          Restore
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        )}
      </div>
    </div>
  )
}

/* ============================================================
   Signed-out preview — sample data, local-state walkthrough
   ============================================================ */
interface DemoRequest {
  id: string
  user: string
  date: string
  text: string
}

interface DemoThreadMsg {
  from: string
  text: string
}

interface DemoMsg {
  id: string
  user: string
  subject: string
  date: string
  unread: boolean
  official?: boolean
  thread: DemoThreadMsg[]
}

const REQUESTS: DemoRequest[] = [
  { id: 'r1', user: 'moth.to.flame', date: 'Jul 10 2026', text: "hi!! saw you in grave.bloom's top 8 — do you have the ashfall demo bootleg from the livestream?" },
  { id: 'r2', user: 'sxlemnity', date: 'Jul 09 2026', text: 'your comment on the tidewreck thread was so right. can we talk lyrics?' },
]

const MESSAGES: DemoMsg[] = [
  {
    id: 'm1', user: 'emberwitch', subject: 're: that bridge', date: 'Jul 10 2026 · 11:58 PM', unread: true,
    thread: [
      { from: 'you', text: 'hey — the hollow sun demo wrecked me. is the bridge in open C?' },
      { from: 'emberwitch', text: "RIGHT?? i think it's drop A actually. static.saint tabbed it in the boards" },
      { from: 'emberwitch', text: 'also villxin liked my comment i am unwell' },
    ],
  },
  {
    id: 'm2', user: 'tidewrecked', subject: 'carpool to the first show??', date: 'Jul 08 2026 · 6:12 PM', unread: true,
    thread: [
      { from: 'tidewrecked', text: "if the ashfall release show happens i'm driving down. 2 seats free. bring blankets" },
    ],
  },
  {
    id: 'm3', user: 'villxin', subject: 'welcome to yourarea', date: 'Jun 24 2026 · 12:00 AM', unread: false, official: true,
    thread: [
      { from: 'villxin', text: 'you found it. this place is small on purpose. leave a comment, claim your corner, be kind to each other. — v' },
    ],
  },
]

function DemoMailCenter() {
  const [folder, setFolder] = useState('inbox')
  const [requests, setRequests] = useState(REQUESTS)
  const [messages, setMessages] = useState(MESSAGES)
  const [openId, setOpenId] = useState<string | null>(null)
  const [note, setNote] = useState<Note>(null)
  const open = messages.find((m) => m.id === openId)

  function decide(id: string, accepted: boolean) {
    const req = requests.find((r) => r.id === id)
    if (!req) return
    setRequests((rs) => rs.filter((r) => r.id !== id))
    if (accepted) {
      setMessages((ms) => [
        { id: 'm-' + id, user: req.user, subject: '(new conversation)', date: req.date, unread: true, thread: [{ from: req.user, text: req.text }] },
        ...ms,
      ])
      setNote({ k: 'ok', t: req.user + ' accepted — their message moved to your inbox.' })
    } else {
      setNote({ k: 'dim', t: 'Declined. ' + req.user + " isn't notified — the request just quietly expires." })
    }
  }

  function openMsg(m: DemoMsg) {
    setOpenId(m.id)
    setMessages((ms) => ms.map((x) => (x.id === m.id ? { ...x, unread: false } : x)))
  }

  function revoke(m: DemoMsg) {
    setOpenId(null)
    setMessages((ms) => ms.filter((x) => x.id !== m.id))
    setNote({ k: 'dim', t: "Access revoked. The thread is closed on both ends — " + m.user + " can't message you again unless you accept a new request." })
  }

  const unread = messages.filter((m) => m.unread).length
  const folders = [
    { id: 'inbox', label: 'Inbox', count: unread },
    { id: 'requests', label: 'Message Requests', count: requests.length },
    { id: 'sent', label: 'Sent', count: 0 },
    { id: 'trash', label: 'Trash', count: 0 },
  ]

  return (
    <div className="wrap ya__page ya__page--inbox">
      {/* ---------- folder sidebar ---------- */}
      <div>
        <section className="yabox" style={{ marginBottom: 18 }}>
          <div className="yabox__hd">Mail Center</div>
          <nav className="ya__folders" aria-label="Mail folders">
            {folders.map((f) => (
              <button
                key={f.id}
                type="button"
                className={folder === f.id ? 'is-here' : undefined}
                onClick={() => {
                  setFolder(f.id)
                  setOpenId(null)
                  setNote(null)
                }}
              >
                {f.label}
                {f.count ? <b>{f.count}</b> : null}
              </button>
            ))}
          </nav>
        </section>
        <p className="ya__counter" style={{ textAlign: 'left' }}>
          DMs open by request only.
          <br />
          Accepts are revocable — block
          <br />
          from any thread, any time.
        </p>
      </div>

      {/* ---------- main pane ---------- */}
      <div>
        <p className="ya__note dim" style={{ margin: '0 0 12px' }}>
          Preview with sample data — <a href="#/yourarea/join">claim a username</a> to open your real Mail Center.
        </p>

        {note && (
          <p className={'ya__note ' + note.k} style={{ margin: '0 0 12px' }}>
            {note.t}
          </p>
        )}

        {folder === 'requests' && (
          <section className="yabox yabox--v">
            <div className="yabox__hd">Message requests ({requests.length})</div>
            {requests.length === 0 && (
              <div className="yabox__bd">
                <p style={{ fontStyle: 'italic', color: 'var(--text-faint)' }}>No pending requests. Peace.</p>
              </div>
            )}
            {requests.map((r) => (
              <div className="ya__req" key={r.id}>
                <div className="who">
                  <span className="av">{r.user[0].toUpperCase()}</span>
                  <div className="nm">{r.user}</div>
                </div>
                <div>
                  <div className="when">{r.date} · wants to message you</div>
                  <div className="txt">{`"${r.text}"`}</div>
                  <div className="ya__req-row">
                    <button className="btn btn--primary" type="button" onClick={() => decide(r.id, true)}>
                      Accept
                    </button>
                    <button className="btn" type="button" onClick={() => decide(r.id, false)}>
                      Decline
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </section>
        )}

        {folder === 'inbox' && !open && (
          <section className="yabox">
            <div className="yabox__hd">Inbox — {unread} unread</div>
            <table className="ya__mail">
              <tbody>
                {messages.map((m) => (
                  <tr key={m.id} className={m.unread ? 'unread' : undefined} onClick={() => openMsg(m)}>
                    <td className="frm">
                      {m.user}
                      {m.official && (
                        <span className="ya__official" style={{ marginLeft: 6 }}>
                          Official
                        </span>
                      )}
                    </td>
                    <td className="sub">
                      {/* keyboard path into the thread (the row itself is mouse-only) */}
                      <a
                        href="#/yourarea/inbox"
                        onClick={(e) => {
                          e.preventDefault()
                          openMsg(m)
                        }}
                      >
                        {m.subject}
                      </a>
                    </td>
                    <td className="dt">{m.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        {folder === 'inbox' && open && (
          <section className="yabox">
            <div className="yabox__hd ya__thread-hd">
              <button type="button" className="bk" onClick={() => setOpenId(null)}>
                ← Inbox
              </button>
              <span>
                {open.user} — {open.subject}
              </span>
              <button type="button" className="blk" onClick={() => revoke(open)}>
                Revoke access
              </button>
            </div>
            <div className="yabox__bd">
              {open.thread.map((t, i) => (
                <div key={i} className={'ya__bubble' + (t.from === 'you' ? ' me' : '')}>
                  <div className="when">{t.from === 'you' ? 'you' : t.from}</div>
                  <div className="txt">{t.text}</div>
                </div>
              ))}
              <div className="ya__reply">
                <input type="text" placeholder={'reply to ' + open.user + '…'} aria-label="Reply" />
                <button className="btn btn--primary" type="button">
                  Send
                </button>
              </div>
              <p className="yadm__hint">Auto-filter is on — flagged words are starred out before delivery.</p>
            </div>
          </section>
        )}

        {(folder === 'sent' || folder === 'trash') && (
          <section className="yabox">
            <div className="yabox__hd">{folder === 'sent' ? 'Sent' : 'Trash'}</div>
            <div className="yabox__bd">
              <p style={{ fontStyle: 'italic', color: 'var(--text-faint)' }}>Nothing here yet.</p>
            </div>
          </section>
        )}
      </div>
    </div>
  )
}

export default MailCenter
