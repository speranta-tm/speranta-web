import { useId, type ComponentProps, type ReactNode } from 'react'
import { cx } from '../lib/cx'
import { Icon } from './Icon'

/** Figma › Field: Type = Text | Select | Textarea, State = Default | Focus | Error. */
interface FieldShell {
  label: string
  required?: boolean
  error?: string
  help?: string
  className?: string
}

const control =
  'w-full rounded-sm border bg-white px-3.5 py-3 text-base leading-[26px] text-ink placeholder:text-muted outline-none transition-[border-color,box-shadow] focus:border-2 focus:border-primary focus:px-[13px] focus:py-[11px] focus:shadow-[0_0_0_4px_rgb(0_85_129/0.12)]'

function Shell({
  id,
  label,
  required,
  error,
  help,
  className,
  children,
}: FieldShell & { id: string; children: ReactNode }) {
  return (
    <div className={cx('flex flex-col gap-1.5', className)}>
      <label htmlFor={id} className="t-label text-ink">
        {label}
        {required && <span className="text-danger"> *</span>}
      </label>
      {children}
      {error ? (
        <p id={`${id}-msg`} className="t-small flex items-center gap-1.5 text-danger">
          <Icon name="alert" size={16} />
          {error}
        </p>
      ) : (
        help && (
          <p id={`${id}-msg`} className="t-small text-muted">
            {help}
          </p>
        )
      )}
    </div>
  )
}

const stateClass = (error?: string) =>
  error ? 'border-2 border-danger px-[13px] py-[11px]' : 'border-line'

export function TextField({
  label,
  required,
  error,
  help,
  className,
  ...input
}: FieldShell & Omit<ComponentProps<'input'>, 'className'>) {
  const id = useId()
  return (
    <Shell id={id} label={label} required={required} error={error} help={help} className={className}>
      <input
        id={id}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={error || help ? `${id}-msg` : undefined}
        className={cx(control, stateClass(error))}
        {...input}
      />
    </Shell>
  )
}

export function TextArea({
  label,
  required,
  error,
  help,
  className,
  ...input
}: FieldShell & Omit<ComponentProps<'textarea'>, 'className'>) {
  const id = useId()
  return (
    <Shell id={id} label={label} required={required} error={error} help={help} className={className}>
      <textarea
        id={id}
        rows={4}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={error || help ? `${id}-msg` : undefined}
        className={cx(control, 'min-h-[120px] resize-y', stateClass(error))}
        {...input}
      />
    </Shell>
  )
}

export function SelectField({
  label,
  required,
  error,
  help,
  className,
  placeholder,
  options,
  value,
  ...select
}: FieldShell & {
  placeholder: string
  options: { value: string; label: string }[]
} & Omit<ComponentProps<'select'>, 'className' | 'children'>) {
  const id = useId()
  return (
    <Shell id={id} label={label} required={required} error={error} help={help} className={className}>
      <div className="relative">
        <select
          id={id}
          required={required}
          value={value}
          aria-invalid={error ? true : undefined}
          aria-describedby={error || help ? `${id}-msg` : undefined}
          className={cx(control, 'appearance-none pr-11', !value && 'text-muted', stateClass(error))}
          {...select}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((o) => (
            <option key={o.value} value={o.value} className="text-ink">
              {o.label}
            </option>
          ))}
        </select>
        <Icon
          name="chevron-down"
          size={20}
          className="pointer-events-none absolute top-1/2 right-3.5 -translate-y-1/2 text-ink"
        />
      </div>
    </Shell>
  )
}

/** Figma › Choice: Radio | Checkbox. */
export function Choice({
  type,
  label,
  className,
  ...input
}: { type: 'radio' | 'checkbox'; label: ReactNode; className?: string } & Omit<
  ComponentProps<'input'>,
  'type' | 'className'
>) {
  return (
    <label className={cx('flex cursor-pointer items-start gap-2.5', className)}>
      <span className="relative mt-[3px] flex size-5 shrink-0 items-center justify-center">
        <input
          type={type}
          className={cx(
            'peer size-5 cursor-pointer appearance-none border-[1.5px] border-muted bg-white transition-colors checked:border-primary checked:bg-primary',
            type === 'radio' ? 'rounded-full' : 'rounded-[5px]',
          )}
          {...input}
        />
        {type === 'radio' ? (
          <span className="pointer-events-none absolute size-2 rounded-full bg-white opacity-0 peer-checked:opacity-100" />
        ) : (
          <Icon
            name="check"
            size={14}
            className="pointer-events-none absolute text-white opacity-0 peer-checked:opacity-100"
          />
        )}
      </span>
      <span className="t-body text-ink">{label}</span>
    </label>
  )
}

/** A radio group with its question and error, laid out as in the design ("Da" / "Nu"). */
export function RadioGroup<T extends string>({
  legend,
  name,
  value,
  options,
  onChange,
  error,
  inline = true,
}: {
  legend: string
  name: string
  value: T | null
  options: { value: T; label: string }[]
  onChange: (value: T) => void
  error?: string
  inline?: boolean
}) {
  return (
    <fieldset className="flex flex-col gap-2.5">
      <legend className="t-small mb-2.5 text-ink">
        {legend} <span>*</span>
      </legend>
      <div className={cx('flex', inline ? 'flex-wrap gap-6' : 'flex-col gap-2.5')}>
        {options.map((o) => (
          <Choice
            key={o.value}
            type="radio"
            name={name}
            label={o.label}
            checked={value === o.value}
            onChange={() => onChange(o.value)}
          />
        ))}
      </div>
      {error && (
        <p className="t-small flex items-center gap-1.5 text-danger">
          <Icon name="alert" size={16} />
          {error}
        </p>
      )}
    </fieldset>
  )
}

/** A consent checkbox with its own error line. */
export function Consent({
  label,
  checked,
  onChange,
  error,
}: {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
  error?: string
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Choice
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        label={<span className="t-small text-ink">{label}</span>}
      />
      {error && (
        <p className="t-small flex items-center gap-1.5 pl-[30px] text-danger">
          <Icon name="alert" size={16} />
          {error}
        </p>
      )}
    </div>
  )
}

/**
 * The hidden "website" field. A person never sees or fills it; a form-filling bot
 * usually does, and the API then quietly keeps nothing. Off-screen rather than
 * display:none, because some bots skip fields that are display:none.
 */
export function Honeypot({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div aria-hidden="true" className="absolute -left-[10000px] h-px w-px overflow-hidden">
      <label>
        Website
        <input
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </label>
    </div>
  )
}
