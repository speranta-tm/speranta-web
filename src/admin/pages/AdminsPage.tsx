import { useState, type FormEvent } from 'react'
import { Button } from '../../components/Button'
import { TextField } from '../../components/Field'
import { ApiError } from '../../lib/api'
import { useTitle } from '../../lib/useTitle'
import { adminApi } from '../api'
import { useRemote } from '../data'
import { ago, initials } from '../labels'
import { Badge, Card, ErrorNote, Loading, Modal, PageHead } from '../ui'

/** Figma › "Admin · Administratori", with the invite dialog. */
export function AdminsPage() {
  useTitle('Administratori')
  const admins = useRemote('admins', () => adminApi.admins())
  const [inviting, setInviting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function act(run: () => Promise<unknown>) {
    setError(null)
    try {
      await run()
      admins.reload()
    } catch (e) {
      setError(e instanceof ApiError && Object.values(e.fields)[0] ? Object.values(e.fields)[0] : 'Nu a reușit. Încearcă din nou.')
    }
  }

  return (
    <>
      <PageHead title="Administratori" sub="Doar persoanele invitate pot intra în panou">
        <Button icon="users" onClick={() => setInviting(true)}>
          Invită pe cineva
        </Button>
      </PageHead>
      {error && <ErrorNote>{error}</ErrorNote>}
      {admins.state === 'loading' && <Loading />}
      {admins.state === 'ready' && (
        <Card>
          <ul>
            {admins.data.admins.map((a) => (
              <li key={a.id} className="flex flex-wrap items-center gap-4 border-t border-line px-5 py-3.5 first:border-t-0">
                <span className="t-caption flex h-[30px] min-w-[40px] items-center justify-center rounded-full bg-surface px-2.5 text-primary">
                  {initials(a.displayName ?? a.email)}
                </span>
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="t-body font-semibold text-ink">{a.displayName ?? a.email}</span>
                  <span className="t-small text-muted">{a.email}</span>
                </div>
                <Badge tone="done">{a.isYou ? 'Activ · tu' : 'Activ'}</Badge>
                {!a.isYou && (
                  <Button
                    size="s"
                    variant="ghost"
                    onClick={() =>
                      window.confirm(`Scoți pe ${a.displayName ?? a.email} din administratori? Contul se șterge.`) &&
                      act(() => adminApi.removeAdmin(a.id))
                    }
                  >
                    Elimină
                  </Button>
                )}
              </li>
            ))}
            {admins.data.invites.map((i) => (
              <li key={`i${i.id}`} className="flex flex-wrap items-center gap-4 border-t border-line px-5 py-3.5">
                <span className="t-caption flex h-[30px] min-w-[40px] items-center justify-center rounded-full bg-surface px-2.5 text-primary">
                  {i.displayName ? initials(i.displayName) : '?'}
                </span>
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="t-body font-semibold text-ink">{i.displayName ?? i.email}</span>
                  <span className="t-small text-muted">{i.displayName ? `${i.email} · ` : ''}Încă nu a acceptat</span>
                </div>
                <Badge tone="progress">Invitație trimisă {ago(i.createdAt)}</Badge>
                <Button size="s" variant="ghost" onClick={() => act(() => adminApi.inviteAdmin(i.email, i.displayName ?? ''))}>
                  Retrimite
                </Button>
                <Button size="s" variant="ghost" onClick={() => act(() => adminApi.revokeInvite(i.id))}>
                  Retrage
                </Button>
              </li>
            ))}
          </ul>
        </Card>
      )}
      {inviting && <InviteDialog onClose={() => setInviting(false)} onSent={() => { setInviting(false); admins.reload() }} />}
    </>
  )
}

function InviteDialog({ onClose, onSent }: { onClose: () => void; onSent: () => void }) {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [busy, setBusy] = useState(false)

  async function submit(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setErrors({})
    try {
      await adminApi.inviteAdmin(email.trim(), name.trim())
      onSent()
    } catch (err) {
      setErrors(err instanceof ApiError && Object.keys(err.fields).length ? { ...err.fields } : { form: 'Invitația nu a putut fi trimisă.' })
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal onClose={onClose} label="Invită un administrator">
      <form onSubmit={submit} className="flex flex-col gap-4">
        <h2 className="t-h2 text-ink">Invită un administrator</h2>
        <p className="t-small text-body">Persoana primește un email cu un link valabil 7 zile, în care își alege parola.</p>
        <TextField label="Email" required type="email" placeholder="nume@exemplu.ro" value={email} error={errors.email} onChange={(e) => setEmail(e.target.value)} />
        <TextField label="Nume" placeholder="ex. Daniel Pop" value={name} error={errors.displayName} onChange={(e) => setName(e.target.value)} />
        {errors.form && <ErrorNote>{errors.form}</ErrorNote>}
        <div className="flex justify-end gap-2">
          <Button type="button" size="s" variant="ghost" onClick={onClose}>
            Renunță
          </Button>
          <Button type="submit" disabled={busy || !email}>
            {busy ? 'Se trimite…' : 'Trimite invitația'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
