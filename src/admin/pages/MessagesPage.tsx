import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Button } from '../../components/Button'
import { useTitle } from '../../lib/useTitle'
import { cx } from '../../lib/cx'
import { adminApi, type MessageDetail } from '../api'
import { useAdmin, useRemote } from '../data'
import { messageStatus, when } from '../labels'
import { Badge, Card, EmailPendingMark, ErrorNote, Loading, PageHead } from '../ui'
import { History } from './OrdersPage'

/** Figma › "Admin · Mesaje": list on the left, the open message on the right. */
export function MessagesPage() {
  useTitle('Mesaje')
  const { id } = useParams()
  const navigate = useNavigate()
  const list = useRemote('messages', () => adminApi.messages({}))
  const selected = id ? Number(id) : list.state === 'ready' ? list.data.items[0]?.id : undefined
  const unread = list.state === 'ready' ? list.data.counts.New : 0

  return (
    <>
      <PageHead title="Mesaje" sub={unread === 1 ? '1 necitit' : `${unread} necitite`} />
      {list.state === 'loading' && <Loading />}
      {list.state === 'error' && <ErrorNote>Nu am putut încărca mesajele.</ErrorNote>}
      {list.state === 'ready' && list.data.items.length === 0 && (
        <Card className="p-8">
          <p className="t-body text-body">Niciun mesaj încă.</p>
        </Card>
      )}
      {list.state === 'ready' && list.data.items.length > 0 && (
        <div className="grid items-start gap-5 lg:grid-cols-[380px_1fr]">
          <Card className={cx('overflow-hidden', id && 'max-lg:hidden')}>
            <ul>
              {list.data.items.map((m) => (
                <li key={m.id} className="border-t border-line first:border-t-0">
                  <Link
                    to={`/admin/mesaje/${m.id}`}
                    className={cx(
                      'flex flex-col gap-1 px-5 py-4 hover:bg-surface-2',
                      m.id === selected && 'bg-primary/6',
                    )}
                  >
                    <span className="flex items-center gap-2">
                      <span className="t-body flex-1 truncate font-semibold text-ink">{m.name}</span>
                      {m.emailPending && <EmailPendingMark />}
                      <Badge tone={messageStatus[m.status].tone}>{messageStatus[m.status].label}</Badge>
                    </span>
                    <span className="t-small truncate text-ink-2">{m.subject ?? m.preview}</span>
                    <span className="t-caption text-muted">{when(m.createdAt)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
          {selected !== undefined && (
            <MessageView
              key={selected}
              id={selected}
              onBack={() => navigate('/admin/mesaje')}
              onChanged={() => list.reload()}
              showBack={!!id}
            />
          )}
        </div>
      )}
    </>
  )
}

function MessageView({ id, onBack, onChanged, showBack }: { id: number; onBack: () => void; onChanged: () => void; showBack: boolean }) {
  const { refresh } = useAdmin()
  const detail = useRemote(`message/${id}`, () => adminApi.message(id))
  const [busy, setBusy] = useState(false)

  if (detail.state === 'loading') return <Loading />
  if (detail.state === 'error') return <ErrorNote>Mesajul nu a putut fi încărcat.</ErrorNote>
  const m: MessageDetail = detail.data
  const name = [m.firstName, m.lastName].filter(Boolean).join(' ') || m.email

  async function toggle() {
    setBusy(true)
    try {
      detail.set(await adminApi.updateMessage(m.id, m.status === 'New' ? 'Answered' : 'New'))
      onChanged()
      refresh()
    } finally {
      setBusy(false)
    }
  }

  const reply = `mailto:${m.email}?subject=${encodeURIComponent(`Re: ${m.subject ?? 'mesajul dvs.'}`)}`

  return (
    <Card className="flex flex-col gap-4 p-6 lg:p-7">
      {showBack && (
        <button type="button" onClick={onBack} className="t-label self-start text-primary lg:hidden">
          ← Toate mesajele
        </button>
      )}
      <h2 className="t-h2 text-ink">{m.subject ?? '(fără subiect)'}</h2>
      <p className="flex flex-wrap items-baseline gap-2">
        <span className="t-body font-semibold text-ink">{name}</span>
        <span className="t-small text-muted">
          {m.email} · {when(m.createdAt).toLowerCase()}
        </span>
      </p>
      <p className="t-body whitespace-pre-wrap text-ink-2">{m.body}</p>
      <div className="flex flex-wrap gap-2">
        <a href={reply} className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-hover">
          Răspunde pe email
        </a>
        <Button size="s" variant="secondary" onClick={toggle} disabled={busy}>
          {m.status === 'New' ? 'Marchează ca rezolvat' : 'Marchează ca nou'}
        </Button>
      </div>
      <p className="t-caption text-muted">
        „Răspunde pe email” deschide clientul de email cu adresa completată; site-ul nu trimite răspunsuri în numele
        tău.
      </p>
      <div className="border-t border-line pt-4">
        <History history={m.history} pending={m.emailPending} />
      </div>
    </Card>
  )
}
