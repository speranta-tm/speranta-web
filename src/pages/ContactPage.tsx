import { useState, type FormEvent, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { IconTile, MapEmbed, PageTitle } from '../components/Bits'
import { useTitle } from '../lib/useTitle'
import { Button } from '../components/Button'
import { Consent, Honeypot, TextArea, TextField } from '../components/Field'
import { Icon, type IconName } from '../components/Icon'
import { church } from '../content/church'
import { api } from '../lib/api'
import { servicesByDay, telHref } from '../lib/format'
import { isEmail, useFormSubmit } from '../lib/forms'
import { useSite } from '../lib/site'
import type { ThanksState } from './ThanksPage'

/** Figma › "Contact · Desktop" / "Contact · Mobile". */
export function ContactPage() {
  useTitle('Contact')
  const { services, kidsPhone } = useSite()

  return (
    <>
      <PageTitle
        title="Contact"
        lead="Sunteți important pentru noi. Ne bucurăm de mesajele dumneavoastră și vom face tot posibilul să vă răspundem în timp util."
      />

      <section className="container-page flex flex-col gap-10 pt-10 pb-14 lg:flex-row lg:items-start lg:gap-16 lg:pt-16 lg:pb-24">
        <div className="flex flex-col gap-4 lg:w-[586px] lg:shrink-0">
          <h2 className="t-h2 text-ink">Cum ne găsiți</h2>
          <InfoCard icon="map-pin" label="Adresa bisericii" href={church.directions}>
            {church.address}
          </InfoCard>
          <InfoCard icon="mail" label={church.pastor.name} href={`mailto:${church.pastor.email}`}>
            {church.pastor.email}
          </InfoCard>
          <InfoCard icon="phone" label="Activități pentru copii" href={telHref(kidsPhone)}>
            {kidsPhone}
          </InfoCard>
          <InfoCard icon="clock" label="Program">
            {servicesByDay(services).map((d) => (
              <span key={d.day} className="block">
                {d.day} {d.times}
              </span>
            ))}
          </InfoCard>
        </div>
        <ContactForm />
      </section>

      <MapEmbed className="h-[300px] lg:h-[420px]" />
    </>
  )
}

function InfoCard({
  icon,
  label,
  href,
  children,
}: {
  icon: IconName
  label: string
  href?: string
  children: ReactNode
}) {
  const body = (
    <>
      <IconTile name={icon} />
      <div className="flex min-w-0 flex-col gap-0.5">
        <span className="t-small text-muted">{label}</span>
        <span className="t-body font-semibold break-words text-ink">{children}</span>
      </div>
    </>
  )
  const cls = 'flex items-center gap-4 rounded-2xl border border-line bg-white p-5'
  if (!href) return <div className={cls}>{body}</div>
  return (
    <a
      href={href}
      className={`${cls} transition-colors hover:border-primary`}
      {...(href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
    >
      {body}
    </a>
  )
}

function ContactForm() {
  const navigate = useNavigate()
  const { errors, formError, busy, submit, clear } = useFormSubmit<{ reference: number }>()
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [accepts, setAccepts] = useState(false)
  const [website, setWebsite] = useState('')

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    const v: Record<string, string> = {}
    if (!email.trim()) v.email = 'Scrieți adresa de email.'
    else if (!isEmail(email)) v.email = 'Adresa de email nu pare corectă.'
    if (!message.trim()) v.message = 'Scrieți mesajul.'
    if (!accepts) v.acceptsDataUse = 'Avem nevoie de acordul dvs. pentru a vă răspunde.'

    void submit(
      v,
      () => api.sendMessage({ firstName, lastName, email, subject, message, acceptsDataUse: accepts, website }),
      () => {
        const state: ThanksState = {
          kind: 'message',
          rows: [
            ['Email', email.trim()],
            ...(subject.trim() ? ([['Subiect', subject.trim()]] as [string, string][]) : []),
          ],
        }
        navigate('/multumim', { state })
      },
    )
  }

  return (
    <form
      noValidate
      onSubmit={onSubmit}
      className="relative flex flex-1 flex-col gap-5 rounded-[24px] border border-line bg-white p-5 sm:p-10"
    >
      <h2 className="t-h2 text-ink">Trimite-ne un mesaj</h2>
      <div className="grid gap-5 sm:grid-cols-2 sm:gap-4">
        <TextField
          label="Prenume"
          autoComplete="given-name"
          placeholder="ex. Ion"
          value={firstName}
          error={errors.firstName}
          onChange={(e) => {
            setFirstName(e.target.value)
            clear('firstName')
          }}
        />
        <TextField
          label="Nume"
          autoComplete="family-name"
          placeholder="ex. Popescu"
          value={lastName}
          error={errors.lastName}
          onChange={(e) => {
            setLastName(e.target.value)
            clear('lastName')
          }}
        />
      </div>
      <TextField
        label="Adresă de email"
        required
        type="email"
        autoComplete="email"
        placeholder="nume@exemplu.ro"
        value={email}
        error={errors.email}
        onChange={(e) => {
          setEmail(e.target.value)
          clear('email')
        }}
      />
      <TextField
        label="Subiect"
        placeholder="Despre ce ne scrieți?"
        value={subject}
        error={errors.subject}
        onChange={(e) => {
          setSubject(e.target.value)
          clear('subject')
        }}
      />
      <TextArea
        label="Mesaj"
        required
        placeholder="Scrie mesajul tău…"
        value={message}
        error={errors.message}
        onChange={(e) => {
          setMessage(e.target.value)
          clear('message')
        }}
      />
      <Consent
        label="Sunt de acord ca datele mele să fie folosite pentru a primi un răspuns. *"
        checked={accepts}
        error={errors.acceptsDataUse}
        onChange={(c) => {
          setAccepts(c)
          clear('acceptsDataUse')
        }}
      />
      <Honeypot value={website} onChange={setWebsite} />
      {formError && (
        <p role="alert" className="t-small flex items-start gap-2 rounded-md bg-danger/10 p-3 text-danger">
          <Icon name="alert" size={16} className="mt-0.5" />
          {formError}
        </p>
      )}
      <Button type="submit" block disabled={busy}>
        {busy ? 'Se trimite…' : 'Trimite mesajul'}
      </Button>
    </form>
  )
}
