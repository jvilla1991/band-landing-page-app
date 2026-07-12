import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { site } from '../config/site'
import type { Track } from '../config/site'
import Icon from '../components/Icon'
import MailCenter from '../components/MailCenter'
import '../styles/yourarea.css'

const ya = site.yourarea

/* Sub-views hang off the page hash: "#/yourarea" = profile,
   "#/yourarea/inbox" = Mail Center, "#/yourarea/join" = profile + signup. */
type YaView = 'profile' | 'inbox'

function getView(): YaView {
  return window.location.hash.startsWith('#/yourarea/inbox') ? 'inbox' : 'profile'
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

/* DM request flow — 3-phase demo (compose -> sent -> recipient view). */
function DmModal({ onClose }: { onClose: () => void }) {
  const [phase, setPhase] = useState<'compose' | 'sent' | 'recipient'>('compose')
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
            <div className="yadm__msg">"hey — the hollow sun demo wrecked me. is the bridge in open C?"</div>
            <div className="yadm__row">
              <button className="btn btn--primary" type="button" onClick={() => setPhase('sent')}>
                Send request
              </button>
              <button className="btn" type="button" onClick={onClose}>
                Cancel
              </button>
            </div>
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
              <button className="btn" type="button" onClick={() => setPhase('recipient')}>
                See what they see →
              </button>
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

/* Signup strip — local-state demo: email -> verification -> username claim. */
function Signup() {
  const [step, setStep] = useState(0)
  const [email, setEmail] = useState('')
  const [uname, setUname] = useState('')
  const [note, setNote] = useState<{ k: 'ok' | 'err'; t: string } | null>(null)
  const valid = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e)

  function sendLink() {
    if (!valid(email)) {
      setNote({ k: 'err', t: "That email doesn't look valid — check it and try again." })
      return
    }
    setNote({ k: 'ok', t: 'Verification link sent to ' + email + '. (Demo: skipping ahead.)' })
    setTimeout(() => {
      setStep(1)
      setNote(null)
    }, 900)
  }

  function claim() {
    const u = uname.trim().toLowerCase()
    if (u.length < 3) {
      setNote({ k: 'err', t: 'Usernames need at least 3 characters.' })
      return
    }
    if (u === 'villxin' || ya.top8.includes(u)) {
      setNote({ k: 'err', t: '"' + u + '" is taken. Try another.' })
      return
    }
    setStep(2)
    setNote(null)
  }

  return (
    <section className="ya__signup" id="join">
      <div className="wrap">
        <span className="eyebrow">Join</span>
        <h2>Claim your corner</h2>
        {step === 0 && (
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
                onKeyDown={(e) => e.key === 'Enter' && sendLink()}
                aria-label="Email"
              />
              <button className="btn btn--primary" type="button" onClick={sendLink}>
                Send verification link
              </button>
            </div>
          </>
        )}
        {step === 1 && (
          <>
            <p className="sub">Email verified. Now the important part — the name everyone will know you by.</p>
            <div className="ya__form">
              <input
                type="text"
                placeholder="username"
                value={uname}
                maxLength={24}
                className={note && note.k === 'err' ? 'bad' : undefined}
                onChange={(e) => setUname(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && claim()}
                aria-label="Username"
              />
              <button className="btn btn--primary" type="button" onClick={claim}>
                Claim username
              </button>
            </div>
          </>
        )}
        {step === 2 && (
          <p className="sub">
            <b style={{ color: 'var(--ok)' }}>Welcome, {uname.trim().toLowerCase()}.</b> Your profile is yours to
            wreck — pick a profile song, write a blurb, start collecting your Top 8.
          </p>
        )}
        {note && <p className={'ya__note ' + note.k}>{note.t}</p>}
      </div>
    </section>
  )
}

function YourAreaPage() {
  const [view, setView] = useState<YaView>(getView)
  const [dmOpen, setDmOpen] = useState(false)
  const [jank, setJank] = useState(true)
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

  // "Sign Up" while already on the profile: the hash swap alone won't
  // re-render, so scroll by hand
  const scrollToJoin = () => {
    if (view === 'profile') document.getElementById('join')?.scrollIntoView()
  }

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
              {/* placeholders until the boards exist */}
              <button type="button">Browse</button>
              <button type="button">Bulletins</button>
              <a href="#/yourarea/inbox" className={view === 'inbox' ? 'is-here' : undefined}>
                Inbox
              </a>
              <a href="#/yourarea/join" onClick={scrollToJoin}>
                Sign Up
              </a>
            </nav>
            <div className="ya__search">
              <input type="text" placeholder="find your people" aria-label="Search YourArea" />
              <button type="button">Search</button>
            </div>
          </div>
        </div>

        {view === 'inbox' ? (
          <MailCenter />
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
                Mood: {p.mood}
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
                      <td>{p.memberSince}</td>
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
                    {ya.bulletins.map((b) => (
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
                <p>{ya.blurb.about}</p>
              </Box>

              <Box title="Who villxin would like to meet">
                <p>{ya.blurb.meet}</p>
              </Box>

              <Box title="villxin's Top 8 — the residents" violet>
                <div className="ya__top8">
                  {ya.top8.map((u) => (
                    <a className="ya__friend" href="#/yourarea" onClick={(e) => e.preventDefault()} key={u}>
                      <span className="av">{u[0].toUpperCase()}</span>
                      <span className="nm">{u}</span>
                    </a>
                  ))}
                </div>
              </Box>

              <Box
                title={'Friends comments (displaying ' + ya.comments.length + ' of ' + ya.commentCount + ')'}
                violet
                pad={false}
              >
                {ya.comments.map((c) => (
                  <div className="ya__comment" key={c.user + c.date}>
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
