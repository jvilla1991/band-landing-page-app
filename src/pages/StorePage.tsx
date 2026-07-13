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

/** Default-select "M" when present, else the first variant, else none. */
function pickDefaultVariant(variants: ShopVariant[]): ShopVariant | undefined {
  return variants.find((v) => v.label.toUpperCase() === 'M') ?? variants[0]
}

function ProductCard({ product }: { product: ShopProduct }) {
  const hasVariants = product.variants.length > 0
  const [variantId, setVariantId] = useState<number | undefined>(() => pickDefaultVariant(product.variants)?.id)
  const [buying, setBuying] = useState(false)
  const [buyErr, setBuyErr] = useState<string | null>(null)

  const selected = product.variants.find((v) => v.id === variantId)
  const type = /hoodie/i.test(product.name) ? 'Hoodie' : 'Tee'

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
          <img src={product.imageUrl} alt={product.name} />
        ) : (
          <div className="ph">
            <div style={{ width: 30, height: 30 }}>
              <Icon name="image" />
            </div>
            {product.name}
            <br />
            art coming soon
          </div>
        )}
      </div>
      <div className="prod__body">
        <span className="prod__type">{type}</span>
        <div className="prod__row">
          <h3 className="prod__name">{product.name}</h3>
          <span className="prod__price">${product.price}</span>
        </div>
        {hasVariants && (
          <div className="prod__sizes" role="group" aria-label={`${product.name} size`}>
            {product.variants.map((v) => (
              <button
                key={v.id}
                type="button"
                className={'szp' + (variantId === v.id ? ' sel' : '')}
                onClick={() => setVariantId(v.id)}
              >
                {v.label}
              </button>
            ))}
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
              {buying ? 'Redirecting…' : `Buy — $${product.price}`}
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
        if (on) setProducts(r)
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
