import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import logo from '../assets/img/logo.png'
import { cx } from '../lib/cx'
import { useFlyerUrl } from '../lib/site'
import { buttonClass } from './buttonClass'
import { Icon } from './Icon'

const links = [
  { to: '/activitati-pentru-copii', label: 'Activități pentru copii' },
  { to: '/carti-gratuite', label: 'Cărți gratuite' },
  { to: '/anunturi', label: 'Anunțuri' },
  { to: '/contact', label: 'Contact' },
]

/** Figma › Header: Desktop, and Mobile closed / open. */
export function Header() {
  const [open, setOpen] = useState(false)
  const flyer = useFlyerUrl()

  // A tap on a menu link navigates; the menu should not still be open on arrival.
  const close = () => setOpen(false)

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white">
      <div className="container-page flex h-16 items-center justify-between pr-2 lg:h-20 lg:pr-8">
        <Link to="/" onClick={close} aria-label="Acasă – Biserica Adventistă Speranța Timișoara" className="shrink-0">
          <img src={logo} alt="" width={196} height={60} className="h-11 w-auto lg:h-[60px]" />
        </Link>

        <nav aria-label="Principal" className="hidden items-center gap-8 lg:flex">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                cx('t-nav transition-colors hover:text-primary', isActive ? 'text-primary' : 'text-ink-2')
              }
            >
              {l.label}
            </NavLink>
          ))}
          <a href={flyer} target="_blank" rel="noopener noreferrer" className={buttonClass({ size: 's' })}>
            <Icon name="download" size={16} />
            Pliantul lunar
          </a>
        </nav>

        <button
          type="button"
          className="flex size-12 items-center justify-center text-ink lg:hidden"
          aria-expanded={open}
          aria-controls="meniu-mobil"
          aria-label={open ? 'Închide meniul' : 'Deschide meniul'}
          onClick={() => setOpen((o) => !o)}
        >
          <Icon name={open ? 'close' : 'menu'} size={24} />
        </button>
      </div>

      {open && (
        <nav id="meniu-mobil" aria-label="Principal" className="border-t border-line px-4 pb-6 lg:hidden">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              onClick={close}
              className={({ isActive }) =>
                cx('t-body block border-b border-line py-4 font-semibold', isActive ? 'text-primary' : 'text-ink')
              }
            >
              {l.label}
            </NavLink>
          ))}
          <a
            href={flyer}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonClass({ block: true, className: 'mt-4' })}
          >
            <Icon name="download" size={20} />
            Descarcă pliantul lunar
          </a>
        </nav>
      )}
    </header>
  )
}
