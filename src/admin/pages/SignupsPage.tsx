import { useEffect, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { Button } from '../../components/Button'
import { SelectField, TextArea } from '../../components/Field'
import { Icon } from '../../components/Icon'
import { telHref } from '../../lib/format'
import { useTitle } from '../../lib/useTitle'
import { adminApi, type SignupDetail, type SignupStatus } from '../api'
import { useAdmin, useRemote } from '../data'
import { count, kidsGroupLabel, longWhen, shortWhen, signupStatus } from '../labels'
import { Badge, Card, Drawer, EmailPendingMark, ErrorNote, Fact, Filters, Loading, PageHead, Pager, SearchBox } from '../ui'
import { History } from './OrdersPage'
import { useDebounced } from './useDebounced'

const child = (name: string | null, age: number | null) =>
  [name, age !== null ? `${age} ani` : null].filter(Boolean).join(', ') || '—'

/** Figma › "Admin · Înscrieri copii". */
export function SignupsPage() {
  useTitle('Înscrieri copii')
  const { id } = useParams()
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const status = (params.get('status') as SignupStatus | null) ?? undefined
  const page = Number(params.get('pagina')) || 1
  const [search, setSearch] = useState(params.get('q') ?? '')
  const q = useDebounced(search, 300)
  const list = useRemote(`signups/${status}/${q}/${page}`, () => adminApi.signups({ status, q, page }))
  const [exportError, setExportError] = useState<string | null>(null)

  const setParam = (key: string, value: string | undefined) => {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value)
    else next.delete(key)
    if (key !== 'pagina') next.delete('pagina')
    setParams(next)
  }

  useEffect(() => {
    if ((params.get('q') ?? '') !== q) setParam('q', q || undefined)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q])

  const c = list.state === 'ready' ? list.data.counts : null

  return (
    <>
      <PageHead
        title="Înscrieri copii"
        sub={c ? `${c.New} ${c.New === 1 ? 'nouă' : 'noi'} · ${count(c.Enrolled, 'copil înscris', 'copii înscriși')}` : ' '}
      >
        <Button
          size="s"
          variant="secondary"
          icon="download"
          onClick={() => adminApi.exportSignups({ status, q }).catch(() => setExportError('Exportul nu a reușit. Încearcă din nou.'))}
        >
          Exportă CSV
        </Button>
      </PageHead>
      {exportError && <ErrorNote>{exportError}</ErrorNote>}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Filters<SignupStatus>
          value={status}
          onChange={(s) => setParam('status', s)}
          options={[
            { value: undefined, label: 'Toate' },
            { value: 'New', label: c ? `Noi (${c.New})` : 'Noi' },
            { value: 'Contacted', label: 'Contactați' },
            { value: 'Enrolled', label: 'Înscriși' },
            { value: 'Withdrawn', label: 'Renunțat' },
          ]}
        />
        <SearchBox value={search} onChange={setSearch} placeholder="Caută părinte sau copil" />
      </div>

      {list.state === 'loading' && <Loading />}
      {list.state === 'error' && <ErrorNote>Nu am putut încărca înscrierile.</ErrorNote>}
      {list.state === 'ready' && (
        <>
          <Card className="overflow-x-auto">
            <table className="w-full min-w-[1000px] text-left">
              <thead className="t-caption bg-surface-2 text-muted">
                <tr>
                  {['Data', 'Părinte', 'Telefon', 'Copil', 'Grupa', 'A mai participat', 'Mesaj', 'Status'].map((h) => (
                    <th key={h} className="px-5 py-3 font-medium">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {list.data.items.length === 0 && (
                  <tr>
                    <td colSpan={8} className="t-body px-5 py-10 text-center text-body">
                      Nicio înscriere aici.
                    </td>
                  </tr>
                )}
                {list.data.items.map((s) => (
                  <tr
                    key={s.id}
                    onClick={() => navigate(`/admin/inscrieri/${s.id}${location.search}`)}
                    className={`cursor-pointer border-t border-line hover:bg-surface-2 ${s.status === 'New' ? 'bg-primary/4' : ''}`}
                  >
                    <td className="t-small px-5 py-3.5 whitespace-nowrap text-body">{shortWhen(s.createdAt)}</td>
                    <td className="t-body px-5 py-3.5 font-semibold text-ink">{s.parentName}</td>
                    <td className="t-small px-5 py-3.5 whitespace-nowrap text-body">{s.phone}</td>
                    <td className="t-small px-5 py-3.5 text-body">{child(s.childFirstName, s.childAge)}</td>
                    <td className="t-small px-5 py-3.5 text-body">{s.group ? kidsGroupLabel[s.group] : '—'}</td>
                    <td className="t-small px-5 py-3.5 text-body">{s.participatedBefore ? 'Da' : 'Nu'}</td>
                    <td className="t-small max-w-[240px] truncate px-5 py-3.5 text-body">{s.message ?? '—'}</td>
                    <td className="px-5 py-3.5">
                      <span className="flex items-center gap-2">
                        <Badge tone={signupStatus[s.status].tone}>{signupStatus[s.status].label}</Badge>
                        {s.emailPending && <EmailPendingMark />}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
          <Pager page={page} pageSize={list.data.pageSize} total={list.data.total} go={(p) => setParam('pagina', String(p))} />
        </>
      )}

      {id && <SignupDrawer id={Number(id)} onClose={() => navigate(`/admin/inscrieri${location.search}`)} onSaved={() => list.reload()} />}
    </>
  )
}

function SignupDrawer({ id, onClose, onSaved }: { id: number; onClose: () => void; onSaved: () => void }) {
  const detail = useRemote(`signup/${id}`, () => adminApi.signup(id))
  return (
    <Drawer onClose={onClose} label={`Înscrierea #${id}`}>
      {detail.state === 'loading' && <Loading />}
      {detail.state === 'error' && <ErrorNote>Înscrierea nu a putut fi încărcată.</ErrorNote>}
      {detail.state === 'ready' && (
        <SignupForm key={detail.data.updatedAt} signup={detail.data} onClose={onClose} onSaved={(s) => { detail.set(s); onSaved() }} />
      )}
    </Drawer>
  )
}

function SignupForm({ signup, onClose, onSaved }: { signup: SignupDetail; onClose: () => void; onSaved: (s: SignupDetail) => void }) {
  const { refresh } = useAdmin()
  const [status, setStatus] = useState<SignupStatus>(signup.status)
  const [note, setNote] = useState(signup.internalNote ?? '')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function save() {
    setBusy(true)
    setError(null)
    try {
      onSaved(await adminApi.updateSignup(signup.id, { status, internalNote: note }))
      refresh()
    } catch {
      setError('Salvarea nu a reușit.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <div className="flex items-start gap-3">
        <div className="flex flex-1 flex-col gap-1">
          <p className="t-small text-muted">Înscrierea #{signup.id}</p>
          <h2 className="t-h2 text-ink">{signup.parentName}</h2>
        </div>
        <button type="button" onClick={onClose} aria-label="Închide" className="p-1 text-ink">
          <Icon name="close" size={24} />
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        <a href={telHref(signup.phone)} className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-hover">
          <Icon name="phone" size={16} /> Sună {signup.phone}
        </a>
        {signup.email && (
          <a href={`mailto:${signup.email}`} className="inline-flex items-center gap-2 rounded-full border-[1.5px] border-primary px-4 py-2 text-sm font-semibold text-primary hover:bg-surface">
            <Icon name="mail" size={16} /> Scrie pe email
          </a>
        )}
      </div>

      <dl className="flex flex-col gap-3 rounded-xl bg-surface-2 p-4">
        <Fact label="Copil">{child(signup.childFirstName, signup.childAge)}</Fact>
        <Fact label="Grupa">{signup.group ? kidsGroupLabel[signup.group] : '—'}</Fact>
        <Fact label="A mai participat">{signup.participatedBefore ? 'Da' : 'Nu'}</Fact>
        <Fact label="Email">{signup.email ?? '—'}</Fact>
        <Fact label="Mesaj">{signup.message ?? '—'}</Fact>
        <Fact label="Trimisă">{longWhen(signup.createdAt)}</Fact>
      </dl>

      <SelectField
        label="Status"
        placeholder="Alege"
        value={status}
        options={Object.entries(signupStatus).map(([value, s]) => ({ value, label: s.label }))}
        onChange={(e) => setStatus(e.target.value as SignupStatus)}
      />
      <TextArea label="Notă internă" value={note} onChange={(e) => setNote(e.target.value)} />
      <History history={signup.history} pending={signup.emailPending} />
      {error && <ErrorNote>{error}</ErrorNote>}
      <div className="mt-auto flex justify-end pt-2">
        <Button onClick={save} disabled={busy}>
          {busy ? 'Se salvează…' : 'Salvează'}
        </Button>
      </div>
    </>
  )
}
