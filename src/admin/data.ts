import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import type { Account, Dashboard, MailHealth } from './api'

export type Remote<T> = { state: 'loading' } | { state: 'ready'; data: T } | { state: 'error'; error: unknown }

/**
 * Loads admin data for `key`, with reload() for after a change and set() for when a
 * save already returned the fresh object. The previous result stays on screen while a
 * new key loads, so a filter click does not flash an empty table.
 */
export function useRemote<T>(key: string, load: () => Promise<T>) {
  const [version, setVersion] = useState(0)
  const [result, setResult] = useState<{ key: string; value: Remote<T> } | null>(null)

  useEffect(() => {
    let live = true
    load().then(
      (data) => live && setResult({ key, value: { state: 'ready', data } }),
      (error) => live && setResult({ key, value: { state: 'error', error } }),
    )
    return () => {
      live = false
    }
    // `load` is a fresh closure every render; `key` + `version` identify the request.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, version])

  const reload = useCallback(() => setVersion((v) => v + 1), [])
  const set = useCallback((data: T) => setResult({ key, value: { state: 'ready', data } }), [key])

  const value: Remote<T> = result ? result.value : { state: 'loading' }
  return { ...value, stale: result !== null && result.key !== key, reload, set }
}

/** What every admin page shares: who is signed in, the sidebar counts, and email health. */
export interface AdminShared {
  me: Account | null
  counts: Dashboard | null
  mail: MailHealth | null
  refresh: () => void
  setMail: (m: MailHealth) => void
}

export const AdminContext = createContext<AdminShared>({
  me: null,
  counts: null,
  mail: null,
  refresh: () => {},
  setMail: () => {},
})

export const useAdmin = () => useContext(AdminContext)
