import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { IconTile, Point } from '../components/Bits'
import { useTitle } from '../lib/useTitle'
import { Button, ButtonLink } from '../components/Button'
import { Consent, Honeypot, RadioGroup, SelectField, TextField } from '../components/Field'
import { Icon, type IconName } from '../components/Icon'
import { bookBySlug, type BookContent } from '../content/books'
import { church } from '../content/church'
import { api, type AgeGroup, type BookInfo, type DeliveryMethod } from '../lib/api'
import { cx } from '../lib/cx'
import { ageGroups, isPhone, useFormSubmit } from '../lib/forms'
import { useSite } from '../lib/site'
import { NotFoundPage } from './NotFoundPage'
import type { ThanksState } from './ThanksPage'

/** Figma › "Carte · …" (six pages, one template). */
export function BookPage() {
  const { slug } = useParams()
  const content = bookBySlug(slug)
  const site = useSite()
  const info = site.books.find((b) => b.slug === slug)
  useTitle(content?.title ?? 'Pagina nu există')

  if (!content || !info) return <NotFoundPage />

  return (
    <>
      <Banner book={content} info={info} />
      <div className="lg:mx-auto lg:flex lg:max-w-[1354px] lg:items-start lg:gap-16 lg:px-8 lg:pt-[72px] lg:pb-24">
        <Description book={content} info={info} />
        <section id="comanda" className="scroll-mt-20 bg-surface-2 px-4 py-12 lg:sticky lg:top-28 lg:w-[520px] lg:shrink-0 lg:bg-transparent lg:p-0">
          <OrderForm book={content} info={info} />
        </section>
      </div>
    </>
  )
}

function Banner({ book, info }: { book: BookContent; info: BookInfo }) {
  const tags = [...(info.isForChildren ? ['Carte pentru copii'] : []), 'Gratuit', 'Livrare în Timișoara']
  return (
    <section className="relative overflow-hidden bg-ink">
      <img src={book.banner} alt="" className="absolute inset-0 size-full scale-105 object-cover opacity-60 blur-[2px]" />
      <div className="absolute inset-0 bg-ink/60" />
      <div className="container-page relative flex flex-col items-center gap-3.5 py-8 text-center lg:flex-row lg:gap-16 lg:py-[72px] lg:text-left">
        <img
          src={book.cover}
          alt={`Coperta cărții „${book.title}”`}
          className="h-[200px] w-[150px] rounded-[10px] bg-surface object-cover shadow-[0_20px_40px_rgb(0_0_0/0.35)] lg:h-[280px] lg:w-[210px] lg:rounded-xl"
        />
        <div className="flex flex-col items-center gap-4 lg:items-start">
          <nav aria-label="Cale" className="t-small hidden gap-2 lg:flex">
            <Link to="/carti-gratuite" className="text-line hover:text-white">
              Cărți gratuite
            </Link>
            <span className="text-muted">/</span>
            <span className="text-white">{book.title}</span>
          </nav>
          <p className="t-small text-line lg:hidden">{tags.join(' · ')}</p>
          <h1 className="t-h1 text-white">{book.heading}</h1>
          <ul className="hidden gap-2 lg:flex">
            {tags.map((t) => (
              <li key={t} className="t-small rounded-full bg-white/14 px-3 py-1.5 text-white">
                {t}
              </li>
            ))}
          </ul>
          {info.isAvailable ? (
            <ButtonLink to="#comanda" block className="mt-1 lg:hidden">
              Comandă gratuit
            </ButtonLink>
          ) : (
            <p className="t-body rounded-full bg-white/14 px-4 py-2 font-semibold text-white">Stoc epuizat</p>
          )}
        </div>
      </div>
    </section>
  )
}

function Description({ book, info }: { book: BookContent; info: BookInfo }) {
  // On a phone the description folds after the first paragraph ("Citește tot textul").
  const [open, setOpen] = useState(false)
  const steps: { icon: IconName; title: string; text: string }[] = [
    {
      icon: 'map-pin',
      title: 'Distribuim doar în Timișoara și împrejurimi',
      text: 'Din motive logistice, nu putem răspunde solicitărilor din orașe mai îndepărtate.',
    },
    {
      icon: 'phone',
      title: 'Te sunăm noi',
      text: 'După înscriere, un coleg te sună să confirme înscrierea și datele de livrare.',
    },
    info.allowsPickup
      ? {
          icon: 'truck',
          title: 'Livrare sau ridicare de la biserică',
          text: 'Un curier voluntar din biserica noastră te sună să stabiliți ziua și ora livrării – sau o poți ridica de la biserică.',
        }
      : {
          icon: 'truck',
          title: 'Livrare la domiciliu',
          text: 'Un curier voluntar din biserica noastră te sună să stabiliți ziua și ora livrării.',
        },
    { icon: 'gift', title: 'Complet gratuit', text: 'Nu trebuie să plătești nimic.' },
  ]

  return (
    <section className="container-page flex flex-col gap-5 pt-8 pb-12 lg:max-w-none lg:flex-1 lg:p-0">
      <div className={cx('relative flex flex-col gap-5', !open && 'max-lg:max-h-[156px] max-lg:overflow-hidden')}>
        <p className="t-lead text-ink max-lg:text-base max-lg:leading-[26px] max-lg:text-ink-2">{book.lead}</p>
        {book.paragraphs.map((p) => (
          <p key={p} className="t-body text-body">
            {p}
          </p>
        ))}
        {book.benefits && (
          <ul className="flex flex-col gap-2.5">
            {book.benefits.map((b) => (
              <Point key={b}>{b}</Point>
            ))}
          </ul>
        )}
        {book.closing && <p className="t-body font-semibold text-ink">{book.closing}</p>}
        {!open && <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white lg:hidden" />}
      </div>
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="t-body -mt-2 flex items-center gap-1.5 self-start font-semibold text-primary lg:hidden"
        >
          Citește tot textul
          <Icon name="chevron-down" size={18} />
        </button>
      )}

      <div className="flex flex-col gap-4 pt-4">
        <h2 className="t-h2 text-ink lg:text-2xl lg:leading-8 lg:font-semibold">Cum o poți primi?</h2>
        <ul className="flex flex-col gap-4">
          {steps.map((s) => (
            <li key={s.title} className="flex gap-3 lg:gap-4">
              <IconTile name={s.icon} />
              <div className="flex flex-col gap-0.5">
                <p className="t-body font-semibold text-ink">{s.title}</p>
                <p className="t-body text-body">{s.text}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {info.allowsPickup && (
        <>
          <div className="flex flex-col gap-2.5 rounded-2xl border border-line bg-surface-2 p-6">
            <p className="t-body font-semibold text-ink">Ridicare de la biserică</p>
            <p className="t-body text-body">{church.addressShort}</p>
            <ul className="flex flex-col gap-2.5">
              {church.pickupHours.map((h) => (
                <li key={h.day} className="t-body flex items-center gap-2.5">
                  <Icon name="clock" size={16} className="text-primary" />
                  <span className="font-semibold text-ink-2">{h.day}</span>
                  <span className="text-body">{h.times}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col gap-4 rounded-2xl bg-primary p-6 sm:flex-row sm:items-center sm:gap-5">
            <Icon name="users" size={32} className="text-white" />
            <div className="flex flex-1 flex-col gap-1">
              <p className="t-body font-semibold text-white">
                Vrei ca și copilul tău să descopere povestirile biblice alături de alți copii?
              </p>
              <p className="t-body text-line">În fiecare sâmbătă organizăm activități gratuite pentru copii.</p>
            </div>
            <ButtonLink to="/activitati-pentru-copii" variant="on-dark" size="s" className="self-start sm:self-center">
              Detalii
            </ButtonLink>
          </div>
        </>
      )}
    </section>
  )
}

function OrderForm({ book, info }: { book: BookContent; info: BookInfo }) {
  const navigate = useNavigate()
  const { errors, formError, busy, submit, clear } = useFormSubmit<{ reference: number }>()
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [method, setMethod] = useState<DeliveryMethod>('Delivery')
  const [address, setAddress] = useState('')
  const [ageGroup, setAgeGroup] = useState<AgeGroup | ''>('')
  const [hasBible, setHasBible] = useState<'yes' | 'no' | null>(null)
  const [acceptsArea, setAcceptsArea] = useState(false)
  const [acceptsData, setAcceptsData] = useState(false)
  const [website, setWebsite] = useState('')

  if (!info.isAvailable) {
    return (
      <div className="flex flex-col gap-4 rounded-[20px] border border-line bg-white p-5 lg:rounded-[24px] lg:p-8">
        <p className="t-eyebrow text-primary">{book.formEyebrow}</p>
        <h2 className="t-h2 text-ink">Stoc epuizat</h2>
        <p className="t-body text-body">
          Momentan nu mai avem această carte. Revino curând sau alege altă carte gratuită.
        </p>
        <ButtonLink to="/carti-gratuite" variant="secondary" icon="arrow-left">
          Vezi celelalte cărți
        </ButtonLink>
      </div>
    )
  }

  const delivering = method === 'Delivery'

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    const v: Record<string, string> = {}
    if (!fullName.trim()) v.fullName = 'Scrieți numele complet.'
    if (!phone.trim()) v.phone = 'Scrieți un număr de telefon.'
    else if (!isPhone(phone)) v.phone = 'Numărul de telefon nu pare corect.'
    if (delivering && !address.trim()) v.address = 'Scrieți adresa completă.'
    if (info.asksAgeGroup && !ageGroup) v.ageGroup = 'Alegeți grupa de vârstă.'
    if (info.asksBibleAtHome && hasBible === null) v.hasBibleAtHome = 'Alegeți un răspuns.'
    if (!acceptsArea) v.acceptsDeliveryArea = 'Confirmați că locuiți în Timișoara sau împrejurimi.'
    if (!acceptsData) v.acceptsDataUse = 'Avem nevoie de acordul dvs. pentru a vă putea livra cartea.'

    void submit(
      v,
      () =>
        api.orderBook({
          bookSlug: book.slug,
          fullName,
          phone,
          deliveryMethod: method,
          address: delivering ? address : '',
          ageGroup: info.asksAgeGroup ? (ageGroup as AgeGroup) : null,
          hasBibleAtHome: info.asksBibleAtHome ? hasBible === 'yes' : null,
          acceptsDeliveryArea: acceptsArea,
          acceptsDataUse: acceptsData,
          website,
        }),
      () => {
        const state: ThanksState = {
          kind: 'order',
          book: book.title,
          rows: [
            ['Carte', book.title],
            ['Nume', fullName.trim()],
            ['Telefon', phone.trim()],
            delivering ? ['Adresă', address.trim()] : ['Primire', 'Ridicare de la biserică'],
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
      className="relative flex flex-col gap-4 rounded-[20px] border border-line bg-white p-5 lg:gap-5 lg:rounded-[24px] lg:p-8 lg:shadow-[0_20px_50px_rgb(26_32_44/0.08)]"
    >
      <div className="flex flex-col gap-2 lg:gap-3">
        <p className="t-eyebrow text-primary">{book.formEyebrow}</p>
        <h2 className="t-h2 text-ink">{book.formTitle}</h2>
        <p className="t-body hidden text-body lg:block">
          Pentru Timișoara și localitățile din jur. Completează formularul și te sunăm noi.
        </p>
      </div>

      <TextField
        label="Nume complet"
        required
        autoComplete="name"
        placeholder="ex. Ion Popescu"
        value={fullName}
        error={errors.fullName}
        onChange={(e) => {
          setFullName(e.target.value)
          clear('fullName')
        }}
      />
      <TextField
        label="Număr de telefon"
        required
        type="tel"
        autoComplete="tel"
        inputMode="tel"
        placeholder="ex. 0712 345 678"
        value={phone}
        error={errors.phone}
        onChange={(e) => {
          setPhone(e.target.value)
          clear('phone')
        }}
      />

      {info.allowsPickup && (
        <RadioGroup<DeliveryMethod>
          legend="Cum vrei să o primești?"
          name="deliveryMethod"
          value={method}
          inline={false}
          error={errors.deliveryMethod}
          options={[
            { value: 'Delivery', label: 'Livrare la domiciliu' },
            { value: 'Pickup', label: 'O ridic de la biserica „Speranța”' },
          ]}
          onChange={(m) => {
            setMethod(m)
            clear('deliveryMethod')
            clear('address')
          }}
        />
      )}

      {delivering && (
        <TextField
          label="Adresa completă"
          required
          autoComplete="street-address"
          placeholder="Localitate, stradă, număr"
          value={address}
          error={errors.address}
          onChange={(e) => {
            setAddress(e.target.value)
            clear('address')
          }}
        />
      )}

      {info.asksAgeGroup && (
        <SelectField
          label="Grupa de vârstă"
          required
          placeholder="Alege grupa de vârstă"
          options={[...ageGroups]}
          value={ageGroup}
          error={errors.ageGroup}
          onChange={(e) => {
            setAgeGroup(e.target.value as AgeGroup)
            clear('ageGroup')
          }}
        />
      )}

      {info.asksBibleAtHome && (
        <RadioGroup<'yes' | 'no'>
          legend="Aveți Biblie în casă?"
          name="hasBibleAtHome"
          value={hasBible}
          error={errors.hasBibleAtHome}
          options={[
            { value: 'yes', label: 'Da' },
            { value: 'no', label: 'Nu' },
          ]}
          onChange={(v) => {
            setHasBible(v)
            clear('hasBibleAtHome')
          }}
        />
      )}

      <div className="flex flex-col gap-3 pt-1">
        <Consent
          label="Am înțeles că livrarea se face doar în Timișoara și împrejurimi. *"
          checked={acceptsArea}
          error={errors.acceptsDeliveryArea}
          onChange={(c) => {
            setAcceptsArea(c)
            clear('acceptsDeliveryArea')
          }}
        />
        <Consent
          label="Sunt de acord ca datele mele să fie folosite pentru livrarea cărții și pentru informări despre campanii gratuite viitoare. *"
          checked={acceptsData}
          error={errors.acceptsDataUse}
          onChange={(c) => {
            setAcceptsData(c)
            clear('acceptsDataUse')
          }}
        />
      </div>

      <Honeypot value={website} onChange={setWebsite} />

      {(formError || errors.bookSlug) && (
        <p role="alert" className="t-small flex items-start gap-2 rounded-md bg-danger/10 p-3 text-danger">
          <Icon name="alert" size={16} className="mt-0.5" />
          {formError ?? errors.bookSlug}
        </p>
      )}

      <Button type="submit" block disabled={busy}>
        {busy ? 'Se trimite…' : 'Trimite comanda'}
      </Button>
      <p className="t-small text-muted">Câmpurile marcate cu * sunt obligatorii.</p>
    </form>
  )
}
