import { describe, expect, it } from 'vitest'
import { followUpFor } from './suggestions'
import type { MoodValue } from './types'

const targets = (mood: MoodValue, tags: string[]) => followUpFor(mood, tags).suggestions.map((s) => s.to)

describe('followUpFor', () => {
  it('suggests breathing and grounding for anxiety', () => {
    expect(targets(3, ['anxious'])).toEqual(['/exercises/breathing', '/exercises/grounding'])
  })

  it('suggests a body scan when tired and worry time when stressed', () => {
    expect(targets(3, ['tired'])).toEqual(['/exercises/body-scan'])
    expect(targets(3, ['stressed'])).toContain('/exercises/worry-time')
  })

  it('never repeats a suggestion and returns at most three', () => {
    const result = targets(3, ['anxious', 'stressed', 'overwhelmed', 'tired', 'sad'])
    expect(new Set(result).size).toBe(result.length)
    expect(result.length).toBeLessThanOrEqual(3)
  })

  it('offers gratitude to capture a good moment', () => {
    expect(targets(5, ['grateful'])).toContain('/exercises/gratitude')
    expect(targets(5, [])).toContain('/exercises/gratitude')
  })

  it('offers breathing on a low day with no tags', () => {
    expect(targets(1, [])).toEqual(['/exercises/breathing'])
  })

  it('points to support on low moods and when lonely, but not on good days', () => {
    expect(followUpFor(1, []).offerSupport).toBe(true)
    expect(followUpFor(2, []).offerSupport).toBe(true)
    expect(followUpFor(4, ['lonely']).offerSupport).toBe(true)
    expect(followUpFor(3, []).offerSupport).toBe(false)
    expect(followUpFor(5, ['grateful']).offerSupport).toBe(false)
  })

  it('always has a short acknowledgement and every suggestion links inside the app', () => {
    for (const mood of [1, 2, 3, 4, 5] as MoodValue[]) {
      const f = followUpFor(mood, ['anxious', 'sad', 'tired'])
      expect(f.message.length).toBeGreaterThan(0)
      for (const s of f.suggestions) expect(s.to.startsWith('/exercises/')).toBe(true)
    }
  })

  it('ignores tags it has no rule for', () => {
    expect(targets(3, ['made-up'])).toEqual([])
  })
})
