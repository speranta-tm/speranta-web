import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, Navigate, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import logo from '../assets/img/logo.png'
import { Icon, type IconName } from '../components/Icon'
import { cx } from '../lib/cx'
import { adminApi, session, useToken, type Account, type Dashboard, type MailHealth } from './api'
import { AdminContext } from './data'
import { initials } from './labels'
import { MailAlert } from './MailAlert'

interface Item {
  to: string
  label: string
  icon: IconName
  count?: (d: Dashboard) => number
}

const groups: Item[][] = [
  [
    { to: '/admin', label: 'Panou', icon: 'users' },
    { to: '/admin/comenzi', label: 'Comenzi cărți', icon: 'book-open', count: (d) => d.newOrders },
    { to: '/admin/inscrieri', label: 'Înscrieri copii', icon: 'heart', count: (d) => d.newSignups },
    { to: '/admin/mesaje', label: 'Mesaje', icon: 'mail', count: (d) => d.newMessages },
  ],
  [
    { to: '/admin/anunturi', label: 'Anunțuri', icon: 'calendar' },
    { to: '/admin/program', label: 'Program & pliant', icon: 'clock' },
    { to: '/admin/carti', label: 'Cărți', icon: 'book-open' },
  ],
  [{ to: '/admin/administratori', label: 'Administratori', icon: 'users' }],
]

/** Figma › AdminSidebar + the page area. Signed-in admins only. */
export function AdminLayout() {
  const token = useToken()
  const location = useLocation()
  const navigate = useNavigate()
  const [me, setMe] = useState<Account | null>(null)
  const [counts, setCounts] = useState<Dashboard | null>(null)
  const [mail, setMail] = useState<MailHealth | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [tick, setTick] = useState(0)

  const refresh = useCallback(() => setTick((t) => t + 1), [])

  useEffect(() => {
    if (!token) return
    adminApi.me().then(setMe, () => {})
  }, [token])

  // Counts and email health stay current while the panel is open.
  useEffect(() => {
    if (!token) return
    let live = true
    const load = () => {
      adminApi.dashboard().then((d) => live && setCounts(d), () => {})
      adminApi.mailStatus().then((m) => live && setMail(m), () => {})
    }
    load()
    const id = window.setInterval(load, 60_000)
    return () => {
      live = false
      window.clearInterval(id)
    }
  }, [token, tick])

  const shared = useMemo(() => ({ me, counts, mail, refresh, setMail }), [me, counts, mail, refresh])

  if (!token) {
    return <Navigate to={`/admin/autentificare?inapoi=${encodeURIComponent(location.pathname + location.search)}`} replace />
  }

  function signOut() {
    session.clear()
    navigate('/admin/autentificare')
  }

  const name = me?.displayName ?? me?.email ?? ''

  const sidebar = (
    <nav aria-label="Administrare" className="flex h-full flex-col gap-1 px-4 py-6">
      <Link to="/admin" onClick={() => setMenuOpen(false)} className="mb-5 block w-[184px] rounded-xl bg-white px-3 py-2">
        <img src={logo} alt="Biserica Speranța – Administrare" className="h-[49px] w-auto" />
      </Link>
      {groups.map((group, gi) => (
        <div key={gi} className={cx('flex flex-col gap-1', gi > 0 && 'mt-1 border-t border-ink-2 pt-2')}>
          {group.map((item) => {
            const n = counts && item.count ? item.count(counts) : 0
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/admin'}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  cx('t-nav flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-white transition-colors', isActive ? 'bg-white/10' : 'hover:bg-white/5')
                }
              >
                <Icon name={item.icon} size={18} />
                <span className="flex-1">{item.label}</span>
                {n > 0 && <span className="t-caption rounded-full bg-primary px-2 py-0.5 text-white">{n}</span>}
              </NavLink>
            )
          })}
        </div>
      ))}
      <div className="mt-auto flex items-center gap-2.5 px-3 pt-6">
        <span className="t-caption flex h-7 min-w-[38px] items-center justify-center rounded-full bg-primary px-2 text-white">
          {initials(name)}
        </span>
        <div className="flex min-w-0 flex-col">
          <span className="t-label truncate text-white">{name}</span>
          <button type="button" onClick={signOut} className="t-caption self-start text-muted hover:text-white">
            Ieșire
          </button>
        </div>
      </div>
    </nav>
  )

  return (
    <AdminContext.Provider value={shared}>
      <div className="min-h-dvh bg-surface-2 lg:flex">
        <aside className="sticky top-0 hidden h-dvh w-[264px] shrink-0 overflow-y-auto bg-ink lg:block">{sidebar}</aside>

        {/* Phone: a top bar, and the sidebar slides over the page. */}
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between bg-ink px-4 lg:hidden">
          <span className="t-label text-white">Administrare site</span>
          <button type="button" onClick={() => setMenuOpen(true)} aria-label="Deschide meniul" className="p-2 text-white">
            <Icon name="menu" size={24} />
          </button>
        </header>
        {menuOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div className="absolute inset-0 bg-ink/50" onClick={() => setMenuOpen(false)} aria-hidden="true" />
            <aside className="absolute inset-y-0 left-0 w-[264px] overflow-y-auto bg-ink">{sidebar}</aside>
          </div>
        )}

        {/* As in the design, the email banner sits under each page's title: the page's
            first element is pulled to the front, the banner comes next. */}
        <main className="flex min-w-0 flex-1 flex-col gap-6 px-4 py-6 lg:px-10 lg:py-8 [&>:first-child]:order-first">
          <Outlet />
          {mail && mail.state !== 'Ok' && (
            <div className="-order-1">
              <MailAlert mail={mail} onChange={setMail} />
            </div>
          )}
        </main>
      </div>
    </AdminContext.Provider>
  )
}
