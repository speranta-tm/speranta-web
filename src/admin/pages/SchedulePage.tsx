import { useRef, useState } from 'react'
import { Button } from '../../components/Button'
import { SelectField, TextField } from '../../components/Field'
import { Icon } from '../../components/Icon'
import { apiUrl, ApiError, type DayOfWeek } from '../../lib/api'
import { dayName } from '../../lib/format'
import { useTitle } from '../../lib/useTitle'
import { adminApi, type Schedule } from '../api'
import { useRemote } from '../data'
import { count, shortDate, size } from '../labels'
import { Card, ErrorNote, Loading, PageHead } from '../ui'

const days: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const hhmm = (t: string) => t.slice(0, 5)
const isTime = (t: string) => /^([01]\d|2[0-3]):[0-5]\d$/.test(t)

/** Figma › "Admin · Program & pliant". */
export function SchedulePage() {
  useTitle('Program & pliant')
  const schedule = useRemote('schedule', () => adminApi.schedule())

  return schedule.state === 'loading' ? (
    <Loading />
  ) : schedule.state === 'error' ? (
    <ErrorNote>Programul nu a putut fi încărcat.</ErrorNote>
  ) : (
    <>
      <ScheduleForm initial={schedule.data} />
      <FlyerCard />
    </>
  )
}

function ScheduleForm({ initial }: { initial: Schedule }) {
  const [services, setServices] = useState(initial.services.map((s) => ({ ...s, start: hhmm(s.start), end: hhmm(s.end) })))
  const [groups, setGroups] = useState(initial.kidsGroups.map((g) => ({ ...g, start: hhmm(g.start), end: hhmm(g.end) })))
  const [phone, setPhone] = useState(initial.kidsPhone)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [busy, setBusy] = useState(false)
  const [saved, setSaved] = useState(false)

  async function save() {
    const v: Record<string, string> = {}
    services.forEach((s, i) => {
      if (!isTime(s.start)) v[`services[${i}].start`] = 'Ora ca 09:30.'
      if (!isTime(s.end)) v[`services[${i}].end`] = 'Ora ca 12:00.'
      else if (isTime(s.start) && s.end <= s.start) v[`services[${i}].end`] = 'După ora de început.'
    })
    groups.forEach((g, i) => {
      if (!g.label.trim()) v[`kidsGroups[${i}].label`] = 'Scrie numele grupei.'
      if (!isTime(g.start)) v[`kidsGroups[${i}].start`] = 'Ora ca 10:00.'
      if (!isTime(g.end)) v[`kidsGroups[${i}].end`] = 'Ora ca 10:50.'
      else if (isTime(g.start) && g.end <= g.start) v[`kidsGroups[${i}].end`] = 'După ora de început.'
    })
    setErrors(v)
    setSaved(false)
    if (Object.keys(v).length) return

    setBusy(true)
    try {
      await adminApi.saveSchedule({
        services: services.map((s) => ({ ...s, start: `${s.start}:00`, end: `${s.end}:00` })),
        kidsGroups: groups.map((g) => ({ ...g, start: `${g.start}:00`, end: `${g.end}:00` })),
        kidsPhone: phone,
      })
      setSaved(true)
    } catch (e) {
      setErrors(e instanceof ApiError && Object.keys(e.fields).length ? { ...e.fields } : { form: 'Salvarea nu a reușit.' })
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <PageHead title="Program & pliant" sub="Apare pe pagina principală, în subsol și pe pagina de contact">
        {saved && <span className="t-small font-semibold text-success">Salvat. Site-ul arată deja noul program.</span>}
        <Button onClick={save} disabled={busy}>
          {busy ? 'Se salvează…' : 'Salvează'}
        </Button>
      </PageHead>
      {errors.form && <ErrorNote>{errors.form}</ErrorNote>}

      <div className="grid items-start gap-6 lg:grid-cols-2">
        <Card className="flex flex-col gap-3 p-6">
          <h2 className="t-h3 text-ink">Programul serviciilor</h2>
          {services.map((s, i) => (
            <div key={i} className="flex items-end gap-3">
              <SelectField
                label="Zi"
                placeholder="Alege ziua"
                className="flex-1"
                value={s.day}
                options={days.map((d) => ({ value: d, label: dayName[d] }))}
                onChange={(e) => setServices(services.map((x, j) => (j === i ? { ...x, day: e.target.value as DayOfWeek } : x)))}
              />
              <TextField label="De la" className="w-[104px]" inputMode="numeric" placeholder="09:00" value={s.start} error={errors[`services[${i}].start`]} onChange={(e) => setServices(services.map((x, j) => (j === i ? { ...x, start: e.target.value } : x)))} />
              <TextField label="Până la" className="w-[104px]" inputMode="numeric" placeholder="12:00" value={s.end} error={errors[`services[${i}].end`]} onChange={(e) => setServices(services.map((x, j) => (j === i ? { ...x, end: e.target.value } : x)))} />
              <button type="button" aria-label="Șterge intervalul" onClick={() => setServices(services.filter((_, j) => j !== i))} className="mb-3 p-2 text-muted hover:text-danger">
                <Icon name="close" size={20} />
              </button>
            </div>
          ))}
          <Button size="s" variant="ghost" className="-ml-4 self-start" onClick={() => setServices([...services, { day: 'Saturday', start: '', end: '' }])}>
            + Adaugă un interval
          </Button>
        </Card>

        <Card className="flex flex-col gap-3 p-6">
          <h2 className="t-h3 text-ink">Activități pentru copii</h2>
          {groups.map((g, i) => (
            <div key={i} className="flex items-end gap-3">
              <TextField label="Grupa" className="flex-1" value={g.label} error={errors[`kidsGroups[${i}].label`]} onChange={(e) => setGroups(groups.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))} />
              <TextField label="De la" className="w-[96px]" inputMode="numeric" value={g.start} error={errors[`kidsGroups[${i}].start`]} onChange={(e) => setGroups(groups.map((x, j) => (j === i ? { ...x, start: e.target.value } : x)))} />
              <TextField label="Până la" className="w-[96px]" inputMode="numeric" value={g.end} error={errors[`kidsGroups[${i}].end`]} onChange={(e) => setGroups(groups.map((x, j) => (j === i ? { ...x, end: e.target.value } : x)))} />
            </div>
          ))}
          <TextField label="Telefon pentru înscrieri" type="tel" value={phone} error={errors.kidsPhone} onChange={(e) => setPhone(e.target.value)} />
        </Card>
      </div>
    </>
  )
}

function FlyerCard() {
  const flyer = useRemote('flyer', () => adminApi.flyer())
  const input = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function upload(file: File | undefined) {
    if (!file) return
    setBusy(true)
    setError(null)
    try {
      flyer.set(await adminApi.uploadFlyer(file))
    } catch (e) {
      setError(e instanceof ApiError && e.fields.file ? e.fields.file : 'Pliantul nu a putut fi încărcat.')
    } finally {
      setBusy(false)
      if (input.current) input.current.value = ''
    }
  }

  const current = flyer.state === 'ready' ? flyer.data : undefined

  return (
    <Card className="flex scroll-mt-6 flex-col gap-3 p-6" >
      <h2 id="pliant" className="t-h3 scroll-mt-6 text-ink">
        Pliantul lunar
      </h2>
      {current ? (
        <div className="flex flex-wrap items-center gap-3.5 rounded-xl bg-surface-2 px-4 py-3.5">
          <Icon name="book-open" size={24} className="text-primary" />
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="t-body truncate font-semibold text-ink">{current.fileName}</span>
            <span className="t-small text-muted">
              Încărcat {shortDate(current.uploadedAt)} · {size(current.sizeBytes)} · descărcat de{' '}
              {count(current.downloads, 'dată', 'ori')}
            </span>
          </div>
          <Button size="s" variant="secondary" disabled={busy} onClick={() => input.current?.click()}>
            {busy ? 'Se încarcă…' : 'Înlocuiește'}
          </Button>
          <a href={apiUrl(current.url)} target="_blank" rel="noopener noreferrer" className="t-small inline-flex items-center gap-1.5 rounded-full px-4 py-2 font-semibold text-primary hover:bg-white">
            <Icon name="external-link" size={16} /> Deschide
          </a>
        </div>
      ) : (
        flyer.state === 'ready' && (
          <div className="flex flex-wrap items-center gap-3 rounded-xl bg-surface-2 px-4 py-3.5">
            <span className="t-body flex-1 text-body">Niciun pliant încărcat încă.</span>
            <Button size="s" disabled={busy} onClick={() => input.current?.click()}>
              {busy ? 'Se încarcă…' : 'Încarcă pliantul (PDF)'}
            </Button>
          </div>
        )
      )}
      <input ref={input} type="file" accept="application/pdf" hidden onChange={(e) => upload(e.target.files?.[0])} />
      {error && <ErrorNote>{error}</ErrorNote>}
      <p className="t-small text-muted">
        Butonul „Descarcă pliantul lunar” de pe site deschide mereu ultimul fișier încărcat aici
        {current ? '.' : ' (până atunci, linkul Google Drive de pe vechiul site).'}
      </p>
    </Card>
  )
}
