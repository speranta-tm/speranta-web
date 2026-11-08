import { useState } from 'react'
import { ApiError } from './api'

/**
 * Submits a public form and keeps what the page needs to show while it does:
 * per-field errors (from the client's own checks or from the API, both in
 * Romanian), one general error, and a busy flag.
 */
export function useFormSubmit<T>() {
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  /** Runs the client checks first; only a clean form reaches the API. */
  async function submit(
    clientErrors: Record<string, string>,
    send: () => Promise<T>,
    onDone: (result: T) => void,
  ) {
    setFormError(null)
    if (Object.keys(clientErrors).length > 0) {
      setErrors(clientErrors)
      focusFirstError()
      return
    }

    setErrors({})
    setBusy(true)
    try {
      onDone(await send())
    } catch (e) {
      if (e instanceof ApiError && Object.keys(e.fields).length > 0) {
        setErrors(e.fields)
        focusFirstError()
      } else {
        setFormError(
          e instanceof ApiError && e.status !== 0 && e.status !== 500
            ? e.message
            : 'Nu am putut trimite formularul. Verificați legătura la internet și încercați din nou.',
        )
      }
    } finally {
      setBusy(false)
    }
  }

  /** Clears one field's error as soon as the person changes it. */
  const clear = (field: string) =>
    setErrors((prev) => {
      if (!(field in prev)) return prev
      const next = { ...prev }
      delete next[field]
      return next
    })

  return { errors, formError, busy, submit, clear }
}

function focusFirstError() {
  // After React has painted the messages.
  requestAnimationFrame(() => {
    const first = document.querySelector<HTMLElement>('[aria-invalid="true"], fieldset:has(.text-danger) input')
    first?.focus()
    first?.scrollIntoView({ block: 'center', behavior: 'smooth' })
  })
}

export const isPhone = (v: string) => /^\+?[\d\s().-]{9,20}$/.test(v.trim())
export const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())

export const ageGroups = [
  { value: 'Under20', label: 'Sub 20' },
  { value: 'From20To30', label: '20 – 30' },
  { value: 'From30To40', label: '30 – 40' },
  { value: 'From40To50', label: '40 – 50' },
  { value: 'From50To70', label: '50 – 70' },
  { value: 'Over70', label: 'Peste 70' },
] as const
