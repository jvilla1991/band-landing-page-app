import { useEffect, useState } from 'react'
import { site } from '../config/site'
import { shopApi } from '../config/shop'
import type { ShopProduct, ShopVariant } from '../config/shop'
import useReveal from '../hooks/useReveal'
import Icon from '../components/Icon'
import '../styles/store.css'

/* Static site.ts products, mapped into the live API's shape as the
   API-down fallback — empty variants means the card renders "Checkout soon". */
function fallbackProducts(): ShopProduct[] {
  return site.store.products.map((p) => ({
    id: p.id,
    name: p.name,
    price: p.price,
    imageUrl: p.image,
    variants: [] as ShopVariant[],
  }))
}

/* The API contract is a plain array, but a stale/old backend can answer 200 with a
   different shape (e.g. a paginated {content:[...]} object). fetchJson only rejects
   on non-2xx, so that wrong-but-successful body would otherwise reach render() and
   throw on .map — take the static fallback instead of white-screening. Also coerce
   each product's variants to an array so a single malformed row can't crash a card. */
function normalizeProducts(raw: unknown): ShopProduct[] {
  if (!Array.isArray(raw)) return fallbackProducts()
  return raw.map((p) => ({
    ...(p as ShopProduct),
    variants: Array.isArray((p as ShopProduct).variants) ? (p as ShopProduct).variants : [],
  }))
}

/** First occurrence order, empties dropped — variants arrive pre-sorted by the API. */
function uniqueInOrder(values: (string | null | undefined)[]): string[] {
  const out: string[] = []
  for (const v of values) if (v && !out.includes(v)) out.push(v)
  return out
}

/** "$28" for whole dollars, "$28.50" otherwise. */
function fmtPrice(n: number): string {
  return Number.isInteger(n) ? `$${n}` : `$${n.toFixed(2)}`
}

function deriveType(name: string): string {
  const n = name.toLowerCase()
  if (n.includes('hoodie')) return 'Hoodie'
  if (n.includes('tank')) return 'Tank'
  if (n.includes('sticker')) return 'Sticker'
  if (n.includes('keyring') || n.includes('keychain')) return 'Keychain'
  if (n.includes('v-neck') || n.includes('tee') || n.includes('shirt')) return 'Tee'
  return 'Merch'
}

function ProductCard({ product }: { product: ShopProduct }) {
  const hasVariants = product.variants.length > 0
  const sizes = uniqueInOrder(product.variants.map((v) => v.size))
  const colors = uniqueInOrder(product.variants.map((v) => v.color))
  /* No structured dimensions at all (older sync data) -> pick by full label. */
  const useLabels = sizes.length === 0 && colors.length === 0
  const sizeOptions = useLabels ? uniqueInOrder(product.variants.map((v) => v.label)) : sizes

  const [size, setSize] = useState<string | undefined>(() =>
    sizeOptions.includes('M') ? 'M' : sizeOptions[0],
  )
  const [color, setColor] = useState<string | undefined>(colors[0])
  const [buying, setBuying] = useState(false)
  const [buyErr, setBuyErr] = useState<string | null>(null)

  const bySize = (v: ShopVariant) =>
    useLabels ? v.label === size : sizes.length === 0 || v.size === size
  const selected =
    product.variants.find((v) => bySize(v) && (colors.length === 0 || v.color === color)) ??
    product.variants.find(bySize) ??
    product.variants[0]
  /* Colors that exist for the chosen size; others render disabled. */
  const availableColors = new Set(product.variants.filter(bySize).map((v) => v.color))

  /* Printify titles carry SEO suffixes ("… | Indoor Outdoor") — show the part before the pipe. */
  const displayName = product.name.split('|')[0].trim()
  const type = deriveType(displayName)

  async function buy() {
    if (!selected || buying) return
    setBuying(true)
    setBuyErr(null)
    try {
      const { url } = await shopApi.checkout([{ variantId: selected.id, quantity: 1 }])
      window.location.href = url
    } catch {
      setBuyErr("Checkout didn't start — try again in a minute.")
      setBuying(false)
    }
  }

  return (
    <article className="prod">
      <div className="prod__art">
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={displayName} />
        ) : (
          <div className="ph">
            <div style={{ width: 30, height: 30 }}>
              <Icon name="image" />
            </div>
            {displayName}
            <br />
            art coming soon
          </div>
        )}
      </div>
      <div className="prod__body">
        <span className="prod__type">{type}</span>
        <div className="prod__row">
          <h3 className="prod__name">{displayName}</h3>
          <span className="prod__price">{fmtPrice(selected?.price ?? product.price)}</span>
        </div>
        {sizeOptions.length > 1 && (
          <div className="prod__opt">
            <span className="prod__dim">Size</span>
            <div className="prod__sizes" role="group" aria-label={`${displayName} size`}>
              {sizeOptions.map((s) => (
                <button
                  key={s}
                  type="button"
                  className={'szp' + (size === s ? ' sel' : '')}
                  onClick={() => setSize(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
        {colors.length > 1 && (
          <div className="prod__opt">
            <span className="prod__dim">Color</span>
            <div className="prod__sizes" role="group" aria-label={`${displayName} color`}>
              {colors.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={'szp' + (selected?.color === c ? ' sel' : '')}
                  disabled={!availableColors.has(c)}
                  onClick={() => setColor(c)}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        )}
        <div className="prod__buy">
          {hasVariants ? (
            <button
              className="btn btn--primary"
              type="button"
              disabled={buying || !selected}
              onClick={() => void buy()}
            >
              {buying ? 'Redirecting…' : `Buy — ${fmtPrice(selected?.price ?? product.price)}`}
              {!buying && (
                <span className="arr" style={{ width: 16, height: 16, display: 'inline-block' }}>
                  <Icon name="arrow" />
                </span>
              )}
            </button>
          ) : (
            <span className="prod__soon">
              <i />
              Checkout soon
            </span>
          )}
        </div>
        {buyErr && <p className="prod__err">{buyErr}</p>}
      </div>
    </article>
  )
}

/* Sub-view hangs off the page hash: Stripe redirects to
   "#/store/success?session_id=…" after a completed checkout. */
function isSuccessHash(): boolean {
  return window.location.hash.startsWith('#/store/success')
}

function SuccessPanel() {
  return (
    <div className="wrap">
      <div className="storeok">
        <span className="storeok__badge">
          <Icon name="check" />
        </span>
        <div>
          <h2 className="storeok__title">Order confirmed</h2>
          <p className="storeok__body">
            Stripe is emailing your receipt now. Everything's printed to order, so plan on 7–10 days for production
            and transit before it ships.
          </p>
          <a className="storeok__back" href="#/store">
            <Icon name="arrowUp" />
            Back to the store
          </a>
        </div>
      </div>
    </div>
  )
}

function StorePage() {
  const ref = useReveal()
  const store = site.store
  const [products, setProducts] = useState<ShopProduct[] | null>(null)
  const [success, setSuccess] = useState(isSuccessHash)

  useEffect(() => {
    const onHashChange = () => setSuccess(isSuccessHash())
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  useEffect(() => {
    let on = true
    shopApi
      .products()
      .then((r) => {
        if (on) setProducts(normalizeProducts(r))
      })
      .catch(() => {
        if (on) setProducts(fallbackProducts())
      })
    return () => {
      on = false
    }
  }, [])

  return (
    <main>
      <section className="storehero">
        <div className="wrap">
          <span className="eyebrow">Store</span>
          <h1 className="storehero__title">Merch</h1>
          <p className="storehero__lead">
            Printed to order — nothing sits in a warehouse. Every piece ships when you order it.
          </p>
          <div className="storehero__meta">
            <span className="protonote">
              <i />
              {store.fulfillment}
            </span>
            <span className="protonote">
              <i />
              {store.shippingNote}
            </span>
          </div>
        </div>
      </section>

      {success && <SuccessPanel />}

      <section className="shop">
        <div className="wrap reveal" ref={ref}>
          {products === null ? (
            <div className="shop__grid">
              {[0, 1, 2].map((i) => (
                <div className="prod prod--skeleton" key={i} aria-hidden="true">
                  <div className="prod__art" />
                  <div className="prod__body">
                    <div className="sk sk--type" />
                    <div className="sk sk--name" />
                    <div className="sk sk--sizes" />
                    <div className="sk sk--buy" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="shop__grid">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </section>

      <div className="wrap">
        <div className="fulfil">
          <span>{store.fulfillment}</span>
          <span>{store.shippingNote}</span>
        </div>
      </div>
    </main>
  )
}

export default StorePage
