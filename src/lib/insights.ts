import { MOOD_LABELS, type MoodEntry, type MoodValue } from './types'

const DAY = 24 * 60 * 60 * 1000

export interface WeeklyInsight {
  thisWeekAvg: number | null
  lastWeekAvg: number | null
  topTag: string | null
  trend: 'up' | 'down' | 'same' | null
}

function average(entries: MoodEntry[]): number | null {
  if (entries.length === 0) return null
  return entries.reduce((sum, e) => sum + e.mood, 0) / entries.length
}

/** Compares the last 7 days of check-ins to the 7 days before that, and finds the most common tag this week. */
export function computeWeeklyInsight(entries: MoodEntry[], now: number = Date.now()): WeeklyInsight {
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

export function moodLabelForAverage(avg: number): string {
  const rounded = Math.min(5, Math.max(1, Math.round(avg))) as MoodValue
  return MOOD_LABELS[rounded]
}
