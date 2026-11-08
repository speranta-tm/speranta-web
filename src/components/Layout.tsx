import { useEffect, useLayoutEffect, useRef } from 'react'
import { Outlet, useLocation, useNavigationType } from 'react-router-dom'
import { Footer } from './Footer'
import { Header } from './Header'

/** Where each visited page was scrolled to, by history entry. */
const scrolled = new Map<string, number>()

// The site restores positions itself; the browser's own attempt runs before the page has rendered.
if ('scrollRestoration' in history) history.scrollRestoration = 'manual'

/** Public pages: header, page, footer. */
export function Layout() {
  const { pathname, hash, key } = useLocation()
  const navigation = useNavigationType()
  const current = useRef(key)

  // Remember each page's position for when the visitor comes back to it. The key is
  // read when the event fires, so the scroll a page change causes is filed under the new page.
  useEffect(() => {
    const save = () => scrolled.set(current.current, window.scrollY)
    window.addEventListener('scroll', save, { passive: true })
    return () => window.removeEventListener('scroll', save)
  }, [])

  // Back/forward returns to where the visitor was; a new page starts at the top;
  // a #anchor link scrolls to its target instead.
  useLayoutEffect(() => {
    current.current = key
    if (navigation === 'POP' && scrolled.has(key)) {
      window.scrollTo(0, scrolled.get(key)!)
    } else if (hash) {
      document.getElementById(hash.slice(1))?.scrollIntoView()
    } else {
      window.scrollTo(0, 0)
    }
  }, [pathname, hash, key, navigation])

  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#continut"
        className="sr-only z-50 rounded-full bg-primary px-4 py-2 text-white focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Sari la conținut
      </a>
      <Header />
      <main id="continut" className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
