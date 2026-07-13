import { fetchJson } from './api'

/* ---- DTO shapes (mirror band-api ShopDtos) ---- */

export interface ShopVariant {
  id: number
  label: string
  price: number
}

export interface ShopProduct {
  id: number | string
  name: string
  description?: string
  price: number
  imageUrl: string
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
