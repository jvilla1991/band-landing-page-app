/* villxin — root app: assembles sections, entry modal, Tweaks */
(function () {
  const { useEffect, useState, useRef } = React;
  const site = window.SITE;
  const { Header, Hero, ReleaseBand, DemoPlayer, LinksGrid, AboutEPK, Contact, SocialDock, Footer, MailingListModal, useReveal } = window;
  const { useTweaks, TweaksPanel, TweakSection, TweakRadio, TweakColor, TweakToggle, TweakButton } = window;

  const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/ {
    streamStyle: "outlined",
    socialStyle: "compact",
    accent: "#d9402a",
    entryModal: true,
  } /*EDITMODE-END*;

  /* ---- LISTEN ---- */
  function Listen({ t }) {
    const ref = useReveal();
    return (
      <section className="section" id="listen">
        <div className="wrap reveal" ref={ref}>
          <span className="eyebrow">Listen</span>
          <h2 className="section-title">Demos &amp; where to hear it</h2>
          <p className="section-lead">
            Rough mixes from the first sessions — previews, not masters.
            <span className="protonote" style={{ marginLeft: 8 }}><i />Static · local audio</span>
          </p>
          <DemoPlayer tracks={site.tracks} />
          <LinksGrid title="Where to listen" items={site.streaming} kind="stream" variant={t.streamStyle} action="Listen" />
        </div>
      </section>
    );
  }

  function App() {
    const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
    const [modalOpen, setModalOpen] = useState(false);
    const greeted = useRef(false);

    const openModal = () => setModalOpen(true);
    const closeModal = () => { setModalOpen(false); try { sessionStorage.setItem("villxin_ml_seen", "1"); } catch (e) {} };

    // greet on entry (once per session, unless tweak disabled)
    useEffect(() => {
      if (greeted.current) return;
      greeted.current = true;
      let seen = false;
      try { seen = sessionStorage.getItem("villxin_ml_seen") === "1"; } catch (e) {}
      if (t.entryModal && !seen) {
        const id = setTimeout(() => setModalOpen(true), 1000);
        return () => clearTimeout(id);
      }
    }, []); // eslint-disable-line

    // tunable accent -> CSS vars (ember/violet family)
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
        <Header site={site} />
        <main>
          <Hero site={site} />
          <ReleaseBand site={site} />
          <Listen t={t} />
          <AboutEPK site={site} />
          <Contact site={site} />
        </main>
        <Footer site={site} />

        <SocialDock site={site} hidden={modalOpen} />
        <MailingListModal open={modalOpen} onClose={closeModal} site={site} />

        <TweaksPanel>
          <TweakSection label="Entry modal" />
          <TweakToggle label="Greet on load" value={t.entryModal} onChange={(v) => setTweak("entryModal", v)} />
          <TweakButton label="Replay entry modal" onClick={() => { try { sessionStorage.removeItem("villxin_ml_seen"); } catch (e) {} setModalOpen(true); }} />
          <TweakSection label="Link grid" />
          <TweakRadio label="Streaming style" value={t.streamStyle}
            options={["outlined", "filled", "list", "compact"]} onChange={(v) => setTweak("streamStyle", v)} />
          <TweakSection label="Accent" />
          <TweakColor label="Ember / violet" value={t.accent}
            options={["#d9402a", "#b3261e", "#a8332f", "#8e2a6b", "#6e2c8f"]}
            onChange={(v) => setTweak("accent", v)} />
        </TweaksPanel>
      </window.ModalCtx.Provider>
    );
  }

  function hexA(hex, a) { const { r, g, b } = toRGB(hex); return `rgba(${r}, ${g}, ${b}, ${a})`; }
  function lighten(hex, amt) { const { r, g, b } = toRGB(hex); const f = (c) => Math.round(c + (255 - c) * amt); return `rgb(${f(r)}, ${f(g)}, ${f(b)})`; }
  function toRGB(hex) { const h = hex.replace("#", ""); return { r: parseInt(h.slice(0, 2), 16), g: parseInt(h.slice(2, 4), 16), b: parseInt(h.slice(4, 6), 16) }; }

  ReactDOM.createRoot(document.getElementById("root")).render(<App />);
})();
