// The admin's half of the API client: the session (Identity bearer tokens) and
// every /admin call, with the shapes mirrored from speranta-api's Contracts.cs.
import { useSyncExternalStore } from 'react'
import { ApiError, apiUrl, request, type DayOfWeek, type AgeGroup, type DeliveryMethod } from '../lib/api'

const TOKEN_KEY = 'speranta.admin.token'
const REFRESH_KEY = 'speranta.admin.refresh'
const listeners = new Set<() => void>()

function read(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

export const session = {
  get token() {
    return read(TOKEN_KEY)
  },
  get refreshToken() {
    return read(REFRESH_KEY)
  },
  set(token: string, refresh: string) {
    try {
      localStorage.setItem(TOKEN_KEY, token)
      localStorage.setItem(REFRESH_KEY, refresh)
    } catch {
      /* storage blocked: the session lasts this page only */
    }
    listeners.forEach((l) => l())
  },
  clear() {
    try {
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(REFRESH_KEY)
    } catch {
      /* ignore */
    }
    listeners.forEach((l) => l())
  },
  subscribe(listener: () => void) {
    listeners.add(listener)
    const onStorage = (e: StorageEvent) => e.key === TOKEN_KEY && listener()
    window.addEventListener('storage', onStorage)
    return () => {
      listeners.delete(listener)
      window.removeEventListener('storage', onStorage)
    }
  },
}

/** The current access token, re-rendering when it changes (sign-in, sign-out, another tab). */
export function useToken(): string | null {
  return useSyncExternalStore(session.subscribe, () => session.token)
}

interface TokenResponse {
  accessToken: string
  refreshToken: string
}

// An access token lasts an hour. One renewal at a time, shared by every request
// that hit the expiry together.
let refreshing: Promise<boolean> | null = null

async function renew(): Promise<boolean> {
  const refreshToken = session.refreshToken
  if (!refreshToken) return false
  try {
    const t = await request<TokenResponse>('/auth/refresh', { method: 'POST', body: JSON.stringify({ refreshToken }) })
    session.set(t.accessToken, t.refreshToken)
    return true
  } catch (e) {
    if (e instanceof ApiError && e.status !== 0) session.clear()
    return false
  }
}

async function call<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = session.token
  try {
    return await request<T>(path, { ...init, token })
  } catch (e) {
    if (!(e instanceof ApiError) || e.status !== 401 || !token) throw e
    if (session.token !== token) return request<T>(path, { ...init, token: session.token })
    refreshing ??= renew().finally(() => (refreshing = null))
    if (await refreshing) return request<T>(path, { ...init, token: session.token })
    session.clear()
    throw e
  }
}

const json = (method: string, body?: unknown): RequestInit => ({
  method,
  body: body === undefined ? undefined : JSON.stringify(body),
})

/** Downloads a file from an authenticated endpoint (the CSV exports). */
async function download(path: string, fallbackName: string) {
  const go = (token: string | null) => fetch(apiUrl(path), { headers: token ? { Authorization: `Bearer ${token}` } : {} })
  let res = await go(session.token)
  if (res.status === 401 && (await renew())) res = await go(session.token)
  if (!res.ok) throw new ApiError(res.status, 'Exportul nu a reușit.')
  const name = /filename="?([^";]+)"?/.exec(res.headers.get('Content-Disposition') ?? '')?.[1] ?? fallbackName
  const url = URL.createObjectURL(await res.blob())
  const a = Object.assign(document.createElement('a'), { href: url, download: name })
  a.click()
  URL.revokeObjectURL(url)
}

const qs = (params: Record<string, string | number | undefined | null>) => {
  const q = new URLSearchParams()
  for (const [k, v] of Object.entries(params)) if (v !== undefined && v !== null && v !== '') q.set(k, String(v))
  const s = q.toString()
  return s ? `?${s}` : ''
}

// ---- Shapes ----------------------------------------------------------------------

export type OrderStatus = 'New' | 'Confirmed' | 'Delivered' | 'PickedUp' | 'Cancelled'
export type SignupStatus = 'New' | 'Contacted' | 'Enrolled' | 'Withdrawn'
export type MessageStatus = 'New' | 'Answered'
export type AnnouncementStatus = 'Draft' | 'Published'
export type SubmissionKind = 'BookOrder' | 'KidsSignup' | 'ContactMessage'

export interface Activity {
  at: string
  text: string
}

export interface SubmissionList<Row, S extends string> {
  items: Row[]
  total: number
  pageNumber: number
  pageSize: number
  counts: Record<S, number>
  thisMonth: number
}

export interface OrderRow {
  id: number
  createdAt: string
  fullName: string
  phone: string
  bookSlug: string
  bookTitle: string
  deliveryMethod: DeliveryMethod
  address: string | null
  status: OrderStatus
  emailPending: boolean
}

export interface OrderDetail extends OrderRow {
  updatedAt: string
  ageGroup: AgeGroup | null
  hasBibleAtHome: boolean | null
  internalNote: string | null
  history: Activity[]
}

export interface SignupRow {
  id: number
  createdAt: string
  parentName: string
  phone: string
  email: string | null
  childFirstName: string | null
  childAge: number | null
  group: 'UnderSeven' | 'SevenToFourteen' | null
  participatedBefore: boolean
  message: string | null
  status: SignupStatus
  emailPending: boolean
}

export interface SignupDetail extends SignupRow {
  updatedAt: string
  internalNote: string | null
  history: Activity[]
}

export interface MessageRow {
  id: number
  createdAt: string
  name: string
  email: string
  subject: string | null
  preview: string
  status: MessageStatus
  emailPending: boolean
}

export interface MessageDetail {
  id: number
  createdAt: string
  firstName: string | null
  lastName: string | null
  email: string
  subject: string | null
  body: string
  status: MessageStatus
  history: Activity[]
  emailPending: boolean
}

export interface DashboardTodo {
  kind: SubmissionKind
  id: number
  title: string
  detail: string
  at: string
}

export interface Dashboard {
  displayName: string | null
  newOrders: number
  ordersThisMonth: number
  newSignups: number
  enrolledKids: number
  newMessages: number
  messagesThisMonth: number
  todo: DashboardTodo[]
}

export type MailState = 'Ok' | 'Failing' | 'NotConfigured'

export interface MailHealth {
  state: MailState
  pending: number
  failingSince: string | null
  lastSuccessAt: string | null
  lastCheckAt: string | null
  lastError: string | null
  notifyTo: string
}

export interface AdminAnnouncementRow {
  id: number
  slug: string
  title: string
  status: AnnouncementStatus
  publishAt: string | null
  isLive: boolean
  coverUrl: string | null
  updatedAt: string
}

export interface AdminAnnouncement {
  id: number
  slug: string
  title: string
  bodyHtml: string
  coverFileId: string | null
  coverUrl: string | null
  status: AnnouncementStatus
  publishAt: string | null
  showOnHome: boolean
  createdAt: string
  updatedAt: string
}

export interface SaveAnnouncement {
  title: string
  bodyHtml: string
  coverFileId: string | null
  status: AnnouncementStatus
  publishAt: string | null
  showOnHome: boolean
}

export interface UploadedFile {
  id: string
  url: string
  fileName: string
  contentType: string
  sizeBytes: number
}

export interface Schedule {
  services: { day: DayOfWeek; start: string; end: string }[]
  kidsGroups: { label: string; start: string; end: string }[]
  kidsPhone: string
}

export interface AdminFlyer {
  url: string
  fileName: string
  uploadedAt: string
  sizeBytes: number
  downloads: number
}

export interface AdminBook {
  id: number
  slug: string
  title: string
  isAvailable: boolean
  sortOrder: number
  newThisMonth: number
}

export interface Account {
  id: string
  email: string
  displayName: string | null
}

export interface Admins {
  admins: { id: string; email: string; displayName: string | null; isYou: boolean }[]
  invites: { id: number; email: string; displayName: string | null; createdAt: string; expiresAt: string }[]
}

export interface InviteInfo {
  email: string
  displayName: string | null
  invitedBy: string | null
}

// ---- Calls -----------------------------------------------------------------------

export const adminApi = {
  login: async (email: string, password: string) => {
    const t = await request<TokenResponse>('/auth/login', json('POST', { email, password }))
    session.set(t.accessToken, t.refreshToken)
  },
  forgotPassword: (email: string) => request<void>('/auth/forgotPassword', json('POST', { email })),
  resetPassword: (email: string, resetCode: string, newPassword: string) =>
    request<void>('/auth/resetPassword', json('POST', { email, resetCode, newPassword })),
  invite: (token: string) => request<InviteInfo>(`/invites/${encodeURIComponent(token)}`),
  acceptInvite: (token: string, password: string) =>
    request<Account>(`/invites/${encodeURIComponent(token)}/accept`, json('POST', { password })),

  me: () => call<Account>('/admin/me'),
  dashboard: () => call<Dashboard>('/admin/dashboard'),

  mailStatus: () => call<MailHealth>('/admin/mail-status'),
  mailCheck: () => call<MailHealth>('/admin/mail-status/check', json('POST')),
  mailTest: () => call<MailHealth>('/admin/mail-status/test', json('POST')),
  saveAppPassword: (appPassword: string) => call<MailHealth>('/admin/mail-settings', json('PUT', { appPassword })),

  orders: (p: { status?: OrderStatus; q?: string; page?: number }) =>
    call<SubmissionList<OrderRow, OrderStatus>>(`/admin/book-orders${qs({ ...p, pageSize: 25 })}`),
  order: (id: number) => call<OrderDetail>(`/admin/book-orders/${id}`),
  updateOrder: (
    id: number,
    body: { status?: OrderStatus; deliveryMethod?: DeliveryMethod; address?: string; internalNote?: string },
  ) => call<OrderDetail>(`/admin/book-orders/${id}`, json('PATCH', body)),
  exportOrders: (p: { status?: OrderStatus; q?: string }) => download(`/admin/book-orders.csv${qs(p)}`, 'comenzi.csv'),

  signups: (p: { status?: SignupStatus; q?: string; page?: number }) =>
    call<SubmissionList<SignupRow, SignupStatus>>(`/admin/kids-signups${qs({ ...p, pageSize: 25 })}`),
  signup: (id: number) => call<SignupDetail>(`/admin/kids-signups/${id}`),
  updateSignup: (id: number, body: { status?: SignupStatus; internalNote?: string }) =>
    call<SignupDetail>(`/admin/kids-signups/${id}`, json('PATCH', body)),
  exportSignups: (p: { status?: SignupStatus; q?: string }) => download(`/admin/kids-signups.csv${qs(p)}`, 'inscrieri.csv'),

  messages: (p: { status?: MessageStatus; q?: string; page?: number }) =>
    call<SubmissionList<MessageRow, MessageStatus>>(`/admin/messages${qs({ ...p, pageSize: 50 })}`),
  message: (id: number) => call<MessageDetail>(`/admin/messages/${id}`),
  updateMessage: (id: number, status: MessageStatus) =>
    call<MessageDetail>(`/admin/messages/${id}`, json('PATCH', { status })),

  announcements: () => call<AdminAnnouncementRow[]>('/admin/announcements'),
  announcement: (id: number) => call<AdminAnnouncement>(`/admin/announcements/${id}`),
  createAnnouncement: (body: SaveAnnouncement) => call<AdminAnnouncement>('/admin/announcements', json('POST', body)),
  saveAnnouncement: (id: number, body: SaveAnnouncement) =>
    call<AdminAnnouncement>(`/admin/announcements/${id}`, json('PUT', body)),
  deleteAnnouncement: (id: number) => call<void>(`/admin/announcements/${id}`, json('DELETE')),
  uploadImage: (file: File) => {
    const form = new FormData()
    form.append('file', file)
    return call<UploadedFile>('/admin/files/images', { method: 'POST', body: form })
  },

  schedule: () => call<Schedule>('/admin/schedule'),
  saveSchedule: (body: Schedule) => call<Schedule>('/admin/schedule', json('PUT', body)),
  flyer: () => call<AdminFlyer | undefined>('/admin/flyer'),
  uploadFlyer: (file: File) => {
    const form = new FormData()
    form.append('file', file)
    return call<AdminFlyer>('/admin/flyer', { method: 'POST', body: form })
  },

  books: () => call<AdminBook[]>('/admin/books'),
  setBookAvailable: (id: number, isAvailable: boolean) =>
    call<AdminBook[]>(`/admin/books/${id}`, json('PATCH', { isAvailable })),
  reorderBooks: (ids: number[]) => call<AdminBook[]>('/admin/books/order', json('PUT', { ids })),

  admins: () => call<Admins>('/admin/admins'),
  inviteAdmin: (email: string, displayName: string) =>
    call<Admins>('/admin/admins/invites', json('POST', { email, displayName })),
  revokeInvite: (id: number) => call<void>(`/admin/admins/invites/${id}`, json('DELETE')),
  removeAdmin: (id: string) => call<void>(`/admin/admins/${id}`, json('DELETE')),

  pushKey: () => call<{ publicKey: string } | undefined>('/admin/push/key'),
  pushSubscribe: (sub: PushSubscriptionJSON) => call<void>('/admin/push/subscriptions', json('POST', sub)),
  pushUnsubscribe: (endpoint: string) =>
    call<void>(`/admin/push/subscriptions?endpoint=${encodeURIComponent(endpoint)}`, json('DELETE')),
  pushTest: () => call<void>('/admin/push/test', json('POST')),
}
