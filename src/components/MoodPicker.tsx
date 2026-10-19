import { useRef } from 'react'
import { MOOD_EMOJI, MOOD_LABELS, type MoodValue } from '../lib/types'

const VALUES: MoodValue[] = [1, 2, 3, 4, 5]

/**
 * A five-option radio group. Follows the standard keyboard pattern: Tab enters the group once (on the
 * selected option, or the first), and the arrow keys move and select within it.
 */
export function MoodPicker({
  value,
  onChange,
}: {
  value: MoodValue | null
  onChange: (v: MoodValue) => void
}) {
  const buttons = useRef<(HTMLButtonElement | null)[]>([])

  function move(from: number, delta: number) {
    const next = (from + delta + VALUES.length) % VALUES.length
    onChange(VALUES[next])
    buttons.current[next]?.focus()
  }

  function onKeyDown(e: React.KeyboardEvent, index: number) {
    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        e.preventDefault()
        move(index, 1)
        break
      case 'ArrowLeft':
      case 'ArrowUp':
        e.preventDefault()
        move(index, -1)
        break
      case 'Home':
        e.preventDefault()
        move(0, 0)
        break
      case 'End':
        e.preventDefault()
        move(VALUES.length - 1, 0)
        break
    }
  }

  const tabbable = value === null ? VALUES[0] : value

  return (
    <div role="radiogroup" aria-label="How are you feeling?" className="flex justify-between gap-2">
      {VALUES.map((v, i) => (
        <button
          key={v}
          ref={(el) => {
            buttons.current[i] = el
          }}
          type="button"
          role="radio"
          aria-checked={value === v}
          tabIndex={v === tabbable ? 0 : -1}
          onClick={() => onChange(v)}
          onKeyDown={(e) => onKeyDown(e, i)}
          className={`flex min-h-16 flex-1 flex-col items-center justify-center gap-1 rounded-xl border py-3 text-sm transition-colors ${
            value === v
              ? 'border-sage-600 bg-sage-100 dark:bg-sage-800'
              : 'border-sage-200 hover:bg-sage-50 dark:border-sage-800 dark:hover:bg-sage-800/50'
          }`}
        >
          <span className="text-2xl" aria-hidden="true">
            {MOOD_EMOJI[v]}
          </span>
          <span className="text-sage-700 dark:text-sage-200">{MOOD_LABELS[v]}</span>
        </button>
      ))}
    </div>
  )
}
