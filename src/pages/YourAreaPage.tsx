import { useEffect, useRef, useState, FormEvent } from 'react'
import type { ReactNode } from 'react'
import { site } from '../config/site'
import type { Track } from '../config/site'
import { ApiError, clearSession, storeSession } from '../config/api'
import { communityApi, fmtDate, fmtDateTime, fmtYearMonth } from '../config/community'
import type { BoardDto, BulletinDto, CommunityProfile, WallCommentDto } from '../config/community'
import useAuth from '../hooks/useAuth'
import Icon from '../components/Icon'
import MailCenter from '../components/MailCenter'
import '../styles/yourarea.css'

const ya = site.yourarea

/* Sub-views hang off the page hash: "#/yourarea" = profile,
   "#/yourarea/inbox" = Mail Center, "#/yourarea/verify?token=…" = magic-link
   landing (the emailed links use this exact shape), "#/yourarea/join" =
   profile + signup strip. */
type YaView = 'profile' | 'inbox' | 'verify'

function getView(): YaView {
  const hash = window.location.hash
  if (hash.startsWith('#/yourarea/inbox')) return 'inbox'
  if (hash.startsWith('#/yourarea/verify')) return 'verify'
  return 'profile'
}

function Box({ title, violet, pad = true, children }: { title: string; violet?: boolean; pad?: boolean; children: ReactNode }) {
  return (
    <section className={'yabox' + (violet ? ' yabox--v' : '')}>
      <div className="yabox__hd">{title}</div>
      {pad ? <div className="yabox__bd">{children}</div> : children}
    </section>
  )
}

function fmt(t: number): string {
  if (!Number.isFinite(t) || t <= 0) return '–:––'
  const m = Math.floor(t / 60)
  const s = Math.floor(t % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}

/* Profile song — the prototype simulated playback; here it plays a real
   demo track the same way DemoPlayer does. */
function ProfileSong({ song }: { song: Track }) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)
  const [pos, setPos] = useState(0)
  const [dur, setDur] = useState(0)

  const toggle = () => {
    const audio = audioRef.current
    if (!audio) return
    if (playing) {
      audio.pause()
      setPlaying(false)
      return
    }
    setPlaying(true)
    void audio.play().catch(() => setPlaying(false))
  }

  return (
    <div className="ya__song">
      <audio
        ref={audioRef}
        src={song.src}
        preload="metadata"
        onLoadedMetadata={(e) => setDur(e.currentTarget.duration)}
        onTimeUpdate={(e) => setPos(e.currentTarget.currentTime)}
        onEnded={() => {
          setPlaying(false)
          setPos(0)
        }}
      />
      <button className="ya__song-btn" onClick={toggle} aria-label={(playing ? 'Pause ' : 'Play ') + song.title}>
        <span>
          <Icon name={playing ? 'pause' : 'play'} />
        </span>
      </button>
      <div className="ya__song-main">
        <div className="ya__song-name">{song.title}</div>
        <div className="ya__song-note">{song.note}</div>
        <div className="ya__song-bar">
          <div className="ya__song-fill" style={{ width: `${dur > 0 ? (pos / dur) * 100 : 0}%` }} />
        </div>
      </div>
      <div className="ya__song-time">{playing ? fmt(pos) : fmt(dur)}</div>
    </div>
  )
}

/* DM request modal. Signed in it sends a real request to villxin; signed
   out it stays the 3-phase walkthrough (compose -> sent -> recipient view),
   labeled as a preview. */
function DmModal({ onClose }: { onClose: () => void }) {
  const { signedIn } = useAuth()
  const [phase, setPhase] = useState<'compose' | 'sent' | 'recipient'>('compose')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const boxRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    boxRef.current?.focus()
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  async function sendReal() {
    const body = message.trim()
    if (!body || busy) return
    setBusy(true)
    setErr(null)
    try {
      await communityApi.dmSendRequest('villxin', body)
      setPhase('sent')
    } catch (e) {
      const code = e instanceof ApiError ? e.code : 'NETWORK'
      setErr(
        code === 'THREAD_EXISTS'
          ? 'You already have an open thread with villxin — it is in your inbox.'
          : code === 'THREAD_REVOKED'
            ? 'You revoked this thread — reopen it from your inbox instead.'
            : code === 'UNAUTHENTICATED'
              ? 'Your session expired — log in again from the signup strip.'
              : "The request didn't send — try again in a minute.",
      )
    } finally {
      setBusy(false)
    }
  }

  const goJoin = () => {
    onClose()
    window.location.hash = '#/yourarea/join'
    // wait for the modal's body-scroll lock to release
    window.setTimeout(() => document.getElementById('join')?.scrollIntoView(), 50)
  }

  return (
    <div
      className="yadm__scrim"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="yadm" role="dialog" aria-modal="true" aria-label="Send a message" tabIndex={-1} ref={boxRef}>
        {phase === 'compose' && (
          <Box title="Send a message">
            <p>
              DMs on YourArea start as a <b>request</b>. villxin (or any member) sees who's asking before anything
              lands in their inbox.
            </p>
            {signedIn ? (
              <>
                <textarea
                  className="yadm__msg"
                  value={message}
                  maxLength={5000}
                  placeholder="say something worth opening…"
                  aria-label="Message"
                  onChange={(e) => setMessage(e.target.value)}
                />
                {err && <p className="ya__note err">{err}</p>}
                <div className="yadm__row">
                  <button
                    className="btn btn--primary"
                    type="button"
                    disabled={busy || !message.trim()}
                    onClick={() => void sendReal()}
                  >
                    Send request
                  </button>
                  <button className="btn" type="button" onClick={onClose}>
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="yadm__msg">"hey — the hollow sun demo wrecked me. is the bridge in open C?"</div>
                <div className="yadm__row">
                  <button className="btn btn--primary" type="button" onClick={() => setPhase('sent')}>
                    Send request
                  </button>
                  <button className="btn" type="button" onClick={onClose}>
                    Cancel
                  </button>
                </div>
                <p className="yadm__hint">
                  Preview — DMs go live once you claim a username.{' '}
                  <a
                    href="#/yourarea/join"
                    onClick={(e) => {
                      e.preventDefault()
                      goJoin()
                    }}
                  >
                    Sign up
                  </a>
                  .
                </p>
              </>
            )}
          </Box>
        )}
        {phase === 'sent' && (
          <Box title="Request sent">
            <p className="yadm__ok">Your message request is on its way.</p>
            <p>
              villxin will be asked to accept before your message is delivered. If they decline, you simply won't
              hear back — no awkward read receipts.
            </p>
            <div className="yadm__row">
              {!signedIn && (
                <button className="btn" type="button" onClick={() => setPhase('recipient')}>
                  See what they see →
                </button>
              )}
              <button className="btn btn--ghost" type="button" onClick={onClose}>
                Close
              </button>
            </div>
          </Box>
        )}
        {phase === 'recipient' && (
          <Box title="New message request">
            <p>
              <b>emberwitch</b> wants to message you.
            </p>
            <div className="yadm__msg">"hey — the hollow sun demo wrecked me. is the bridge in open C?"</div>
            <div className="yadm__row">
              <button className="btn btn--primary" type="button" onClick={onClose}>
                Accept
              </button>
              <button className="btn" type="button" onClick={onClose}>
                Decline
              </button>
            </div>
            <p className="yadm__hint">
              Accepting opens the conversation. You can revoke it any time — blocking quietly closes the thread on
              both ends.
            </p>
          </Box>
        )}
      </div>
    </div>
  )
}

/* Signup strip — real magic-link auth: signup emails a verification link
   that claims the username; login emails a plain login link. */
function Signup() {
  const { username: me, signedIn } = useAuth()
  const [mode, setMode] = useState<'signup' | 'login'>('signup')
  const [step, setStep] = useState<'email' | 'username' | 'sent'>('email')
  const [email, setEmail] = useState('')
  const [uname, setUname] = useState('')
  const [busy, setBusy] = useState(false)
  const [note, setNote] = useState<{ k: 'ok' | 'err'; t: string } | null>(null)
  const validEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e)

  function switchMode(m: 'signup' | 'login') {
    setMode(m)
    setStep('email')
    setNote(null)
  }

  function continueEmail() {
    if (!validEmail(email.trim())) {
      setNote({ k: 'err', t: "That email doesn't look valid — check it and try again." })
      return
    }
    setStep('username')
    setNote(null)
  }

  async function submitSignup() {
    const u = uname.trim().toLowerCase()
    if (!/^[a-z0-9_]{3,24}$/.test(u)) {
      setNote({ k: 'err', t: 'Usernames are 3–24 characters — lowercase letters, numbers and underscores.' })
      return
    }
    if (busy) return
    setBusy(true)
    try {
      await communityApi.signup(email.trim(), u)
      setStep('sent')
      setNote(null)
    } catch (e) {
      const code = e instanceof ApiError ? e.code : 'NETWORK'
      if (code === 'USERNAME_TAKEN') setNote({ k: 'err', t: '"' + u + '" is taken. Try another.' })
      else if (code === 'USERNAME_INVALID')
        setNote({ k: 'err', t: 'Usernames are 3–24 characters — lowercase letters, numbers and underscores.' })
      else if (code === 'EMAIL_TAKEN') setNote({ k: 'err', t: 'That email already has an account — log in instead.' })
      else setNote({ k: 'err', t: "Can't reach the server — try again in a minute." })
    } finally {
      setBusy(false)
    }
  }

  async function submitLogin() {
    if (!validEmail(email.trim())) {
      setNote({ k: 'err', t: "That email doesn't look valid — check it and try again." })
      return
    }
    if (busy) return
    setBusy(true)
    try {
      await communityApi.login(email.trim())
      setStep('sent')
      setNote(null)
    } catch (e) {
      const code = e instanceof ApiError ? e.code : 'NETWORK'
      if (code === 'NO_ACCOUNT') setNote({ k: 'err', t: 'No account for that email — sign up instead.' })
      else setNote({ k: 'err', t: "Can't reach the server — try again in a minute." })
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="ya__signup" id="join">
      <div className="wrap">
        <span className="eyebrow">Join</span>
        <h2>Claim your corner</h2>

        {signedIn && (
          <p className="sub">
            <b style={{ color: 'var(--ok)' }}>Welcome back, {me}.</b> Your corner is claimed — leave a comment on
            the wall or check your Mail Center.
          </p>
        )}

        {!signedIn && step === 'sent' && (
          <p className="sub">
            <b style={{ color: 'var(--ok)' }}>Check your email.</b> A {mode === 'signup' ? 'verification' : 'login'}{' '}
            link is on its way to {email.trim()}
            {mode === 'signup' ? ' — click it to claim "' + uname.trim().toLowerCase() + '"' : ''}. It's good for 15
            minutes.
          </p>
        )}

        {!signedIn && mode === 'signup' && step === 'email' && (
          <>
            <p className="sub">
              A verifiable email and a username is all it takes. No algorithm, no feed — just the boards, the wall,
              and whoever's online at 2 AM.
            </p>
            <div className="ya__form">
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                className={note && note.k === 'err' ? 'bad' : undefined}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && continueEmail()}
                aria-label="Email"
              />
              <button className="btn btn--primary" type="button" onClick={continueEmail}>
                Continue
              </button>
            </div>
          </>
        )}

        {!signedIn && mode === 'signup' && step === 'username' && (
          <>
            <p className="sub">Now the important part — the name everyone will know you by.</p>
            <div className="ya__form">
              <input
                type="text"
                placeholder="username"
                value={uname}
                maxLength={24}
                className={note && note.k === 'err' ? 'bad' : undefined}
                onChange={(e) => setUname(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && void submitSignup()}
                aria-label="Username"
              />
              <button className="btn btn--primary" type="button" disabled={busy} onClick={() => void submitSignup()}>
                Send verification link
              </button>
            </div>
          </>
        )}

        {!signedIn && mode === 'login' && step === 'email' && (
          <>
            <p className="sub">Been here before? A login link is all you need — no passwords in this house.</p>
            <div className="ya__form">
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                className={note && note.k === 'err' ? 'bad' : undefined}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && void submitLogin()}
                aria-label="Email"
              />
              <button className="btn btn--primary" type="button" disabled={busy} onClick={() => void submitLogin()}>
                Send login link
              </button>
            </div>
          </>
        )}

        {note && <p className={'ya__note ' + note.k}>{note.t}</p>}

        {!signedIn && step !== 'sent' && (
          <p className="ya__note dim">
            {mode === 'signup' ? (
              <>
                Already claimed a corner?{' '}
                <button type="button" className="ya__linkbtn" onClick={() => switchMode('login')}>
                  Log in
                </button>
              </>
            ) : (
              <>
                New here?{' '}
                <button type="button" className="ya__linkbtn" onClick={() => switchMode('signup')}>
                  Sign up
                </button>
              </>
            )}
          </p>
        )}
      </div>
    </section>
  )
}

/* Magic-link landing — exchanges the emailed one-time token for a JWT. */
const VERIFY_ERRORS: Record<string, string> = {
  LINK_INVALID: "That link isn't valid — it may have been used already. Request a fresh one from the signup strip.",
  LINK_EXPIRED: 'That link has expired — they last 15 minutes. Request a fresh one from the signup strip.',
}

function VerifyView() {
  const [state, setState] = useState<{ k: 'working' } | { k: 'ok'; username: string } | { k: 'err'; code: string }>({
    k: 'working',
  })
  const fired = useRef(false)

  useEffect(() => {
    if (fired.current) return // one-time token: don't spend it twice (StrictMode)
    fired.current = true
    const query = window.location.hash.split('?')[1] ?? ''
    const token = new URLSearchParams(query).get('token') ?? ''
    if (!token) {
      setState({ k: 'err', code: 'LINK_INVALID' })
      return
    }
    communityApi
      .verify(token)
      .then((r) => {
        storeSession(r.token, r.username)
        setState({ k: 'ok', username: r.username })
        window.setTimeout(() => {
          if (window.location.hash.startsWith('#/yourarea/verify')) window.location.hash = '#/yourarea'
        }, 1800)
      })
      .catch((e) => setState({ k: 'err', code: e instanceof ApiError ? e.code : 'NETWORK' }))
  }, [])

  return (
    <div className="wrap ya__verify">
      <Box title="Verifying your link">
        {state.k === 'working' && <p className="ya__note dim">Checking your link…</p>}
        {state.k === 'ok' && (
          <p className="ya__note ok">Welcome, {state.username}. You're signed in — taking you to the profile…</p>
        )}
        {state.k === 'err' && (
          <>
            <p className="ya__note err">
              {VERIFY_ERRORS[state.code] ?? "Can't reach the server — try the link again in a minute."}
            </p>
            <p>
              <a href="#/yourarea/join">Back to sign-up</a>
            </p>
          </>
        )}
      </Box>
    </div>
  )
}

function YourAreaPage() {
  const { username: me, signedIn } = useAuth()
  const [view, setView] = useState<YaView>(getView)
  const [dmOpen, setDmOpen] = useState(false)
  const [jank, setJank] = useState(true)

  // live community data — null means "not loaded yet": render the static
  // config so the page never looks broken when the API is cold
  const [profile, setProfile] = useState<CommunityProfile | null>(null)
  const [wall, setWall] = useState<WallCommentDto[] | null>(null)
  const [bulletins, setBulletins] = useState<BulletinDto[] | null>(null)
  const [boards, setBoards] = useState<BoardDto[] | null>(null)

  // wall composer (signed-in only)
  const [wallText, setWallText] = useState('')
  const [wallGlitter, setWallGlitter] = useState(false)
  const [wallBusy, setWallBusy] = useState(false)
  const [wallErr, setWallErr] = useState<string | null>(null)

  const p = ya.profile

  useEffect(() => {
    const onHashChange = () => setView(getView())
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  // land on the right spot: the signup strip for a "/join" deep link,
  // otherwise the top (also covers profile <-> inbox switches)
  useEffect(() => {
    if (view === 'profile' && window.location.hash.startsWith('#/yourarea/join')) {
      document.getElementById('join')?.scrollIntoView()
    } else {
      window.scrollTo(0, 0)
    }
  }, [view])

  // public reads — each falls back silently to static config on failure
  useEffect(() => {
    let on = true
    communityApi
      .profile('villxin')
      .then((r) => {
        if (on) setProfile(r)
      })
      .catch(() => {})
    communityApi
      .wall('villxin')
      .then((r) => {
        if (on) setWall(r)
      })
      .catch(() => {})
    communityApi
      .bulletins()
      .then((r) => {
        if (on) setBulletins(r.content)
      })
      .catch(() => {})
    communityApi
      .boards()
      .then((r) => {
        if (on) setBoards(r)
      })
      .catch(() => {})
    return () => {
      on = false
    }
  }, [])

  // "Sign Up" while already on the profile: the hash swap alone won't
  // re-render, so scroll by hand
  const scrollToJoin = () => {
    if (view === 'profile') document.getElementById('join')?.scrollIntoView()
  }

  async function postWallComment(e: FormEvent) {
    e.preventDefault()
    const body = wallText.trim()
    if (!body || wallBusy) return
    setWallBusy(true)
    setWallErr(null)
    try {
      const c = await communityApi.postWall('villxin', body, wallGlitter)
      setWall((w) => [c, ...(w ?? [])])
      setWallText('')
      setWallGlitter(false)
    } catch {
      setWallErr("The comment didn't post — try again in a minute.")
    } finally {
      setWallBusy(false)
    }
  }

  // live values with static fallbacks (empty live data also falls back, so
  // a fresh backend doesn't render hollow boxes)
  const about = profile?.about || ya.blurb.about
  const meet = profile?.whoToMeet || ya.blurb.meet
  const mood = profile?.mood || p.mood
  const memberSince = profile ? fmtYearMonth(profile.memberSince) : p.memberSince
  const top8 = profile && profile.topFriends.length > 0 ? profile.topFriends.map((f) => f.username) : ya.top8
  const comments =
    wall && wall.length > 0
      ? wall.map((c) => ({
          key: String(c.id),
          user: c.author.username,
          date: fmtDateTime(c.createdAt),
          glitter: c.glitter,
          text: c.body,
        }))
      : ya.comments.map((c) => ({ key: c.user + c.date, ...c }))
  const commentTotal = wall && wall.length > 0 ? wall.length : ya.commentCount
  const bulls =
    bulletins && bulletins.length > 0
      ? bulletins.map((b) => ({ date: fmtDate(b.createdAt), title: b.title }))
      : ya.bulletins

  return (
    <div className={'ya' + (jank ? ' ya--jank' : '')}>
      <main id="top">
        {/* sub-chrome */}
        <div className="ya__chrome">
          <div className="wrap ya__chrome-in">
            <div className="ya__logo">
              {ya.name}
              <em>{ya.tag}</em>
            </div>
            <nav className="ya__links" aria-label="YourArea">
              <a href="#/yourarea" className={view === 'profile' ? 'is-here' : undefined}>
                Home
              </a>
              {/* placeholders until the boards UI exists */}
              <button type="button">Browse</button>
              <button type="button">Bulletins</button>
              <a href="#/yourarea/inbox" className={view === 'inbox' ? 'is-here' : undefined}>
                Inbox
              </a>
              {signedIn ? (
                <>
                  <span className="ya__me">{me}</span>
                  <button type="button" onClick={clearSession}>
                    Sign Out
                  </button>
                </>
              ) : (
                <a href="#/yourarea/join" onClick={scrollToJoin}>
                  Sign Up
                </a>
              )}
            </nav>
            <div className="ya__search">
              <input type="text" placeholder="find your people" aria-label="Search YourArea" />
              <button type="button">Search</button>
            </div>
          </div>
        </div>

        {view === 'inbox' ? (
          <MailCenter />
        ) : view === 'verify' ? (
          <VerifyView />
        ) : (
          <div className="wrap ya__page">
            {/* ---------- left column ---------- */}
            <div>
              <h1 className="ya__name">
                villxin <span className="ya__official">Official</span>
              </h1>
              <span className="ya__online">
                <i />
                {p.status}
              </span>
              <div className="ya__pic">
                <img src={site.assets.emblem} alt="villxin emblem" />
              </div>
              <div className="ya__meta">
                <b>{site.about.genre}</b>
                <br />
                Last login: {p.lastLogin}
                <br />
                Mood: {mood}
              </div>

              <div style={{ height: 18 }} />

              <Box title="Contact villxin" pad={false}>
                <div className="ya__contact">
                  <button type="button" onClick={() => setDmOpen(true)}>
                    <span>
                      <Icon name="arrow" />
                    </span>
                    Send Message
                  </button>
                  <button type="button">
                    <span>
                      <Icon name="arrow" />
                    </span>
                    Add to Friends
                  </button>
                  <button type="button">
                    <span>
                      <Icon name="arrow" />
                    </span>
                    Add Comment
                  </button>
                  <button type="button">
                    <span>
                      <Icon name="arrow" />
                    </span>
                    Block User
                  </button>
                </div>
              </Box>

              <Box title="villxin: details" pad={false}>
                <table className="ya__details">
                  <tbody>
                    <tr>
                      <td>Member since</td>
                      <td>{memberSince}</td>
                    </tr>
                    <tr>
                      <td>Here for</td>
                      <td>{p.hereFor}</td>
                    </tr>
                    <tr>
                      <td>Location</td>
                      <td>{p.location}</td>
                    </tr>
                    <tr>
                      <td>Sounds like</td>
                      <td>{site.about.genre}</td>
                    </tr>
                  </tbody>
                </table>
              </Box>

              <Box title="Profile song">
                <ProfileSong song={p.song} />
              </Box>

              {boards && boards.length > 0 && (
                <Box title="The boards" pad={false}>
                  <table className="ya__details">
                    <tbody>
                      {boards.map((b) => (
                        <tr key={b.slug}>
                          <td>{b.title}</td>
                          <td>
                            {b.threadCount} {b.threadCount === 1 ? 'thread' : 'threads'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Box>
              )}

              <p className="ya__counter">
                member No. <b>001</b> · {ya.memberCount} residents · {ya.onlineNow} online now
              </p>
              <button
                type="button"
                className="protonote ya__jank-toggle"
                aria-pressed={jank}
                onClick={() => setJank((v) => !v)}
              >
                <i />
                2005 jank: {jank ? 'on' : 'off'}
              </button>
            </div>

            {/* ---------- right column ---------- */}
            <div>
              <div className="ya__network">
                villxin is in <b>your</b> extended network.
              </div>

              <Box title="villxin's latest bulletins" pad={false}>
                <table className="ya__bulls">
                  <tbody>
                    {bulls.map((b) => (
                      <tr key={b.title}>
                        <td>{b.date}</td>
                        <td>
                          <a href="#/yourarea" onClick={(e) => e.preventDefault()}>
                            {b.title}
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Box>

              <Box title="About villxin">
                <p>{about}</p>
              </Box>

              <Box title="Who villxin would like to meet">
                <p>{meet}</p>
              </Box>

              <Box title="villxin's Top 8 — the residents" violet>
                <div className="ya__top8">
                  {top8.map((u) => (
                    <a className="ya__friend" href="#/yourarea" onClick={(e) => e.preventDefault()} key={u}>
                      <span className="av">{u[0].toUpperCase()}</span>
                      <span className="nm">{u}</span>
                    </a>
                  ))}
                </div>
              </Box>

              <Box
                title={'Friends comments (displaying ' + comments.length + ' of ' + commentTotal + ')'}
                violet
                pad={false}
              >
                {comments.map((c) => (
                  <div className="ya__comment" key={c.key}>
                    <div className="who">
                      <span className="av">{c.user[0].toUpperCase()}</span>
                      <div className="nm">{c.user}</div>
                    </div>
                    <div>
                      <div className="when">{c.date}</div>
                      <div className={'txt' + (c.glitter ? ' glitter' : '')}>{c.text}</div>
                    </div>
                  </div>
                ))}
                {signedIn && (
                  <form className="ya__wallform" onSubmit={postWallComment}>
                    <input
                      type="text"
                      value={wallText}
                      maxLength={2000}
                      placeholder="leave a comment on the wall…"
                      aria-label="Wall comment"
                      onChange={(e) => setWallText(e.target.value)}
                    />
                    <label className="ya__glitter">
                      <input
                        type="checkbox"
                        checked={wallGlitter}
                        onChange={(e) => setWallGlitter(e.target.checked)}
                      />
                      glitter
                    </label>
                    <button className="btn btn--primary" type="submit" disabled={wallBusy || !wallText.trim()}>
                      Post
                    </button>
                  </form>
                )}
                {wallErr && (
                  <p className="ya__note err" style={{ margin: 0, padding: '0 12px 12px' }}>
                    {wallErr}
                  </p>
                )}
              </Box>
            </div>
          </div>
        )}

        {view === 'profile' && <Signup />}
      </main>

      {dmOpen && <DmModal onClose={() => setDmOpen(false)} />}
    </div>
  )
}

export default YourAreaPage
