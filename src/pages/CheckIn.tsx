import { useState } from 'react'
import { CheckInFollowUp } from '../components/CheckInFollowUp'
import { MoodPicker } from '../components/MoodPicker'
import { Button, Card, ConfirmButton, PageHeader, TextArea } from '../components/ui'
import { moodStore, storageStatus } from '../lib/storage'
import { useCollection } from '../lib/useStore'
import { MOOD_EMOJI, MOOD_LABELS, MOOD_TAGS, type MoodValue } from '../lib/types'

export function CheckIn() {
  const [mood, setMood] = useState<MoodValue | null>(null)
  const [tags, setTags] = useState<string[]>([])
  const [note, setNote] = useState('')
  const [saved, setSaved] = useState<{ mood: MoodValue; tags: string[] } | null>(null)
  const [failed, setFailed] = useState(false)
  const history = useCollection(moodStore).slice(0, 7)

  function toggleTag(tag: string) {
    setTags((t) => (t.includes(tag) ? t.filter((x) => x !== tag) : [...t, tag]))
  }

  function handleSave() {
    if (mood === null) return
    moodStore.add({ mood, tags, note: note.trim() || undefined })
    if (storageStatus.get().writeFailed) {
      // Keep what they typed so nothing is lost; the global banner explains why saving failed.
      setFailed(true)
      return
    }
    setFailed(false)
    setSaved({ mood, tags })
    setMood(null)
    setTags([])
    setNote('')
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="How are you feeling?"
        subtitle="There's no wrong answer. This just helps you notice patterns over time."
      />

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
              className={`min-h-11 rounded-full border px-3 py-1 text-sm capitalize transition-colors ${
                tags.includes(tag)
                  ? 'border-sage-600 bg-sage-600 text-white'
                  : 'border-sage-200 text-sage-700 hover:bg-sage-50 dark:border-sage-800 dark:text-sage-300 dark:hover:bg-sage-800/50'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </fieldset>

      <TextArea
        label="Anything you want to note? (optional)"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        maxLength={5000}
        rows={3}
        placeholder="A few words about your day..."
      />

      <div>
        <Button onClick={handleSave} disabled={mood === null}>
          Save check-in
        </Button>
      </div>

      {failed && (
        <p role="alert" className="rounded-lg bg-clay-50 px-3 py-2 text-sm text-clay-700 dark:bg-clay-500/10 dark:text-clay-200">
          That couldn’t be saved — this browser’s storage may be full. Your entry is still on screen; try a
          backup from Settings, then save again.
        </p>
      )}

      {saved && <CheckInFollowUp mood={saved.mood} tags={saved.tags} />}

      {history.length > 0 && (
        <div>
          <h2 className="mb-2 font-semibold text-sage-800 dark:text-sage-100">Recent check-ins</h2>
          <ul className="flex flex-col gap-2">
            {history.map((entry) => (
              <li key={entry.id}>
                <Card size="sm" className="flex items-start gap-3 text-sm">
                  <span className="text-xl" aria-hidden="true">
                    {MOOD_EMOJI[entry.mood]}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-sage-600 dark:text-sage-400">
                      <span className="font-medium text-sage-800 dark:text-sage-100">{MOOD_LABELS[entry.mood]}</span>
                      {' · '}
                      {new Date(entry.timestamp).toLocaleString()}
                    </div>
                    {entry.tags.length > 0 && (
                      <div className="mt-1 text-sage-700 dark:text-sage-300">{entry.tags.join(', ')}</div>
                    )}
                    {entry.note && (
                      <div className="mt-1 whitespace-pre-wrap break-words text-sage-700 dark:text-sage-200">
                        {entry.note}
                      </div>
                    )}
                  </div>
                  <ConfirmButton
                    size="sm"
                    confirmLabel="Confirm delete"
                    aria-label={`Delete check-in from ${new Date(entry.timestamp).toLocaleString()}`}
                    onConfirm={() => moodStore.remove(entry.id)}
                  >
                    Delete
                  </ConfirmButton>
                </Card>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
