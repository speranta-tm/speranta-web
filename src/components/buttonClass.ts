import { cx } from '../lib/cx'

/** Figma › Button: Style = Primary | Secondary | On dark | Ghost, Size = M | S. */
export type ButtonStyle = 'primary' | 'secondary' | 'on-dark' | 'ghost'
export type ButtonSize = 'm' | 's'

const base =
  'inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-colors select-none disabled:cursor-not-allowed disabled:opacity-60'

const sizes: Record<ButtonSize, string> = {
  m: 'px-6 py-3 text-base leading-6',
  s: 'px-4 py-2 text-sm leading-6',
}

const variants: Record<ButtonStyle, string> = {
  primary: 'bg-primary text-white hover:bg-primary-hover',
  secondary: 'border-[1.5px] border-primary text-primary hover:bg-surface',
  'on-dark': 'border-[1.5px] border-white text-white hover:bg-white/10',
  ghost: 'text-primary hover:bg-surface',
}

export function buttonClass({ variant = 'primary', size = 'm', block, className }: {
  variant?: ButtonStyle
  size?: ButtonSize
  block?: boolean
  className?: string
}) {
  return cx(base, sizes[size], variants[variant], block && 'w-full', className)
}

