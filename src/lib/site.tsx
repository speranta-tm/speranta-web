import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { api, apiUrl, type SiteInfo } from './api'
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
  books: [
    { slug: 'biblia', title: 'Biblia', isAvailable: true, asksAgeGroup: true, asksBibleAtHome: true, allowsPickup: false, isForChildren: false },
    { slug: 'viata-lui-isus', title: 'Viața lui Isus', isAvailable: true, asksAgeGroup: true, asksBibleAtHome: false, allowsPickup: false, isForChildren: false },
    { slug: 'tragedia-veacurilor', title: 'Tragedia veacurilor', isAvailable: true, asksAgeGroup: true, asksBibleAtHome: false, allowsPickup: false, isForChildren: false },
    { slug: 'calea-catre-hristos', title: 'Calea către Hristos', isAvailable: true, asksAgeGroup: true, asksBibleAtHome: false, allowsPickup: false, isForChildren: false },
    { slug: 'biblia-pentru-elevi', title: 'Biblia pentru elevi', isAvailable: true, asksAgeGroup: false, asksBibleAtHome: false, allowsPickup: true, isForChildren: true },
    { slug: 'mesajul-lui-dumnezeu-pentru-tine', title: 'Mesajul lui Dumnezeu pentru tine', isAvailable: true, asksAgeGroup: false, asksBibleAtHome: false, allowsPickup: true, isForChildren: true },
  ],
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
