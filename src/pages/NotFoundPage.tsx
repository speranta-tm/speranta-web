import { useTitle } from '../lib/useTitle'
import { ButtonLink } from '../components/Button'

/** Figma › "404 · Desktop". */
export function NotFoundPage() {
  useTitle('Pagina nu există')
  return (
    <section className="bg-surface-2">
      <div className="container-page flex flex-col items-center gap-5 py-24 text-center lg:py-[140px]">
        <p className="text-[96px] leading-none font-bold text-primary lg:text-[120px]">404</p>
        <h1 className="t-h1 text-ink">Pagina nu există</h1>
        <p className="t-lead max-w-[640px] text-body">
          Poate linkul este greșit sau pagina a fost mutată. Te putem ajuta cu una dintre paginile de mai jos.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <ButtonLink to="/">Acasă</ButtonLink>
          <ButtonLink to="/carti-gratuite" variant="secondary">
            Cărți gratuite
          </ButtonLink>
          <ButtonLink to="/activitati-pentru-copii" variant="secondary">
            Activități pentru copii
          </ButtonLink>
          <ButtonLink to="/contact" variant="secondary">
            Contact
          </ButtonLink>
        </div>
      </div>
    </section>
  )
}
