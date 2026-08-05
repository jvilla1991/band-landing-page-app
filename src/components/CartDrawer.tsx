import { useEffect } from 'react'
import type { ShopProduct, ShopVariant } from '../config/shop'
import type { CartEntry } from '../hooks/useCart'
import Icon from './Icon'

/** A cart entry joined against the live catalog; variant is undefined when the
    saved item no longer exists (discontinued between visits). */
export interface CartLine {
  entry: CartEntry
  product?: ShopProduct
  variant?: ShopVariant
}

interface CartDrawerProps {
  open: boolean
  onClose: () => void
  lines: CartLine[]
  /** false while the catalog is still loading — lines can't be resolved yet */
  catalogReady: boolean
  onSetQuantity: (variantId: number, quantity: number) => void
  onRemove: (variantId: number) => void
  onCheckout: () => void
  checkingOut: boolean
  error: string | null
}

function fmtPrice(n: number): string {
  return Number.isInteger(n) ? `$${n}` : `$${n.toFixed(2)}`
}

function CartDrawer({
  open,
  onClose,
  lines,
  catalogReady,
  onSetQuantity,
  onRemove,
  onCheckout,
  checkingOut,
  error,
}: CartDrawerProps) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  const valid = lines.filter((l) => l.variant)
  const stale = catalogReady ? lines.filter((l) => !l.variant) : []
  const subtotal = valid.reduce((sum, l) => sum + (l.variant?.price ?? 0) * l.entry.quantity, 0)

  return (
    <div className="cartd" role="dialog" aria-modal="true" aria-label="Cart">
      <div className="cartd__scrim" onClick={onClose} />
      <aside className="cartd__panel">
        <header className="cartd__head">
          <h2 className="cartd__title">Cart</h2>
          <button type="button" className="cartd__close" aria-label="Close cart" onClick={onClose}>
            ×
          </button>
        </header>

        {lines.length === 0 ? (
          <p className="cartd__empty">Nothing in here yet.</p>
        ) : (
          <ul className="cartd__list">
            {lines.map(({ entry, product, variant }) => {
              const name = product ? product.name.split('|')[0].trim() : 'Item no longer available'
              return (
                <li className={'cartd__line' + (catalogReady && !variant ? ' cartd__line--stale' : '')} key={entry.variantId}>
                  <div className="cartd__lineart">
                    {product?.imageUrl ? <img src={product.imageUrl} alt="" /> : <Icon name="image" />}
                  </div>
                  <div className="cartd__linebody">
                    <span className="cartd__linename">{name}</span>
                    {variant ? (
                      <span className="cartd__linevariant">{variant.label}</span>
                    ) : catalogReady ? (
                      <span className="cartd__linevariant">Removed from the store — take it out to check out</span>
                    ) : (
                      <span className="cartd__linevariant">Loading…</span>
                    )}
                    {variant && (
                      <div className="cartd__qty" role="group" aria-label={`${name} quantity`}>
                        <button
                          type="button"
                          aria-label="Decrease quantity"
                          onClick={() => onSetQuantity(entry.variantId, entry.quantity - 1)}
                        >
                          −
                        </button>
                        <span aria-live="polite">{entry.quantity}</span>
                        <button
                          type="button"
                          aria-label="Increase quantity"
                          onClick={() => onSetQuantity(entry.variantId, entry.quantity + 1)}
                        >
                          +
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="cartd__lineend">
                    {variant && <span className="cartd__lineprice">{fmtPrice(variant.price * entry.quantity)}</span>}
                    <button
                      type="button"
                      className="cartd__remove"
                      aria-label={`Remove ${name}`}
                      onClick={() => onRemove(entry.variantId)}
                    >
                      Remove
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>
        )}

        {lines.length > 0 && (
          <footer className="cartd__foot">
            <div className="cartd__subtotal">
              <span>Subtotal</span>
              <span>{fmtPrice(subtotal)}</span>
            </div>
            <p className="cartd__shipnote">Shipping calculated at checkout.</p>
            {error && <p className="cartd__err">{error}</p>}
            <button
              type="button"
              className="btn btn--primary cartd__checkout"
              disabled={checkingOut || !catalogReady || valid.length === 0 || stale.length > 0}
              onClick={onCheckout}
            >
              {checkingOut ? 'Redirecting…' : `Checkout — ${fmtPrice(subtotal)}`}
            </button>
          </footer>
        )}
      </aside>
    </div>
  )
}

export default CartDrawer
