import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { gratitudeStore, reframeStore } from '../lib/storage'

type Filter = 'all' | 'gratitude' | 'reframe'

export function Journal() {
  const [filter, setFilter] = useState<Filter>('all')
  const gratitude = useMemo(() => gratitudeStore.all(), [])
  const reframes = useMemo(() => reframeStore.all(), [])

  const combined = useMemo(() => {
    const g = gratitude.map((e) => ({ type: 'gratitude' as const, timestamp: e.timestamp, entry: e }))
    const r = reframes.map((e) => ({ type: 'reframe' as const, timestamp: e.timestamp, entry: e }))
    return [...g, ...r]
      .filter((e) => filter === 'all' || e.type === filter)
      .sort((a, b) => b.timestamp - a.timestamp)
  }, [gratitude, reframes, filter])

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-sage-800 dark:text-sage-50">Your journal</h1>
        <p className="mt-1 text-sage-600 dark:text-sage-300">
          Gratitude notes and thought-reframing entries, kept only on this device.
        </p>
      </div>

      <div className="flex gap-2">
        {(['all', 'gratitude', 'reframe'] as Filter[]).map((f) => (
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

      {combined.length === 0 ? (
        <div className="rounded-xl border border-dashed border-sage-300 p-8 text-center text-sage-500 dark:border-sage-700 dark:text-sage-400">
          <p>Nothing here yet.</p>
          <div className="mt-3 flex justify-center gap-3">
            <Link to="/exercises/gratitude" className="text-sage-600 underline dark:text-sage-300">
              Write a gratitude note
            </Link>
            <Link to="/exercises/reframe" className="text-sage-600 underline dark:text-sage-300">
              Try thought reframing
            </Link>
          </div>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {combined.map((item) => (
            <li
              key={item.entry.id}
              className="rounded-xl border border-sage-200 bg-white p-4 dark:border-sage-800 dark:bg-sage-900/40"
            >
              <div className="mb-2 flex items-center justify-between text-xs text-sage-500 dark:text-sage-400">
                <span className="font-medium uppercase tracking-wide">
                  {item.type === 'gratitude' ? '✨ Gratitude' : '🔄 Thought reframe'}
                </span>
                <span>{new Date(item.timestamp).toLocaleString()}</span>
              </div>
              {item.type === 'gratitude' ? (
                <ul className="list-inside list-disc text-sage-700 dark:text-sage-200">
                  {item.entry.items.map((g, i) => (
                    <li key={i}>{g}</li>
                  ))}
                </ul>
              ) : (
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
