import { computeWeeklyInsight, moodLabelForAverage } from '../lib/insights'
import type { MoodEntry } from '../lib/types'

const TREND_COPY: Record<NonNullable<ReturnType<typeof computeWeeklyInsight>['trend']>, string> = {
  up: 'up from',
  down: 'down from',
  same: 'about the same as',
}

export function WeeklyInsight({ entries }: { entries: MoodEntry[] }) {
  const insight = computeWeeklyInsight(entries)

  if (insight.thisWeekAvg === null) return null

  const thisWeekLabel = moodLabelForAverage(insight.thisWeekAvg)

  return (
    <div className="mt-3 border-t border-sage-100 pt-3 dark:border-sage-800">
      <p className="text-sm text-sage-600 dark:text-sage-300">
        This week you're averaging{' '}
        <strong className="font-medium text-sage-800 dark:text-sage-100">{thisWeekLabel}</strong> (
        {insight.thisWeekAvg.toFixed(1)})
        {insight.lastWeekAvg !== null && insight.trend && (
          <>
            {' '}
            — {TREND_COPY[insight.trend]} {moodLabelForAverage(insight.lastWeekAvg)} last week.
          </>
        )}
        {insight.topTag && <> "{insight.topTag}" came up most often.</>}
      </p>
    </div>
  )
}
