import { useState } from 'react'
import { ExerciseHeader } from '../../components/ExerciseHeader'
import { Button, ButtonLink, TextArea } from '../../components/ui'
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
        <p className="text-4xl" aria-hidden="true">
          🔄
        </p>
        <p className="text-sage-600 dark:text-sage-300">
          You just gave yourself a more balanced perspective — that's real work.
        </p>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => setSaved(false)}>
            Do another
          </Button>
          <ButtonLink to="/journal">View journal</ButtonLink>
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
        <TextArea
          key={field.key}
          label={field.label}
          rows={2}
          maxLength={5000}
          value={form[field.key]}
          onChange={(e) => setForm((f) => ({ ...f, [field.key]: e.target.value }))}
          placeholder={field.placeholder}
        />
      ))}

      <div>
        <Button disabled={!canSave} onClick={handleSave}>
          Save to journal
        </Button>
      </div>
    </div>
  )
}
