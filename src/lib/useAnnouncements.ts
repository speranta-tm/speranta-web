import { useEffect, useState } from 'react'
import { api, type AnnouncementSummary, type Page } from './api'

export type Loadable<T> = { state: 'loading' } | { state: 'ready'; data: T } | { state: 'error' }

/**
 * Loads something keyed by `key`, and reports "loading" whenever the key has
 * moved on from the last answer, without resetting state inside the effect.
 */
export function useLoad<T, E = never>(
  key: string,
  load: () => Promise<T>,
  onError: (e: unknown) => Loadable<T> | E = () => ({ state: 'error' }),
): Loadable<T> | E {
  const [answer, setAnswer] = useState<{ key: string; value: Loadable<T> | E } | null>(null)

  useEffect(() => {
    let live = true
    load().then(
      (data) => live && setAnswer({ key, value: { state: 'ready', data } }),
      (e) => live && setAnswer({ key, value: onError(e) }),
    )
    return () => {
      live = false
    }
    // `load` and `onError` are recreated every render; `key` is what identifies the request.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  return answer && answer.key === key ? answer.value : { state: 'loading' }
}

export function useAnnouncements(page: number, pageSize: number, home = false): Loadable<Page<AnnouncementSummary>> {
  return useLoad(`${page}/${pageSize}/${home}`, () => api.announcements(page, pageSize, home))
}
