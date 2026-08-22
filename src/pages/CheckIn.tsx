import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MoodPicker } from '../components/MoodPicker'
import { moodStore } from '../lib/storage'
import { MOOD_EMOJI, MOOD_TAGS, type MoodEntry, type MoodValue } from '../lib/types'

export function CheckIn() {
  const navigate = useNavigate()
  const [mood, setMood] = useState<MoodValue | null>(null)
  const [tags, setTags] = useState<string[]>([])
  const [note, setNote] = useState('')
  const [saved, setSaved] = useState(false)
  const [history, setHistory] = useState<MoodEntry[]>(() => moodStore.all().slice(0, 7))

  function toggleTag(tag: string) {
    setTags((t) => (t.includes(tag) ? t.filter((x) => x !== tag) : [...t, tag]))
  }

  function handleSave() {
    if (mood === null) return
    const entry = moodStore.add({ mood, tags, note: note.trim() || undefined })
    setHistory((h) => [entry, ...h].slice(0, 7))
    setSaved(true)
    setMood(null)
    setTags([])
    setNote('')
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-sage-800 dark:text-sage-50">How are you feeling?</h1>
        <p className="mt-1 text-sage-600 dark:text-sage-300">
          There's no wrong answer. This just helps you notice patterns over time.
        </p>
      </div>

      <MoodPicker value={mood} onChange={setMood} />

      <fieldset>
        <legend className="mb-2 text-sm font-medium text-sage-700 dark:text-sage-200">
          What's contributing to this? (optional)
        </legend>
        <div className="flex flex-wrap gap-2">
          {MOOD_TAGS.map((tag) => (
            <button
              key={tag}
              type="button"
              aria-pressed={tags.includes(tag)}
              onClick={() => toggleTag(tag)}
              className={`rounded-full border px-3 py-1 text-sm capitalize transition-colors ${
                tags.includes(tag)
                  ? 'border-sage-500 bg-sage-600 text-white'
                  : 'border-sage-200 text-sage-600 hover:bg-sage-50 dark:border-sage-800 dark:text-sage-300 dark:hover:bg-sage-800/50'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </fieldset>

      <div>
        <label htmlFor="note" className="mb-2 block text-sm font-medium text-sage-700 dark:text-sage-200">
          Anything you want to note? (optional)
        </label>
        <textarea
          id="note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          className="w-full rounded-lg border border-sage-200 bg-white p-3 text-sm outline-none focus:border-sage-500 dark:border-sage-800 dark:bg-sage-900/40"
          placeholder="A few words about your day..."
        />
      </div>

      <button
        type="button"
        onClick={handleSave}
        disabled={mood === null}
        className="rounded-full bg-sage-600 px-6 py-2.5 font-medium text-white transition-colors hover:bg-sage-700 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Save check-in
      </button>

      {saved && (
        <p role="status" className="rounded-lg bg-sage-100 px-3 py-2 text-sm text-sage-700 dark:bg-sage-800 dark:text-sage-200">
          Saved. Thanks for taking a moment for yourself.{' '}
          <button type="button" className="underline" onClick={() => navigate('/')}>
            Back to home
          </button>
        </p>
      )}

      {history.length > 0 && (
        <div>
          <h2 className="mb-2 font-semibold text-sage-800 dark:text-sage-100">Recent check-ins</h2>
          <ul className="flex flex-col gap-2">
            {history.map((entry) => (
              <li
                key={entry.id}
                className="flex items-start gap-3 rounded-lg border border-sage-200 bg-white p-3 text-sm dark:border-sage-800 dark:bg-sage-900/40"
              >
                <span className="text-xl" aria-hidden="true">
                  {MOOD_EMOJI[entry.mood]}
                </span>
                <div>
                  <div className="text-sage-500 dark:text-sage-400">
                    {new Date(entry.timestamp).toLocaleString()}
                  </div>
                  {entry.tags.length > 0 && (
                    <div className="mt-1 text-sage-600 dark:text-sage-300">{entry.tags.join(', ')}</div>
                  )}
                  {entry.note && <div className="mt-1 text-sage-700 dark:text-sage-200">{entry.note}</div>}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
