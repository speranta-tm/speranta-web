import type { AgeGroup, DeliveryMethod } from '../lib/api'
import type { MessageStatus, OrderStatus, SignupStatus, SubmissionKind } from './api'

/** Figma › StatusBadge tones. */
export type Tone = 'new' | 'progress' | 'done' | 'cancelled' | 'neutral'

/** The statuses as the church approved them, with the badge tone each one gets. */
export const orderStatus: Record<OrderStatus, { label: string; tone: Tone }> = {
  New: { label: 'Nou', tone: 'new' },
  Confirmed: { label: 'Confirmat', tone: 'progress' },
  Delivered: { label: 'Livrat', tone: 'done' },
  PickedUp: { label: 'Ridicat', tone: 'done' },
  Cancelled: { label: 'Anulat', tone: 'cancelled' },
}

export const signupStatus: Record<SignupStatus, { label: string; tone: Tone }> = {
  New: { label: 'Nou', tone: 'new' },
  Contacted: { label: 'Contactat', tone: 'progress' },
  Enrolled: { label: 'Înscris', tone: 'done' },
  Withdrawn: { label: 'Renunțat', tone: 'cancelled' },
}

export const messageStatus: Record<MessageStatus, { label: string; tone: Tone }> = {
  New: { label: 'Nou', tone: 'new' },
  Answered: { label: 'Răspuns', tone: 'done' },
}

export const kindLabel: Record<SubmissionKind, string> = {
  BookOrder: 'Comandă',
  KidsSignup: 'Înscriere',
  ContactMessage: 'Mesaj',
}

export const kindPath: Record<SubmissionKind, string> = {
  BookOrder: '/admin/comenzi',
  KidsSignup: '/admin/inscrieri',
  ContactMessage: '/admin/mesaje',
}

export const deliveryLabel: Record<DeliveryMethod, string> = {
  Delivery: 'Livrare',
  Pickup: 'Ridicare',
}

export const deliveryLong: Record<DeliveryMethod, string> = {
  Delivery: 'Livrare la domiciliu',
  Pickup: 'Ridicare de la biserică',
}

export const ageGroupLabel: Record<AgeGroup, string> = {
  Under20: 'Sub 20',
  From20To30: '20–30',
  From30To40: '30–40',
  From40To50: '40–50',
  From50To70: '50–70',
  Over70: 'Peste 70',
}

export const kidsGroupLabel = { UnderSeven: 'Până la 7 ani', SevenToFourteen: '7–14 ani' } as const

const tz = 'Europe/Bucharest'
const time = new Intl.DateTimeFormat('ro-RO', { hour: '2-digit', minute: '2-digit', timeZone: tz })
const dayMonth = new Intl.DateTimeFormat('ro-RO', { day: 'numeric', month: 'short', timeZone: tz })
const full = new Intl.DateTimeFormat('ro-RO', { day: 'numeric', month: 'long', year: 'numeric', timeZone: tz })
const dayKey = new Intl.DateTimeFormat('en-CA', { timeZone: tz })

/** "8 nov" without the trailing dot Intl adds to short months. */
const shortDay = (d: Date) => dayMonth.format(d).replace('.', '')

/** "Azi, 10:24" · "Ieri, 18:40" · "3 nov, 09:30" */
export function when(iso: string): string {
  const d = new Date(iso)
  const today = dayKey.format(new Date())
  const yesterday = dayKey.format(new Date(Date.now() - 86_400_000))
  const key = dayKey.format(d)
  const prefix = key === today ? 'Azi' : key === yesterday ? 'Ieri' : shortDay(d)
  return `${prefix}, ${time.format(d)}`
}

/** "8 nov, 10:24" in tables. */
export const shortWhen = (iso: string) => `${shortDay(new Date(iso))}, ${time.format(new Date(iso))}`

/** "8 noiembrie 2026, 10:24" */
export const longWhen = (iso: string) => `${full.format(new Date(iso))}, ${time.format(new Date(iso))}`

/** "8 nov 2026" */
export const shortDate = (iso: string) => `${shortDay(new Date(iso))} ${new Date(iso).getFullYear()}`

/** "acum 2 zile" */
export function ago(iso: string): string {
  const minutes = Math.round((Date.now() - new Date(iso).getTime()) / 60_000)
  if (minutes < 2) return 'acum un minut'
  if (minutes < 60) return `acum ${minutes} de minute`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return hours === 1 ? 'acum o oră' : `acum ${hours} ore`
  const days = Math.round(hours / 24)
  return days === 1 ? 'ieri' : `acum ${days} zile`
}

/** "1,2 MB" */
export const size = (bytes: number) =>
  bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / 1024 / 1024).toFixed(1).replace('.', ',')} MB`

/** Romanian count agreement: 1 comandă, 2 comenzi, 20 de comenzi. */
export function count(n: number, one: string, many: string): string {
  if (n === 1) return `1 ${one}`
  const de = n !== 0 && (n % 100 === 0 || n % 100 >= 20) ? 'de ' : ''
  return `${n} ${de}${many}`
}

export const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter((w) => w && w[0] === w[0].toUpperCase() && /\p{L}/u.test(w[0]))
    .slice(-2)
    .map((w) => w[0])
    .join('')
    .toUpperCase() || '?'
