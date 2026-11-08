import { useState, type FormEvent, type ReactNode } from 'react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import logo from '../../assets/img/logo.png'
import { Button } from '../../components/Button'
import { TextField } from '../../components/Field'
import { ApiError } from '../../lib/api'
import { useTitle } from '../../lib/useTitle'
import { adminApi, useToken } from '../api'
import { useRemote } from '../data'
import { ErrorNote } from '../ui'

const MIN = 10

/** Figma › "Admin · Autentificare" card, shared by the four sign-in screens. */
function AuthCard({ title, sub, children }: { title: string; sub: ReactNode; children: ReactNode }) {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-surface-2 p-4">
      <div className="flex w-full max-w-[440px] flex-col gap-5 rounded-[24px] bg-white p-6 shadow-[0_20px_50px_rgb(26_32_44/0.08)] sm:p-10">
        <img src={logo} alt="Biserica Adventistă Speranța Timișoara" className="h-[60px] w-auto self-start" />
        <div className="flex flex-col gap-1">
          <h1 className="t-h2 text-ink">{title}</h1>
          <p className="t-small text-muted">{sub}</p>
        </div>
        {children}
      </div>
    </div>
  )
}

/** Only internal admin paths; never send someone off-site after sign-in. */
const safeReturn = (to: string | null) => (to && to.startsWith('/admin') && !to.startsWith('//') ? to : '/admin')

export function LoginPage() {
  useTitle('Administrare')
  const token = useToken()
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const back = safeReturn(params.get('inapoi'))

  if (token) return <Navigate to={back} replace />

  async function submit(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      await adminApi.login(email.trim(), password)
      navigate(back, { replace: true })
    } catch (err) {
      setError(
        err instanceof ApiError && err.status === 401
          ? 'Emailul sau parola nu se potrivesc.'
          : err instanceof ApiError && err.status === 429
            ? err.message
            : 'Nu ne-am putut conecta. Încearcă din nou.',
      )
    } finally {
      setBusy(false)
    }
  }

  return (
    <AuthCard title="Administrare site" sub="Intră cu contul primit prin invitație.">
      <form onSubmit={submit} className="flex flex-col gap-5">
        <TextField label="Email" type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nume@exemplu.ro" />
        <TextField label="Parolă" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        {error && <ErrorNote>{error}</ErrorNote>}
        <Button type="submit" block disabled={busy || !email || !password}>
          {busy ? 'Se verifică…' : 'Intră'}
        </Button>
        <Link to="/admin/parola-uitata" className="t-label text-primary hover:underline">
          Ai uitat parola?
        </Link>
      </form>
    </AuthCard>
  )
}

export function ForgotPasswordPage() {
  useTitle('Parolă uitată')
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      await adminApi.forgotPassword(email.trim())
      setSent(true)
    } catch {
      setError('Nu am putut trimite linkul. Încearcă din nou.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <AuthCard title="Ai uitat parola?" sub="Scrie adresa contului. Îți trimitem un link ca să alegi o parolă nouă.">
      {sent ? (
        <p className="t-body rounded-md bg-success/10 p-4 text-success">
          Dacă există un cont cu adresa {email}, linkul este pe drum. Verifică și folderul Spam.
        </p>
      ) : (
        <form onSubmit={submit} className="flex flex-col gap-5">
          <TextField label="Email" type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nume@exemplu.ro" />
          {error && <ErrorNote>{error}</ErrorNote>}
          <Button type="submit" block disabled={busy || !email}>
            {busy ? 'Se trimite…' : 'Trimite linkul'}
          </Button>
        </form>
      )}
      <Link to="/admin/autentificare" className="t-label text-primary hover:underline">
        ← Înapoi la autentificare
      </Link>
    </AuthCard>
  )
}

function PasswordPair({
  onSubmit,
  label,
  busy,
  error,
}: {
  onSubmit: (password: string) => void
  label: string
  busy: boolean
  error: string | null
}) {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [local, setLocal] = useState<string | null>(null)

  function submit(e: FormEvent) {
    e.preventDefault()
    if (password.length < MIN) return setLocal(`Parola trebuie să aibă cel puțin ${MIN} caractere.`)
    if (password !== confirm) return setLocal('Cele două parole nu sunt la fel.')
    setLocal(null)
    onSubmit(password)
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-5">
      <TextField
        label="Parolă nouă"
        type="password"
        autoComplete="new-password"
        required
        value={password}
        help={`Cel puțin ${MIN} caractere. Lungimea contează mai mult decât simbolurile.`}
        onChange={(e) => setPassword(e.target.value)}
      />
      <TextField label="Confirmă parola" type="password" autoComplete="new-password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} />
      {(local || error) && <ErrorNote>{local ?? error}</ErrorNote>}
      <Button type="submit" block disabled={busy}>
        {busy ? 'Se salvează…' : label}
      </Button>
    </form>
  )
}

export function ResetPasswordPage() {
  useTitle('Parolă nouă')
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const email = params.get('email') ?? ''
  const code = params.get('code') ?? ''
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!email || !code) {
    return (
      <AuthCard title="Linkul nu este complet" sub="Deschide din nou linkul din email sau cere unul nou.">
        <Link to="/admin/parola-uitata" className="t-label text-primary hover:underline">
          Cere un link nou
        </Link>
      </AuthCard>
    )
  }

  async function save(password: string) {
    setBusy(true)
    setError(null)
    try {
      await adminApi.resetPassword(email, code, password)
      await adminApi.login(email, password)
      navigate('/admin', { replace: true })
    } catch {
      setError('Linkul a expirat sau a fost deja folosit. Cere unul nou.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <AuthCard title="Alege o parolă nouă" sub={`Pentru ${email}. Cel puțin ${MIN} caractere.`}>
      <PasswordPair onSubmit={save} label="Salvează parola" busy={busy} error={error} />
    </AuthCard>
  )
}

/** Figma › "Admin · Acceptă invitația". */
export function AcceptInvitePage() {
  useTitle('Invitație')
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const token = params.get('token') ?? ''
  const invite = useRemote(`invite/${token}`, () => adminApi.invite(token))
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (invite.state === 'loading') return <AuthCard title="Bine ai venit!" sub="Se verifică invitația…">{null}</AuthCard>
  if (invite.state === 'error' || !token) {
    return (
      <AuthCard title="Invitația nu mai este valabilă" sub="Linkul a expirat (după 7 zile), a fost deja folosit sau a fost retras. Cere o invitație nouă de la un administrator.">
        <Link to="/admin/autentificare" className="t-label text-primary hover:underline">
          Ai deja cont? Intră aici
        </Link>
      </AuthCard>
    )
  }

  const { email, invitedBy } = invite.data

  async function create(password: string) {
    setBusy(true)
    setError(null)
    try {
      await adminApi.acceptInvite(token, password)
      await adminApi.login(email, password)
      navigate('/admin', { replace: true })
    } catch (err) {
      setError(err instanceof ApiError && err.fields.password ? err.fields.password : 'Nu am putut crea contul. Încearcă din nou.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <AuthCard
      title="Bine ai venit!"
      sub={`${invitedBy ?? 'Un administrator'} te-a invitat să administrezi site-ul. Alege o parolă pentru ${email}.`}
    >
      <PasswordPair onSubmit={create} label="Creează contul" busy={busy} error={error} />
    </AuthCard>
  )
}
