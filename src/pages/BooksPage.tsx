import { Link } from 'react-router-dom'
import { IconTile, PageTitle } from '../components/Bits'
import { useTitle } from '../lib/useTitle'
import { ButtonLink } from '../components/Button'
import type { IconName } from '../components/Icon'
import { books } from '../content/books'
import { useSite } from '../lib/site'

const steps: { icon: IconName; step: string; title: string; text: string }[] = [
  { icon: 'book-open', step: 'Pasul 1', title: 'Alegi cartea', text: 'Completezi formularul de pe pagina cărții.' },
  { icon: 'phone', step: 'Pasul 2', title: 'Te sunăm', text: 'Un coleg confirmă înscrierea și adresa.' },
  { icon: 'truck', step: 'Pasul 3', title: 'Ți-o aducem', text: 'Un curier voluntar stabilește cu tine ziua și ora.' },
  { icon: 'gift', step: 'Pasul 4', title: 'Gratuit', text: 'Nu plătești nimic, nici livrarea.' },
]

/**
 * Figma › "Cărți gratuite · Desktop". New: the old site's footer linked to
 * /carti-gratuite/, which was a 404.
 */
export function BooksPage() {
  useTitle('Cărți gratuite')
  const site = useSite()

  return (
    <>
      <PageTitle
        eyebrow="Cadou de la noi"
        title="Cărți gratuite"
        center
        lead="Alege o carte și ți-o aducem acasă, gratuit. Livrăm în Timișoara și în localitățile din jur."
      />

      <section className="container-page pt-10 pb-16 lg:pt-16 lg:pb-24">
        <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {site.books.map((info) => {
            const book = books.find((b) => b.slug === info.slug)
            if (!book) return null
            return (
              <li key={book.slug} className="flex gap-5 rounded-[24px] border border-line bg-white p-5 lg:gap-6 lg:p-6">
                <Link to={`/carti-gratuite/${book.slug}`} tabIndex={-1} aria-hidden="true" className="shrink-0">
                  <img
                    src={book.cover}
                    alt=""
                    loading="lazy"
                    className="h-[148px] w-[111px] rounded-[10px] bg-surface object-cover shadow-[0_8px_20px_rgb(26_32_44/0.15)] lg:h-[176px] lg:w-[132px]"
                  />
                </Link>
                <div className="flex flex-col items-start gap-2.5">
                  {info.isForChildren && (
                    <span className="t-small rounded-full bg-surface px-2.5 py-1 text-primary">Pentru copii</span>
                  )}
                  <h2 className="t-card-title text-ink">
                    <Link to={`/carti-gratuite/${book.slug}`} className="hover:text-primary">
                      {book.title}
                    </Link>
                  </h2>
                  <p className="t-small text-body">{book.blurb}</p>
                  {info.isAvailable ? (
                    <ButtonLink to={`/carti-gratuite/${book.slug}`} size="s" className="mt-auto">
                      Comandă gratuit
                    </ButtonLink>
                  ) : (
                    <span className="t-small mt-auto font-semibold text-muted">Stoc epuizat</span>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      </section>

      <section className="bg-surface-2">
        <div className="container-page flex flex-col gap-8 py-14 lg:py-24">
          <h2 className="t-h1 text-ink">Cum funcționează?</h2>
          <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            {steps.map((s) => (
              <li key={s.step} className="flex flex-col gap-2.5 rounded-[24px] border border-line bg-white p-7">
                <div className="flex items-center gap-3">
                  <IconTile name={s.icon} />
                  <span className="t-eyebrow text-muted">{s.step}</span>
                </div>
                <h3 className="t-h3 text-ink">{s.title}</h3>
                <p className="t-body text-body">{s.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </>
  )
}
