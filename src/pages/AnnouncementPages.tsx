import { Link, useParams, useSearchParams } from 'react-router-dom'
import { AnnouncementCard, Cover, DateLine, PageTitle } from '../components/Bits'
import { useTitle } from '../lib/useTitle'
import { ButtonLink } from '../components/Button'
import { api, ApiError, type AnnouncementDetail } from '../lib/api'
import { cx } from '../lib/cx'
import { useAnnouncements, useLoad } from '../lib/useAnnouncements'
import { NotFoundPage } from './NotFoundPage'

const PAGE_SIZE = 8

/** Figma › "Anunțuri · Desktop": newest first, paginated. */
export function AnnouncementsPage() {
  useTitle('Anunțuri')
  const [params, setParams] = useSearchParams()
  const page = Math.max(1, Number(params.get('pagina')) || 1)
  const result = useAnnouncements(page, PAGE_SIZE)

  return (
    <>
      <PageTitle
        eyebrow="Noutăți"
        title="Anunțuri"
        lead="Ce se întâmplă la Biserica Speranța: evenimente, programe speciale și noutăți."
      />
      <section className="container-page flex max-w-[1008px] flex-col gap-4 py-10 lg:gap-6 lg:py-24">
        {result.state === 'loading' && <Skeleton />}
        {result.state === 'error' && (
          <p className="t-body text-body">Nu am putut încărca anunțurile. Încercați din nou puțin mai târziu.</p>
        )}
        {result.state === 'ready' && result.data.items.length === 0 && (
          <p className="t-lead text-body">Momentan nu sunt anunțuri. Reveniți curând!</p>
        )}
        {result.state === 'ready' &&
          result.data.items.map((a) => (
            <article
              key={a.slug}
              className="flex flex-col gap-4 rounded-[24px] border border-line bg-white p-5 sm:flex-row sm:items-center sm:gap-8 sm:p-6"
            >
              {a.coverUrl && (
                <Link to={`/anunturi/${a.slug}`} tabIndex={-1} aria-hidden="true" className="shrink-0">
                  <Cover url={a.coverUrl} className="h-[180px] w-full rounded-2xl sm:h-[160px] sm:w-[240px]" />
                </Link>
              )}
              <div className="flex flex-col gap-2.5">
                <DateLine iso={a.publishedAt} />
                <h2 className="t-h3 text-ink">
                  <Link to={`/anunturi/${a.slug}`} className="hover:text-primary">
                    {a.title}
                  </Link>
                </h2>
                <p className="t-body line-clamp-3 text-body">{a.excerpt}</p>
                <ButtonLink to={`/anunturi/${a.slug}`} variant="ghost" size="s" icon="arrow-right" className="-ml-4 self-start">
                  Citește anunțul
                </ButtonLink>
              </div>
            </article>
          ))}
        {result.state === 'ready' && result.data.total > PAGE_SIZE && (
          <Pagination
            page={page}
            pages={Math.ceil(result.data.total / PAGE_SIZE)}
            go={(p) => setParams(p === 1 ? {} : { pagina: String(p) })}
          />
        )}
      </section>
    </>
  )
}

function Pagination({ page, pages, go }: { page: number; pages: number; go: (page: number) => void }) {
  return (
    <nav aria-label="Pagini" className="flex flex-wrap items-center gap-2 pt-2">
      {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => go(p)}
          aria-current={p === page ? 'page' : undefined}
          className={cx(
            't-body min-w-9 rounded-[10px] px-3.5 py-2 font-semibold',
            p === page ? 'bg-primary text-white' : 'bg-surface text-ink-2 hover:bg-line',
          )}
        >
          {p}
        </button>
      ))}
      {page < pages && (
        <button
          type="button"
          onClick={() => go(page + 1)}
          className="t-small ml-2 rounded-full px-4 py-2 font-semibold text-primary hover:bg-surface"
        >
          Următoarea →
        </button>
      )}
    </nav>
  )
}

function Skeleton() {
  return (
    <>
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-[198px] animate-pulse rounded-[24px] bg-surface-2" />
      ))}
    </>
  )
}

/** Figma › "Anunț · Desktop". */
export function AnnouncementPage() {
  const { slug = '' } = useParams()
  const result = useLoad<AnnouncementDetail, { state: 'missing' }>(
    slug,
    () => api.announcement(slug),
    (e) => (e instanceof ApiError && e.status === 404 ? { state: 'missing' } : { state: 'error' }),
  )
  const others = useAnnouncements(1, 3)
  useTitle(result.state === 'ready' ? result.data.title : 'Anunțuri')

  if (result.state === 'missing') return <NotFoundPage />

  const rest = others.state === 'ready' ? others.data.items.filter((a) => a.slug !== slug).slice(0, 2) : []

  return (
    <>
      <article className="container-page flex max-w-[864px] flex-col gap-6 pt-8 pb-14 lg:pt-16 lg:pb-24">
        <ButtonLink to="/anunturi" variant="ghost" size="s" icon="arrow-left" className="-ml-4 self-start">
          Toate anunțurile
        </ButtonLink>
        {result.state === 'loading' && <div className="h-80 animate-pulse rounded-[24px] bg-surface-2" />}
        {result.state === 'error' && (
          <p className="t-body text-body">Nu am putut încărca anunțul. Încercați din nou puțin mai târziu.</p>
        )}
        {result.state === 'ready' && (
          <>
            <DateLine iso={result.data.publishedAt} />
            <h1 className="t-h1 text-ink">{result.data.title}</h1>
            <Cover url={result.data.coverUrl} className="max-h-[420px] w-full rounded-[24px]" />
            {/* Sanitised by the API: only paragraphs, small headings, lists, links, bold, italic. */}
            <div className="prose-anunt" dangerouslySetInnerHTML={{ __html: result.data.bodyHtml }} />
          </>
        )}
      </article>

      {rest.length > 0 && (
        <section className="bg-surface-2">
          <div className="container-page flex max-w-[864px] flex-col gap-6 py-14 lg:py-16">
            <h2 className="t-h2 text-ink">Alte anunțuri</h2>
            <div className="grid gap-4 sm:grid-cols-2 sm:gap-6">
              {rest.map((a) => (
                <AnnouncementCard key={a.slug} a={a} compact />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  )
}
