// One place that knows where the API is and how errors come back.
//
// Dev: VITE_API_BASE is unset, so requests go to "/api/..." and Vite's proxy
// (vite.config.ts) forwards them to the API: same origin, no CORS.
// Deployed: VITE_API_BASE is the API root, and requests go straight there.
export const API_BASE: string = import.meta.env.VITE_API_BASE ?? '/api'

/** Turns an API path such as "/files/…" or "/flyer" into a URL the browser can open. */
export function apiUrl(path: string): string {
  return `${API_BASE}${path}`
}

export class ApiError extends Error {
  readonly status: number

  /**
   * Field errors from a ValidationProblem, keyed by the camelCase field name the
   * client posted. The messages are already Romanian, written for the visitor.
   */
  readonly fields: Readonly<Record<string, string>>

  constructor(status: number, message: string, fields: Record<string, string> = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.fields = fields
  }
}

export interface RequestOptions extends RequestInit {
  /** Bearer token for admin calls. */
  token?: string | null
}

export async function request<T>(path: string, init: RequestOptions = {}): Promise<T> {
  const { token, ...rest } = init
  const headers = new Headers(rest.headers)
  if (token) headers.set('Authorization', `Bearer ${token}`)
  if (rest.body && !(rest.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  let res: Response
  try {
    res = await fetch(apiUrl(path), { ...rest, headers })
  } catch {
    throw new ApiError(0, 'Nu ne-am putut conecta. Verificați legătura la internet și încercați din nou.')
  }

  if (!res.ok) {
    let message = res.statusText
    const fields: Record<string, string> = {}
    try {
      const body = await res.json()
      message = body.title ?? message
      if (body.errors && typeof body.errors === 'object') {
        for (const [key, value] of Object.entries(body.errors)) {
          const first = Array.isArray(value) ? value[0] : value
          if (typeof first === 'string') fields[key] = first
        }
      }
    } catch {
      /* not JSON */
    }
    if (res.status === 429) {
      message = 'Ați trimis prea multe formulare într-un timp scurt. Încercați din nou peste câteva minute.'
    }
    throw new ApiError(res.status, message, fields)
  }

  // 204, and Identity's empty 200s, carry no body.
  if (res.status === 204) return undefined as T
  const text = await res.text()
  return (text ? JSON.parse(text) : undefined) as T
}

// ---- Shapes mirrored from speranta-api's Contracts.cs --------------------------

export type DayOfWeek = 'Sunday' | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday'

export interface ServiceTime {
  day: DayOfWeek
  /** "HH:mm:ss" */
  start: string
  end: string
}

export interface KidsGroup {
  label: string
  start: string
  end: string
}

export interface Flyer {
  /** API-relative: "/flyer" */
  url: string
  fileName: string
  uploadedAt: string
  sizeBytes: number
}

export interface BookInfo {
  slug: string
  title: string
  isAvailable: boolean
  asksAgeGroup: boolean
  asksBibleAtHome: boolean
  allowsPickup: boolean
  isForChildren: boolean
  /** One sentence for the catalogue. */
  blurb: string
  /** API-relative; null for the six launch books, whose covers ship with this client. */
  coverUrl: string | null
}

/** Everything a book's page shows (GET /books/{slug}). */
export interface BookPageData {
  slug: string
  title: string
  heading: string
  blurb: string
  lead: string
  paragraphs: string[]
  benefits: string[]
  closing: string | null
  formEyebrow: string
  formTitle: string
  coverUrl: string | null
  bannerUrl: string | null
  isAvailable: boolean
  asksAgeGroup: boolean
  asksBibleAtHome: boolean
  allowsPickup: boolean
  isForChildren: boolean
}

export interface SiteInfo {
  services: ServiceTime[]
  kidsGroups: KidsGroup[]
  kidsPhone: string
  flyer: Flyer | null
  books: BookInfo[]
}

export interface AnnouncementSummary {
  slug: string
  title: string
  excerpt: string
  coverUrl: string | null
  publishedAt: string
}

export interface AnnouncementDetail {
  slug: string
  title: string
  bodyHtml: string
  coverUrl: string | null
  publishedAt: string
}

export interface Page<T> {
  items: T[]
  total: number
  pageNumber: number
  pageSize: number
}

export type AgeGroup = 'Under20' | 'From20To30' | 'From30To40' | 'From40To50' | 'From50To70' | 'Over70'
export type DeliveryMethod = 'Delivery' | 'Pickup'

export interface BookOrderRequest {
  bookSlug: string
  fullName: string
  phone: string
  deliveryMethod: DeliveryMethod
  address: string
  ageGroup: AgeGroup | null
  hasBibleAtHome: boolean | null
  acceptsDeliveryArea: boolean
  acceptsDataUse: boolean
  website: string
}

export interface KidsSignupRequest {
  parentName: string
  phone: string
  email: string
  childFirstName: string
  childAge: number | null
  participatedBefore: boolean | null
  message: string
  acceptsDataUse: boolean
  website: string
}

export interface ContactMessageRequest {
  firstName: string
  lastName: string
  email: string
  subject: string
  message: string
  acceptsDataUse: boolean
  website: string
}

export interface SubmissionReceipt {
  reference: number
}

const post = <T>(path: string, body: unknown) =>
  request<T>(path, { method: 'POST', body: JSON.stringify(body) })

export const api = {
  site: () => request<SiteInfo>('/site'),

  book: (slug: string) => request<BookPageData>(`/books/${encodeURIComponent(slug)}`),

  announcements: (page = 1, pageSize = 9, home = false) => {
    const query = new URLSearchParams({ page: String(page), pageSize: String(pageSize) })
    if (home) query.set('home', 'true')
    return request<Page<AnnouncementSummary>>(`/announcements?${query}`)
  },

  announcement: (slug: string) => request<AnnouncementDetail>(`/announcements/${encodeURIComponent(slug)}`),

  orderBook: (body: BookOrderRequest) => post<SubmissionReceipt>('/forms/book-orders', body),
  signUpChild: (body: KidsSignupRequest) => post<SubmissionReceipt>('/forms/kids-signups', body),
  sendMessage: (body: ContactMessageRequest) => post<SubmissionReceipt>('/forms/contact', body),
}
