import { useEffect, useState } from 'react'

export interface CartEntry {
  /** Our backend's variant id (ShopVariant.id) — what the checkout endpoint takes. */
  variantId: number
  quantity: number
}

const STORAGE_KEY = 'villxin.cart'
const MAX_QTY = 99

/* Prices are never stored — the backend re-reads the live variant price at
   checkout, so a stale saved cart can't buy at an old price. */
function load(): CartEntry[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed
      .filter(
        (e): e is CartEntry =>
          typeof e === 'object' &&
          e !== null &&
          Number.isFinite((e as CartEntry).variantId) &&
          Number.isFinite((e as CartEntry).quantity) &&
          (e as CartEntry).quantity > 0,
      )
      .map((e) => ({ variantId: e.variantId, quantity: Math.min(Math.floor(e.quantity), MAX_QTY) }))
  } catch {
    return []
  }
}

/** localStorage-backed cart: survives reloads and the Stripe redirect round trip. */
export default function useCart() {
  const [entries, setEntries] = useState<CartEntry[]>(load)

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
    } catch {
      /* private mode / quota — the cart just won't persist */
    }
  }, [entries])

  const add = (variantId: number, quantity = 1) =>
    setEntries((prev) => {
      const existing = prev.find((e) => e.variantId === variantId)
      if (existing) {
        return prev.map((e) =>
          e.variantId === variantId ? { ...e, quantity: Math.min(e.quantity + quantity, MAX_QTY) } : e,
        )
      }
      return [...prev, { variantId, quantity: Math.min(quantity, MAX_QTY) }]
    })

  /** Quantity below 1 removes the line — the stepper's "−" on a single item. */
  const setQuantity = (variantId: number, quantity: number) =>
    setEntries((prev) =>
      quantity < 1
        ? prev.filter((e) => e.variantId !== variantId)
        : prev.map((e) => (e.variantId === variantId ? { ...e, quantity: Math.min(quantity, MAX_QTY) } : e)),
    )

  const remove = (variantId: number) => setEntries((prev) => prev.filter((e) => e.variantId !== variantId))

  const clear = () => setEntries([])

  const count = entries.reduce((n, e) => n + e.quantity, 0)

  return { entries, count, add, setQuantity, remove, clear }
}
