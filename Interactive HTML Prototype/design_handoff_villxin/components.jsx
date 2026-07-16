/* villxin — core components: reveal hook, Header, Hero, ReleaseBand, DemoPlayer */
(function () {
  const { useState, useEffect, useRef, useCallback, useContext } = React;
  const Icon = window.Icon;

  /* ---- reveal-on-scroll hook ---- */
  function useReveal() {
    const ref = useRef(null);
    useEffect(() => {
      const el = ref.current;
      if (!el) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { el.classList.add("in"); return; }
      const io = new IntersectionObserver(
        (entries) => entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } }),
        { threshold: 0.16 }
      );
      io.observe(el);
      return () => io.disconnect();
    }, []);
    return ref;
  }
  window.useReveal = useReveal;

  const NAV = [
    { label: "Home", href: "#top" },
    { label: "Listen", href: "#listen" },
    { label: "About", href: "#about" },
    { label: "Store", href: "store.html", page: "store" },
    { label: "Contact", href: "#contact" },
  ];

  /* ============================ HEADER / NAV ============================ */
  function Header({ site, page = "home" }) {
    const openModal = useContext(window.ModalCtx);
    const [scrolled, setScrolled] = useState(false);
    const [open, setOpen] = useState(false);
    // on subpages, in-page anchors must point back to the main page
    const resolve = (href) => (href.startsWith("#") && page !== "home" ? "villxin.html" + href : href);
    useEffect(() => {
      const onScroll = () => setScrolled(window.scrollY > 24);
      onScroll();
      window.addEventListener("scroll", onScroll, { passive: true });
      return () => window.removeEventListener("scroll", onScroll);
    }, []);
    useEffect(() => { document.body.style.overflow = open ? "hidden" : ""; }, [open]);

    return (
      <>
        <header className={"hdr" + (scrolled ? " scrolled" : "")}>
          <div className="wrap hdr__in">
            <a className="brand" href={resolve("#top")} aria-label={site.artistName + " home"}>
              {/* NAV USES THE ICON / EMBLEM MARK ONLY (never the wordmark) */}
              <span className="brand__mark"><img src={site.assets.iconMark} alt="" /></span>
              <span className="brand__name">{site.artistName}</span>
            </a>
            <nav className="nav" aria-label="Primary">
              {NAV.map((n) => (
                <a key={n.href} href={resolve(n.href)} className={n.page && n.page === page ? "is-current" : undefined}>{n.label}</a>
              ))}
              <button className="cta" type="button" onClick={openModal}>Mailing List</button>
            </nav>
            <button className={"burger" + (open ? " open" : "")} aria-label="Menu" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
              <span /><span /><span />
            </button>
          </div>
        </header>

        <div className={"msheet" + (open ? " open" : "")}>
          {NAV.map((n, i) => (
            <a key={n.href} href={resolve(n.href)} onClick={() => setOpen(false)}>
              <span className="ix">{String(i + 1).padStart(2, "0")}</span>{n.label}
            </a>
          ))}
          <button onClick={() => { setOpen(false); openModal(); }}>
            <span className="ix">{String(NAV.length + 1).padStart(2, "0")}</span>Mailing List
          </button>
        </div>
      </>
    );
  }

  /* ============================ HERO ============================ */
  function Hero({ site }) {
    const openModal = useContext(window.ModalCtx);
    const emblemRef = useRef(null);
    const innerRef = useRef(null);
    useEffect(() => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      let raf = 0;
      const onScroll = () => {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          const y = window.scrollY;
          if (emblemRef.current) emblemRef.current.style.transform = `translateY(${y * 0.12}px)`;
          if (innerRef.current) { innerRef.current.style.transform = `translateY(${y * -0.04}px)`; innerRef.current.style.opacity = String(Math.max(0, 1 - y / 700)); }
        });
      };
      window.addEventListener("scroll", onScroll, { passive: true });
      return () => { window.removeEventListener("scroll", onScroll); cancelAnimationFrame(raf); };
    }, []);

    const rel = site.latestRelease;
    const wm = site.assets.wordmark;
    return (
      <section className="hero" id="top">
        <div className="fog" aria-hidden="true" />
        <div className="hero__bloom" aria-hidden="true" />
        <div className="wrap hero__inner" ref={innerRef}>
          <div className="hero__emblem" ref={emblemRef}>
            <img src={site.assets.emblem} alt={site.artistName + " emblem"} />
          </div>
          <div className="hero__kicker"><span className="eyebrow">Ambient · Metalcore</span></div>
          {/* HERO LOCKUP = WORDMARK (image; text fallback if asset missing) */}
          <h1 className="hero__wordmark">
            {wm ? <img src={wm} alt={site.artistName} /> : <span className="hero__wordmark--text">villxin</span>}
          </h1>
          <p className="hero__tag">{site.tagline}</p>

          <div className="hero__teaser">
            <span>{rel.type}</span><span className="sep" />
            <b className="em">{rel.title}</b><span className="sep" />
            <span>{rel.status === "out" ? "Out now" : "Coming " + rel.releaseDateLabel}</span>
          </div>

          <div className="hero__cta">
            <button className="btn btn--primary" type="button" onClick={openModal}>
              Join the mailing list
              <span className="arr" style={{ width: 16, height: 16, display: "inline-block" }}><Icon name="arrow" /></span>
            </button>
            <a className="btn" href="#listen">Hear the demos</a>
          </div>
        </div>
        <div className="scrollhint"><span>Scroll</span><span className="ln" /></div>
      </section>
    );
  }

  /* ============================ LATEST RELEASE band (static) ============================ */
  function ReleaseBand({ site }) {
    const ref = useReveal();
    const rel = site.latestRelease;
    const cover = site.assets.coverArt;
    const out = rel.status === "out";
    return (
      <section className="section relband" id="release">
        <div className="wrap reveal" ref={ref}>
          <div className="links-head" style={{ marginBottom: 22 }}>
            <span className="eyebrow">Latest Release</span>
            <span className="protonote"><i />Static · config</span>
          </div>
          <div className="relband__inner">
            <div className="release__cover">
              {cover
                ? <img src={cover} alt={rel.title + " cover art"} />
                : <div className="ph"><div style={{ width: 34, height: 34 }}><Icon name="disc" /></div>Cover art slot<br />1:1 — swap in</div>}
            </div>
            <div className="release__body">
              <span className="release__type">{rel.type}</span>
              <h3 className="release__title">{rel.title}</h3>
              <p className="release__date">
                {out ? <>Out now</> : <>{rel.status === "coming-soon" ? "Coming " : ""}<b>{rel.releaseDateLabel}</b> · {rel.releaseDate}</>}
              </p>
              <div className="release__cta">
                <a className="btn btn--primary" href={rel.primaryCta.href}>
                  {rel.primaryCta.label}
                  <span className="arr" style={{ width: 16, height: 16, display: "inline-block" }}><Icon name="arrow" /></span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  /* ============================ DEMO PLAYER (static .wav, simulated in prototype) ============================ */
  function parseDur(s) { const [m, sec] = s.split(":").map(Number); return m * 60 + sec; }
  function fmt(t) { const m = Math.floor(t / 60); const s = Math.floor(t % 60); return `${m}:${String(s).padStart(2, "0")}`; }

  function DemoPlayer({ tracks }) {
    const [active, setActive] = useState(-1);
    const [pos, setPos] = useState(0);
    const timer = useRef(null);

    const stop = useCallback(() => { clearInterval(timer.current); timer.current = null; }, []);
    useEffect(() => () => stop(), [stop]);

    function toggle(i) {
      const dur = parseDur(tracks[i].duration);
      if (active === i) { setActive(-1); stop(); return; }
      // NOTE: prototype simulates playback (no real .wav files yet).
      // Real app: drive an <audio src={track.src}> element instead of this timer.
      setActive(i); setPos(0); stop();
      timer.current = setInterval(() => {
        setPos((p) => { if (p + 0.25 >= dur) { stop(); setActive(-1); return 0; } return p + 0.25; });
      }, 250);
    }

    return (
      <div className="player">
        {tracks.map((t, i) => {
          const dur = parseDur(t.duration);
          const playing = active === i;
          const pct = playing ? (pos / dur) * 100 : 0;
          return (
            <div key={t.title} className={"track" + (playing ? " playing" : "")}>
              <button className="track__btn" onClick={() => toggle(i)} aria-label={(playing ? "Pause " : "Play ") + t.title}>
                <span style={{ width: 20, height: 20 }}><Icon name={playing ? "pause" : "play"} /></span>
              </button>
              <div className="track__main">
                <div className="track__name"><b>{t.title}</b></div>
                <div className="track__sub">{t.note}</div>
                <div className="track__bar"><div className="track__fill" style={{ width: pct + "%" }} /></div>
              </div>
              <div className="track__time">{playing ? fmt(pos) : t.duration}</div>
            </div>
          );
        })}
      </div>
    );
  }

  Object.assign(window, { Header, Hero, ReleaseBand, DemoPlayer });
})();
