/* YourArea — a villxin space. MySpace-era official artist profile. */
(function () {
  const { useState, useEffect, useRef } = React;
  const site = window.SITE;
  const ya = site.yourarea;
  const { Header, Footer, SocialDock, MailingListModal } = window;
  const { useTweaks, TweaksPanel, TweakSection, TweakToggle, TweakColor } = window;
  const Icon = window.Icon;

  const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/ {
    jank: true,
    accent: "#d9402a",
  } /*EDITMODE-END*/;

  /* ---------- generic box ---------- */
  function Box({ title, violet, children, pad = true }) {
    return (
      <section className={"yabox" + (violet ? " yabox--v" : "")}>
        <div className="yabox__hd">{title}</div>
        {pad ? <div className="yabox__bd">{children}</div> : children}
      </section>
    );
  }

  /* ---------- profile song (simulated playback) ---------- */
  function ProfileSong({ song }) {
    const [playing, setPlaying] = useState(false);
    const [pos, setPos] = useState(0);
    const timer = useRef(null);
    const [m, s] = song.duration.split(":").map(Number);
    const dur = m * 60 + s;
    useEffect(() => () => clearInterval(timer.current), []);
    function toggle() {
      if (playing) { clearInterval(timer.current); setPlaying(false); return; }
      setPlaying(true);
      timer.current = setInterval(() => {
        setPos((p) => { if (p + 0.25 >= dur) { clearInterval(timer.current); setPlaying(false); return 0; } return p + 0.25; });
      }, 250);
    }
    const fmt = (t) => `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, "0")}`;
    return (
      <div className="ya__song">
        <button className="ya__song-btn" onClick={toggle} aria-label={(playing ? "Pause " : "Play ") + song.title}>
          <span><Icon name={playing ? "pause" : "play"} /></span>
        </button>
        <div className="ya__song-main">
          <div className="ya__song-name">{song.title}</div>
          <div className="ya__song-note">{song.note}</div>
          <div className="ya__song-bar"><div className="ya__song-fill" style={{ width: (playing ? (pos / dur) * 100 : 0) + "%" }}></div></div>
        </div>
        <div className="ya__song-time">{playing ? fmt(pos) : song.duration}</div>
      </div>
    );
  }

  /* ---------- DM request flow demo ---------- */
  function DmModal({ onClose }) {
    const [phase, setPhase] = useState("compose"); // compose -> sent -> recipient
    return (
      <div className="yadm__scrim" onClick={onClose}>
        <div className="yadm" onClick={(e) => e.stopPropagation()}>
          {phase === "compose" && (
            <Box title="Send a message" pad={true}>
              <p>DMs on YourArea start as a <b>request</b>. villxin (or any member) sees who's asking before anything lands in their inbox.</p>
              <div className="yadm__msg">"hey — the hollow sun demo wrecked me. is the bridge in open C?"</div>
              <div className="yadm__row">
                <button className="btn btn--primary" onClick={() => setPhase("sent")}>Send request</button>
                <button className="btn" onClick={onClose}>Cancel</button>
              </div>
            </Box>
          )}
          {phase === "sent" && (
            <Box title="Request sent" pad={true}>
              <p className="yadm__ok">Your message request is on its way.</p>
              <p>villxin will be asked to accept before your message is delivered. If they decline, you simply won't hear back — no awkward read receipts.</p>
              <div className="yadm__row">
                <button className="btn" onClick={() => setPhase("recipient")}>See what they see →</button>
                <button className="btn btn--ghost" onClick={onClose}>Close</button>
              </div>
            </Box>
          )}
          {phase === "recipient" && (
            <Box title="New message request" pad={true}>
              <p><b>emberwitch</b> wants to message you.</p>
              <div className="yadm__msg">"hey — the hollow sun demo wrecked me. is the bridge in open C?"</div>
              <div className="yadm__row">
                <button className="btn btn--primary" onClick={onClose}>Accept</button>
                <button className="btn" onClick={onClose}>Decline</button>
              </div>
              <p className="yadm__hint">Accepting opens the conversation. You can revoke it any time — blocking quietly closes the thread on both ends.</p>
            </Box>
          )}
        </div>
      </div>
    );
  }

  /* ---------- signup strip (mock: email -> verify -> username) ---------- */
  function Signup() {
    const [step, setStep] = useState(0);
    const [email, setEmail] = useState("");
    const [uname, setUname] = useState("");
    const [note, setNote] = useState(null);
    const valid = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e);
    function sendLink() {
      if (!valid(email)) { setNote({ k: "err", t: "That email doesn't look valid — check it and try again." }); return; }
      setNote({ k: "ok", t: "Verification link sent to " + email + ". (Prototype: skipping ahead.)" });
      setTimeout(() => { setStep(1); setNote(null); }, 900);
    }
    function claim() {
      const u = uname.trim().toLowerCase();
      if (u.length < 3) { setNote({ k: "err", t: "Usernames need at least 3 characters." }); return; }
      if (u === "villxin" || ya.top8.includes(u)) { setNote({ k: "err", t: "\"" + u + "\" is taken. Try another." }); return; }
      setStep(2);
      setNote(null);
    }
    return (
      <section className="ya__signup">
        <div className="wrap">
          <span className="eyebrow">Join</span>
          <h2>Claim your corner</h2>
          {step === 0 && (
            <>
              <p className="sub">A verifiable email and a username is all it takes. No algorithm, no feed — just the boards, the wall, and whoever's online at 2 AM.</p>
              <div className="ya__form">
                <input type="email" placeholder="your@email.com" value={email} className={note && note.k === "err" ? "bad" : ""}
                  onChange={(e) => setEmail(e.target.value)} onKeyDown={(e) => e.key === "Enter" && sendLink()} aria-label="Email" />
                <button className="btn btn--primary" onClick={sendLink}>Send verification link</button>
              </div>
            </>
          )}
          {step === 1 && (
            <>
              <p className="sub">Email verified. Now the important part — the name everyone will know you by.</p>
              <div className="ya__form">
                <input type="text" placeholder="username" value={uname} maxLength={24}
                  className={note && note.k === "err" ? "bad" : ""}
                  onChange={(e) => setUname(e.target.value)} onKeyDown={(e) => e.key === "Enter" && claim()} aria-label="Username" />
                <button className="btn btn--primary" onClick={claim}>Claim username</button>
              </div>
            </>
          )}
          {step === 2 && (
            <p className="sub"><b style={{ color: "var(--ok)" }}>Welcome, {uname.trim().toLowerCase()}.</b> Your profile is yours to wreck — pick a profile song, write a blurb, start collecting your Top 8.</p>
          )}
          {note && <p className={"ya__note " + note.k}>{note.t}</p>}
        </div>
      </section>
    );
  }

  /* ---------- page ---------- */
  function YourAreaApp() {
    const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
    const [modalOpen, setModalOpen] = useState(false);
    const [dmOpen, setDmOpen] = useState(false);
    const [view, setView] = useState(() => (location.hash === "#inbox" ? "inbox" : "profile"));
    useEffect(() => {
      const onHash = () => setView(location.hash === "#inbox" ? "inbox" : "profile");
      window.addEventListener("hashchange", onHash);
      return () => window.removeEventListener("hashchange", onHash);
    }, []);
    const openModal = () => setModalOpen(true);
    const closeModal = () => { setModalOpen(false); try { sessionStorage.setItem("villxin_ml_seen", "1"); } catch (e) {} };
    const p = ya.profile;

    useEffect(() => {
      const root = document.documentElement;
      root.style.setProperty("--accent", t.accent);
      root.style.setProperty("--accent-bright", lighten(t.accent, 0.24));
      root.style.setProperty("--accent-glow", lighten(t.accent, 0.34));
      root.style.setProperty("--accent-line", hexA(t.accent, 0.42));
      root.style.setProperty("--accent-soft", hexA(t.accent, 0.16));
    }, [t.accent]);

    return (
      <window.ModalCtx.Provider value={openModal}>
        <div className={"ya" + (t.jank ? " ya--jank" : "")} data-screen-label="YourArea">
          <Header site={site} page="yourarea" />
          <main id="top">
            {/* sub-chrome */}
            <div className="ya__chrome">
              <div className="wrap ya__chrome-in">
                <div className="ya__logo">{ya.name}<em>{ya.tag}</em></div>
                <nav className="ya__links" aria-label="YourArea">
                  <a href="#" className={view === "profile" ? "is-here" : ""} onClick={(e) => { e.preventDefault(); location.hash = ""; }}>Home</a>
                  <a href="#">Browse</a>
                  <a href="#">Bulletins</a>
                  <a href="#inbox" className={view === "inbox" ? "is-here" : ""}>Inbox</a>
                  <a href="#join" onClick={() => { if (view === "inbox") location.hash = "#join"; }}>Sign Up</a>
                </nav>
                <div className="ya__search">
                  <input type="text" placeholder="find your people" aria-label="Search YourArea" />
                  <button type="button">Search</button>
                </div>
              </div>
            </div>

            {view === "inbox" ? (
              <window.YaInbox />
            ) : (
            <div className="wrap ya__page">
              {/* ---------- left column ---------- */}
              <div>
                <h1 className="ya__name">villxin <span className="ya__official">Official</span></h1>
                <span className="ya__online"><i></i>{p.status}</span>
                <div className="ya__pic"><img src={site.assets.emblem} alt="villxin emblem" /></div>
                <div className="ya__meta">
                  <b>{site.about.genre}</b><br />
                  Last login: {p.lastLogin}<br />
                  Mood: {p.mood}
                </div>

                <div style={{ height: 18 }}></div>

                <Box title="Contact villxin" pad={false}>
                  <div className="ya__contact">
                    <button type="button" onClick={() => setDmOpen(true)}><span><Icon name="arrow" /></span>Send Message</button>
                    <button type="button"><span><Icon name="arrow" /></span>Add to Friends</button>
                    <button type="button"><span><Icon name="arrow" /></span>Add Comment</button>
                    <button type="button"><span><Icon name="arrow" /></span>Block User</button>
                  </div>
                </Box>

                <Box title="villxin: details" pad={false}>
                  <table className="ya__details">
                    <tbody>
                      <tr><td>Member since</td><td>{p.memberSince}</td></tr>
                      <tr><td>Here for</td><td>{p.hereFor}</td></tr>
                      <tr><td>Location</td><td>{p.location}</td></tr>
                      <tr><td>Sounds like</td><td>{site.about.genre}</td></tr>
                    </tbody>
                  </table>
                </Box>

                <Box title="Profile song">
                  <ProfileSong song={p.song} />
                </Box>

                <p className="ya__counter">member No. <b>001</b> · {ya.memberCount} residents · {ya.onlineNow} online now</p>
              </div>

              {/* ---------- right column ---------- */}
              <div>
                <div className="ya__network">villxin is in <b>your</b> extended network.</div>

                <Box title="villxin's latest bulletins" pad={false}>
                  <table className="ya__bulls">
                    <tbody>
                      {ya.bulletins.map((b) => (
                        <tr key={b.title}><td>{b.date}</td><td><a href="#">{b.title}</a></td></tr>
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

                <Box title={"villxin's Top 8 — the residents"} violet={true}>
                  <div className="ya__top8">
                    {ya.top8.map((u) => (
                      <a className="ya__friend" href="#" key={u}>
                        <span className="av">{u[0].toUpperCase()}</span>
                        <span className="nm">{u}</span>
                      </a>
                    ))}
                  </div>
                </Box>

                <Box title={"Friends comments (displaying " + ya.comments.length + " of " + ya.commentCount + ")"} violet={true} pad={false}>
                  {ya.comments.map((c) => (
                    <div className="ya__comment" key={c.user + c.date}>
                      <div className="who">
                        <span className="av">{c.user[0].toUpperCase()}</span>
                        <div className="nm">{c.user}</div>
                      </div>
                      <div>
                        <div className="when">{c.date}</div>
                        <div className={"txt" + (c.glitter ? " glitter" : "")}>{c.text}</div>
                      </div>
                    </div>
                  ))}
                </Box>
              </div>
            </div>
            )}

            {view === "profile" && <div id="join"><Signup /></div>}
          </main>
          <Footer site={site} />
        </div>

        <SocialDock site={site} hidden={modalOpen || dmOpen} />
        <MailingListModal open={modalOpen} onClose={closeModal} site={site} />
        {dmOpen && <DmModal onClose={() => setDmOpen(false)} />}

        <TweaksPanel>
          <TweakSection label="Era" />
          <TweakToggle label="2005 jank (glitter + tile)" value={t.jank} onChange={(v) => setTweak("jank", v)} />
          <TweakSection label="Accent" />
          <TweakColor label="Ember / violet" value={t.accent}
            options={["#d9402a", "#b3261e", "#8e2a6b", "#6e2c8f"]}
            onChange={(v) => setTweak("accent", v)} />
        </TweaksPanel>
      </window.ModalCtx.Provider>
    );
  }

  function hexA(hex, a) { const { r, g, b } = toRGB(hex); return `rgba(${r}, ${g}, ${b}, ${a})`; }
  function lighten(hex, amt) { const { r, g, b } = toRGB(hex); const f = (c) => Math.round(c + (255 - c) * amt); return `rgb(${f(r)}, ${f(g)}, ${f(b)})`; }
  function toRGB(hex) { const h = hex.replace("#", ""); return { r: parseInt(h.slice(0, 2), 16), g: parseInt(h.slice(2, 4), 16), b: parseInt(h.slice(4, 6), 16) }; }

  ReactDOM.createRoot(document.getElementById("root")).render(<YourAreaApp />);
})();
