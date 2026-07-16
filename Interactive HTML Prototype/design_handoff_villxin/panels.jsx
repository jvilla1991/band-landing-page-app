/* villxin — panels: StreamingLinks, AboutEPK, PressKit, Contact, SocialDock, Footer */
(function () {
  const { useContext, useState, useEffect } = React;
  const Icon = window.Icon;

  const PLATFORM = {
    spotify:   { label: "Spotify",     icon: "spotify"   },
    apple:     { label: "Apple Music", icon: "apple"     },
    bandcamp:  { label: "Bandcamp",    icon: "bandcamp"  },
    youtube:   { label: "YouTube",     icon: "youtube"   },
    instagram: { label: "Instagram",   icon: "instagram" },
    x:         { label: "X",           icon: "x"         },
    tiktok:    { label: "TikTok",      icon: "tiktok"    },
    facebook:  { label: "Facebook",    icon: "facebook"  },
    discord:   { label: "Discord",     icon: "discord"   },
  };

  /* ---- one placeholder-aware link (live href -> clickable; empty -> "soon" disabled) ---- */
  function LinkTile({ item, action }) {
    const meta = PLATFORM[item.id] || { label: item.label, icon: "disc" };
    const live = !!(item.href && item.href.trim());
    const common = (
      <>
        <span className="lnk__ic"><span style={{ width: "100%", height: "100%", display: "block" }}><Icon name={meta.icon} /></span></span>
        <span className="lnk__tx"><b>{item.label || meta.label}</b>{live && <small>{action}</small>}</span>
        {live && <span className="lnk__arr" style={{ width: 16, height: 16 }}><Icon name="arrow" /></span>}
      </>
    );
    if (live) {
      return <a className="lnk live" href={item.href} target="_blank" rel="noopener noreferrer">{common}</a>;
    }
    return <div className="lnk soon" aria-disabled="true" title="Coming soon">{common}</div>;
  }

  function LinksGrid({ title, items, kind, variant, action }) {
    const vClass = { outlined: "", filled: "v-filled", list: "v-list", compact: "v-compact" }[variant] || "";
    return (
      <div className="links-block">
        <div className="links-head">
          <h3>{title}</h3>
          <span className="protonote"><i />Static · placeholder-aware</span>
        </div>
        <div className={`lgrid lgrid--${kind} ${vClass}`}>
          {items.map((it) => <LinkTile key={it.id + (it.label || "")} item={it} action={action} />)}
        </div>
      </div>
    );
  }

  /* ============================ ABOUT / EPK / PRESS ============================ */
  function AboutEPK({ site }) {
    const ref = window.useReveal();
    const a = site.about;
    return (
      <section className="section" id="about">
        <div className="wrap reveal" ref={ref}>
          <span className="eyebrow">About · EPK</span>
          <h2 className="section-title">{a.genre}</h2>
          <div className="about__grid">
            <div>
              <div className="photo">
                {site.assets.pressPhoto
                  ? <img src={site.assets.pressPhoto} alt="villxin press photo" />
                  : <div className="ph"><div style={{ width: 30, height: 30 }}><Icon name="image" /></div>Press photo slot<br />4:5 — swap in</div>}
              </div>
            </div>
            <div className="bio">
              <p className="lead">{a.lead}</p>
              {a.body.map((p, i) => <p key={i}>{p}</p>)}

              <div className="quotes">
                {site.press.map((q, i) => (
                  <blockquote className="quote" key={i}>
                    <p>“{q.quote}”</p>
                    <cite>{q.source}</cite>
                  </blockquote>
                ))}
              </div>

              <div className="epk">
                <div className="epk__tx">
                  <h4>{site.pressKit.label}</h4>
                  <p>{site.pressKit.note}</p>
                </div>
                <a className="btn" href={site.pressKit.href} aria-label="Download press kit">
                  Download
                  <span className="arr" style={{ width: 16, height: 16, display: "inline-block" }}><Icon name="download" /></span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  /* ============================ CONTACT (mailto only — no contact API) ============================ */
  function Contact({ site }) {
    const ref = window.useReveal();
    const c = site.contact;
    return (
      <section className="section" id="contact">
        <div className="wrap reveal" ref={ref}>
          <span className="eyebrow">Contact</span>
          <h2 className="section-title">Get in touch</h2>
          <p className="section-lead">No forms, no funnel — just a direct line. <span className="protonote" style={{ marginLeft: 8 }}><i />Static · mailto</span></p>

          <div className="contact__grid">
            <div className="ccard">
              <span className="ccard__k">Booking &amp; Press</span>
              <div className="ccard__v"><a href={`mailto:${c.bookingEmail}`}>{c.bookingEmail}</a></div>
              <span className="ccard__sub">{c.bookingNote}</span>
              <a className="btn btn--primary" href={`mailto:${c.bookingEmail}?subject=villxin%20booking`} style={{ marginTop: 8, alignSelf: "flex-start" }}>
                Email for booking
                <span className="arr" style={{ width: 16, height: 16, display: "inline-block" }}><Icon name="mail" /></span>
              </a>
            </div>

            <div className="ccard">
              <span className="ccard__k">Say hello</span>
              <div className="ccard__v"><a href={`mailto:${c.generalEmail}`}>{c.generalEmail}</a></div>
              <span className="ccard__sub">{c.generalNote}</span>
              <a className="btn" href={`mailto:${c.generalEmail}`} style={{ marginTop: 8, alignSelf: "flex-start" }}>
                Say hello
                <span className="arr" style={{ width: 16, height: 16, display: "inline-block" }}><Icon name="mail" /></span>
              </a>
            </div>
          </div>
        </div>
      </section>
    );
  }

  /* ============================ PERSISTENT SOCIAL DOCK (follows scroll) ============================ */
  function SocialDock({ site, hidden }) {
    const [shown, setShown] = useState(false);
    useEffect(() => { const id = setTimeout(() => setShown(true), 600); return () => clearTimeout(id); }, []);
    return (
      <nav className={"socialdock" + (shown ? " in" : "") + (hidden ? " away" : "")} aria-label="Social links">
        <span className="socialdock__label">Follow</span>
        <span className="socialdock__row">
          {site.social.map((s) => {
            const meta = PLATFORM[s.id] || { label: s.id, icon: "disc" };
            const live = !!(s.href && s.href.trim());
            const inner = <span className="socialdock__ic"><Icon name={meta.icon} /></span>;
            return live
              ? <a key={s.id} className="sdk live" href={s.href} target="_blank" rel="noopener noreferrer" aria-label={meta.label}>{inner}</a>
              : <span key={s.id} className="sdk soon" aria-label={meta.label + " (coming soon)"} title={meta.label + " — coming soon"}>{inner}</span>;
          })}
        </span>
      </nav>
    );
  }

  /* ============================ FOOTER ============================ */
  function Footer({ site }) {
    const openModal = useContext(window.ModalCtx);
    const year = new Date().getFullYear();
    return (
      <footer className="ftr">
        <div className="wrap ftr__in">
          <div className="ftr__top">
            <div className="ftr__brand">
              <img src={site.assets.iconMark} alt="" />
              <span className="nm">{site.artistName}</span>
            </div>
            <div className="ftr__join">
              <span className="ftr__join-tx">Be first to hear the debut.</span>
              <button className="btn btn--primary" type="button" onClick={openModal}>
                Join the mailing list
                <span className="arr" style={{ width: 16, height: 16, display: "inline-block" }}><Icon name="arrow" /></span>
              </button>
            </div>
          </div>
          <div className="ftr__bottom">
            <span className="ftr__cp">© {year} {site.artistName} — All rights reserved</span>
            <button className="totop" type="button" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>Back to top<span className="up" style={{ width: 14, height: 14, display: "inline-block" }}><Icon name="arrowUp" /></span></button>
          </div>
        </div>
      </footer>
    );
  }

  Object.assign(window, { LinksGrid, AboutEPK, Contact, SocialDock, Footer });
})();
