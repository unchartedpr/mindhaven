import { useState } from 'react'
import { MoodCalendar } from '../components/MoodCalendar'
import { MoodChart } from '../components/MoodChart'
import { Button, ButtonLink, Card, PageHeader } from '../components/ui'
import { downloadFile, today } from '../lib/download'
import { moodLabelForAverage, moodsToCSV, summarizeRange, tagPatterns } from '../lib/insights'
import { moodStore } from '../lib/storage'
import { useCollection } from '../lib/useStore'

const RANGES = [
  { days: 7, label: '7 days' },
  { days: 30, label: '30 days' },
  { days: 90, label: '90 days' },
] as const

function formatDay(d: Date): string {
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

function Stat({ label, value, detail }: { label: string; value: string; detail?: string }) {
  return (
    <Card size="sm">
      <div className="text-xs font-medium uppercase tracking-wide text-sage-700 dark:text-sage-400">{label}</div>
      <div className="mt-1 text-xl font-semibold text-sage-800 dark:text-sage-100">{value}</div>
      {detail && <div className="text-xs text-sage-700 dark:text-sage-400">{detail}</div>}
    </Card>
  )
}

export function Insights() {
  const entries = useCollection(moodStore)
  const [days, setDays] = useState<number>(30)
  const [monthOffset, setMonthOffset] = useState(0)

  const summary = summarizeRange(entries, days)
  const patterns = tagPatterns(entries, days).slice(0, 6)
  const rangeLabel = RANGES.find((r) => r.days === days)?.label ?? `${days} days`

  const viewed = new Date()
  viewed.setDate(1)
  viewed.setMonth(viewed.getMonth() + monthOffset)
  const monthTitle = viewed.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })

  if (entries.length === 0) {
    return (
      <div className="flex flex-col gap-4">
        <PageHeader title="Insights" subtitle="Patterns in your own check-ins will appear here." />
        <Card className="text-sage-700 dark:text-sage-300">
          <p>No check-ins yet. After a few days of checking in, you’ll see your trend, a calendar, and patterns.</p>
          <ButtonLink to="/check-in" className="mt-3">
            Do a check-in
          </ButtonLink>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Insights"
        subtitle="Patterns in your own check-ins. These are observations to reflect on, not diagnoses."
      />

      <div className="hidden print:block">
        <p className="text-sm">
          MindHaven summary — last {rangeLabel}, printed {new Date().toLocaleDateString()}. Self-reported check-ins,
          not a clinical record.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 print:hidden" role="group" aria-label="Time range">
        {RANGES.map((r) => (
          <button
            key={r.days}
            type="button"
            aria-pressed={days === r.days}
            onClick={() => setDays(r.days)}
            className={`min-h-11 rounded-full px-4 py-1.5 text-sm font-medium ${
              days === r.days
                ? 'bg-sage-600 text-white'
                : 'border border-sage-200 text-sage-700 hover:bg-sage-50 dark:border-sage-800 dark:text-sage-300 dark:hover:bg-sage-800/50'
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>

      <section aria-label={`Summary, last ${rangeLabel}`} className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Check-ins" value={String(summary.entries)} detail={`on ${summary.checkInDays} of ${days} days`} />
        <Stat
          label="Average mood"
          value={summary.avg === null ? '—' : moodLabelForAverage(summary.avg)}
          detail={summary.avg === null ? undefined : `${summary.avg.toFixed(1)} out of 5`}
        />
        <Stat
          label="Best day"
          value={summary.best?.avg == null ? '—' : moodLabelForAverage(summary.best.avg)}
          detail={summary.best ? formatDay(summary.best.date) : undefined}
        />
        <Stat
          label="Lowest day"
          value={summary.lowest?.avg == null ? '—' : moodLabelForAverage(summary.lowest.avg)}
          detail={summary.lowest ? formatDay(summary.lowest.date) : undefined}
        />
      </section>

      <Card>
        <h2 className="mb-2 font-semibold text-sage-800 dark:text-sage-100">Mood over the last {rangeLabel}</h2>
        <MoodChart entries={entries} days={days} />
      </Card>

      <Card className="print:hidden">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="font-semibold text-sage-800 dark:text-sage-100">{monthTitle}</h2>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" aria-label="Previous month" onClick={() => setMonthOffset((m) => m - 1)}>
              ←
            </Button>
            <Button
              variant="secondary"
              size="sm"
              aria-label="Next month"
              disabled={monthOffset >= 0}
              onClick={() => setMonthOffset((m) => m + 1)}
            >
              →
            </Button>
          </div>
        </div>
        <MoodCalendar entries={entries} year={viewed.getFullYear()} month={viewed.getMonth()} />
      </Card>

      <Card>
        <h2 className="font-semibold text-sage-800 dark:text-sage-100">Patterns you’ve tagged</h2>
        {patterns.length === 0 ? (
          <p className="mt-1 text-sm text-sage-700 dark:text-sage-300">
            Once a tag appears on at least 3 check-ins in this range, you’ll see how your mood compares when it’s
            present.
          </p>
        ) : (
          <>
            <ul className="mt-2 flex flex-col gap-2 text-sm text-sage-800 dark:text-sage-100">
              {patterns.map((p) => (
                <li key={p.tag}>
                  When you tag <strong className="font-medium">“{p.tag}”</strong> ({p.count} check-ins), your mood
                  averages {moodLabelForAverage(p.avg)} ({p.avg.toFixed(1)}) —{' '}
                  {Math.abs(p.delta) < 0.1
                    ? 'about the same as usual'
                    : `${Math.abs(p.delta).toFixed(1)} ${p.delta > 0 ? 'higher' : 'lower'} than your overall average`}
                  .
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-sage-700 dark:text-sage-400">
              These are patterns in your own entries, not causes — a tag can show up on hard days without
              causing them.
            </p>
          </>
        )}
      </Card>

      <div className="flex flex-wrap gap-3 print:hidden">
        <Button variant="secondary" onClick={() => window.print()}>
          Print or save summary as PDF
        </Button>
        <Button
          variant="secondary"
          onClick={() => downloadFile(`mindhaven-checkins-${today()}.csv`, 'text/csv', moodsToCSV(entries))}
        >
          Download check-ins (CSV)
        </Button>
      </div>
      <p className="text-xs text-sage-700 dark:text-sage-400 print:hidden">
        The printed summary shows the numbers and chart only — not your notes. The CSV includes everything you
        wrote in check-in notes.
      </p>
    </div>
  )
}
