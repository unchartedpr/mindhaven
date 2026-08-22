import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { gratitudeStore, reframeStore, worryStore } from '../lib/storage'
import type { GratitudeEntry, ThoughtReframeEntry, WorryEntry } from '../lib/types'

type Filter = 'all' | 'gratitude' | 'reframe' | 'worry'

type JournalItem =
  | { type: 'gratitude'; timestamp: number; entry: GratitudeEntry }
  | { type: 'reframe'; timestamp: number; entry: ThoughtReframeEntry }
  | { type: 'worry'; timestamp: number; entry: WorryEntry }

function searchableText(item: JournalItem): string {
  switch (item.type) {
    case 'gratitude':
      return item.entry.items.join(' ')
    case 'reframe':
      return [item.entry.situation, item.entry.automaticThought, item.entry.balancedThought].join(' ')
    case 'worry':
      return item.entry.worry
  }
}

const TYPE_LABEL: Record<JournalItem['type'], string> = {
  gratitude: '✨ Gratitude',
  reframe: '🔄 Thought reframe',
  worry: '📦 Worry, set aside',
}

export function Journal() {
  const [filter, setFilter] = useState<Filter>('all')
  const [query, setQuery] = useState('')
  const gratitude = useMemo(() => gratitudeStore.all(), [])
  const reframes = useMemo(() => reframeStore.all(), [])
  const worries = useMemo(() => worryStore.all(), [])

  const combined = useMemo(() => {
    const g: JournalItem[] = gratitude.map((e) => ({ type: 'gratitude', timestamp: e.timestamp, entry: e }))
    const r: JournalItem[] = reframes.map((e) => ({ type: 'reframe', timestamp: e.timestamp, entry: e }))
    const w: JournalItem[] = worries.map((e) => ({ type: 'worry', timestamp: e.timestamp, entry: e }))
    const q = query.trim().toLowerCase()
    return [...g, ...r, ...w]
      .filter((e) => filter === 'all' || e.type === filter)
      .filter((e) => q === '' || searchableText(e).toLowerCase().includes(q))
      .sort((a, b) => b.timestamp - a.timestamp)
  }, [gratitude, reframes, worries, filter, query])

  const isEmptyOverall = gratitude.length === 0 && reframes.length === 0 && worries.length === 0

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-sage-800 dark:text-sage-50">Your journal</h1>
        <p className="mt-1 text-sage-600 dark:text-sage-300">
          Gratitude notes, thought reframes, and worries you've set aside — kept only on this device.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {(['all', 'gratitude', 'reframe', 'worry'] as Filter[]).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`rounded-full px-3 py-1.5 text-sm font-medium capitalize ${
                filter === f
                  ? 'bg-sage-600 text-white'
                  : 'border border-sage-200 text-sage-600 hover:bg-sage-50 dark:border-sage-800 dark:text-sage-300 dark:hover:bg-sage-800/50'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        {!isEmptyOverall && (
          <label className="relative sm:w-64">
            <span className="sr-only">Search journal entries</span>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search your journal..."
              className="w-full rounded-full border border-sage-200 bg-white px-4 py-1.5 text-sm outline-none focus:border-sage-500 dark:border-sage-800 dark:bg-sage-900/40"
            />
          </label>
        )}
      </div>

      {isEmptyOverall ? (
        <div className="rounded-xl border border-dashed border-sage-300 p-8 text-center text-sage-500 dark:border-sage-700 dark:text-sage-400">
          <p>Nothing here yet.</p>
          <div className="mt-3 flex flex-wrap justify-center gap-3">
            <Link to="/exercises/gratitude" className="text-sage-600 underline dark:text-sage-300">
              Write a gratitude note
            </Link>
            <Link to="/exercises/reframe" className="text-sage-600 underline dark:text-sage-300">
              Try thought reframing
            </Link>
            <Link to="/exercises/worry-time" className="text-sage-600 underline dark:text-sage-300">
              Set a worry aside
            </Link>
          </div>
        </div>
      ) : combined.length === 0 ? (
        <div className="rounded-xl border border-dashed border-sage-300 p-8 text-center text-sage-500 dark:border-sage-700 dark:text-sage-400">
          <p>No entries match your search.</p>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {combined.map((item) => (
            <li
              key={item.entry.id}
              className="rounded-xl border border-sage-200 bg-white p-4 shadow-sm dark:border-sage-800 dark:bg-sage-900/40"
            >
              <div className="mb-2 flex items-center justify-between text-xs text-sage-500 dark:text-sage-400">
                <span className="font-medium uppercase tracking-wide">{TYPE_LABEL[item.type]}</span>
                <span>{new Date(item.timestamp).toLocaleString()}</span>
              </div>
              {item.type === 'gratitude' && (
                <ul className="list-inside list-disc text-sage-700 dark:text-sage-200">
                  {item.entry.items.map((g, i) => (
                    <li key={i}>{g}</li>
                  ))}
                </ul>
              )}
              {item.type === 'worry' && <p className="text-sage-700 dark:text-sage-200">{item.entry.worry}</p>}
              {item.type === 'reframe' && (
                <dl className="flex flex-col gap-1.5 text-sm">
                  <div>
                    <dt className="font-medium text-sage-700 dark:text-sage-200">Situation</dt>
                    <dd className="text-sage-600 dark:text-sage-300">{item.entry.situation}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-sage-700 dark:text-sage-200">Automatic thought</dt>
                    <dd className="text-sage-600 dark:text-sage-300">{item.entry.automaticThought}</dd>
                  </div>
                  {item.entry.balancedThought && (
                    <div>
                      <dt className="font-medium text-sage-700 dark:text-sage-200">Balanced thought</dt>
                      <dd className="text-sage-600 dark:text-sage-300">{item.entry.balancedThought}</dd>
                    </div>
                  )}
                </dl>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
