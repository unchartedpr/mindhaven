import { useEffect, useId, useState, type ComponentProps, type ReactNode } from 'react'
import { Link, type LinkProps } from 'react-router-dom'
import { buttonClass, cardClass, type ButtonSize, type ButtonVariant, type CardSize, type CardTone } from './uiClasses'

/**
 * Shared UI primitives. Keeping button/card/field styling in one place means a design
 * change (or an accessibility fix such as touch-target size) happens once, not in 30 files.
 */

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  type = 'button',
  ...props
}: ComponentProps<'button'> & { variant?: ButtonVariant; size?: ButtonSize }) {
  return <button type={type} className={buttonClass(variant, className, size)} {...props} />
}

export function ButtonLink({
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}: LinkProps & { variant?: ButtonVariant; size?: ButtonSize }) {
  return <Link className={buttonClass(variant, className, size)} {...props} />
}

export function Card({
  tone = 'default',
  size = 'md',
  className = '',
  ...props
}: ComponentProps<'div'> & { tone?: CardTone; size?: CardSize }) {
  return <div className={cardClass(tone, false, className, size)} {...props} />
}

export function PageHeader({ title, subtitle, children }: { title: string; subtitle?: ReactNode; children?: ReactNode }) {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-sage-800 dark:text-sage-50">{title}</h1>
      {subtitle && <p className="mt-1 text-sage-600 dark:text-sage-300">{subtitle}</p>}
      {children}
    </div>
  )
}

const FIELD_INPUT =
  'w-full rounded-lg border border-sage-200 bg-white p-2.5 text-sm outline-none focus:border-sage-500 dark:border-sage-800 dark:bg-sage-900/40'

export function TextArea({
  label,
  hint,
  className = '',
  ...props
}: ComponentProps<'textarea'> & { label: string; hint?: string }) {
  const id = useId()
  const hintId = `${id}-hint`
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-sage-700 dark:text-sage-200">
        {label}
      </label>
      {hint && (
        <p id={hintId} className="mb-1.5 text-sm text-sage-600 dark:text-sage-400">
          {hint}
        </p>
      )}
      <textarea id={id} aria-describedby={hint ? hintId : undefined} className={`${FIELD_INPUT} ${className}`} {...props} />
    </div>
  )
}

export function TextInput({
  label,
  hint,
  className = '',
  ...props
}: ComponentProps<'input'> & { label: string; hint?: string }) {
  const id = useId()
  const hintId = `${id}-hint`
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-sage-700 dark:text-sage-200">
        {label}
      </label>
      {hint && (
        <p id={hintId} className="mb-1.5 text-sm text-sage-600 dark:text-sage-400">
          {hint}
        </p>
      )}
      <input id={id} aria-describedby={hint ? hintId : undefined} className={`${FIELD_INPUT} ${className}`} {...props} />
    </div>
  )
}

/**
 * A destructive action that needs a second deliberate click. It disarms itself after a few
 * seconds or when focus leaves, so a stray tap can't leave a delete "loaded".
 */
export function ConfirmButton({
  children,
  confirmLabel = 'Click again to confirm',
  onConfirm,
  variant = 'danger',
  size = 'md',
  className = '',
  ...props
}: Omit<ComponentProps<'button'>, 'onClick'> & {
  confirmLabel?: string
  onConfirm: () => void
  variant?: ButtonVariant
  size?: ButtonSize
}) {
  const [armed, setArmed] = useState(false)

  useEffect(() => {
    if (!armed) return
    const t = window.setTimeout(() => setArmed(false), 5000)
    return () => window.clearTimeout(t)
  }, [armed])

  return (
    <>
      <Button
        variant={variant}
        size={size}
        className={className}
        onClick={() => {
          if (!armed) {
            setArmed(true)
            return
          }
          setArmed(false)
          onConfirm()
        }}
        onBlur={() => setArmed(false)}
        {...props}
        // While armed the visible text changes, so the accessible name must change with it.
        {...(armed ? { 'aria-label': confirmLabel } : {})}
      >
        {armed ? confirmLabel : children}
      </Button>
      {armed && (
        <span role="alert" className="sr-only">
          {confirmLabel}
        </span>
      )}
    </>
  )
}
