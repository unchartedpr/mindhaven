import { describe, expect, it } from 'vitest'
import { computeWeeklyInsight, moodLabelForAverage } from './insights'
import type { MoodEntry } from './types'

const DAY = 24 * 60 * 60 * 1000

function entry(mood: MoodEntry['mood'], daysAgo: number, tags: string[] = []): MoodEntry {
  return { id: `${daysAgo}-${Math.random()}`, timestamp: Date.now() - daysAgo * DAY, mood, tags }
}

describe('computeWeeklyInsight', () => {
  it('returns nulls with no entries', () => {
    const insight = computeWeeklyInsight([])
    expect(insight.thisWeekAvg).toBeNull()
    expect(insight.lastWeekAvg).toBeNull()
    expect(insight.trend).toBeNull()
    expect(insight.topTag).toBeNull()
  })

  it('computes this-week average from entries in the last 7 days', () => {
    const entries = [entry(4, 1), entry(2, 3)]
    const insight = computeWeeklyInsight(entries)
    expect(insight.thisWeekAvg).toBe(3)
    expect(insight.lastWeekAvg).toBeNull()
  })

  it('detects an upward trend', () => {
    const entries = [entry(5, 1), entry(2, 10)]
    const insight = computeWeeklyInsight(entries)
    expect(insight.trend).toBe('up')
  })

  it('detects a downward trend', () => {
    const entries = [entry(2, 1), entry(5, 10)]
    const insight = computeWeeklyInsight(entries)
    expect(insight.trend).toBe('down')
  })

  it('treats a small difference as "same"', () => {
    const entries = [entry(3, 1), entry(3, 10)]
    const insight = computeWeeklyInsight(entries)
    expect(insight.trend).toBe('same')
  })

  it('finds the most common tag this week', () => {
    const entries = [entry(3, 1, ['tired']), entry(4, 2, ['tired', 'anxious']), entry(3, 3, ['calm'])]
    const insight = computeWeeklyInsight(entries)
    expect(insight.topTag).toBe('tired')
  })
})

describe('moodLabelForAverage', () => {
  it('rounds to the nearest mood label', () => {
    expect(moodLabelForAverage(4.6)).toBe('Great')
    expect(moodLabelForAverage(1.2)).toBe('Awful')
    expect(moodLabelForAverage(3)).toBe('Okay')
  })
})
