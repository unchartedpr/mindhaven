import { dailyAverages } from '../lib/insights'
import { MOOD_LABELS } from '../lib/types'
import type { MoodEntry } from '../lib/types'

const WEEKDAY = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function tooltipFor(date: Date, avg: number): string {
  const rounded = Math.min(5, Math.max(1, Math.round(avg))) as 1 | 2 | 3 | 4 | 5
  const dateLabel = `${WEEKDAY[date.getDay()]} ${date.getMonth() + 1}/${date.getDate()}`
  return `${dateLabel}: ${MOOD_LABELS[rounded]} (${avg.toFixed(1)})`
}

/** Minimal inline SVG line chart of the last N days of mood entries — no charting dependency needed. */
export function MoodChart({ entries, days = 14 }: { entries: readonly MoodEntry[]; days?: number }) {
  const buckets = dailyAverages(entries, days)

  const width = 320
  const height = 120
  const padding = 12
  const stepX = (width - padding * 2) / Math.max(1, days - 1)
  const yFor = (mood: number) => height - padding - ((mood - 1) / 4) * (height - padding * 2)
  const dotRadius = days > 30 ? 1.8 : 2.5

  const points = buckets
    .map((b, i) => (b.avg === null ? null : `${padding + i * stepX},${yFor(b.avg)}`))
    .filter((p): p is string => p !== null)

  const hasData = points.length > 0

  return (
    <div>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={`Mood trend over the last ${days} days`}
        className="w-full text-sage-600"
      >
        {[1, 2, 3, 4, 5].map((m) => (
          <line
            key={m}
            x1={padding}
            x2={width - padding}
            y1={yFor(m)}
            y2={yFor(m)}
            className="stroke-sage-100 dark:stroke-sage-800"
            strokeWidth={1}
          />
        ))}
        {hasData ? (
          <polyline points={points.join(' ')} fill="none" className="stroke-sage-500" strokeWidth={2} />
        ) : null}
        {buckets.map((b, i) =>
          b.avg === null ? null : (
            <g key={b.key}>
              {/* Larger invisible circle for an easier hover/tap target. */}
              <circle cx={padding + i * stepX} cy={yFor(b.avg)} r={8} fill="transparent">
                <title>{tooltipFor(b.date, b.avg)}</title>
              </circle>
              <circle
                cx={padding + i * stepX}
                cy={yFor(b.avg)}
                r={dotRadius}
                className="fill-sage-600 dark:fill-sage-300"
              />
            </g>
          ),
        )}
      </svg>
      {!hasData && (
        <p className="mt-2 text-center text-sm text-sage-600 dark:text-sage-400">
          Check in a few times to see your trend here.
        </p>
      )}
    </div>
  )
}
