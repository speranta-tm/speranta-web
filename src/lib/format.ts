import type { DayOfWeek, ServiceTime } from './api'

export const dayName: Record<DayOfWeek, string> = {
  Sunday: 'Duminică',
  Monday: 'Luni',
  Tuesday: 'Marți',
  Wednesday: 'Miercuri',
  Thursday: 'Joi',
  Friday: 'Vineri',
  Saturday: 'Sâmbătă',
}

/** "09:45:00" → "09:45" */
export const hhmm = (time: string) => time.slice(0, 5)

/** "20:00 – 21:00", with the en dash and spaces the design uses. */
export const span = (start: string, end: string) => `${hhmm(start)} – ${hhmm(end)}`

/**
 * Groups services by day for one-line summaries:
 * "Sâmbătă 09:00 – 12:00 și 18:00 – 19:00".
 */
export function servicesByDay(services: ServiceTime[]): { day: string; times: string }[] {
  const days: { day: DayOfWeek; spans: string[] }[] = []
  for (const s of services) {
    const last = days.at(-1)
    if (last && last.day === s.day) last.spans.push(span(s.start, s.end))
    else days.push({ day: s.day, spans: [span(s.start, s.end)] })
  }
  return days.map((d) => ({ day: dayName[d.day], times: d.spans.join(' și ') }))
}

const dateFormat = new Intl.DateTimeFormat('ro-RO', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'Europe/Bucharest',
})

/** "8 noiembrie 2026" */
export const longDate = (iso: string) => dateFormat.format(new Date(iso))

/** "0764 915 396" → "tel:+40764915396" */
export function telHref(phone: string): string {
  const digits = phone.replace(/[^\d+]/g, '')
  return `tel:${digits.startsWith('0') ? `+4${digits}` : digits}`
}
