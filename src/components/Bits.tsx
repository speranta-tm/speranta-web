import { useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { church } from '../content/church'
import { coverFor } from '../content/books'
import { apiUrl, type AnnouncementSummary, type BookInfo } from '../lib/api'
import { cx } from '../lib/cx'
import { longDate } from '../lib/format'
import { ButtonLink } from './Button'
import { Icon, type IconName } from './Icon'

/** The grey title band at the top of the inner pages (Cărți gratuite, Contact, Anunțuri…). */
export function PageTitle({
  eyebrow,
  title,
  lead,
  center,
  narrow,
}: {
  eyebrow?: string
  title: string
  lead?: ReactNode
  center?: boolean
  narrow?: boolean
}) {
  return (
    <section className="bg-surface-2">
      <div
        className={cx(
          'container-page flex flex-col gap-4 pt-14 pb-12 lg:pt-20 lg:pb-16',
          center && 'items-center text-center',
          narrow && 'max-w-[864px]',
        )}
      >
        {eyebrow && <p className="t-eyebrow text-primary">{eyebrow}</p>}
        <h1 className={narrow ? 't-h1 text-ink' : 't-display text-ink'}>{title}</h1>
        {lead && <div className="t-lead max-w-[820px] text-body">{lead}</div>}
      </div>
    </section>
  )
}

/** A rounded square holding an icon, as in "Cum o poți primi?" and the contact cards. */
export function IconTile({ name, size = 'md' }: { name: IconName; size?: 'sm' | 'md' | 'lg' }) {
  const box = { sm: 'size-[34px] rounded-[10px]', md: 'size-10 rounded-xl', lg: 'size-12 rounded-[14px]' }[size]
  const icon = { sm: 18, md: 20, lg: 24 }[size]
  return (
    <span className={cx('flex shrink-0 items-center justify-center bg-surface text-primary', box)}>
      <Icon name={name} size={icon} />
    </span>
  )
}

/** A bullet with a check (or another icon) in the primary colour. */
export function Point({ icon = 'check', children }: { icon?: IconName; children: ReactNode }) {
  return (
    <li className="t-body flex gap-3 text-ink-2">
      <Icon name={icon} size={20} className="mt-[3px] text-primary" />
      <span>{children}</span>
    </li>
  )
}

/** Figma › BookCard (home page row). */
export function BookCard({ book }: { book: BookInfo }) {
  const cover = coverFor(book.slug, book.coverUrl, apiUrl)
  const available = book.isAvailable
  return (
    <div className="flex h-full flex-col items-center gap-4 rounded-[24px] bg-surface px-3 pt-4 pb-5 sm:px-4">
      <Link to={`/carti-gratuite/${book.slug}`} className="block w-full" tabIndex={-1} aria-hidden="true">
        <img
          src={cover}
          alt=""
          loading="lazy"
          className="aspect-[3/4] w-full rounded-[10px] bg-line object-cover shadow-[0_8px_20px_rgb(26_32_44/0.18)]"
        />
      </Link>
      <h3 className="t-card-title line-clamp-2 flex min-h-12 items-center text-center text-ink">{book.title}</h3>
      {available ? (
        <ButtonLink to={`/carti-gratuite/${book.slug}`} size="s" className="mt-auto">
          Comandă gratuit
        </ButtonLink>
      ) : (
        <span className="t-small mt-auto py-2 font-semibold text-muted">Stoc epuizat</span>
      )}
    </div>
  )
}

/** The date line with a calendar icon. */
export function DateLine({ iso }: { iso: string }) {
  return (
    <p className="t-small flex items-center gap-2 text-muted">
      <Icon name="calendar" size={16} />
      <time dateTime={iso}>{longDate(iso)}</time>
    </p>
  )
}

/** Home page / "Alte anunțuri" card. */
export function AnnouncementCard({ a, compact }: { a: AnnouncementSummary; compact?: boolean }) {
  return (
    <article className="flex flex-col gap-2.5 rounded-[20px] border border-line bg-white p-5 lg:gap-3 lg:rounded-[24px] lg:p-7">
      <DateLine iso={a.publishedAt} />
      <h3 className="t-h3 text-ink">
        <Link to={`/anunturi/${a.slug}`} className="hover:text-primary">
          {a.title}
        </Link>
      </h3>
      {!compact && <p className="t-body line-clamp-3 text-body">{a.excerpt}</p>}
      <ButtonLink to={`/anunturi/${a.slug}`} variant="ghost" size="s" icon="arrow-right" className="-ml-4 self-start">
        Citește
      </ButtonLink>
    </article>
  )
}

/** A cover image from the API, or nothing. */
export function Cover({ url, className }: { url: string | null; className?: string }) {
  if (!url) return null
  return <img src={apiUrl(url)} alt="" loading="lazy" className={cx('object-cover', className)} />
}

/**
 * The YouTube documentary. Shows our own poster and only loads YouTube (with its
 * cookies) when someone presses play, which also keeps the home page light.
 */
export function YouTubeEmbed({ videoId, poster, title }: { videoId: string; poster: string; title: string }) {
  const [playing, setPlaying] = useState(false)
  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-ink lg:rounded-[24px]">
      {playing ? (
        <iframe
          className="absolute inset-0 size-full"
          src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      ) : (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          className="group absolute inset-0 flex items-center justify-center"
          aria-label={`Pornește video: ${title}`}
        >
          <img src={poster} alt="" loading="lazy" className="absolute inset-0 size-full object-cover" />
          <PlayDisc />
        </button>
      )}
    </div>
  )
}

export function PlayDisc({ small }: { small?: boolean }) {
  return (
    <span
      className={cx(
        'relative flex items-center justify-center rounded-full bg-white/92 shadow-lg transition-transform group-hover:scale-105',
        small ? 'size-14' : 'size-14 lg:size-[88px]',
      )}
    >
      <svg viewBox="0 0 24 24" className="ml-1 size-6 fill-primary lg:size-[30px]" aria-hidden="true">
        <path d="M7 4.5v15a1 1 0 0 0 1.5.86l12-7.5a1 1 0 0 0 0-1.72l-12-7.5A1 1 0 0 0 7 4.5Z" />
      </svg>
    </span>
  )
}

/** The church on Google Maps, loaded only when it scrolls near the screen. */
export function MapEmbed({ className }: { className?: string }) {
  return (
    <iframe
      src={church.mapEmbed}
      title={`Harta: ${church.address}`}
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
      className={cx('block w-full border-0', className)}
    />
  )
}
