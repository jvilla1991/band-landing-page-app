import { fetchJson } from './api'

/* About-section carousel photos (GET /api/site/photos). Image bytes live in the
   backend; `imageUrl` is a path like "/api/site/photos/3/image" that must be
   joined to API_BASE before use. The public site must keep rendering when this
   fetch fails, so AboutEPK falls back to the static site.about.photos list. */

export interface AboutPhotoDto {
  id: number
  alt: string
  focus?: string | null
  sortOrder: number
  /** Path under API_BASE for the image bytes, e.g. "/api/site/photos/3/image". */
  imageUrl: string
}

export const fetchAboutPhotos = () => fetchJson<AboutPhotoDto[]>('/api/site/photos')
