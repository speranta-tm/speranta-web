import { useCallback, useEffect, useRef, useState, type DragEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Button, ButtonLink } from '../../components/Button'
import { Choice, TextField } from '../../components/Field'
import { Icon } from '../../components/Icon'
import { apiUrl, ApiError } from '../../lib/api'
import { cx } from '../../lib/cx'
import { useTitle } from '../../lib/useTitle'
import { adminApi, type AdminAnnouncement, type AnnouncementStatus, type SaveAnnouncement } from '../api'
import { useRemote } from '../data'
import { ago, shortDate, when } from '../labels'
import { Badge, Card, ErrorNote, Loading, Modal, PageHead, Switch } from '../ui'

/** Figma › "Admin · Anunțuri". */
export function AnnouncementsPage() {
  useTitle('Anunțuri')
  const list = useRemote('announcements', () => adminApi.announcements())
  const published = list.state === 'ready' ? list.data.filter((a) => a.status === 'Published').length : 0
  const drafts = list.state === 'ready' ? list.data.length - published : 0

  return (
    <>
      <PageHead
        title="Anunțuri"
        sub={list.state === 'ready' ? `${published} ${published === 1 ? 'publicat' : 'publicate'} · ${drafts} ${drafts === 1 ? 'ciornă' : 'ciorne'}` : ' '}
      >
        <ButtonLink to="/admin/anunturi/nou" icon="calendar">
          Anunț nou
        </ButtonLink>
      </PageHead>
      {list.state === 'loading' && <Loading />}
      {list.state === 'error' && <ErrorNote>Nu am putut încărca anunțurile.</ErrorNote>}
      {list.state === 'ready' && (
        <Card>
          {list.data.length === 0 && <p className="t-body p-8 text-body">Niciun anunț încă. Apasă „Anunț nou”.</p>}
          <ul>
            {list.data.map((a) => (
              <li key={a.id} className="flex items-center gap-4 border-t border-line px-5 py-3.5 first:border-t-0">
                {a.coverUrl ? (
                  <img src={apiUrl(a.coverUrl)} alt="" className="h-12 w-[72px] shrink-0 rounded-lg object-cover" />
                ) : (
                  <span className="h-12 w-[72px] shrink-0 rounded-lg bg-surface" />
                )}
                <div className="flex min-w-0 flex-1 flex-col">
                  <Link to={`/admin/anunturi/${a.id}`} className="t-body truncate font-semibold text-ink hover:text-primary">
                    {a.title}
                  </Link>
                  <span className="t-small text-muted">
                    {a.status === 'Draft'
                      ? `Modificat ${when(a.updatedAt).toLowerCase()}`
                      : a.isLive
                        ? `Publicat ${shortDate(a.publishAt!)}`
                        : `Programat pentru ${when(a.publishAt!).toLowerCase()}`}
                  </span>
                </div>
                <Badge tone={a.status === 'Draft' ? 'neutral' : a.isLive ? 'done' : 'progress'}>
                  {a.status === 'Draft' ? 'Ciornă' : a.isLive ? 'Publicat' : 'Programat'}
                </Badge>
                <ButtonLink to={`/admin/anunturi/${a.id}`} variant="ghost" size="s" className="hidden sm:inline-flex">
                  Editează
                </ButtonLink>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </>
  )
}

/** datetime-local value ("2026-11-08T12:00") in this browser's time, from an ISO instant. */
const toLocalInput = (iso: string) => {
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

const BLOCKS = new Set(['P', 'H2', 'H3', 'UL', 'OL', 'BLOCKQUOTE'])

/**
 * The editor's HTML, as paragraphs. Browsers make a new line in a contentEditable as a
 * <div> (Chrome) or leave bare text at the top level, and the API keeps only p, h2/h3,
 * lists, links, bold and italic, so a <div> would vanish and its lines run together.
 * Here every top-level <div> becomes a <p>, and loose text and inline runs are wrapped
 * in one.
 */
function normalize(root: HTMLElement): string {
  const out = document.createElement('div')
  let loose: HTMLParagraphElement | null = null

  // A <p> or <div> holding a list or heading (Chrome nests them so) is not a
  // paragraph: its children are taken one level up instead.
  const holdsBlocks = (el: HTMLElement) =>
    Array.from(el.children).some((c) => BLOCKS.has(c.tagName) || c.tagName === 'DIV')
  const flat: Node[] = []
  const flatten = (parent: Node) => {
    for (const node of Array.from(parent.childNodes)) {
      const el = node.nodeType === Node.ELEMENT_NODE ? (node as HTMLElement) : null
      if (el && (el.tagName === 'P' || el.tagName === 'DIV') && holdsBlocks(el)) flatten(el)
      else flat.push(node)
    }
  }
  flatten(root)

  for (const node of flat) {
    const el = node.nodeType === Node.ELEMENT_NODE ? (node as HTMLElement) : null
    if (el && BLOCKS.has(el.tagName)) {
      loose = null
      out.appendChild(el.cloneNode(true))
    } else if (el && el.tagName === 'DIV') {
      loose = null
      const p = document.createElement('p')
      p.innerHTML = el.innerHTML
      out.appendChild(p)
    } else if (el?.tagName === 'BR') {
      loose = null
    } else if (node.textContent?.trim() || el) {
      loose ??= out.appendChild(document.createElement('p'))
      loose.appendChild(node.cloneNode(true))
    }
  }

  // Drop paragraphs that are only a line break.
  for (const p of Array.from(out.querySelectorAll('p'))) {
    if (!p.textContent?.trim() && !p.querySelector('img')) p.remove()
  }
  return out.innerHTML
}

/** Figma › "Admin · Anunț (editor)". */
export function AnnouncementEditorPage() {
  const { id } = useParams()
  if (id === 'nou') return <Editor key="new" initial={null} />
  return <ExistingEditor id={Number(id)} />
}

function ExistingEditor({ id }: { id: number }) {
  const a = useRemote(`announcement/${id}`, () => adminApi.announcement(id))
  if (a.state === 'loading') return <Loading />
  if (a.state === 'error') return <ErrorNote>Anunțul nu a putut fi încărcat.</ErrorNote>
  return <Editor key={id} initial={a.data} />
}

function Editor({ initial }: { initial: AdminAnnouncement | null }) {
  useTitle(initial ? `Editează: ${initial.title}` : 'Anunț nou')
  const navigate = useNavigate()
  const editor = useRef<HTMLDivElement>(null)
  const [id, setId] = useState<number | null>(initial?.id ?? null)
  const [title, setTitle] = useState(initial?.title ?? '')
  const [cover, setCover] = useState<{ id: string; url: string } | null>(
    initial?.coverFileId && initial.coverUrl ? { id: initial.coverFileId, url: initial.coverUrl } : null,
  )
  const [status, setStatus] = useState<AnnouncementStatus>(initial?.status ?? 'Draft')
  const future = initial?.publishAt && new Date(initial.publishAt) > new Date()
  const [mode, setMode] = useState<'now' | 'schedule'>(future ? 'schedule' : 'now')
  const [publishAt, setPublishAt] = useState(initial?.publishAt ? toLocalInput(initial.publishAt) : toLocalInput(new Date(Date.now() + 86_400_000).toISOString()))
  const [showOnHome, setShowOnHome] = useState(initial?.showOnHome ?? true)
  const [savedAt, setSavedAt] = useState<string | null>(initial?.updatedAt ?? null)
  const [dirty, setDirty] = useState(false)
  const [busy, setBusy] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [preview, setPreview] = useState(false)
  const [, setTick] = useState(0)

  // Load the body once; after that the editor owns it. New lines become <p>, not <div>.
  useEffect(() => {
    document.execCommand('defaultParagraphSeparator', false, 'p')
    if (editor.current && initial) editor.current.innerHTML = initial.bodyHtml
  }, [initial])

  // Keep "salvată acum X minute" honest.
  useEffect(() => {
    const t = window.setInterval(() => setTick((n) => n + 1), 30_000)
    return () => window.clearInterval(t)
  }, [])

  const body = () => (editor.current ? normalize(editor.current) : '')

  /**
   * When it goes live. "Programează" sends the chosen time. "Publică imediat" keeps the
   * original date of one that is already live (so an edit doesn't bump it to the top),
   * and otherwise means now, including for one that was scheduled for later.
   */
  function publishInstant(nextStatus: AnnouncementStatus): string | null {
    if (nextStatus !== 'Published') return null
    if (mode === 'schedule' && publishAt) return new Date(publishAt).toISOString()
    const original = initial?.publishAt
    return original && new Date(original) <= new Date() ? original : new Date().toISOString()
  }

  const payload = useCallback(
    (nextStatus: AnnouncementStatus): SaveAnnouncement => ({
      title: title.trim(),
      bodyHtml: body(),
      coverFileId: cover?.id ?? null,
      status: nextStatus,
      publishAt: publishInstant(nextStatus),
      showOnHome,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [title, cover, mode, publishAt, showOnHome],
  )

  const save = useCallback(
    async (nextStatus: AnnouncementStatus, quiet = false) => {
      if (!title.trim()) {
        if (!quiet) setErrors({ title: 'Scrie un titlu.' })
        return null
      }
      setBusy(!quiet)
      if (!quiet) setErrors({})
      try {
        const saved = id === null ? await adminApi.createAnnouncement(payload(nextStatus)) : await adminApi.saveAnnouncement(id, payload(nextStatus))
        if (id === null) {
          setId(saved.id)
          navigate(`/admin/anunturi/${saved.id}`, { replace: true })
        }
        setStatus(saved.status)
        setSavedAt(saved.updatedAt)
        setDirty(false)
        return saved
      } catch (e) {
        if (!quiet) setErrors(e instanceof ApiError && Object.keys(e.fields).length ? { ...e.fields } : { form: 'Salvarea nu a reușit.' })
        return null
      } finally {
        setBusy(false)
      }
    },
    [id, title, payload, navigate],
  )

  // Autosave drafts two seconds after the last change. A published announcement
  // changes only when someone presses "Salvează", so half an edit never goes live.
  useEffect(() => {
    if (!dirty || status !== 'Draft' || !title.trim()) return
    const t = window.setTimeout(() => void save('Draft', true), 2000)
    return () => window.clearTimeout(t)
  }, [dirty, status, title, save])

  const touch = () => setDirty(true)

  function format(command: string, value?: string) {
    editor.current?.focus()
    document.execCommand(command, false, value)
    touch()
  }

  function link() {
    const url = window.prompt('Adresa linkului (de ex. https://… sau /contact):')
    if (!url) return
    if (!/^(https?:\/\/|\/|mailto:|tel:)/i.test(url.trim())) return window.alert('Linkul trebuie să înceapă cu https://, / sau mailto:')
    format('createLink', url.trim())
  }

  async function upload(file: File | undefined) {
    if (!file) return
    setErrors((e) => ({ ...e, cover: '' }))
    try {
      const f = await adminApi.uploadImage(file)
      setCover({ id: f.id, url: f.url })
      touch()
    } catch (e) {
      setErrors((x) => ({ ...x, cover: e instanceof ApiError && e.fields.file ? e.fields.file : 'Imaginea nu a putut fi încărcată.' }))
    }
  }

  async function publish() {
    const saved = await save('Published')
    if (saved) navigate('/admin/anunturi')
  }

  async function remove() {
    if (id === null || !window.confirm('Ștergi definitiv acest anunț?')) return
    await adminApi.deleteAnnouncement(id)
    navigate('/admin/anunturi')
  }

  const tools: [string, string, () => void][] = [
    ['B', 'Îngroșat', () => format('bold')],
    ['I', 'Cursiv', () => format('italic')],
    ['Titlu', 'Titlu mic', () => format('formatBlock', 'h3')],
    ['• Listă', 'Listă cu puncte', () => format('insertUnorderedList')],
    ['1. Listă', 'Listă numerotată', () => format('insertOrderedList')],
    ['Link', 'Adaugă un link', link],
  ]

  return (
    <>
      <PageHead
        title={initial ? 'Editează anunțul' : 'Anunț nou'}
        sub={
          status === 'Draft'
            ? savedAt
              ? `Ciornă salvată automat ${ago(savedAt)}`
              : 'Ciornă: se salvează singură după ce scrii titlul'
            : `Publicat · modificările se aplică la „Salvează”`
        }
      >
        <Button size="s" variant="secondary" onClick={() => setPreview(true)}>
          Previzualizează
        </Button>
        <Button onClick={publish} disabled={busy}>
          {status === 'Published' ? 'Salvează' : mode === 'schedule' ? 'Programează' : 'Publică'}
        </Button>
      </PageHead>

      {errors.form && <ErrorNote>{errors.form}</ErrorNote>}

      <div className="grid items-start gap-6 lg:grid-cols-[1fr_340px]">
        <Card className="flex flex-col gap-5 p-5 lg:p-7">
          <TextField
            label="Titlu"
            required
            placeholder="ex. Program special de sărbători"
            value={title}
            error={errors.title}
            onChange={(e) => {
              setTitle(e.target.value)
              touch()
            }}
          />
          <div className="flex flex-col gap-1.5">
            <div role="toolbar" aria-label="Formatare" className="flex flex-wrap gap-1 rounded-[10px] border border-line bg-surface-2 p-1.5">
              {tools.map(([label, title, run]) => (
                <button
                  key={label}
                  type="button"
                  title={title}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={run}
                  className={cx('t-label rounded-md px-2.5 py-1.5 text-ink-2 hover:bg-white', label === 'B' && 'font-bold', label === 'I' && 'italic')}
                >
                  {label}
                </button>
              ))}
            </div>
            <div
              ref={editor}
              contentEditable
              role="textbox"
              aria-multiline="true"
              aria-label="Textul anunțului"
              data-placeholder="Scrie aici anunțul. Poți folosi paragrafe, titluri mici, liste și linkuri."
              onInput={touch}
              onPaste={(e) => {
                // Text only: pasting from Word or a web page would bring styles the site drops anyway.
                e.preventDefault()
                document.execCommand('insertText', false, e.clipboardData.getData('text/plain'))
              }}
              className="prose-anunt min-h-[320px] rounded-[10px] border border-line p-4 outline-none focus:border-primary empty:before:text-muted empty:before:content-[attr(data-placeholder)]"
            />
            {errors.bodyHtml && <p className="t-small text-danger">{errors.bodyHtml}</p>}
          </div>
        </Card>

        <div className="flex flex-col gap-5">
          <CoverBox cover={cover} error={errors.cover} onFile={upload} onRemove={() => { setCover(null); touch() }} />

          <Card className="flex flex-col gap-3 p-5">
            <p className="t-label text-ink">Publicare</p>
            <Choice type="radio" name="mode" label="Publică imediat" checked={mode === 'now'} onChange={() => { setMode('now'); touch() }} />
            <Choice type="radio" name="mode" label="Programează" checked={mode === 'schedule'} onChange={() => { setMode('schedule'); touch() }} />
            {mode === 'schedule' && (
              <TextField label="Data publicării" type="datetime-local" value={publishAt} onChange={(e) => { setPublishAt(e.target.value); touch() }} />
            )}
          </Card>

          <Card className="flex items-center gap-3 p-5">
            <span className="t-small flex-1 text-ink-2">Arată pe pagina principală</span>
            <Switch checked={showOnHome} onChange={(v) => { setShowOnHome(v); touch() }} label="Arată pe pagina principală" />
          </Card>

          {id !== null && (
            <div className="flex flex-wrap gap-2">
              {status === 'Published' && (
                <Button size="s" variant="secondary" onClick={() => void save('Draft')}>
                  Retrage (ciornă)
                </Button>
              )}
              <Button size="s" variant="ghost" onClick={remove}>
                Șterge anunțul
              </Button>
            </div>
          )}
        </div>
      </div>

      {preview && (
        <Modal onClose={() => setPreview(false)} label="Previzualizare">
          <div className="-m-7 max-h-[80vh] overflow-y-auto p-7">
            <p className="t-small mb-2 text-muted">Previzualizare</p>
            <h2 className="t-h1 mb-4 text-ink">{title || 'Fără titlu'}</h2>
            {cover && <img src={apiUrl(cover.url)} alt="" className="mb-4 max-h-60 w-full rounded-2xl object-cover" />}
            <div className="prose-anunt" dangerouslySetInnerHTML={{ __html: body() }} />
            <Button className="mt-6" onClick={() => setPreview(false)}>
              Închide
            </Button>
          </div>
        </Modal>
      )}
    </>
  )
}

function CoverBox({
  cover,
  error,
  onFile,
  onRemove,
}: {
  cover: { url: string } | null
  error?: string
  onFile: (f: File | undefined) => void
  onRemove: () => void
}) {
  const [over, setOver] = useState(false)
  const input = useRef<HTMLInputElement>(null)
  const drop = (e: DragEvent) => {
    e.preventDefault()
    setOver(false)
    onFile(e.dataTransfer.files[0])
  }

  return (
    <Card className="flex flex-col gap-3 p-5">
      <p className="t-label text-ink">Imagine de copertă</p>
      {cover ? (
        <div className="flex flex-col gap-2">
          <img src={apiUrl(cover.url)} alt="" className="aspect-[16/9] w-full rounded-xl object-cover" />
          <div className="flex gap-2">
            <Button size="s" variant="secondary" onClick={() => input.current?.click()}>
              Înlocuiește
            </Button>
            <Button size="s" variant="ghost" onClick={onRemove}>
              Scoate
            </Button>
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
            over ? 'border-primary bg-primary/5' : 'border-line hover:bg-surface-2',
          )}
        >
          <Icon name="download" size={24} className="text-primary" />
          <span className="t-small text-body">Trage o imagine aici sau apasă</span>
          <span className="t-caption text-muted">JPG, PNG sau WebP, până la 5 MB</span>
        </button>
      )}
      <input ref={input} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={(e) => onFile(e.target.files?.[0])} />
      {error && <p className="t-small text-danger">{error}</p>}
    </Card>
  )
}
