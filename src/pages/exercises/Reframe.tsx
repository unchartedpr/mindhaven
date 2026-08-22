import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ExerciseHeader } from '../../components/ExerciseHeader'
import { reframeStore } from '../../lib/storage'

const FIELDS = [
  { key: 'situation', label: 'What happened?', placeholder: 'Describe the situation briefly.' },
  {
    key: 'automaticThought',
    label: "What's the automatic thought?",
    placeholder: 'The first thought that came to mind.',
  },
  {
    key: 'evidenceFor',
    label: 'What evidence supports this thought?',
    placeholder: 'Facts, not feelings.',
  },
  {
    key: 'evidenceAgainst',
    label: "What evidence doesn't support it?",
    placeholder: 'Is there another way to see this?',
  },
  {
    key: 'balancedThought',
    label: "What's a more balanced thought?",
    placeholder: 'A fairer, more complete way to think about it.',
  },
] as const

type FormState = Record<(typeof FIELDS)[number]['key'], string>

const EMPTY: FormState = {
  situation: '',
  automaticThought: '',
  evidenceFor: '',
  evidenceAgainst: '',
  balancedThought: '',
}

export function Reframe() {
  const [form, setForm] = useState<FormState>(EMPTY)
  const [saved, setSaved] = useState(false)

  function handleSave() {
    reframeStore.add(form)
    setSaved(true)
    setForm(EMPTY)
  }

  const canSave = form.situation.trim() && form.automaticThought.trim()

  if (saved) {
    return (
      <div className="flex flex-col items-center gap-4 text-center">
        <ExerciseHeader title="Thought reframing" subtitle="Saved to your journal." />
        <p className="text-4xl">🔄</p>
        <p className="text-sage-600 dark:text-sage-300">
          You just gave yourself a more balanced perspective — that's real work.
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setSaved(false)}
            className="rounded-full border border-sage-300 px-5 py-2 text-sm font-medium text-sage-700 hover:bg-sage-50 dark:border-sage-700 dark:text-sage-200 dark:hover:bg-sage-800"
          >
            Do another
          </button>
          <Link
            to="/journal"
            className="rounded-full bg-sage-600 px-5 py-2 text-sm font-medium text-white hover:bg-sage-700"
          >
            View journal
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <ExerciseHeader
        title="Thought reframing"
        subtitle="A CBT-style worksheet to examine a difficult thought and find a more balanced one."
      />

      {FIELDS.map((field) => (
        <div key={field.key}>
          <label htmlFor={field.key} className="mb-1.5 block text-sm font-medium text-sage-700 dark:text-sage-200">
            {field.label}
          </label>
          <textarea
            id={field.key}
            rows={2}
            value={form[field.key]}
            onChange={(e) => setForm((f) => ({ ...f, [field.key]: e.target.value }))}
            placeholder={field.placeholder}
            className="w-full rounded-lg border border-sage-200 bg-white p-2.5 text-sm outline-none focus:border-sage-500 dark:border-sage-800 dark:bg-sage-900/40"
          />
        </div>
      ))}

      <button
        type="button"
        disabled={!canSave}
        onClick={handleSave}
        className="rounded-full bg-sage-600 px-6 py-2.5 font-medium text-white hover:bg-sage-700 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Save to journal
      </button>
    </div>
  )
}
