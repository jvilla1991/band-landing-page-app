import { fetchJson } from './api'

/* ---- DTO shapes (mirror band-api ShopDtos) ---- */

export interface ShopVariant {
  id: number
  /** Printify's variant id — matches ShopImage.variantIds; absent on a pre-gallery backend. */
  printifyId?: number | null
  label: string
  /** Structured size option from Printify (e.g. "M"); null when the product has no size dimension. */
  size?: string | null
  /** Structured color option from Printify (e.g. "Solid Black"); null when no color dimension. */
  color?: string | null
  price: number
}

/** One Printify mockup shot (front/back/folded/on-model), in display order. */
export interface ShopImage {
  src: string
  isDefault?: boolean
  /** Printify variant ids this mockup depicts — mockups come per color group. */
  variantIds?: number[]
}

export interface ShopProduct {
  id: number | string
  name: string
  description?: string
  price: number
  imageUrl: string
  /** Full mockup gallery; absent on a pre-gallery backend (card falls back to imageUrl). */
  images?: ShopImage[]
  variants: ShopVariant[]
}

export interface CheckoutItem {
  variantId: number
  quantity: number
}

interface CheckoutResponse {
  url: string
}

/* ---- endpoints ---- */

const S = '/api/shop'

export const shopApi = {
  products: () => fetchJson<ShopProduct[]>(`${S}/products`),
  checkout: (items: CheckoutItem[]) => fetchJson<CheckoutResponse>(`${S}/checkout`, { body: { items } }),
}
