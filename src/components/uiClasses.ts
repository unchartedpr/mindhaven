/** Class-name builders for the shared UI primitives (kept apart from the components so fast refresh works). */

export type ButtonVariant = 'primary' | 'secondary' | 'danger'

export type ButtonSize = 'md' | 'sm'

const BUTTON_BASE =
  'inline-flex items-center justify-center rounded-full font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40'

const BUTTON_SIZES: Record<ButtonSize, string> = {
  md: 'min-h-11 px-5 py-2 text-sm',
  sm: 'min-h-9 px-3 py-1 text-xs',
}

const BUTTON_VARIANTS: Record<ButtonVariant, string> = {
  primary: 'bg-sage-600 text-white hover:bg-sage-700',
  secondary:
    'border border-sage-300 text-sage-700 hover:bg-sage-50 dark:border-sage-700 dark:text-sage-200 dark:hover:bg-sage-800',
  danger:
    'border border-clay-300 text-clay-700 hover:bg-clay-100 dark:border-clay-500/40 dark:text-clay-200 dark:hover:bg-clay-500/10',
}

export function buttonClass(variant: ButtonVariant = 'primary', extra = '', size: ButtonSize = 'md'): string {
  return `${BUTTON_BASE} ${BUTTON_SIZES[size]} ${BUTTON_VARIANTS[variant]} ${extra}`.trim()
}

export type CardTone = 'default' | 'warning' | 'danger'

const CARD_TONES: Record<CardTone, string> = {
  default: 'border-sage-200 bg-white dark:border-sage-800 dark:bg-sage-900/40',
  warning: 'border-clay-200 bg-clay-50 dark:border-clay-500/30 dark:bg-clay-500/10',
  danger: 'border-clay-200 bg-clay-50/60 dark:border-clay-500/30 dark:bg-clay-500/5',
}

export type CardSize = 'sm' | 'md' | 'lg'

const CARD_SIZES: Record<CardSize, string> = { sm: 'p-3', md: 'p-4', lg: 'p-8' }

export function cardClass(tone: CardTone = 'default', interactive = false, extra = '', size: CardSize = 'md'): string {
  const lift = interactive
    ? ' transition-all hover:-translate-y-0.5 hover:shadow-md motion-reduce:transition-none motion-reduce:hover:translate-y-0'
    : ''
  return `rounded-xl border ${CARD_SIZES[size]} shadow-sm ${CARD_TONES[tone]}${lift} ${extra}`.trim()
}
