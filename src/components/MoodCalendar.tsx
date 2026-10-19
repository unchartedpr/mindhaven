import { monthGrid, type DayPoint } from '../lib/insights'
import { MOOD_EMOJI, MOOD_LABELS, type MoodEntry, type MoodValue } from '../lib/types'

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

// Colour reinforces the mood but is never the only signal: every logged day also shows its emoji.
const CELL_TONE: Record<MoodValue, string> = {
  1: 'bg-clay-200 dark:bg-clay-500/40',
  2: 'bg-clay-100 dark:bg-clay-500/25',
  3: 'bg-sage-100 dark:bg-sage-800',
  4: 'bg-sage-200 dark:bg-sage-700',
  5: 'bg-sage-300 dark:bg-sage-600',
}

function roundedMood(avg: number): MoodValue {
  return Math.min(5, Math.max(1, Math.round(avg))) as MoodValue
}

function describe(day: DayPoint): string {
  const date = day.date.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })
  if (day.avg === null) return `${date}: no check-in`
  const mood = roundedMood(day.avg)
  const times = day.count === 1 ? '1 check-in' : `${day.count} check-ins`
  return `${date}: ${MOOD_LABELS[mood]} (${day.avg.toFixed(1)}), ${times}`
}

/** One month of check-ins as an accessible table: each day shows its number and, if logged, a mood emoji. */
export function MoodCalendar({ entries, year, month }: { entries: readonly MoodEntry[]; year: number; month: number }) {
  const weeks = monthGrid(entries, year, month)
  const title = new Date(year, month, 1).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })

  return (
    <table className="w-full table-fixed border-separate border-spacing-1 text-center text-xs">
      <caption className="sr-only">Check-ins for {title}</caption>
      <thead>
        <tr>
          {WEEKDAYS.map((d) => (
            <th key={d} scope="col" className="pb-1 font-medium text-sage-700 dark:text-sage-300">
              {d}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {weeks.map((week, wi) => (
          <tr key={wi}>
            {week.map((day, di) =>
              day === null ? (
                <td key={di} />
              ) : (
                <td
                  key={day.key}
                  title={describe(day)}
                  className={`h-12 rounded-md align-middle ${
                    day.avg === null
                      ? 'border border-sage-100 text-sage-700 dark:border-sage-800 dark:text-sage-400'
                      : `${CELL_TONE[roundedMood(day.avg)]} text-sage-900 dark:text-sage-50`
                  }`}
                >
                  <span className="sr-only">{describe(day)}</span>
                  <span aria-hidden="true" className="flex flex-col items-center justify-center leading-tight">
                    <span className="text-[11px]">{day.date.getDate()}</span>
                    <span className="text-base">{day.avg === null ? '' : MOOD_EMOJI[roundedMood(day.avg)]}</span>
                  </span>
                </td>
              ),
            )}
          </tr>
        ))}
      </tbody>
    </table>
  )
}
