import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ExerciseHeader } from '../../components/ExerciseHeader'
import { worryStore } from '../../lib/storage'

export function WorryTime() {
  const [worry, setWorry] = useState('')
  const [saved, setSaved] = useState(false)

  function handleSave() {
    if (!worry.trim()) return
    worryStore.add(worry.trim())
    setSaved(true)
    setWorry('')
  }

  if (saved) {
    return (
      <div className="flex flex-col items-center gap-4 text-center">
        <ExerciseHeader title="Worry time" subtitle="Your worry has been set aside." />
        <p className="text-4xl">📦</p>
        <p className="max-w-sm text-sage-600 dark:text-sage-300">
          You've written it down, which means you don't have to carry it in your head right now. If
          it resurfaces today, you can gently remind yourself: "I already wrote that down — I'll
          think about it later."
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setSaved(false)}
            className="rounded-full border border-sage-300 px-5 py-2 text-sm font-medium text-sage-700 hover:bg-sage-50 dark:border-sage-700 dark:text-sage-200 dark:hover:bg-sage-800"
          >
            Add another worry
          </button>
          <Link
            to="/exercises"
            className="rounded-full bg-sage-600 px-5 py-2 text-sm font-medium text-white hover:bg-sage-700"
          >
            Back to exercises
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <ExerciseHeader
        title="Worry time"
        subtitle="A technique for when a worry keeps circling: write it down fully, then consciously set it aside for later. You can't un-know it, but you don't have to solve it this second."
      />

      <div>
        <label htmlFor="worry" className="mb-1.5 block text-sm font-medium text-sage-700 dark:text-sage-200">
          What's on your mind?
        </label>
        <textarea
          id="worry"
          rows={5}
          value={worry}
          onChange={(e) => setWorry(e.target.value)}
          placeholder="Write out the worry in as much detail as you need to."
          className="w-full rounded-lg border border-sage-200 bg-white p-3 text-sm outline-none focus:border-sage-500 dark:border-sage-800 dark:bg-sage-900/40"
        />
      </div>

      <button
        type="button"
        disabled={!worry.trim()}
        onClick={handleSave}
        className="rounded-full bg-sage-600 px-6 py-2.5 font-medium text-white hover:bg-sage-700 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Set this worry aside
      </button>
    </div>
  )
}
