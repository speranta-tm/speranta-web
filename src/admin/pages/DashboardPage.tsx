import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button, ButtonLink } from '../../components/Button'
import { Icon, type IconName } from '../../components/Icon'
import { useTitle } from '../../lib/useTitle'
import { adminApi } from '../api'
import { useAdmin } from '../data'
import { count, kindLabel, kindPath, when } from '../labels'
import { pushState, turnOff, turnOn, type PushState } from '../push'
import { Badge, Card, Loading } from '../ui'

/** Figma › "Admin · Panou". */
export function DashboardPage() {
  useTitle('Panou')
  const { counts, me } = useAdmin()
  const firstName = (counts?.displayName ?? me?.displayName ?? '').split(' ')[0]

  return (
    <>
      <div className="flex flex-col gap-1">
        <h1 className="text-[28px] leading-9 font-bold text-ink lg:text-[32px] lg:leading-10">
          {firstName ? `Bună, ${firstName}` : 'Bună!'}
        </h1>
        <p className="t-small text-muted">Ce s-a întâmplat de la ultima vizită</p>
      </div>

      {!counts ? (
        <Loading />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-3 lg:gap-5">
            <Stat to="/admin/comenzi" icon="book-open" label="Comenzi noi" value={counts.newOrders} sub={`${counts.ordersThisMonth} în total luna aceasta`} />
            <Stat to="/admin/inscrieri" icon="heart" label="Înscrieri noi" value={counts.newSignups} sub={`${count(counts.enrolledKids, 'copil înscris', 'copii înscriși')}`} />
            <Stat to="/admin/mesaje" icon="mail" label="Mesaje necitite" value={counts.newMessages} sub={`${counts.messagesThisMonth} luna aceasta`} />
          </div>

          <div className="grid items-start gap-5 lg:grid-cols-[1fr_360px]">
            <Card className="flex flex-col gap-3 p-6">
              <h2 className="t-h3 text-ink">De făcut</h2>
              {counts.todo.length === 0 ? (
                <p className="t-body text-body">Nimic nou. Toate comenzile, înscrierile și mesajele au fost preluate.</p>
              ) : (
                <ul className="flex flex-col">
                  {counts.todo.map((t) => (
                    <li key={`${t.kind}${t.id}`} className="border-t border-line first:border-t-0">
                      <Link to={`${kindPath[t.kind]}/${t.id}`} className="group flex items-center gap-3 py-2.5">
                        <Badge tone="new">{kindLabel[t.kind]}</Badge>
                        <span className="flex min-w-0 flex-1 flex-col">
                          <span className="t-body truncate font-semibold text-ink group-hover:text-primary">{t.title}</span>
                          <span className="t-small text-muted">
                            {when(t.at)}
                            {t.kind === 'BookOrder' ? ` · ${t.detail}` : ''}
                          </span>
                        </span>
                        <Icon name="arrow-right" size={18} className="text-muted group-hover:text-primary" />
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            <Card className="flex flex-col gap-3 p-6">
              <h2 className="t-h3 text-ink">Scurtături</h2>
              <ButtonLink to="/admin/anunturi/nou" variant="secondary" icon="calendar" block>
                Publică un anunț
              </ButtonLink>
              <ButtonLink to="/admin/program#pliant" variant="secondary" icon="download" block>
                Încarcă pliantul lunii
              </ButtonLink>
              <ButtonLink to="/admin/program" variant="secondary" icon="check" block>
                Modifică programul
              </ButtonLink>
              <ButtonLink to="/" variant="secondary" icon="external-link" block newTab>
                Vezi site-ul
              </ButtonLink>
              <div className="mt-1 border-t border-line pt-4">
                <PhoneAlerts />
              </div>
            </Card>
          </div>
        </>
      )}
    </>
  )
}

function Stat({ to, icon, label, value, sub }: { to: string; icon: IconName; label: string; value: number; sub: string }) {
  return (
    <Link to={to} className="flex flex-col gap-2 rounded-2xl border border-line bg-white p-6 transition-colors hover:border-primary">
      <span className="t-label flex items-center gap-2.5 text-body">
        <Icon name={icon} size={20} className="text-primary" />
        {label}
      </span>
      <span className="text-[40px] leading-[48px] font-bold text-ink">{value}</span>
      <span className="t-small text-muted">{sub}</span>
    </Link>
  )
}

/** Figma › dashboard "Alerte pe acest telefon". Web Push, independent of Gmail. */
function PhoneAlerts() {
  const [state, setState] = useState<PushState | null>(null)
  const [busy, setBusy] = useState(false)
  const [note, setNote] = useState<string | null>(null)

  useEffect(() => {
    pushState().then(setState, () => setState('unsupported'))
  }, [])

  async function toggle() {
    setBusy(true)
    setNote(null)
    try {
      const next = state === 'on' ? await turnOff() : await turnOn()
      setState(next)
      if (next === 'on') {
        await adminApi.pushTest()
        setNote('Gata. Ți-am trimis o alertă de probă.')
      }
      if (next === 'denied') setNote('Notificările sunt blocate pentru site în setările browserului.')
    } catch {
      setNote('Nu am putut porni alertele pe acest dispozitiv.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <p className="t-body font-semibold text-ink">Alerte pe acest telefon</p>
      <p className="t-small text-body">
        Primești o notificare la fiecare comandă, înscriere sau mesaj nou și dacă emailurile se opresc.
      </p>
      {state === 'ios-install' && (
        <p className="t-small rounded-md bg-surface p-3 text-ink-2">
          Pe iPhone: apasă Partajează › „Adaugă pe ecranul principal”, deschide panoul de acolo și pornește alertele.
        </p>
      )}
      {state === 'unsupported' && <p className="t-small text-muted">Browserul acesta nu poate primi alerte.</p>}
      {state === 'denied' && (
        <p className="t-small text-muted">Notificările sunt blocate pentru site. Le poți permite din setările browserului.</p>
      )}
      {(state === 'on' || state === 'off') && (
        <Button size="s" variant={state === 'on' ? 'secondary' : 'primary'} onClick={toggle} disabled={busy} className="mt-1.5 self-start">
          {busy ? 'Un moment…' : state === 'on' ? 'Oprește alertele' : 'Pornește alertele'}
        </Button>
      )}
      {note && <p className="t-small font-semibold text-ink-2">{note}</p>}
    </div>
  )
}
