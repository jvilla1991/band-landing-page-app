/* villxin — store page app: product grid + Stripe/Printify checkout slots */
(function () {
  const { useState, useEffect } = React;
  const site = window.SITE;
  const { Header, Footer, SocialDock, MailingListModal, useReveal } = window;
  const { useTweaks, TweaksPanel, TweakSection, TweakSlider, TweakColor } = window;
  const Icon = window.Icon;

  const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/ {
    cols: 3,
    accent: "#d9402a",
  } /*EDITMODE-END*/;

  /* ============================ PRODUCT CARD ============================ */
  function ProductCard({ p }) {
    const [size, setSize] = useState("M");
    const live = !!p.checkoutUrl;
    // Real app: Stripe Payment Link per product; size passed via link params / Printify variant.
    const href = live ? p.checkoutUrl + (p.checkoutUrl.includes("?") ? "&" : "?") + "size=" + size : undefined;
    return (
      <article className="prod">
        <div className="prod__art">
          <image-slot
            id={"prod-" + p.id}
            shape="rect"
            placeholder={"Drop " + p.name + " art"}
          ></image-slot>
        </div>
        <div className="prod__body">
          <span className="prod__type">{p.type}</span>
          <div className="prod__row">
            <h3 className="prod__name">{p.name}</h3>
            <span className="prod__price">${p.price}</span>
          </div>
          <div className="prod__sizes" role="group" aria-label={p.name + " size"}>
            {p.sizes.map((s) => (
              <button key={s} type="button" className={"szp" + (size === s ? " sel" : "")} onClick={() => setSize(s)}>{s}</button>
            ))}
          </div>
          <div className="prod__buy">
            {live ? (
              <a className="btn btn--primary" href={href} target="_blank" rel="noopener">
                Buy — ${p.price}
                <span className="arr" style={{ width: 16, height: 16, display: "inline-block" }}><Icon name="arrow" /></span>
              </a>
            ) : (
              <span className="prod__soon"><i />Checkout soon</span>
            )}
          </div>
        </div>
      </article>
    );
  }

  /* ============================ PAGE ============================ */
  function StoreApp() {
    const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
    const [modalOpen, setModalOpen] = useState(false);
    const openModal = () => setModalOpen(true);
    const closeModal = () => { setModalOpen(false); try { sessionStorage.setItem("villxin_ml_seen", "1"); } catch (e) {} };
    const ref = useReveal();
    const store = site.store;

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
        <Header site={site} page="store" />
        <main id="top">
          <section className="storehero">
            <div className="wrap">
              <span className="eyebrow">Store</span>
              <h1 className="storehero__title">Merch</h1>
              <p className="storehero__lead">
                Printed to order — nothing sits in a warehouse. Every piece ships when you order it.
              </p>
              <div className="storehero__meta">
                <span className="protonote"><i />{store.fulfillment}</span>
                <span className="protonote"><i />{store.shippingNote}</span>
              </div>
            </div>
          </section>

          <section className="shop">
            <div className="wrap reveal" ref={ref}>
              <div className="shop__grid" style={{ gridTemplateColumns: `repeat(${t.cols}, 1fr)` }}>
                {store.products.map((p) => <ProductCard key={p.id} p={p} />)}
              </div>
            </div>
          </section>

          <div className="wrap">
            <div className="fulfil">
              <span>{store.fulfillment}</span>
              <span>{store.shippingNote}</span>
            </div>
          </div>
        </main>
        <Footer site={site} />

        <SocialDock site={site} hidden={modalOpen} />
        <MailingListModal open={modalOpen} onClose={closeModal} site={site} />

        <TweaksPanel>
          <TweakSection label="Grid" />
          <TweakSlider label="Columns" min={2} max={4} step={1} value={t.cols} onChange={(v) => setTweak("cols", v)} />
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

  ReactDOM.createRoot(document.getElementById("root")).render(<StoreApp />);
})();
