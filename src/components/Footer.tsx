import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { church } from '../content/church'
import { span, dayName, telHref } from '../lib/format'
import { useSite } from '../lib/site'
import { Icon, type IconName } from './Icon'

const YEAR = new Date().getFullYear()

function Column({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      <p className="t-eyebrow text-muted">{title}</p>
      {children}
    </div>
  )
}

function Row({ icon, children, href }: { icon: IconName; children: ReactNode; href?: string }) {
  const content = (
    <>
      <Icon name={icon} size={18} className="text-line" />
      <span>{children}</span>
    </>
  )
  const cls = 't-body flex items-center gap-2.5 text-white'
  if (!href) return <p className={cls}>{content}</p>
  const external = href.startsWith('http')
  return (
    <a
      href={href}
      className={`${cls} hover:underline`}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
    >
      {content}
    </a>
  )
}

/** Figma › Footer: Desktop and Mobile. Schedule and kids' phone come from the admin. */
export function Footer() {
  const { services, kidsPhone } = useSite()

  return (
    <footer className="bg-ink">
      <div className="container-page flex flex-col gap-10 pt-12 pb-8 lg:gap-12 lg:pt-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-16">
          <div className="flex flex-col gap-3">
            <p className="text-xl leading-7 font-semibold text-white">{church.name}</p>
            <p className="t-body text-line">{church.place}</p>
          </div>

          <Column title="Program">
            {services.map((s) => (
              <Row key={`${s.day}${s.start}`} icon="clock">
                {dayName[s.day]} {span(s.start, s.end)}
              </Row>
            ))}
          </Column>

          <Column title="Contact">
            <Row icon="map-pin" href={church.directions}>
              {church.addressShort}
            </Row>
            <Row icon="phone" href={telHref(kidsPhone)}>
              {kidsPhone}
            </Row>
            <Row icon="mail" href={`mailto:${church.email}`}>
              {church.email}
            </Row>
          </Column>

          <Column title="Urmărește-ne">
            <Row icon="youtube" href={church.youtube}>
              YouTube · Transmisiuni live
            </Row>
            <Row icon="facebook" href={church.facebook}>
              Facebook
            </Row>
          </Column>
        </div>

        <div className="t-small flex flex-col gap-2 border-t border-ink-2 pt-6 text-muted sm:flex-row sm:justify-between">
          <p>
            © {YEAR} {church.name} Speranța – Timișoara
          </p>
          <Link to="/confidentialitate" className="hover:text-white">
            Politica de confidențialitate
          </Link>
        </div>
      </div>
    </footer>
  )
}
