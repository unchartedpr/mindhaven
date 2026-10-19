import type { SafetyContact } from '../lib/types'
import { Button } from './ui'

const INPUT =
  'min-h-11 w-full rounded-lg border border-sage-200 bg-white p-2.5 text-sm outline-none focus:border-sage-500 dark:border-sage-800 dark:bg-sage-900/40'

interface BaseProps {
  legend: string
  hint?: string
  max?: number
}

/** An editable list of short text lines (add / edit / remove). Controlled by the parent. */
export function StringListEditor({
  legend,
  hint,
  values,
  onChange,
  placeholder,
  max = 10,
}: BaseProps & { values: string[]; onChange: (next: string[]) => void; placeholder?: string }) {
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="text-base font-semibold text-sage-800 dark:text-sage-100">{legend}</legend>
      {hint && <p className="text-sm text-sage-700 dark:text-sage-300">{hint}</p>}
      {values.map((value, i) => (
        <div key={i} className="flex gap-2">
          <input
            className={INPUT}
            value={value}
            maxLength={200}
            placeholder={placeholder}
            aria-label={`${legend}, item ${i + 1}`}
            onChange={(e) => onChange(values.map((v, idx) => (idx === i ? e.target.value : v)))}
          />
          <Button
            variant="secondary"
            size="sm"
            aria-label={`Remove ${legend}, item ${i + 1}`}
            onClick={() => onChange(values.filter((_, idx) => idx !== i))}
          >
            Remove
          </Button>
        </div>
      ))}
      {values.length < max && (
        <div>
          <Button variant="secondary" size="sm" onClick={() => onChange([...values, ''])}>
            + Add
          </Button>
        </div>
      )}
    </fieldset>
  )
}

/** An editable list of people/organisations with an optional phone number. */
export function ContactListEditor({
  legend,
  hint,
  values,
  onChange,
  max = 5,
}: BaseProps & { values: SafetyContact[]; onChange: (next: SafetyContact[]) => void }) {
  const update = (i: number, patch: Partial<SafetyContact>) =>
    onChange(values.map((v, idx) => (idx === i ? { ...v, ...patch } : v)))

  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="text-base font-semibold text-sage-800 dark:text-sage-100">{legend}</legend>
      {hint && <p className="text-sm text-sage-700 dark:text-sage-300">{hint}</p>}
      {values.map((contact, i) => (
        <div key={i} className="flex flex-col gap-2 sm:flex-row">
          <input
            className={INPUT}
            value={contact.name}
            maxLength={100}
            placeholder="Name"
            aria-label={`${legend}, name ${i + 1}`}
            onChange={(e) => update(i, { name: e.target.value })}
          />
          <input
            className={INPUT}
            value={contact.phone}
            maxLength={40}
            inputMode="tel"
            placeholder="Phone (optional)"
            aria-label={`${legend}, phone ${i + 1}`}
            onChange={(e) => update(i, { phone: e.target.value })}
          />
          <Button
            variant="secondary"
            size="sm"
            aria-label={`Remove ${legend}, contact ${i + 1}`}
            onClick={() => onChange(values.filter((_, idx) => idx !== i))}
          >
            Remove
          </Button>
        </div>
      ))}
      {values.length < max && (
        <div>
          <Button variant="secondary" size="sm" onClick={() => onChange([...values, { name: '', phone: '' }])}>
            + Add a person
          </Button>
        </div>
      )}
    </fieldset>
  )
}
