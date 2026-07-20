import type { IconName } from '../components/Icon'

export const PLATFORM: Record<string, { label: string; icon: IconName }> = {
  spotify: { label: 'Spotify', icon: 'spotify' },
  apple: { label: 'Apple Music', icon: 'apple' },
  amazon: { label: 'Amazon Music', icon: 'amazon' },
  tidal: { label: 'Tidal', icon: 'tidal' },
  deezer: { label: 'Deezer', icon: 'deezer' },
  soundcloud: { label: 'SoundCloud', icon: 'soundcloud' },
  bandcamp: { label: 'Bandcamp', icon: 'bandcamp' },
  youtube: { label: 'YouTube', icon: 'youtube' },
  instagram: { label: 'Instagram', icon: 'instagram' },
  x: { label: 'X', icon: 'x' },
  tiktok: { label: 'TikTok', icon: 'tiktok' },
  facebook: { label: 'Facebook', icon: 'facebook' },
  discord: { label: 'Discord', icon: 'discord' },
}
