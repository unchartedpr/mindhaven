import { describe, expect, it } from 'vitest'
import {
  computeStreak,
  computeWeeklyInsight,
  csvCell,
  dailyAverages,
  dayKey,
  monthGrid,
  moodLabelForAverage,
  moodsToCSV,
  summarizeRange,
  tagPatterns,
} from './insights'
import type { MoodEntry } from './types'

const DAY = 24 * 60 * 60 * 1000

/** Noon, local time, `daysAgo` days before the fixed "now" — avoids midnight and DST edge effects. */
const NOW = new Date(2026, 9, 15, 12, 0, 0).getTime()
function at(daysAgo: number): number {
  const d = new Date(NOW)
  d.setDate(d.getDate() - daysAgo)
  return d.getTime()
}

function entry(mood: MoodEntry['mood'], daysAgo: number, tags: string[] = []): MoodEntry {
  return { id: `${daysAgo}-${mood}-${tags.join('')}`, timestamp: at(daysAgo), mood, tags }
}

describe('dayKey', () => {
  it('formats the local calendar day', () => {
    expect(dayKey(new Date(2026, 0, 5, 23, 59).getTime())).toBe('2026-01-05')
    expect(dayKey(new Date(2026, 11, 31, 0, 1).getTime())).toBe('2026-12-31')
  })
})

describe('computeStreak', () => {
  it('is 0 with no entries', () => {
    expect(computeStreak([], NOW)).toBe(0)
  })

  it('counts consecutive days ending today', () => {
    expect(computeStreak([entry(3, 0), entry(3, 1), entry(3, 2)], NOW)).toBe(3)
  })

  it('stays alive when the last check-in was yesterday (today is not over yet)', () => {
    expect(computeStreak([entry(3, 1), entry(3, 2), entry(3, 3)], NOW)).toBe(3)
  })

  it('is 0 once a whole day has been missed', () => {
    expect(computeStreak([entry(3, 2), entry(3, 3)], NOW)).toBe(0)
  })

  it('stops at the first gap', () => {
    expect(computeStreak([entry(3, 0), entry(3, 1), entry(3, 3)], NOW)).toBe(2)
  })

  it('counts several check-ins on one day once', () => {
    expect(computeStreak([entry(3, 0), entry(4, 0), entry(3, 1)], NOW)).toBe(2)
  })
})

describe('computeWeeklyInsight', () => {
  it('returns nulls with no entries', () => {
    expect(computeWeeklyInsight([], NOW)).toEqual({ thisWeekAvg: null, lastWeekAvg: null, topTag: null, trend: null })
  })

  it('averages the last 7 days', () => {
    const insight = computeWeeklyInsight([entry(4, 1), entry(2, 3)], NOW)
    expect(insight.thisWeekAvg).toBe(3)
    expect(insight.lastWeekAvg).toBeNull()
  })

  it('detects up, down, and same', () => {
    expect(computeWeeklyInsight([entry(5, 1), entry(2, 10)], NOW).trend).toBe('up')
    expect(computeWeeklyInsight([entry(2, 1), entry(5, 10)], NOW).trend).toBe('down')
    expect(computeWeeklyInsight([entry(3, 1), entry(3, 10)], NOW).trend).toBe('same')
  })

  it('finds the most common tag this week', () => {
    const entries = [entry(3, 1, ['tired']), entry(4, 2, ['tired', 'anxious']), entry(3, 3, ['calm'])]
    expect(computeWeeklyInsight(entries, NOW).topTag).toBe('tired')
  })
})

describe('moodLabelForAverage', () => {
  it('rounds to the nearest label and clamps', () => {
    expect(moodLabelForAverage(4.6)).toBe('Great')
    expect(moodLabelForAverage(1.2)).toBe('Awful')
    expect(moodLabelForAverage(3)).toBe('Okay')
    expect(moodLabelForAverage(99)).toBe('Great')
    expect(moodLabelForAverage(-4)).toBe('Awful')
  })
})

describe('dailyAverages', () => {
  it('returns one point per day, oldest first, ending today', () => {
    const points = dailyAverages([entry(4, 0), entry(2, 0), entry(5, 2)], 5, NOW)
    expect(points).toHaveLength(5)
    expect(points[4].key).toBe(dayKey(NOW))
    expect(points[4].avg).toBe(3)
    expect(points[4].count).toBe(2)
    expect(points[2].avg).toBe(5)
    expect(points[3].avg).toBeNull()
  })
})

describe('monthGrid', () => {
  it('lays out a month in whole weeks starting on Sunday', () => {
    // October 2026 starts on a Thursday and has 31 days.
    const weeks = monthGrid([], 2026, 9)
    expect(weeks.every((w) => w.length === 7)).toBe(true)
    expect(weeks[0].slice(0, 4).every((c) => c === null)).toBe(true)
    expect(weeks[0][4]?.date.getDate()).toBe(1)
    const days = weeks.flat().filter((c) => c !== null)
    expect(days).toHaveLength(31)
  })

  it('attaches check-ins to the right day', () => {
    const e: MoodEntry = { id: 'a', timestamp: new Date(2026, 9, 10, 9, 0).getTime(), mood: 5, tags: [] }
    const cell = monthGrid([e], 2026, 9).flat().find((c) => c?.date.getDate() === 10)
    expect(cell?.avg).toBe(5)
    expect(cell?.count).toBe(1)
  })
})

describe('summarizeRange', () => {
  it('summarises counts, average, best and lowest day', () => {
    const s = summarizeRange([entry(5, 1), entry(2, 2), entry(3, 3), entry(4, 40)], 7, NOW)
    expect(s.entries).toBe(3)
    expect(s.checkInDays).toBe(3)
    expect(s.avg).toBeCloseTo(10 / 3)
    expect(s.best?.avg).toBe(5)
    expect(s.lowest?.avg).toBe(2)
  })

  it('handles an empty range', () => {
    const s = summarizeRange([], 7, NOW)
    expect(s).toEqual({ entries: 0, checkInDays: 0, avg: null, best: null, lowest: null })
  })
})

describe('tagPatterns', () => {
  const entries: MoodEntry[] = [
    entry(2, 1, ['anxious']),
    entry(1, 2, ['anxious']),
    entry(2, 3, ['anxious']),
    entry(5, 4, ['calm']),
    entry(4, 5, ['calm']),
    entry(5, 6, ['calm']),
    entry(3, 7, ['rare']),
  ]

  it('compares each tag with the overall average, largest difference first', () => {
    const patterns = tagPatterns(entries, 30, NOW)
    expect(patterns.map((p) => p.tag)).toEqual(['calm', 'anxious'])
    expect(patterns[0].delta).toBeGreaterThan(0)
    expect(patterns[1].delta).toBeLessThan(0)
  })

  it('leaves out tags that appear too few times', () => {
    expect(tagPatterns(entries, 30, NOW).some((p) => p.tag === 'rare')).toBe(false)
  })

  it('returns nothing when there is too little data', () => {
    expect(tagPatterns([entry(3, 1, ['a'])], 30, NOW)).toEqual([])
  })
})

describe('CSV export', () => {
  it('quotes cells that contain commas, quotes, or newlines', () => {
    expect(csvCell('plain')).toBe('plain')
    expect(csvCell('a,b')).toBe('"a,b"')
    expect(csvCell('say "hi"')).toBe('"say ""hi"""')
    expect(csvCell('line1\nline2')).toBe('"line1\nline2"')
  })

  it('neutralises spreadsheet formulas so a note cannot execute when opened in Excel', () => {
    expect(csvCell('=HYPERLINK("http://evil","x")')).toBe(`"'=HYPERLINK(""http://evil"",""x"")"`)
    expect(csvCell('+1+1')).toBe("'+1+1")
    expect(csvCell('-2')).toBe("'-2")
    expect(csvCell('@SUM(A1)')).toBe("'@SUM(A1)")
  })

  it('writes a header and one row per check-in, oldest first, in local time', () => {
    const a: MoodEntry = { id: 'a', timestamp: new Date(2026, 9, 2, 8, 5).getTime(), mood: 4, tags: ['calm', 'hopeful'], note: 'good, mostly' }
    const b: MoodEntry = { id: 'b', timestamp: new Date(2026, 9, 1, 21, 30).getTime(), mood: 2, tags: [] }
    const lines = moodsToCSV([a, b]).trimEnd().split('\r\n')
    expect(lines[0]).toBe('date,time,mood,mood_label,tags,note')
    expect(lines[1]).toBe('2026-10-01,21:30,2,Rough,,')
    expect(lines[2]).toBe('2026-10-02,08:05,4,Good,calm; hopeful,"good, mostly"')
  })
})

describe('time windows', () => {
  it('uses 24-hour windows for the weekly comparison', () => {
    const justInside: MoodEntry = { id: 'i', timestamp: NOW - 7 * DAY + 1000, mood: 5, tags: [] }
    const justOutside: MoodEntry = { id: 'o', timestamp: NOW - 7 * DAY - 1000, mood: 1, tags: [] }
    const insight = computeWeeklyInsight([justInside, justOutside], NOW)
    expect(insight.thisWeekAvg).toBe(5)
    expect(insight.lastWeekAvg).toBe(1)
  })
})
