import { useEffect, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { Button } from '../../components/Button'
import { SelectField, TextArea, TextField } from '../../components/Field'
import { Icon } from '../../components/Icon'
import { ApiError, type DeliveryMethod } from '../../lib/api'
import { telHref } from '../../lib/format'
import { useTitle } from '../../lib/useTitle'
import { adminApi, type OrderDetail, type OrderStatus } from '../api'
import { useAdmin, useRemote } from '../data'
import { ageGroupLabel, deliveryLabel, deliveryLong, longWhen, orderStatus, shortWhen } from '../labels'
import { Badge, Card, Drawer, EmailPendingMark, ErrorNote, Fact, Filters, Loading, PageHead, Pager, SearchBox } from '../ui'
import { useDebounced } from './useDebounced'

/** Figma › "Admin · Comenzi cărți" and "Comandă (detaliu)". */
export function OrdersPage() {
  useTitle('Comenzi cărți')
  const { id } = useParams()
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const status = (params.get('status') as OrderStatus | null) ?? undefined
  const page = Number(params.get('pagina')) || 1
  const [search, setSearch] = useState(params.get('q') ?? '')
  const q = useDebounced(search, 300)
  const list = useRemote(`orders/${status}/${q}/${page}`, () => adminApi.orders({ status, q, page }))
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
  const sub = c
    ? `${c.New} ${c.New === 1 ? 'nouă' : 'noi'} · ${c.Confirmed} ${c.Confirmed === 1 ? 'confirmată' : 'confirmate'} · ${list.state === 'ready' ? list.data.thisMonth : 0} luna aceasta`
    : ' '

  return (
    <>
      <PageHead title="Comenzi cărți" sub={sub}>
        <Button
          size="s"
          variant="secondary"
          icon="download"
          onClick={() => adminApi.exportOrders({ status, q }).catch(() => setExportError('Exportul nu a reușit. Încearcă din nou.'))}
        >
          Exportă CSV
        </Button>
      </PageHead>
      {exportError && <ErrorNote>{exportError}</ErrorNote>}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Filters<OrderStatus>
          value={status}
          onChange={(s) => setParam('status', s)}
          options={[
            { value: undefined, label: 'Toate' },
            { value: 'New', label: c ? `Noi (${c.New})` : 'Noi' },
            { value: 'Confirmed', label: 'Confirmate' },
            { value: 'Delivered', label: 'Livrate' },
            { value: 'PickedUp', label: 'Ridicate' },
            { value: 'Cancelled', label: 'Anulate' },
          ]}
        />
        <SearchBox value={search} onChange={setSearch} placeholder="Caută nume sau telefon" />
      </div>

      {list.state === 'loading' && <Loading />}
      {list.state === 'error' && <ErrorNote>Nu am putut încărca comenzile.</ErrorNote>}
      {list.state === 'ready' && (
        <>
          <Card className="overflow-x-auto">
            <table className="w-full min-w-[960px] text-left">
              <thead className="t-caption bg-surface-2 text-muted">
                <tr>
                  {['Data', 'Nume', 'Telefon', 'Carte', 'Primire', 'Adresă', 'Status'].map((h) => (
                    <th key={h} className="px-5 py-3 font-medium first:pl-5">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {list.data.items.length === 0 && (
                  <tr>
                    <td colSpan={7} className="t-body px-5 py-10 text-center text-body">
                      Nicio comandă aici.
                    </td>
                  </tr>
                )}
                {list.data.items.map((o) => (
                  <tr
                    key={o.id}
                    onClick={() => navigate(`/admin/comenzi/${o.id}${location.search}`)}
                    className={`cursor-pointer border-t border-line hover:bg-surface-2 ${o.status === 'New' ? 'bg-primary/4' : ''}`}
                  >
                    <td className="t-small px-5 py-3.5 whitespace-nowrap text-body">{shortWhen(o.createdAt)}</td>
                    <td className="t-body px-5 py-3.5 font-semibold text-ink">
                      <a href={`/admin/comenzi/${o.id}`} onClick={(e) => e.preventDefault()} className="hover:text-primary">
                        {o.fullName}
                      </a>
                    </td>
                    <td className="t-small px-5 py-3.5 whitespace-nowrap text-body">{o.phone}</td>
                    <td className="t-small px-5 py-3.5 text-body">{o.bookTitle}</td>
                    <td className="t-small px-5 py-3.5 text-body">{deliveryLabel[o.deliveryMethod]}</td>
                    <td className="t-small max-w-[220px] px-5 py-3.5 text-body">{o.address ?? '—'}</td>
                    <td className="px-5 py-3.5">
                      <span className="flex items-center gap-2">
                        <Badge tone={orderStatus[o.status].tone}>{orderStatus[o.status].label}</Badge>
                        {o.emailPending && <EmailPendingMark />}
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

      {id && (
        <OrderDrawer
          id={Number(id)}
          onClose={() => navigate(`/admin/comenzi${location.search}`)}
          onSaved={() => list.reload()}
        />
      )}
    </>
  )
}

function OrderDrawer({ id, onClose, onSaved }: { id: number; onClose: () => void; onSaved: () => void }) {
  const detail = useRemote(`order/${id}`, () => adminApi.order(id))
  return (
    <Drawer onClose={onClose} label={`Comanda #${id}`}>
      {detail.state === 'loading' && <Loading />}
      {detail.state === 'error' && <ErrorNote>Comanda nu a putut fi încărcată.</ErrorNote>}
      {detail.state === 'ready' && <OrderForm key={detail.data.updatedAt} order={detail.data} onClose={onClose} onSaved={(o) => { detail.set(o); onSaved() }} />}
    </Drawer>
  )
}

function OrderForm({ order, onClose, onSaved }: { order: OrderDetail; onClose: () => void; onSaved: (o: OrderDetail) => void }) {
  const { refresh } = useAdmin()
  const [status, setStatus] = useState<OrderStatus>(order.status)
  const [method, setMethod] = useState<DeliveryMethod>(order.deliveryMethod)
  const [address, setAddress] = useState(order.address ?? '')
  const [note, setNote] = useState(order.internalNote ?? '')
  const [busy, setBusy] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [copied, setCopied] = useState(false)

  async function save(override?: Partial<{ status: OrderStatus }>) {
    setBusy(true)
    setErrors({})
    try {
      const saved = await adminApi.updateOrder(order.id, {
        status: override?.status ?? status,
        deliveryMethod: method,
        address,
        internalNote: note,
      })
      onSaved(saved)
      refresh()
    } catch (e) {
      setErrors(e instanceof ApiError && Object.keys(e.fields).length ? { ...e.fields } : { form: 'Salvarea nu a reușit.' })
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <div className="flex items-start gap-3">
        <div className="flex flex-1 flex-col gap-1">
          <p className="t-small text-muted">Comanda #{order.id}</p>
          <h2 className="t-h2 text-ink">{order.fullName}</h2>
        </div>
        <button type="button" onClick={onClose} aria-label="Închide" className="p-1 text-ink">
          <Icon name="close" size={24} />
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        <a href={telHref(order.phone)} className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-hover">
          <Icon name="phone" size={16} /> Sună {order.phone}
        </a>
        {order.address && (
          <Button
            size="s"
            variant="secondary"
            onClick={() => navigator.clipboard.writeText(order.address ?? '').then(() => setCopied(true))}
          >
            {copied ? 'Copiată' : 'Copiază adresa'}
          </Button>
        )}
      </div>

      <dl className="flex flex-col gap-3 rounded-xl bg-surface-2 p-4">
        <Fact label="Carte">{order.bookTitle}</Fact>
        <Fact label="Primire">{deliveryLong[order.deliveryMethod]}</Fact>
        <Fact label="Adresă">{order.address ?? '—'}</Fact>
        {order.ageGroup && <Fact label="Grupa de vârstă">{ageGroupLabel[order.ageGroup]}</Fact>}
        {order.hasBibleAtHome !== null && <Fact label="Are Biblie acasă">{order.hasBibleAtHome ? 'Da' : 'Nu'}</Fact>}
        <Fact label="Trimisă">{longWhen(order.createdAt)}</Fact>
        <Fact label="Acord informări">Da</Fact>
      </dl>

      <SelectField
        label="Status"
        placeholder="Alege"
        value={status}
        options={Object.entries(orderStatus).map(([value, s]) => ({ value, label: s.label }))}
        onChange={(e) => setStatus(e.target.value as OrderStatus)}
      />
      <SelectField
        label="Primire"
        placeholder="Alege"
        value={method}
        options={[
          { value: 'Delivery', label: deliveryLong.Delivery },
          { value: 'Pickup', label: deliveryLong.Pickup },
        ]}
        onChange={(e) => setMethod(e.target.value as DeliveryMethod)}
      />
      {method === 'Delivery' && (
        <TextField label="Adresă" value={address} error={errors.address} onChange={(e) => setAddress(e.target.value)} />
      )}
      <TextArea
        label="Notă internă"
        placeholder="ex. A cerut livrare după ora 17. Curier: Daniel."
        value={note}
        error={errors.internalNote}
        onChange={(e) => setNote(e.target.value)}
      />

      <History history={order.history} pending={order.emailPending} />

      {errors.form && <ErrorNote>{errors.form}</ErrorNote>}

      <div className="mt-auto flex items-center justify-between gap-2 pt-2">
        {order.status !== 'Cancelled' ? (
          <Button variant="ghost" size="s" disabled={busy} onClick={() => save({ status: 'Cancelled' })}>
            Anulează comanda
          </Button>
        ) : (
          <span />
        )}
        <Button onClick={() => save()} disabled={busy}>
          {busy ? 'Se salvează…' : 'Salvează'}
        </Button>
      </div>
    </>
  )
}

/** "Istoric", with the not-yet-sent line when the notification is still waiting. */
export function History({ history, pending }: { history: { at: string; text: string }[]; pending: boolean }) {
  return (
    <div className="flex flex-col gap-2">
      <p className="t-label text-ink">Istoric</p>
      <ul className="flex flex-col gap-1">
        {history.map((h, i) => (
          <li key={i} className="t-small text-muted">
            {shortWhen(h.at)} · {h.text}
          </li>
        ))}
        {pending && (
          <li className="t-small flex items-center gap-1.5 text-warning">
            <Icon name="alert" size={16} />
            Email netrimis încă · se reîncearcă automat
          </li>
        )}
      </ul>
    </div>
  )
}
