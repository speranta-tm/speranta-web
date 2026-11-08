import { useRef, useState, type DragEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '../../components/Button'
import { Choice, TextArea, TextField } from '../../components/Field'
import { Icon } from '../../components/Icon'
import { coverFor } from '../../content/books'
import { apiUrl, ApiError } from '../../lib/api'
import { cx } from '../../lib/cx'
import { useTitle } from '../../lib/useTitle'
import { adminApi, type AdminBookDetail, type BookFields } from '../api'
import { useRemote } from '../data'
import { Card, ErrorNote, Loading, PageHead, Switch } from '../ui'

/** Figma › "Admin · Carte (editor)": add a book, or edit one, with everything its page shows. */
export function BookEditorPage() {
  const { id } = useParams()
  if (id === 'nou') return <Editor initial={null} />
  return <Existing id={Number(id)} />
}

function Existing({ id }: { id: number }) {
  const book = useRemote(`book/${id}`, () => adminApi.book(id))
  if (book.state === 'loading') return <Loading />
  if (book.state === 'error') return <ErrorNote>Cartea nu a putut fi încărcată.</ErrorNote>
  return <Editor key={id} initial={book.data} />
}

/** The page text is typed as plain paragraphs: one blank line between them. */
const toParagraphs = (text: string) =>
  text
    .split(/\n\s*\n/)
    .map((p) => p.replace(/\s*\n\s*/g, ' ').trim())
    .filter(Boolean)
const toLines = (text: string) =>
  text
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)

/** Same rule as the API: lowercase, no diacritics, dashes. Only to preview the address. */
const slugOf = (title: string) =>
  title
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80) || 'carte'

function Editor({ initial }: { initial: AdminBookDetail | null }) {
  useTitle(initial ? `Editează: ${initial.title}` : 'Carte nouă')
  const navigate = useNavigate()
  const [title, setTitle] = useState(initial?.title ?? '')
  const [heading, setHeading] = useState(initial?.heading ?? '')
  const [blurb, setBlurb] = useState(initial?.blurb ?? '')
  const [lead, setLead] = useState(initial?.lead ?? '')
  const [text, setText] = useState((initial?.paragraphs ?? []).join('\n\n'))
  const [benefits, setBenefits] = useState((initial?.benefits ?? []).join('\n'))
  const [closing, setClosing] = useState(initial?.closing ?? '')
  const [formTitle, setFormTitle] = useState(initial?.formTitle ?? '')
  const [cover, setCover] = useState<{ id: string | null; url: string | undefined }>({
    id: initial?.coverFileId ?? null,
    url: initial ? coverFor(initial.slug, initial.coverUrl, apiUrl) : undefined,
  })
  const [banner, setBanner] = useState<{ id: string | null; url: string | undefined }>({
    id: initial?.bannerFileId ?? null,
    url: initial?.bannerUrl ? apiUrl(initial.bannerUrl) : undefined,
  })
  const [flags, setFlags] = useState({
    isAvailable: initial?.isAvailable ?? true,
    asksAgeGroup: initial?.asksAgeGroup ?? true,
    asksBibleAtHome: initial?.asksBibleAtHome ?? false,
    allowsPickup: initial?.allowsPickup ?? false,
    isForChildren: initial?.isForChildren ?? false,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [busy, setBusy] = useState(false)
  const [saved, setSaved] = useState(false)

  const slug = initial?.slug ?? slugOf(title)
  const defaultFormTitle = `Primește gratuit „${title.trim() || '…'}”`

  async function save() {
    const v: Record<string, string> = {}
    if (!title.trim()) v.title = 'Scrie titlul cărții.'
    if (!blurb.trim()) v.blurb = 'Scrie o frază pentru pagina „Cărți gratuite”.'
    if (!lead.trim()) v.lead = 'Scrie introducerea.'
    if (!initial && !cover.id) v.coverFileId = 'Adaugă coperta cărții.'
    setErrors(v)
    setSaved(false)
    if (Object.keys(v).length) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    const body: BookFields = {
      title: title.trim(),
      heading: heading.trim() || null,
      blurb: blurb.trim(),
      lead: lead.trim(),
      paragraphs: toParagraphs(text),
      benefits: toLines(benefits),
      closing: closing.trim() || null,
      formEyebrow: initial?.formEyebrow ?? null,
      formTitle: formTitle.trim() || null,
      coverFileId: cover.id,
      bannerFileId: banner.id,
      ...flags,
    }

    setBusy(true)
    try {
      const result = initial ? await adminApi.saveBook(initial.id, body) : await adminApi.createBook(body)
      if (!initial) {
        navigate(`/admin/carti/${result.id}`, { replace: true })
      } else {
        setFormTitle(result.formTitle)
        setSaved(true)
      }
    } catch (e) {
      setErrors(e instanceof ApiError && Object.keys(e.fields).length ? { ...e.fields } : { form: 'Salvarea nu a reușit.' })
    } finally {
      setBusy(false)
    }
  }

  async function remove() {
    if (!initial || !window.confirm(`Ștergi definitiv cartea „${initial.title}”?`)) return
    try {
      await adminApi.deleteBook(initial.id)
      navigate('/admin/carti')
    } catch (e) {
      setErrors({ form: e instanceof ApiError && e.fields.id ? e.fields.id : 'Ștergerea nu a reușit.' })
    }
  }

  const flag = (key: keyof typeof flags) => (e: { target: { checked: boolean } }) =>
    setFlags((f) => ({ ...f, [key]: e.target.checked }))

  return (
    <>
      <PageHead title={initial ? initial.title : 'Carte nouă'} sub={`Pagina ${initial ? 'este' : 'va fi'} la /carti-gratuite/${slug}`}>
        {saved && <span className="t-small font-semibold text-success">Salvat. Pagina arată deja modificările.</span>}
        {initial && (
          <a
            href={`/carti-gratuite/${initial.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border-[1.5px] border-primary px-4 py-2 text-sm font-semibold text-primary hover:bg-surface"
          >
            <Icon name="external-link" size={16} /> Vezi pagina
          </a>
        )}
        <Button onClick={save} disabled={busy}>
          {busy ? 'Se salvează…' : 'Salvează'}
        </Button>
      </PageHead>
      {errors.form && <ErrorNote>{errors.form}</ErrorNote>}

      <div className="grid items-start gap-6 lg:grid-cols-[1fr_340px]">
        <Card className="flex flex-col gap-5 p-5 lg:p-7">
          <h2 className="t-h3 text-ink">Textul paginii</h2>
          <TextField label="Titlu" required placeholder="ex. Mesajul pentru familie" value={title} error={errors.title}
            help={initial ? 'Apare pe card și în lista cărților. Adresa paginii rămâne aceeași.' : 'Apare pe card, în lista cărților și în adresa paginii.'}
            onChange={(e) => setTitle(e.target.value)} />
          <TextField label="Titlul mare al paginii" placeholder="ex. Mesajul pentru familie – ediție ilustrată" value={heading} error={errors.heading}
            help="Opțional. Dacă rămâne gol, se folosește titlul." onChange={(e) => setHeading(e.target.value)} />
          <TextField label="Descriere scurtă" required placeholder="O frază pentru pagina „Cărți gratuite”" value={blurb} error={errors.blurb}
            onChange={(e) => setBlurb(e.target.value)} />
          <TextArea label="Introducere" required placeholder="Primul paragraf, scris mai mare" value={lead} error={errors.lead}
            onChange={(e) => setLead(e.target.value)} />
          <TextArea label="Text" placeholder="Restul descrierii. Lasă un rând liber între paragrafe." value={text} error={errors.paragraphs}
            rows={10} onChange={(e) => setText(e.target.value)} />
          <TextArea label="Puncte cu bifă" placeholder="Câte unul pe rând (opțional)" value={benefits} error={errors.benefits}
            onChange={(e) => setBenefits(e.target.value)} />
          <TextField label="Încheiere" placeholder="ex. Dă-ți o șansă să-L cunoști pe Dumnezeu prin Cuvântul Său." value={closing}
            error={errors.closing} help="Opțional, apare îngroșat." onChange={(e) => setClosing(e.target.value)} />
        </Card>

        <div className="flex flex-col gap-5">
          <ImageBox label="Copertă" required image={cover} error={errors.coverFileId}
            hint="JPG, PNG sau WebP, până la 5 MB"
            onChange={(f) => { setCover(f); setErrors((e) => ({ ...e, coverFileId: '' })) }} />
          <ImageBox label="Imagine de fundal (opțional)" image={banner} error={errors.bannerFileId}
            hint="Dacă lipsește, se folosește coperta" onChange={setBanner} removable />

          <Card className="flex flex-col gap-3 p-5">
            <p className="t-label text-ink">Formularul de comandă întreabă</p>
            <Choice type="checkbox" label="Grupa de vârstă" checked={flags.asksAgeGroup} onChange={flag('asksAgeGroup')} />
            <Choice type="checkbox" label="„Aveți Biblie în casă?”" checked={flags.asksBibleAtHome} onChange={flag('asksBibleAtHome')} />
            <Choice type="checkbox" label="Permite ridicarea de la biserică" checked={flags.allowsPickup} onChange={flag('allowsPickup')} />
            <Choice type="checkbox" label="Carte pentru copii" checked={flags.isForChildren} onChange={flag('isForChildren')} />
            <TextField label="Titlul formularului" placeholder={defaultFormTitle} value={formTitle} error={errors.formTitle}
              help="Dacă rămâne gol: „Primește gratuit „titlu””." onChange={(e) => setFormTitle(e.target.value)} />
          </Card>

          <Card className="flex items-center gap-3 p-5">
            <span className="t-small flex-1 text-ink-2">Activă pe site (se poate comanda)</span>
            <Switch checked={flags.isAvailable} onChange={(v) => setFlags((f) => ({ ...f, isAvailable: v }))} label="Activă pe site" />
          </Card>

          {initial && (
            <div className="flex flex-col gap-1">
              <Button size="s" variant="ghost" className="-ml-4 self-start" onClick={remove}>
                Șterge cartea
              </Button>
              {initial.orderCount > 0 && (
                <p className="t-caption text-muted">
                  Are {initial.orderCount} {initial.orderCount === 1 ? 'comandă' : 'comenzi'}, așa că nu se poate șterge; o poți opri.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

function ImageBox({
  label,
  required,
  image,
  hint,
  error,
  onChange,
  removable,
}: {
  label: string
  required?: boolean
  image: { id: string | null; url: string | undefined }
  hint: string
  error?: string
  onChange: (v: { id: string | null; url: string | undefined }) => void
  removable?: boolean
}) {
  const input = useRef<HTMLInputElement>(null)
  const [over, setOver] = useState(false)
  const [busy, setBusy] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  async function upload(file: File | undefined) {
    if (!file) return
    setBusy(true)
    setUploadError(null)
    try {
      const f = await adminApi.uploadImage(file)
      onChange({ id: f.id, url: apiUrl(f.url) })
    } catch (e) {
      setUploadError(e instanceof ApiError && e.fields.file ? e.fields.file : 'Imaginea nu a putut fi încărcată.')
    } finally {
      setBusy(false)
      if (input.current) input.current.value = ''
    }
  }

  const drop = (e: DragEvent) => {
    e.preventDefault()
    setOver(false)
    void upload(e.dataTransfer.files[0])
  }

  return (
    <Card className="flex flex-col gap-3 p-5">
      <p className="t-label text-ink">
        {label}
        {required && <span className="text-danger"> *</span>}
      </p>
      {image.url ? (
        <div className="flex items-center gap-4">
          <img src={image.url} alt="" className="h-[120px] w-[90px] rounded-lg bg-surface object-cover shadow" />
          <div className="flex flex-col gap-2">
            <Button size="s" variant="secondary" disabled={busy} onClick={() => input.current?.click()}>
              {busy ? 'Se încarcă…' : 'Înlocuiește'}
            </Button>
            {removable && (
              <Button size="s" variant="ghost" onClick={() => onChange({ id: null, url: undefined })}>
                Scoate
              </Button>
            )}
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => input.current?.click()}
          onDragOver={(e) => {
            e.preventDefault()
            setOver(true)
          }}
          onDragLeave={() => setOver(false)}
          onDrop={drop}
          className={cx(
            'flex flex-col items-center gap-2 rounded-xl border border-dashed px-4 py-7 text-center transition-colors',
            over ? 'border-primary bg-primary/5' : error ? 'border-danger' : 'border-line hover:bg-surface-2',
          )}
        >
          <Icon name="download" size={24} className="text-primary" />
          <span className="t-small text-body">{busy ? 'Se încarcă…' : 'Trage o imagine aici sau apasă'}</span>
          <span className="t-caption text-muted">{hint}</span>
        </button>
      )}
      <input ref={input} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={(e) => upload(e.target.files?.[0])} />
      {(uploadError || error) && <p className="t-small text-danger">{uploadError || error}</p>}
    </Card>
  )
}
