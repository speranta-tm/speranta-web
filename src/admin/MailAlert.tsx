import { useState, type FormEvent } from 'react'
import { Button } from '../components/Button'
import { TextField } from '../components/Field'
import { Icon } from '../components/Icon'
import { ApiError } from '../lib/api'
import { cx } from '../lib/cx'
import { adminApi, type MailHealth } from './api'
import { count, when } from './labels'

/**
 * Figma › MailAlert. Shown at the top of every admin page while email is failing or
 * not set up, from GET /admin/mail-status. "Cum rezolv?" opens the steps and a field
 * for a new Gmail app password, so the church can restart email on their own.
 */
export function MailAlert({ mail, onChange }: { mail: MailHealth; onChange: (m: MailHealth) => void }) {
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState<'check' | 'save' | null>(null)
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<string | null>(null)

  if (mail.state === 'Ok') return null
  const failing = mail.state === 'Failing'

  const waiting =
    mail.pending === 1
      ? 'O notificare așteaptă și pleacă singură după ce rezolvi problema.'
      : mail.pending > 1
        ? `${count(mail.pending, 'notificare', 'notificări')} așteaptă și pleacă singure după ce rezolvi problema.`
        : 'Noile notificări vor aștepta și vor pleca singure după ce rezolvi problema.'

  const since = mail.failingSince ? when(mail.failingSince).replace(/^Azi/, 'azi').replace(/^Ieri/, 'ieri') : null
  const title = failing ? `Emailurile nu mai pleacă${since ? ` din ${since}` : ''}` : 'Emailurile nu sunt pornite'

  async function check() {
    setBusy('check')
    setError(null)
    setResult(null)
    try {
      const m = await adminApi.mailCheck()
      onChange(m)
      if (m.state !== 'Ok') setResult('Încă nu merge. Urmează pașii de la „Cum rezolv?”.')
    } catch {
      setError('Verificarea nu a reușit. Încearcă din nou.')
    } finally {
      setBusy(null)
    }
  }

  async function save(e: FormEvent) {
    e.preventDefault()
    setBusy('save')
    setError(null)
    setResult(null)
    try {
      const m = await adminApi.saveAppPassword(password)
      setPassword('')
      onChange(m)
      if (m.state !== 'Ok') setError('Gmail nu a acceptat parola. Verifică dacă ai copiat toate cele 16 litere și încearcă din nou.')
    } catch (err) {
      setError(err instanceof ApiError && err.fields.appPassword ? err.fields.appPassword : 'Salvarea nu a reușit. Încearcă din nou.')
    } finally {
      setBusy(null)
    }
  }

  return (
    <div
      role="alert"
      className={cx(
        'flex gap-4 rounded-xl border px-5 py-4',
        failing ? 'border-danger/35 bg-danger/8' : 'border-warning/35 bg-warning/8',
      )}
    >
      <Icon name="alert" size={24} className={failing ? 'text-danger' : 'text-warning'} />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <p className={cx('t-body font-semibold', failing ? 'text-danger' : 'text-warning')}>{title}</p>
        <p className="t-small text-ink-2">
          {failing ? (
            <>
              Gmail refuză conectarea{mail.lastError ? <> („{mail.lastError.slice(0, 120)}”)</> : null}. {waiting} Nimic nu
              s-a pierdut: toate comenzile, înscrierile și mesajele sunt aici, în panou.
            </>
          ) : (
            <>
              Site-ul nu are încă parola de aplicație Gmail, așa că nu trimite notificări. Comenzile, înscrierile și
              mesajele apar oricum aici. {waiting}
            </>
          )}
        </p>

        {open && (
          <form onSubmit={save} className="mt-2 flex flex-col gap-2.5 rounded-[10px] bg-white p-4">
            <p className="t-body font-semibold text-ink">Cum repornești emailurile</p>
            <ol className="t-small flex list-decimal flex-col gap-1.5 pl-5 text-ink-2">
              <li>
                Intră în contul <strong>{mail.notifyTo}</strong> și deschide{' '}
                <a
                  href="https://myaccount.google.com/apppasswords"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-primary underline underline-offset-2"
                >
                  myaccount.google.com/apppasswords
                </a>
                . (Dacă pagina spune că nu e disponibilă, pornește întâi „Verificarea în doi pași” din Securitate.)
              </li>
              <li>Creează o parolă nouă de aplicație cu numele „site Speranța”. Google îți arată 16 litere.</li>
              <li>Lipește-le mai jos și apasă „Salvează și verifică”. Notificările care așteaptă pleacă imediat.</li>
            </ol>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <TextField
                label="Parolă de aplicație Gmail"
                required
                autoComplete="off"
                spellCheck={false}
                placeholder="abcd efgh ijkl mnop"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="sm:w-[360px]"
              />
              <Button type="submit" disabled={busy !== null || !password.trim()}>
                {busy === 'save' ? 'Se verifică…' : 'Salvează și verifică'}
              </Button>
            </div>
            <p className="t-caption text-muted">Parola se păstrează criptat și nu mai apare nicăieri după salvare.</p>
          </form>
        )}

        {error && <p className="t-small font-semibold text-danger">{error}</p>}
        {result && <p className="t-small font-semibold text-ink-2">{result}</p>}

        <div className="flex flex-wrap gap-2 pt-1.5">
          <Button size="s" onClick={check} disabled={busy !== null}>
            {busy === 'check' ? 'Se verifică…' : 'Verifică acum'}
          </Button>
          <Button size="s" variant="ghost" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
            {open ? 'Ascunde' : 'Cum rezolv?'}
          </Button>
        </div>
      </div>
    </div>
  )
}
