import { beforeEach, describe, expect, it, vi } from 'vitest'
import { computeStreak, gratitudeStore, moodStore, reframeStore } from './storage'
import type { MoodEntry } from './types'

beforeEach(() => {
  localStorage.clear()
})

describe('moodStore', () => {
  it('starts empty', () => {
    expect(moodStore.all()).toEqual([])
  })

  it('adds and retrieves entries, newest first', () => {
    moodStore.add({ mood: 3, tags: [], timestamp: 1000 })
    moodStore.add({ mood: 5, tags: ['grateful'], timestamp: 2000 })

    const all = moodStore.all()
    expect(all).toHaveLength(2)
    expect(all[0].mood).toBe(5)
    expect(all[1].mood).toBe(3)
  })

  it('removes an entry by id', () => {
    const entry = moodStore.add({ mood: 2, tags: [] })
    moodStore.remove(entry.id)
    expect(moodStore.all()).toEqual([])
  })

  it('persists across separate calls (backed by localStorage)', () => {
    moodStore.add({ mood: 4, tags: [] })
    expect(moodStore.all()).toHaveLength(1)
    expect(JSON.parse(localStorage.getItem('mindhaven:v1:moods')!)).toHaveLength(1)
  })
})

describe('gratitudeStore', () => {
  it('adds items and returns newest first', () => {
    vi.useFakeTimers()
    vi.setSystemTime(1000)
    gratitudeStore.add(['first'])
    vi.setSystemTime(2000)
    gratitudeStore.add(['second'])
    vi.useRealTimers()

    const all = gratitudeStore.all()
    expect(all[0].items).toEqual(['second'])
    expect(all[1].items).toEqual(['first'])
  })
})

describe('reframeStore', () => {
  it('round-trips a thought-reframe entry', () => {
    reframeStore.add({
      situation: 'Missed a deadline',
      automaticThought: "I'm a failure",
      evidenceFor: 'I was late',
      evidenceAgainst: 'I usually deliver on time',
      balancedThought: 'One missed deadline does not define me',
    })
    const all = reframeStore.all()
    expect(all).toHaveLength(1)
    expect(all[0].balancedThought).toBe('One missed deadline does not define me')
  })
})

describe('computeStreak', () => {
  const DAY = 24 * 60 * 60 * 1000

  function entryOnDaysAgo(daysAgo: number): MoodEntry {
    return {
      id: String(daysAgo),
      timestamp: Date.now() - daysAgo * DAY,
      mood: 3,
      tags: [],
    }
  }

  it('is 0 with no entries', () => {
    expect(computeStreak([])).toBe(0)
  })

  it('is 0 if the most recent entry is not from today', () => {
    expect(computeStreak([entryOnDaysAgo(2)])).toBe(0)
  })

  it('counts consecutive days ending today', () => {
    const entries = [entryOnDaysAgo(0), entryOnDaysAgo(1), entryOnDaysAgo(2)]
    expect(computeStreak(entries)).toBe(3)
  })

  it('stops counting at the first gap', () => {
    const entries = [entryOnDaysAgo(0), entryOnDaysAgo(1), entryOnDaysAgo(3)]
    expect(computeStreak(entries)).toBe(2)
  })

  it('treats multiple check-ins on the same day as one', () => {
    const entries = [entryOnDaysAgo(0), entryOnDaysAgo(0), entryOnDaysAgo(1)]
    expect(computeStreak(entries)).toBe(2)
  })
})
