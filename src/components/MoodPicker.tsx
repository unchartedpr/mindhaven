import { MOOD_EMOJI, MOOD_LABELS, type MoodValue } from '../lib/types'

const VALUES: MoodValue[] = [1, 2, 3, 4, 5]

export function MoodPicker({
  value,
  onChange,
}: {
  value: MoodValue | null
  onChange: (v: MoodValue) => void
}) {
  return (
    <div role="radiogroup" aria-label="How are you feeling?" className="flex justify-between gap-2">
      {VALUES.map((v) => (
        <button
          key={v}
          type="button"
          role="radio"
          aria-checked={value === v}
          onClick={() => onChange(v)}
          className={`flex flex-1 flex-col items-center gap-1 rounded-xl border py-3 text-sm transition-colors ${
            value === v
              ? 'border-sage-500 bg-sage-100 dark:bg-sage-800'
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
