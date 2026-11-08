import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { PageTitle } from '../components/Bits'
import { useTitle } from '../lib/useTitle'
import { church } from '../content/church'

/**
 * Figma › "Confidențialitate · Desktop".
 * DRAFT: the church has to review this text and fill in how long data is kept
 * before the site goes live.
 */
const sections: [string, ReactNode][] = [
  ['Cine suntem', `${church.name} Speranța Timișoara, ${church.address}.`],
  [
    'Ce date colectăm',
    'Doar ce ne trimiți prin formulare: numele, numărul de telefon, adresa de livrare (pentru cărți), adresa de email (opțional), grupa de vârstă și răspunsurile din formular.',
  ],
  [
    'De ce le folosim',
    'Ca să-ți livrăm cartea comandată, să te înscriem la activitățile pentru copii sau să-ți răspundem la mesaj. Doar dacă ești de acord, te putem anunța și despre campanii gratuite viitoare.',
  ],
  [
    'Cine are acces',
    'Doar voluntarii bisericii care se ocupă de comenzi, înscrieri și mesaje. Nu vindem și nu dăm datele tale nimănui.',
  ],
  ['Cât timp le păstrăm', 'Cât e nevoie pentru livrare sau înscriere, apoi le ștergem. [Perioada exactă: de stabilit.]'],
  [
    'Drepturile tale',
    <>
      Poți cere oricând să vezi, să corectezi sau să ștergi datele tale, scriindu-ne la adresa de pe{' '}
      <Link to="/contact" className="text-primary underline underline-offset-2">
        pagina de contact
      </Link>
      .
    </>,
  ],
]

export function PrivacyPage() {
  useTitle('Politica de confidențialitate')
  return (
    <>
      <PageTitle
        narrow
        title="Politica de confidențialitate"
        lead={<span className="t-small text-muted">Ultima actualizare: 8 noiembrie 2026 · DRAFT – de revizuit de biserică</span>}
      />
      <section className="container-page flex max-w-[864px] flex-col gap-5 pt-10 pb-16 lg:pt-16 lg:pb-24">
        {sections.map(([title, body]) => (
          <div key={title} className="flex flex-col gap-2">
            <h2 className="t-h3 text-ink">{title}</h2>
            <p className="t-body text-body">{body}</p>
          </div>
        ))}
      </section>
    </>
  )
}
