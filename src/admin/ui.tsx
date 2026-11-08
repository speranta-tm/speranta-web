import { useEffect, useRef, type ReactNode } from 'react'
import { Icon } from '../components/Icon'
import { cx } from '../lib/cx'
import type { Tone } from './labels'

const tones: Record<Tone, string> = {
  new: 'bg-info/12 text-info',
  progress: 'bg-warning/12 text-warning',
  done: 'bg-success/12 text-success',
  cancelled: 'bg-danger/12 text-danger',
  neutral: 'bg-muted/12 text-muted',
}
const dots: Record<Tone, string> = {
  new: 'bg-info',
  progress: 'bg-warning',
  done: 'bg-success',
  cancelled: 'bg-danger',
  neutral: 'bg-muted',
}

/** Figma › StatusBadge. */
export function Badge({ tone, children }: { tone: Tone; children: ReactNode }) {
  return (
    <span className={cx('t-caption inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 whitespace-nowrap', tones[tone])}>
      <span className={cx('size-1.5 rounded-full', dots[tone])} />
      {children}
    </span>
  )
}

/** The warning-coloured envelope: this submission's notification email has not gone out yet. */
export function EmailPendingMark() {
  return (
    <span title="Emailul de notificare nu a plecat încă; se reîncearcă automat." className="text-warning">
      <Icon name="mail" size={16} />
      <span className="sr-only">Email netrimis încă</span>
    </span>
  )
}

/** Title + subtitle row at the top of each admin page. */
export function PageHead({ title, sub, children }: { title: string; sub?: ReactNode; children?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-3 lg:gap-4">
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <h1 className="text-[28px] leading-9 font-bold text-ink lg:text-[32px] lg:leading-10">{title}</h1>
        {sub && <p className="t-small text-muted">{sub}</p>}
      </div>
      {children}
    </div>
  )
}

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return <section className={cx('rounded-2xl border border-line bg-white', className)}>{children}</section>
}

/** The status filter pills above each list ("Toate", "Noi (2)" …). */
export function Filters<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T | undefined
  options: { value: T | undefined; label: string }[]
  onChange: (value: T | undefined) => void
}) {
  return (
    <div className="flex flex-wrap gap-2" role="tablist">
      {options.map((o) => (
        <button
          key={o.label}
          type="button"
          role="tab"
          aria-selected={value === o.value}
          onClick={() => onChange(o.value)}
          className={cx(
            't-label rounded-full border border-line px-3.5 py-2 transition-colors',
            value === o.value ? 'bg-ink text-white' : 'bg-white text-ink-2 hover:bg-surface',
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

export function SearchBox({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <label className="relative block w-full sm:w-[300px]">
      <span className="sr-only">Caută</span>
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-sm border border-line bg-white px-3.5 py-2.5 text-base text-ink outline-none placeholder:text-muted focus:border-primary"
      />
    </label>
  )
}

/** Figma › "Panou detaliu": the side sheet over the list. Esc or the backdrop closes it. */
export function Drawer({ onClose, children, label }: { onClose: () => void; children: ReactNode; label: string }) {
  const panel = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    panel.current?.focus()
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-ink/35" onClick={onClose} aria-hidden="true" />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        tabIndex={-1}
        className="relative flex h-full w-full max-w-[480px] flex-col gap-5 overflow-y-auto bg-white p-6 shadow-2xl outline-none sm:p-7"
      >
        {children}
      </div>
    </div>
  )
}

/** Centered dialog (the invite form). */
export function Modal({ onClose, children, label }: { onClose: () => void; children: ReactNode; label: string }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink/40" onClick={onClose} aria-hidden="true" />
      <div role="dialog" aria-modal="true" aria-label={label} className="relative flex w-full max-w-[480px] flex-col gap-4 rounded-[20px] bg-white p-7">
        {children}
      </div>
    </div>
  )
}

/** Figma › "Comutator": on/off switch. */
export function Switch({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cx('relative h-[22px] w-10 shrink-0 rounded-full transition-colors', checked ? 'bg-primary' : 'bg-line')}
    >
      <span
        className={cx(
          'absolute top-0.5 size-[18px] rounded-full bg-white shadow transition-[left]',
          checked ? 'left-[20px]' : 'left-0.5',
        )}
      />
    </button>
  )
}

/** A label/value line in the detail sheets. */
export function Fact({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex gap-3">
      <dt className="t-small w-32 shrink-0 pt-[3px] text-muted">{label}</dt>
      <dd className="t-body min-w-0 font-semibold break-words text-ink">{children}</dd>
    </div>
  )
}

export function ErrorNote({ children }: { children: ReactNode }) {
  return (
    <p role="alert" className="t-small flex items-start gap-2 rounded-md bg-danger/10 p-3 text-danger">
      <Icon name="alert" size={16} className="mt-0.5" />
      <span>{children}</span>
    </p>
  )
}

export function Loading() {
  return <div className="h-40 animate-pulse rounded-2xl bg-surface" aria-label="Se încarcă" />
}

/** Previous / next under the lists. */
export function Pager({ page, pageSize, total, go }: { page: number; pageSize: number; total: number; go: (p: number) => void }) {
  const pages = Math.ceil(total / pageSize)
  if (pages <= 1) return null
  return (
    <div className="t-small flex items-center justify-end gap-3 text-muted">
      <span>
        Pagina {page} din {pages}
      </span>
      <button type="button" disabled={page <= 1} onClick={() => go(page - 1)} className="rounded-full px-3 py-1.5 font-semibold text-primary hover:bg-surface disabled:opacity-40">
        ← Înapoi
      </button>
      <button type="button" disabled={page >= pages} onClick={() => go(page + 1)} className="rounded-full px-3 py-1.5 font-semibold text-primary hover:bg-surface disabled:opacity-40">
        Înainte →
      </button>
    </div>
  )
}
