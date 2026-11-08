import { useEffect } from 'react'

/** Sets the browser tab title for a page. */
export function useTitle(title: string) {
  useEffect(() => {
    document.title = title
      ? `${title} – Biserica Speranța Timișoara`
      : 'Biserica Adventistă de Ziua a Șaptea Speranța – Timișoara'
  }, [title])
}
