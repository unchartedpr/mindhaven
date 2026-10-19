import { useState } from 'react'
import { ExerciseHeader } from '../../components/ExerciseHeader'
import { Button, ButtonLink } from '../../components/ui'
import { gratitudeStore } from '../../lib/storage'

export function Gratitude() {
  const [items, setItems] = useState(['', '', ''])
  const [saved, setSaved] = useState(false)

  function updateItem(i: number, value: string) {
    setItems((prev) => prev.map((v, idx) => (idx === i ? value : v)))
  }

  function handleSave() {
    const filled = items.map((i) => i.trim()).filter(Boolean)
    if (filled.length === 0) return
    gratitudeStore.add({ items: filled })
    setSaved(true)
    setItems(['', '', ''])
  }

  if (saved) {
    return (
      <div className="flex flex-col items-center gap-4 text-center">
        <ExerciseHeader title="Gratitude note" subtitle="Saved to your journal." />
        <p className="text-4xl" aria-hidden="true">
          ✨
        </p>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => setSaved(false)}>
            Add another
          </Button>
          <ButtonLink to="/journal">View journal</ButtonLink>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <ExerciseHeader
        title="Gratitude note"
        subtitle="List a few things you appreciate right now — they can be as small as a warm cup of tea."
      />

      <div className="flex flex-col gap-2">
        {items.map((item, i) => (
          <input
            key={i}
            value={item}
            onChange={(e) => updateItem(i, e.target.value)}
            maxLength={200}
            placeholder={`${i + 1}. I'm grateful for...`}
            aria-label={`Gratitude ${i + 1} of ${items.length}`}
            className="min-h-11 rounded-lg border border-sage-200 bg-white p-2.5 text-sm outline-none focus:border-sage-500 dark:border-sage-800 dark:bg-sage-900/40"
          />
        ))}
      </div>

      <div>
        <Button onClick={handleSave}>Save</Button>
      </div>
    </div>
  )
}
