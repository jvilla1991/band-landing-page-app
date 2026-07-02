import { useState } from 'react'
import { site } from '../config/site'
import type { Product } from '../config/site'
import useReveal from '../hooks/useReveal'
import Icon from '../components/Icon'
import '../styles/store.css'

function ProductCard({ product }: { product: Product }) {
  const [size, setSize] = useState('M')
  const live = Boolean(product.checkoutUrl)
  // Stripe Payment Link per product; selected size passed via link params
  const href = live
    ? product.checkoutUrl + (product.checkoutUrl.includes('?') ? '&' : '?') + 'size=' + size
    : undefined

  return (
    <article className="prod">
      <div className="prod__art">
        {product.image ? (
          <img src={product.image} alt={product.name} />
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
        <span className="prod__type">{product.type}</span>
        <div className="prod__row">
          <h3 className="prod__name">{product.name}</h3>
          <span className="prod__price">${product.price}</span>
        </div>
        <div className="prod__sizes" role="group" aria-label={`${product.name} size`}>
          {product.sizes.map((s) => (
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
        <div className="prod__buy">
          {live ? (
            <a className="btn btn--primary" href={href} target="_blank" rel="noopener noreferrer">
              Buy — ${product.price}
              <span className="arr" style={{ width: 16, height: 16, display: 'inline-block' }}>
                <Icon name="arrow" />
              </span>
            </a>
          ) : (
            <span className="prod__soon">
              <i />
              Checkout soon
            </span>
          )}
        </div>
      </div>
    </article>
  )
}

function StorePage() {
  const ref = useReveal()
  const store = site.store

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

      <section className="shop">
        <div className="wrap reveal" ref={ref}>
          <div className="shop__grid">
            {store.products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
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
  )
}

export default StorePage
