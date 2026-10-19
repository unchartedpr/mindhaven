import { MOOD_LABELS, type MoodEntry, type MoodValue } from './types'

const DAY = 24 * 60 * 60 * 1000

/** Local-calendar day key, e.g. "2026-10-19". Used to group entries by the user's own day. */
export function dayKey(timestamp: number): string {
  const d = new Date(timestamp)
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}`
}

function startOfDay(timestamp: number): Date {
  const d = new Date(timestamp)
  d.setHours(0, 0, 0, 0)
  return d
}

function average(entries: readonly MoodEntry[]): number | null {
  if (entries.length === 0) return null
  return entries.reduce((sum, e) => sum + e.mood, 0) / entries.length
}

export function moodLabelForAverage(avg: number): string {
  const rounded = Math.min(5, Math.max(1, Math.round(avg))) as MoodValue
  return MOOD_LABELS[rounded]
}

/**
 * Consecutive days with at least one check-in.
 *
 * A streak is still alive if the last check-in was yesterday — the day isn't over,
 * so "haven't checked in yet today" must not reset the number to zero.
 */
export function computeStreak(entries: readonly MoodEntry[], now: number = Date.now()): number {
  if (entries.length === 0) return 0
  const days = new Set(entries.map((e) => dayKey(e.timestamp)))
  const cursor = startOfDay(now)
  if (!days.has(dayKey(cursor.getTime()))) cursor.setDate(cursor.getDate() - 1)
  let streak = 0
  while (days.has(dayKey(cursor.getTime()))) {
    streak += 1
    cursor.setDate(cursor.getDate() - 1)
  }
  return streak
}

// ---------------------------------------------------------------------------
// Weekly comparison
// ---------------------------------------------------------------------------

export interface WeeklyInsight {
  thisWeekAvg: number | null
  lastWeekAvg: number | null
  topTag: string | null
  trend: 'up' | 'down' | 'same' | null
}

/** Compares the last 7 days of check-ins to the 7 days before that, and finds the most common tag this week. */
export function computeWeeklyInsight(entries: readonly MoodEntry[], now: number = Date.now()): WeeklyInsight {
  const weekAgo = now - 7 * DAY
  const twoWeeksAgo = now - 14 * DAY

  const thisWeek = entries.filter((e) => e.timestamp > weekAgo && e.timestamp <= now)
  const lastWeek = entries.filter((e) => e.timestamp > twoWeeksAgo && e.timestamp <= weekAgo)

  const thisWeekAvg = average(thisWeek)
  const lastWeekAvg = average(lastWeek)

  let trend: WeeklyInsight['trend'] = null
  if (thisWeekAvg !== null && lastWeekAvg !== null) {
    const delta = thisWeekAvg - lastWeekAvg
    trend = Math.abs(delta) < 0.3 ? 'same' : delta > 0 ? 'up' : 'down'
  }

  const tagCounts = new Map<string, number>()
  for (const entry of thisWeek) {
    for (const tag of entry.tags) {
      tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1)
    }
  }
  let topTag: string | null = null
  let topCount = 0
  for (const [tag, count] of tagCounts) {
    if (count > topCount) {
      topTag = tag
      topCount = count
    }
  }

  return { thisWeekAvg, lastWeekAvg, topTag, trend }
}

// ---------------------------------------------------------------------------
// Daily series and calendar
// ---------------------------------------------------------------------------

export interface DayPoint {
  date: Date
  key: string
  avg: number | null
  count: number
}

function groupByDay(entries: readonly MoodEntry[]): Map<string, MoodEntry[]> {
  const byDay = new Map<string, MoodEntry[]>()
  for (const e of entries) {
    const k = dayKey(e.timestamp)
    const list = byDay.get(k)
    if (list) list.push(e)
    else byDay.set(k, [e])
  }
  return byDay
}

/** One point per calendar day for the last `days` days (oldest first, ending today). */
export function dailyAverages(entries: readonly MoodEntry[], days: number, now: number = Date.now()): DayPoint[] {
  const byDay = groupByDay(entries)
  const points: DayPoint[] = []
  for (let i = days - 1; i >= 0; i--) {
    const date = startOfDay(now)
    date.setDate(date.getDate() - i)
    const key = dayKey(date.getTime())
    const list = byDay.get(key) ?? []
    points.push({ date, key, avg: average(list), count: list.length })
  }
  return points
}

/** A month laid out as weeks (Sunday first). Cells outside the month are `null`. */
export function monthGrid(entries: readonly MoodEntry[], year: number, month: number): (DayPoint | null)[][] {
  const byDay = groupByDay(entries)
  const first = new Date(year, month, 1)
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells: (DayPoint | null)[] = Array(first.getDay()).fill(null)
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day)
    const key = dayKey(date.getTime())
    const list = byDay.get(key) ?? []
    cells.push({ date, key, avg: average(list), count: list.length })
  }
  while (cells.length % 7 !== 0) cells.push(null)
  const weeks: (DayPoint | null)[][] = []
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7))
  return weeks
}

// ---------------------------------------------------------------------------
// Range summary and tag patterns
// ---------------------------------------------------------------------------

export interface RangeSummary {
  entries: number
  checkInDays: number
  avg: number | null
  best: DayPoint | null
  lowest: DayPoint | null
}

function entriesInRange(entries: readonly MoodEntry[], days: number, now: number): MoodEntry[] {
  const since = startOfDay(now)
  since.setDate(since.getDate() - (days - 1))
  return entries.filter((e) => e.timestamp >= since.getTime() && e.timestamp <= now)
}

export function summarizeRange(entries: readonly MoodEntry[], days: number, now: number = Date.now()): RangeSummary {
  const withData = dailyAverages(entries, days, now).filter((p) => p.avg !== null)
  const inRange = entriesInRange(entries, days, now)
  let best: DayPoint | null = null
  let lowest: DayPoint | null = null
  for (const p of withData) {
    if (best === null || (p.avg as number) > (best.avg as number)) best = p
    if (lowest === null || (p.avg as number) < (lowest.avg as number)) lowest = p
  }
  return { entries: inRange.length, checkInDays: withData.length, avg: average(inRange), best, lowest }
}

export interface TagPattern {
  tag: string
  count: number
  avg: number
  /** Tag average minus the overall average: positive means moods tend to be higher when this tag is present. */
  delta: number
}

/**
 * How moods differ when each tag is present. This is an association in the user's own data,
 * not a cause — the UI words it that way. Tags with too few entries are left out as noise.
 */
export function tagPatterns(
  entries: readonly MoodEntry[],
  days: number,
  now: number = Date.now(),
  minCount = 3,
): TagPattern[] {
  const inRange = entriesInRange(entries, days, now)
  const overall = average(inRange)
  if (overall === null || inRange.length < minCount * 2) return []

  const byTag = new Map<string, MoodEntry[]>()
  for (const e of inRange) {
    for (const tag of new Set(e.tags)) {
      const list = byTag.get(tag)
      if (list) list.push(e)
      else byTag.set(tag, [e])
    }
  }
  const patterns: TagPattern[] = []
  for (const [tag, list] of byTag) {
    if (list.length < minCount) continue
    const avg = average(list) as number
    patterns.push({ tag, count: list.length, avg, delta: avg - overall })
  }
  return patterns.sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta))
}

// ---------------------------------------------------------------------------
// CSV export
// ---------------------------------------------------------------------------

/**
 * Escapes one CSV cell. Cells that start with a character spreadsheets treat as a formula
 * (= + - @ tab CR) are prefixed with an apostrophe so a note can never execute when opened in Excel.
 */
export function csvCell(value: string): string {
  let v = value
  if (/^[=+\-@\t\r]/.test(v)) v = `'${v}`
  if (/[",\n\r]/.test(v)) v = `"${v.replace(/"/g, '""')}"`
  return v
}

function pad(n: number): string {
  return String(n).padStart(2, '0')
}

/** Check-ins as CSV, oldest first, in the user's local time. */
export function moodsToCSV(entries: readonly MoodEntry[]): string {
  const rows = [['date', 'time', 'mood', 'mood_label', 'tags', 'note']]
  const chronological = [...entries].sort((a, b) => a.timestamp - b.timestamp)
  for (const e of chronological) {
    const d = new Date(e.timestamp)
    rows.push([
      dayKey(e.timestamp),
      `${pad(d.getHours())}:${pad(d.getMinutes())}`,
      String(e.mood),
      MOOD_LABELS[e.mood],
      e.tags.join('; '),
      e.note ?? '',
    ])
  }
  return rows.map((r) => r.map(csvCell).join(',')).join('\r\n') + '\r\n'
}
