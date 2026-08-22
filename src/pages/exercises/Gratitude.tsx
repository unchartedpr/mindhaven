import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ExerciseHeader } from '../../components/ExerciseHeader'
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
    gratitudeStore.add(filled)
    setSaved(true)
    setItems(['', '', ''])
  }

  if (saved) {
    return (
      <div className="flex flex-col items-center gap-4 text-center">
        <ExerciseHeader title="Gratitude note" subtitle="Saved to your journal." />
        <p className="text-4xl">✨</p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setSaved(false)}
            className="rounded-full border border-sage-300 px-5 py-2 text-sm font-medium text-sage-700 hover:bg-sage-50 dark:border-sage-700 dark:text-sage-200 dark:hover:bg-sage-800"
          >
            Add another
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
        title="Gratitude note"
        subtitle="List a few things you appreciate right now — they can be as small as a warm cup of tea."
      />

      <div className="flex flex-col gap-2">
        {items.map((item, i) => (
          <input
            key={i}
            value={item}
            onChange={(e) => updateItem(i, e.target.value)}
            placeholder={`${i + 1}. I'm grateful for...`}
            className="rounded-lg border border-sage-200 bg-white p-2.5 text-sm outline-none focus:border-sage-500 dark:border-sage-800 dark:bg-sage-900/40"
          />
        ))}
      </div>

      <button
        type="button"
        onClick={handleSave}
        className="rounded-full bg-sage-600 px-6 py-2.5 font-medium text-white hover:bg-sage-700"
      >
        Save
      </button>
    </div>
  )
}
