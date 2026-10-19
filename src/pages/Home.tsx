import { Link } from 'react-router-dom'
import { BackupNudge } from '../components/BackupNudge'
import { CrisisBanner } from '../components/CrisisBanner'
import { MoodChart } from '../components/MoodChart'
import { WeeklyInsight } from '../components/WeeklyInsight'
import { ButtonLink, Card } from '../components/ui'
import { cardClass } from '../components/uiClasses'
import { computeStreak, dayKey } from '../lib/insights'
import { gratitudeStore, moodStore, reframeStore, worryStore } from '../lib/storage'
import { useCollection, useToday } from '../lib/useStore'
import { MOOD_EMOJI, MOOD_LABELS } from '../lib/types'

const QUICK_LINKS = [
  { to: '/check-in', title: 'Daily check-in', desc: 'Log how you feel in a few seconds.', emoji: '📝' },
  { to: '/exercises', title: 'Coping exercises', desc: 'Breathing, grounding, and thought reframing.', emoji: '🌬️' },
  { to: '/journal', title: 'Journal', desc: 'Gratitude notes and past reflections.', emoji: '📔' },
  { to: '/insights', title: 'Insights', desc: 'Calendar, patterns, and a summary to share.', emoji: '📊' },
  { to: '/safety-plan', title: 'Safety plan', desc: 'Your own plan for hard moments, ready when you need it.', emoji: '🛟' },
  { to: '/resources', title: 'Crisis resources', desc: 'Hotlines and support by country.', emoji: '☎️' },
]

export function Home() {
  const entries = useCollection(moodStore)
  const gratitude = useCollection(gratitudeStore)
  const reframes = useCollection(reframeStore)
  const worries = useCollection(worryStore)
  const entryCount = entries.length + gratitude.length + reframes.length + worries.length
  const today = useToday()
  const streak = computeStreak(entries) // re-evaluated whenever `today` changes
  const checkedInToday = entries.length > 0 && dayKey(entries[0].timestamp) === today
  const lastMood = entries[0]

  return (
    <div className="flex flex-col gap-6">
      <section>
        <h1 className="text-2xl font-semibold text-sage-800 dark:text-sage-50">{greeting()}, welcome back.</h1>
        <p className="mt-1 text-sage-600 dark:text-sage-300">
          A private, free space to check in with yourself, breathe, and reflect. Nothing you enter ever leaves
          this device.
        </p>
      </section>

      <CrisisBanner />
      <BackupNudge entryCount={entryCount} />

      <section className="grid gap-4 sm:grid-cols-2">
        <Card>
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-sage-800 dark:text-sage-100">Your streak</h2>
            <span className="text-2xl" aria-hidden="true">
              🔥
            </span>
          </div>
          <p className="mt-2 text-3xl font-bold text-sage-700 dark:text-sage-200">{streak}</p>
          <p className="text-sm text-sage-600 dark:text-sage-400">
            day{streak === 1 ? '' : 's'} of checking in
            {!checkedInToday && streak > 0 ? ' — check in today to keep it going' : ''}
          </p>
          {!checkedInToday && (
            <ButtonLink to="/check-in" className="mt-3">
              Check in now
            </ButtonLink>
          )}
        </Card>

        <Card>
          <h2 className="font-semibold text-sage-800 dark:text-sage-100">Last check-in</h2>
          {lastMood ? (
            <div className="mt-2 flex items-center gap-3">
              <span className="text-3xl" aria-hidden="true">
                {MOOD_EMOJI[lastMood.mood]}
              </span>
              <div className="text-sm text-sage-600 dark:text-sage-400">
                <div className="font-medium text-sage-800 dark:text-sage-100">{MOOD_LABELS[lastMood.mood]}</div>
                {new Date(lastMood.timestamp).toLocaleString()}
              </div>
            </div>
          ) : (
            <p className="mt-2 text-sm text-sage-600 dark:text-sage-400">No check-ins yet.</p>
          )}
        </Card>
      </section>

      <Card>
        <div className="mb-2 flex items-baseline justify-between gap-3">
          <h2 className="font-semibold text-sage-800 dark:text-sage-100">14-day trend</h2>
          <Link to="/insights" className="text-sm text-sage-700 underline dark:text-sage-300">
            See all insights
          </Link>
        </div>
        <MoodChart entries={entries} />
        <WeeklyInsight entries={entries} />
      </Card>

      <section>
        <h2 className="mb-3 font-semibold text-sage-800 dark:text-sage-100">Explore</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {QUICK_LINKS.map((link) => (
            <Link key={link.to} to={link.to} className={cardClass('default', true, 'flex items-start gap-3')}>
              <span className="text-2xl" aria-hidden="true">
                {link.emoji}
              </span>
              <span>
                <span className="block font-medium text-sage-800 dark:text-sage-100">{link.title}</span>
                <span className="block text-sm text-sage-600 dark:text-sage-400">{link.desc}</span>
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
