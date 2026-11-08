import { Navigate, useLocation } from 'react-router-dom'
import { useTitle } from '../lib/useTitle'
import { ButtonLink } from '../components/Button'
import { Icon } from '../components/Icon'

/** What a form hands this page: which form it was, and what to read back. */
export type ThanksState =
  | { kind: 'order'; book: string; rows: [string, string][] }
  | { kind: 'signup'; rows: [string, string][] }
  | { kind: 'message'; rows: [string, string][] }

const copy = {
  order: {
    title: 'Mulțumim! Am primit comanda ta.',
    lead: (s: ThanksState) =>
      `Un coleg te va suna în zilele următoare ca să confirme datele și să stabiliți livrarea pentru „${s.kind === 'order' ? s.book : ''}”.`,
    primary: { to: '/carti-gratuite', label: 'Vezi și alte cărți' },
  },
  signup: {
    title: 'Mulțumim! Am primit înscrierea.',
    lead: () => 'Te contactăm în curând cu toate detaliile. Te așteptăm sâmbătă!',
    primary: { to: '/activitati-pentru-copii', label: 'Înapoi la activități' },
  },
  message: {
    title: 'Mulțumim! Am primit mesajul tău.',
    lead: () => 'Îți vom răspunde cât de curând, la adresa de email pe care ne-ai lăsat-o.',
    primary: { to: '/', label: 'Înapoi acasă' },
  },
} as const

/**
 * Figma › "Mulțumim · Desktop". Reached only from a form; opened directly (a
 * reload, a bookmark) there is nothing to thank for, so it goes home.
 */
export function ThanksPage() {
  const state = useLocation().state as ThanksState | null
  useTitle('Mulțumim')
  if (!state) return <Navigate to="/" replace />

  const c = copy[state.kind]

  return (
    <section className="bg-surface-2">
      <div className="container-page flex flex-col items-center gap-6 py-20 text-center lg:py-[120px]">
        <span className="flex size-20 items-center justify-center rounded-full bg-success/12 text-success">
          <Icon name="check" size={40} />
        </span>
        <h1 className="t-h1 text-ink">{c.title}</h1>
        <p className="t-lead max-w-[720px] text-body">{c.lead(state)}</p>

        <dl className="flex w-full max-w-[560px] flex-col gap-3 rounded-[20px] border border-line bg-white px-7 py-6 text-left">
          <p className="t-eyebrow text-muted">Ce ai trimis</p>
          {state.rows.map(([label, value]) => (
            <div key={label} className="flex gap-4">
              <dt className="t-small w-20 shrink-0 pt-[3px] text-muted">{label}</dt>
              <dd className="t-body font-semibold break-words text-ink">{value}</dd>
            </div>
          ))}
        </dl>

        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <ButtonLink to={c.primary.to}>{c.primary.label}</ButtonLink>
          {state.kind !== 'message' && (
            <ButtonLink to="/" variant="secondary">
              Înapoi acasă
            </ButtonLink>
          )}
        </div>
      </div>
    </section>
  )
}
