import { useState, type FormEvent, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import copii from '../assets/img/copii-ilustratie.webp'
import poster from '../assets/img/copii-video-poster.webp'
import { IconTile, PlayDisc, Point } from '../components/Bits'
import { useTitle } from '../lib/useTitle'
import { Button, ButtonLink } from '../components/Button'
import { Consent, Honeypot, RadioGroup, TextArea, TextField } from '../components/Field'
import { Icon } from '../components/Icon'
import { api } from '../lib/api'
import { span, telHref } from '../lib/format'
import { isEmail, isPhone, useFormSubmit } from '../lib/forms'
import { useSite } from '../lib/site'
import type { ThanksState } from './ThanksPage'

const stories = [
  'Noe, care a stat cu familia lui în corabie un an, până când apele potopului s-au retras',
  'Moise, care a trecut Marea Roșie împreună cu tot poporul Israel',
  'apostolul Pavel, care a vorbit tuturor fără frică despre Dumnezeu',
  'Isus, care i-a vindecat pe orbi, pe bolnavii de lepră și pe invalizi',
  'Daniel, care a fost aruncat în groapa cu lei și nu i s-a întâmplat niciun rău',
]

const activities = [
  'Vor colora scene din poveștile biblice',
  'Vor desena, decupa și vor face puzzle-uri și rebusuri',
  'Cu ajutorul figurinelor, personajele biblice prind viață',
  'Se vor bucura de timp petrecut împreună, într-un mediu prietenos și sigur',
  'Fiecare grupă face activități potrivite vârstei',
  'Poți să stai și tu cu copilul la activități',
]

/** Figma › "Activități pentru copii · Desktop" / "Copii · Mobile". */
export function KidsPage() {
  useTitle('Activități pentru copii')
  const { kidsGroups, kidsPhone } = useSite()

  return (
    <>
      <section className="bg-surface-2">
        <div className="container-page flex flex-col-reverse gap-8 py-12 lg:flex-row lg:items-center lg:gap-16 lg:py-20">
          <div className="flex flex-col gap-5">
            <p className="t-eyebrow text-primary">Pentru copii</p>
            <h1 className="t-display text-ink">Activități pentru copii</h1>
            <p className="t-lead text-ink-2">
              La Biserica Adventistă de Ziua a Șaptea Speranța Timișoara organizăm activități pentru copii cu tematică
              biblică.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <ButtonLink to="#inscriere" icon="arrow-right">
                Înscrie-ți copilul
              </ButtonLink>
              <ButtonLink to={telHref(kidsPhone)} variant="secondary" icon="phone">
                {kidsPhone}
              </ButtonLink>
            </div>
          </div>
          <img
            src={copii}
            alt=""
            className="aspect-square w-full rounded-[24px] object-cover lg:w-[520px] lg:shrink-0 lg:rounded-[32px]"
          />
        </div>
      </section>

      <section className="container-page flex flex-col gap-8 pt-14 pb-6 lg:pt-24 lg:pb-12">
        <h2 className="t-h1 text-ink">Când și pentru cine?</h2>
        <div className="grid gap-4 lg:grid-cols-3 lg:gap-6">
          <Card icon="calendar" title="Când?">
            <p className="t-body text-body">În fiecare sâmbătă</p>
          </Card>
          <Card icon="users" title="Grupe pe vârstă">
            {kidsGroups.map((g) => (
              <p key={g.label} className="t-body text-body">
                {g.label}: {span(g.start, g.end)}
              </p>
            ))}
          </Card>
          <Card icon="gift" title="Cât costă?">
            <p className="t-body text-body">Totul e gratuit!</p>
          </Card>
        </div>
      </section>

      <section className="container-page grid gap-4 pt-6 pb-14 lg:grid-cols-2 lg:gap-12 lg:pt-12 lg:pb-24">
        <List title="Vor auzi povestiri despre…" icon="book-open" items={stories} />
        <List title="…și vor face activități practice" icon="check" items={activities} />
      </section>

      <section className="bg-ink">
        <div className="container-page flex flex-col items-center gap-10 py-14 lg:flex-row lg:gap-20 lg:py-24">
          <KidsVideo />
          <div className="flex flex-col gap-5">
            <Icon name="heart" size={32} className="text-white" />
            <h2 className="t-h1 text-white">De ce facem asta?</h2>
            <p className="t-lead text-line">
              Scopul nostru este ca fiecare copil să-L cunoască mai bine pe Dumnezeu, să învețe valori frumoase și să
              se simtă iubit.
            </p>
          </div>
        </div>
      </section>

      <section id="inscriere" className="scroll-mt-20 bg-surface-2">
        <div className="container-page flex flex-col items-center gap-8 py-14 lg:py-24">
          <div className="flex max-w-[1152px] flex-col gap-3 text-center">
            <p className="t-eyebrow text-primary">Înscriere</p>
            <h2 className="t-h1 text-ink">Înscrie-ți copilul la activitățile biblice săptămânale</h2>
            <p className="t-lead text-body">
              Completează formularul și te contactăm pentru detalii sau dacă ai întrebări. Preferi să suni?{' '}
              <a href={telHref(kidsPhone)} className="font-semibold whitespace-nowrap text-primary">
                {kidsPhone}
              </a>
              .
            </p>
          </div>
          <SignupForm />
        </div>
      </section>
    </>
  )
}

function Card({ icon, title, children }: { icon: 'calendar' | 'users' | 'gift'; title: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2.5 rounded-[24px] border border-line bg-white p-7">
      <IconTile name={icon} size="lg" />
      <h3 className="t-h3 text-ink">{title}</h3>
      {children}
    </div>
  )
}

function List({ title, icon, items }: { title: string; icon: 'book-open' | 'check'; items: string[] }) {
  return (
    <div className="flex flex-col gap-3.5 rounded-[24px] border border-line bg-surface-2 p-6 lg:p-8">
      <h3 className="t-h3 text-ink">{title}</h3>
      <ul className="flex flex-col gap-3.5">
        {items.map((i) => (
          <Point key={i} icon={icon}>
            {i}
          </Point>
        ))}
      </ul>
    </div>
  )
}

/** The 35-second clip from the old site. Plays in place; nothing loads until asked. */
function KidsVideo() {
  const [playing, setPlaying] = useState(false)
  return (
    <div className="relative aspect-[464/832] w-full max-w-[300px] shrink-0 overflow-hidden rounded-[24px] bg-ink-2">
      {playing ? (
        <video
          className="absolute inset-0 size-full object-cover"
          src="/media/copii.mp4"
          poster={poster}
          controls
          autoPlay
          playsInline
        />
      ) : (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          className="group absolute inset-0 flex items-center justify-center"
          aria-label="Pornește video: copiii la activități"
        >
          <img src={poster} alt="" loading="lazy" className="absolute inset-0 size-full object-cover" />
          <PlayDisc small />
        </button>
      )}
    </div>
  )
}

function SignupForm() {
  const navigate = useNavigate()
  const { errors, formError, busy, submit, clear } = useFormSubmit<{ reference: number }>()
  const [parentName, setParentName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [childName, setChildName] = useState('')
  const [childAge, setChildAge] = useState('')
  const [before, setBefore] = useState<'yes' | 'no' | null>(null)
  const [message, setMessage] = useState('')
  const [accepts, setAccepts] = useState(false)
  const [website, setWebsite] = useState('')

  /** "6", "6 ani", "6 ani și jumătate" → 6. Blank → null. */
  const parsedAge = childAge.trim() ? Number.parseInt(childAge, 10) : null

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    const v: Record<string, string> = {}
    if (!parentName.trim()) v.parentName = 'Scrieți numele dvs. complet.'
    if (!phone.trim()) v.phone = 'Scrieți un număr de telefon.'
    else if (!isPhone(phone)) v.phone = 'Numărul de telefon nu pare corect.'
    if (email.trim() && !isEmail(email)) v.email = 'Adresa de email nu pare corectă.'
    if (childAge.trim() && (parsedAge === null || Number.isNaN(parsedAge) || parsedAge < 0 || parsedAge > 18)) {
      v.childAge = 'Scrieți vârsta în ani, de exemplu 6.'
    }
    if (before === null) v.participatedBefore = 'Alegeți un răspuns.'
    if (!accepts) v.acceptsDataUse = 'Avem nevoie de acordul dvs. pentru a vă contacta.'

    void submit(
      v,
      () =>
        api.signUpChild({
          parentName,
          phone,
          email,
          childFirstName: childName,
          childAge: parsedAge,
          participatedBefore: before === 'yes',
          message,
          acceptsDataUse: accepts,
          website,
        }),
      () => {
        const child = [childName.trim(), parsedAge !== null ? `${parsedAge} ani` : ''].filter(Boolean).join(', ')
        const state: ThanksState = {
          kind: 'signup',
          rows: [
            ['Părinte', parentName.trim()],
            ['Telefon', phone.trim()],
            ...(child ? ([['Copil', child]] as [string, string][]) : []),
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
      className="relative flex w-full max-w-[720px] flex-col gap-5 rounded-[24px] border border-line bg-white p-5 sm:p-10"
    >
      <div className="grid gap-5 sm:grid-cols-2 sm:gap-4">
        <TextField
          label="Numele dvs. complet"
          required
          autoComplete="name"
          placeholder="ex. Maria Popescu"
          value={parentName}
          error={errors.parentName}
          onChange={(e) => {
            setParentName(e.target.value)
            clear('parentName')
          }}
        />
        <TextField
          label="Număr de telefon"
          required
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="ex. 0712 345 678"
          value={phone}
          error={errors.phone}
          onChange={(e) => {
            setPhone(e.target.value)
            clear('phone')
          }}
        />
      </div>
      <TextField
        label="Adresa de email"
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
      <div className="grid gap-5 sm:grid-cols-2 sm:gap-4">
        <TextField
          label="Prenumele copilului"
          placeholder="ex. Andrei"
          value={childName}
          error={errors.childFirstName}
          onChange={(e) => {
            setChildName(e.target.value)
            clear('childFirstName')
          }}
        />
        <TextField
          label="Vârsta copilului"
          inputMode="numeric"
          placeholder="ex. 6 ani"
          value={childAge}
          error={errors.childAge}
          onChange={(e) => {
            setChildAge(e.target.value)
            clear('childAge')
          }}
        />
      </div>
      <RadioGroup<'yes' | 'no'>
        legend="Ați mai participat la astfel de activități?"
        name="participatedBefore"
        value={before}
        error={errors.participatedBefore}
        options={[
          { value: 'yes', label: 'Da' },
          { value: 'no', label: 'Nu' },
        ]}
        onChange={(v) => {
          setBefore(v)
          clear('participatedBefore')
        }}
      />
      <TextArea
        label="Mesaj"
        placeholder="Ceva ce ar trebui să știm? (opțional)"
        value={message}
        error={errors.message}
        onChange={(e) => {
          setMessage(e.target.value)
          clear('message')
        }}
      />
      <Consent
        label="Sunt de acord ca datele mele să fie folosite pentru înscrierea copilului la activități și pentru informări despre campanii gratuite viitoare. *"
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
        {busy ? 'Se trimite…' : 'Trimite înscrierea'}
      </Button>
    </form>
  )
}
