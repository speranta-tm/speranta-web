import type { ComponentProps, ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { buttonClass, type ButtonSize, type ButtonStyle } from './buttonClass'
import { Icon, type IconName } from './Icon'

interface Common {
  variant?: ButtonStyle
  size?: ButtonSize
  icon?: IconName
  /** Full width (the forms, and every button on a phone where the design says so). */
  block?: boolean
  className?: string
  children: ReactNode
}

function Content({ icon, size = 'm', children }: Pick<Common, 'icon' | 'size' | 'children'>) {
  return (
    <>
      {icon && <Icon name={icon} size={size === 'm' ? 20 : 16} />}
      {children}
    </>
  )
}

export function Button({
  variant,
  size,
  icon,
  block,
  className,
  children,
  ...rest
}: Common & Omit<ComponentProps<'button'>, 'children' | 'className'>) {
  return (
    <button {...rest} className={buttonClass({ variant, size, block, className })}>
      <Content icon={icon} size={size}>
        {children}
      </Content>
    </button>
  )
}

/** A button-looking link. Internal paths use the router; anything with a scheme opens normally. */
export function ButtonLink({
  to,
  variant,
  size,
  icon,
  block,
  className,
  children,
  newTab,
}: Common & { to: string; newTab?: boolean }) {
  const cls = buttonClass({ variant, size, block, className })
  const content = (
    <Content icon={icon} size={size}>
      {children}
    </Content>
  )

  if (/^(https?:|mailto:|tel:|\/api\/)/.test(to) || to.startsWith('#')) {
    return (
      <a
        href={to}
        className={cls}
        {...(newTab ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      >
        {content}
      </a>
    )
  }

  return (
    <Link to={to} className={cls}>
      {content}
    </Link>
  )
}
