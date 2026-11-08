import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Footer } from './Footer'
import { Header } from './Header'

/** Public pages: header, page, footer. */
export function Layout() {
  const { pathname, hash } = useLocation()

  // A new page starts at the top; a #anchor link scrolls to its target instead.
  useEffect(() => {
    if (hash) {
      document.getElementById(hash.slice(1))?.scrollIntoView()
    } else {
      window.scrollTo(0, 0)
    }
  }, [pathname, hash])

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
