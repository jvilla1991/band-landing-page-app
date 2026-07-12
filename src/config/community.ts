import { fetchJson } from './api'

/* ---- DTO shapes (mirror band-api CommunityDtos) ---- */

export interface UserSummary {
  username: string
  displayName: string | null
  avatarUrl: string | null
  official: boolean
}

export interface CommunityProfile {
  username: string
  displayName: string | null
  avatarUrl: string | null
  about: string | null
  whoToMeet: string | null
  mood: string | null
  profileSong: string | null
  official: boolean
  themeAccent: string
  themeGlitter: boolean
  themeTiledBg: boolean
  memberSince: string
  topFriends: UserSummary[]
}

export interface WallCommentDto {
  id: number
  body: string
  glitter: boolean
  author: UserSummary
  createdAt: string
}

export interface BulletinDto {
  id: number
  title: string
  body: string
  author: UserSummary
  createdAt: string
}

export interface BoardDto {
  id: number
  slug: string
  title: string
  description: string
  threadCount: number
}

export interface Paged<T> {
  content: T[]
}

export type ThreadStatus = 'OPEN' | 'REVOKED'

export interface DmRequestDto {
  id: number
  from: UserSummary
  preview: string
  createdAt: string
}

export interface InboxThreadDto {
  id: number
  with: UserSummary
  lastMessagePreview: string
  lastActivityAt: string
  unreadCount: number
  status: ThreadStatus
}

export interface DmMessageDto {
  id: number
  from: string
  body: string
  createdAt: string
}

export interface ThreadMessagesDto {
  id: number
  with: UserSummary
  status: ThreadStatus
  messages: DmMessageDto[]
}

export interface SentFolderDto {
  requests: { id: number; to: UserSummary; preview: string; sentAt: string }[]
  messages: { threadId: number; to: UserSummary; body: string; sentAt: string }[]
}

export interface VerifyResponse {
  token: string
  username: string
  displayName: string | null
  official: boolean
}

interface Ok {
  ok: boolean
  message?: string
}

/* ---- endpoints ---- */

const C = '/api/community'

export const communityApi = {
  signup: (email: string, username: string) => fetchJson<Ok>(`${C}/auth/signup`, { body: { email, username } }),
  login: (email: string) => fetchJson<Ok>(`${C}/auth/login`, { body: { email } }),
  verify: (token: string) => fetchJson<VerifyResponse>(`${C}/auth/verify`, { body: { token } }),

  profile: (username: string) => fetchJson<CommunityProfile>(`${C}/profiles/${username}`),
  wall: (username: string) => fetchJson<WallCommentDto[]>(`${C}/profiles/${username}/wall`),
  postWall: (username: string, body: string, glitter: boolean) =>
    fetchJson<WallCommentDto>(`${C}/profiles/${username}/wall`, { body: { body, glitter } }),

  bulletins: () => fetchJson<Paged<BulletinDto>>(`${C}/bulletins?page=0&size=10`),
  boards: () => fetchJson<BoardDto[]>(`${C}/boards`),

  dmSendRequest: (toUsername: string, message: string) =>
    fetchJson<Ok>(`${C}/dms/requests`, { body: { toUsername, message } }),
  dmRequests: () => fetchJson<DmRequestDto[]>(`${C}/dms/requests`),
  dmAccept: (id: number) => fetchJson<{ ok: boolean; threadId: number }>(`${C}/dms/requests/${id}/accept`, { method: 'POST' }),
  dmDecline: (id: number) => fetchJson<Ok>(`${C}/dms/requests/${id}/decline`, { method: 'POST' }),
  dmInbox: () => fetchJson<InboxThreadDto[]>(`${C}/dms/inbox`),
  dmSent: () => fetchJson<SentFolderDto>(`${C}/dms/sent`),
  dmTrash: () => fetchJson<InboxThreadDto[]>(`${C}/dms/trash`),
  dmThread: (id: number) => fetchJson<ThreadMessagesDto>(`${C}/dms/threads/${id}`),
  dmPostMessage: (id: number, body: string) => fetchJson<DmMessageDto>(`${C}/dms/threads/${id}/messages`, { body: { body } }),
  dmRevoke: (id: number) => fetchJson<Ok>(`${C}/dms/threads/${id}/revoke`, { method: 'POST' }),
  dmReopen: (id: number) => fetchJson<Ok>(`${C}/dms/threads/${id}/reopen`, { method: 'POST' }),
  dmTrashThread: (id: number) => fetchJson<Ok>(`${C}/dms/threads/${id}/trash`, { method: 'POST' }),
  dmRestore: (id: number) => fetchJson<Ok>(`${C}/dms/threads/${id}/restore`, { method: 'POST' }),
}

/* ---- date display (matches the demo data's "Jul 09 2026" style) ---- */

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export function fmtDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return `${MONTHS[d.getMonth()]} ${String(d.getDate()).padStart(2, '0')} ${d.getFullYear()}`
}

export function fmtDateTime(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  const h12 = d.getHours() % 12 || 12
  const ampm = d.getHours() >= 12 ? 'PM' : 'AM'
  return `${fmtDate(iso)} · ${h12}:${String(d.getMinutes()).padStart(2, '0')} ${ampm}`
}

/** "2026.07" — the profile details table's member-since style. */
export function fmtYearMonth(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}`
}
