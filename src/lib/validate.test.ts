import { describe, expect, it } from 'vitest'
import {
  LIMITS,
  emptySafetyPlan,
  isSafetyPlanEmpty,
  sanitizeGratitude,
  sanitizeMood,
  sanitizeReframe,
  sanitizeSafetyPlan,
  sanitizeWorry,
} from './validate'

const base = { id: 'a', timestamp: 1000 }

describe('sanitizeMood', () => {
  it('accepts a well-formed entry', () => {
    expect(sanitizeMood({ ...base, mood: 4, tags: ['calm'], note: 'fine' })).toEqual({
      id: 'a',
      timestamp: 1000,
      mood: 4,
      tags: ['calm'],
      note: 'fine',
    })
  })

  it.each([
    ['non-object', 'x'],
    ['null', null],
    ['array', []],
    ['missing id', { timestamp: 1, mood: 3 }],
    ['empty id', { id: '', timestamp: 1, mood: 3 }],
    ['overlong id', { id: 'x'.repeat(101), timestamp: 1, mood: 3 }],
    ['string timestamp', { id: 'a', timestamp: '1', mood: 3 }],
    ['NaN timestamp', { id: 'a', timestamp: NaN, mood: 3 }],
    ['Infinity timestamp', { id: 'a', timestamp: Infinity, mood: 3 }],
    ['negative timestamp', { id: 'a', timestamp: -1, mood: 3 }],
    ['mood 0', { ...base, mood: 0 }],
    ['mood 6', { ...base, mood: 6 }],
    ['fractional mood', { ...base, mood: 3.5 }],
    ['string mood', { ...base, mood: '3' }],
  ])('rejects %s', (_name, input) => {
    expect(sanitizeMood(input)).toBeNull()
  })

  it('coerces bad tags and drops an empty note', () => {
    const clean = sanitizeMood({ ...base, mood: 3, tags: 'nope', note: '' })
    expect(clean?.tags).toEqual([])
    expect(clean).not.toHaveProperty('note')
  })

  it('limits tag count, tag length, and note length', () => {
    const tags = Array.from({ length: 50 }, (_, i) => `tag${i}`.padEnd(100, 'x'))
    const clean = sanitizeMood({ ...base, mood: 3, tags, note: 'n'.repeat(LIMITS.longText + 500) })
    expect(clean?.tags).toHaveLength(LIMITS.tags)
    expect(clean?.tags[0]).toHaveLength(40)
    expect(clean?.note).toHaveLength(LIMITS.longText)
  })

  it('does not copy unknown properties', () => {
    const clean = sanitizeMood({ ...base, mood: 3, tags: [], __proto__: { evil: 1 }, extra: 'x' })
    expect(clean).not.toHaveProperty('extra')
  })
})

describe('sanitizeGratitude', () => {
  it('keeps non-empty strings only', () => {
    expect(sanitizeGratitude({ ...base, items: ['a', '  ', 3, 'b'] })?.items).toEqual(['a', 'b'])
  })
  it('rejects an entry with nothing in it', () => {
    expect(sanitizeGratitude({ ...base, items: [] })).toBeNull()
    expect(sanitizeGratitude({ ...base, items: 'x' })).toBeNull()
  })
})

describe('sanitizeReframe', () => {
  it('coerces missing fields to empty strings', () => {
    const clean = sanitizeReframe({ ...base, situation: 's', automaticThought: 123 })
    expect(clean).toMatchObject({ situation: 's', automaticThought: '', evidenceFor: '', balancedThought: '' })
  })
  it('rejects an entirely empty reframe', () => {
    expect(sanitizeReframe({ ...base })).toBeNull()
  })
})

describe('sanitizeWorry', () => {
  it('requires text', () => {
    expect(sanitizeWorry({ ...base, worry: 'x' })?.worry).toBe('x')
    expect(sanitizeWorry({ ...base, worry: '   ' })).toBeNull()
    expect(sanitizeWorry({ ...base, worry: 5 })).toBeNull()
  })
})

describe('sanitizeSafetyPlan', () => {
  it('rejects non-objects', () => {
    expect(sanitizeSafetyPlan(null)).toBeNull()
    expect(sanitizeSafetyPlan('plan')).toBeNull()
    expect(sanitizeSafetyPlan([])).toBeNull()
  })

  it('fills in every section, defaulting to empty', () => {
    expect(sanitizeSafetyPlan({})).toMatchObject({
      warningSigns: [],
      copingStrategies: [],
      distractionPeople: [],
      supportPeople: [],
      professionals: [],
      safeEnvironment: [],
      reasonsToLive: [],
    })
  })

  it('keeps only phone-safe characters, so values are safe in a tel: link', () => {
    const plan = sanitizeSafetyPlan({ supportPeople: [{ name: 'Sam', phone: '+1 (555) 010-0100 ext<b>9' }] })
    expect(plan?.supportPeople[0].phone).toBe('+1 (555) 010-0100 9')
  })

  it('drops contacts that are completely blank and caps the list', () => {
    const many = Array.from({ length: 30 }, (_, i) => ({ name: `P${i}`, phone: '' }))
    const plan = sanitizeSafetyPlan({ supportPeople: [{ name: '', phone: '' }, ...many] })
    expect(plan?.supportPeople).toHaveLength(10)
    expect(plan?.supportPeople[0].name).toBe('P0')
  })
})

describe('isSafetyPlanEmpty', () => {
  it('is true for null and for a plan with nothing in it', () => {
    expect(isSafetyPlanEmpty(null)).toBe(true)
    expect(isSafetyPlanEmpty(emptySafetyPlan())).toBe(true)
  })
  it('is false as soon as anything is filled in', () => {
    expect(isSafetyPlanEmpty({ ...emptySafetyPlan(), reasonsToLive: ['x'] })).toBe(false)
    expect(isSafetyPlanEmpty({ ...emptySafetyPlan(), professionals: [{ name: 'Dr', phone: '' }] })).toBe(false)
  })
})
