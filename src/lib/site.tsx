import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { api, apiUrl, type SiteInfo } from './api'
import { books as launchBooks } from '../content/books'
import { church } from '../content/church'

/**
 * What the site shows before the API answers, or if it never does: the values
 * the church had on 2026-11-08 (the same ones a fresh API database is seeded
 * with). The schedule in the footer should never be blank because a request
 * was slow.
 */
const FALLBACK: SiteInfo = {
  services: [
    { day: 'Friday', start: '20:00:00', end: '21:00:00' },
    { day: 'Saturday', start: '09:00:00', end: '12:00:00' },
    { day: 'Saturday', start: '18:00:00', end: '19:00:00' },
  ],
  kidsGroups: [
    { label: 'Copii mici (până la 7 ani)', start: '10:00:00', end: '10:50:00' },
    { label: 'Copii între 7 și 14 ani', start: '09:45:00', end: '10:50:00' },
  ],
  kidsPhone: '0764 915 396',
  flyer: null,
  books: (
    [
      ['biblia', true, true, false, false],
      ['viata-lui-isus', true, false, false, false],
      ['tragedia-veacurilor', true, false, false, false],
      ['calea-catre-hristos', true, false, false, false],
      ['biblia-pentru-elevi', false, false, true, true],
      ['mesajul-lui-dumnezeu-pentru-tine', false, false, true, true],
    ] as const
  ).map(([slug, asksAgeGroup, asksBibleAtHome, allowsPickup, isForChildren]) => {
    const b = launchBooks.find((x) => x.slug === slug)!
    return { slug, title: b.title, blurb: b.blurb, coverUrl: null, isAvailable: true, asksAgeGroup, asksBibleAtHome, allowsPickup, isForChildren }
  }),
}

const SiteContext = createContext<SiteInfo>(FALLBACK)

export function SiteProvider({ children }: { children: ReactNode }) {
  const [site, setSite] = useState<SiteInfo>(FALLBACK)

  useEffect(() => {
    let live = true
    api.site().then(
      (s) => live && setSite(s),
      () => {
        /* keep the fallback; every page still works */
      },
    )
    return () => {
      live = false
    }
  }, [])

  return <SiteContext.Provider value={site}>{children}</SiteContext.Provider>
}

// eslint-disable-next-line react/only-export-components
export function useSite(): SiteInfo {
  return useContext(SiteContext)
}

/**
 * Where "Descarcă pliantul lunar" goes: the flyer uploaded in the admin, or,
 * until the first upload, the Google Drive link the old site used.
 */
// eslint-disable-next-line react/only-export-components
export function useFlyerUrl(): string {
  const { flyer } = useSite()
  return flyer ? apiUrl(flyer.url) : church.legacyFlyerUrl
}
