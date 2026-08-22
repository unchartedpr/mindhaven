import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { CrisisBanner } from '../components/CrisisBanner'
import { MoodChart } from '../components/MoodChart'
import { WeeklyInsight } from '../components/WeeklyInsight'
import { computeStreak, moodStore } from '../lib/storage'
import { MOOD_EMOJI } from '../lib/types'

const QUICK_LINKS = [
  { to: '/check-in', title: 'Daily check-in', desc: 'Log how you feel in a few seconds.', emoji: '📝' },
  { to: '/exercises', title: 'Coping exercises', desc: 'Breathing, grounding, and thought reframing.', emoji: '🌬️' },
  { to: '/journal', title: 'Journal', desc: 'Gratitude notes and past reflections.', emoji: '📔' },
  { to: '/resources', title: 'Crisis resources', desc: 'Hotlines and support by country.', emoji: '☎️' },
]

export function Home() {
  const entries = useMemo(() => moodStore.all(), [])
  const streak = useMemo(() => computeStreak(entries), [entries])
  const today = new Date().toDateString()
  const checkedInToday = entries.some((e) => new Date(e.timestamp).toDateString() === today)
  const lastMood = entries[0]

  return (
    <div className="flex flex-col gap-6">
      <section>
        <h1 className="text-2xl font-semibold text-sage-800 dark:text-sage-50">
          {greeting()}, welcome back.
        </h1>
        <p className="mt-1 text-sage-600 dark:text-sage-300">
          A private, free space to check in with yourself, breathe, and reflect. Nothing you enter
          ever leaves this device.
        </p>
      </section>

      <CrisisBanner />

      <section className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-sage-200 bg-white p-4 dark:border-sage-800 dark:bg-sage-900/40">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-sage-800 dark:text-sage-100">Your streak</h2>
            <span className="text-2xl" aria-hidden="true">
              🔥
            </span>
          </div>
          <p className="mt-2 text-3xl font-bold text-sage-700 dark:text-sage-200">{streak}</p>
          <p className="text-sm text-sage-500 dark:text-sage-400">
            day{streak === 1 ? '' : 's'} of checking in
            {!checkedInToday && entries.length > 0 ? ' — check in today to keep it going' : ''}
          </p>
          {!checkedInToday && (
            <Link
              to="/check-in"
              className="mt-3 inline-block rounded-full bg-sage-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-sage-700"
            >
              Check in now
            </Link>
          )}
        </div>

        <div className="rounded-xl border border-sage-200 bg-white p-4 dark:border-sage-800 dark:bg-sage-900/40">
          <h2 className="font-semibold text-sage-800 dark:text-sage-100">Last check-in</h2>
          {lastMood ? (
            <div className="mt-2 flex items-center gap-3">
              <span className="text-3xl" aria-hidden="true">
                {MOOD_EMOJI[lastMood.mood]}
              </span>
              <div className="text-sm text-sage-500 dark:text-sage-400">
                {new Date(lastMood.timestamp).toLocaleString()}
              </div>
            </div>
          ) : (
            <p className="mt-2 text-sm text-sage-500 dark:text-sage-400">No check-ins yet.</p>
          )}
        </div>
      </section>

      <section className="rounded-xl border border-sage-200 bg-white p-4 dark:border-sage-800 dark:bg-sage-900/40">
        <h2 className="mb-2 font-semibold text-sage-800 dark:text-sage-100">14-day trend</h2>
        <MoodChart entries={entries} />
        <WeeklyInsight entries={entries} />
      </section>

      <section>
        <h2 className="mb-3 font-semibold text-sage-800 dark:text-sage-100">Explore</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {QUICK_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="flex items-start gap-3 rounded-xl border border-sage-200 bg-white p-4 transition-colors hover:bg-sage-50 dark:border-sage-800 dark:bg-sage-900/40 dark:hover:bg-sage-800/50"
            >
              <span className="text-2xl" aria-hidden="true">
                {link.emoji}
              </span>
              <span>
                <span className="block font-medium text-sage-800 dark:text-sage-100">{link.title}</span>
                <span className="block text-sm text-sage-500 dark:text-sage-400">{link.desc}</span>
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}

function greeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}
