import { describe, expect, it } from 'vitest'
import { CRISIS_DIRECTORY, INTERNATIONAL_RESOURCES } from './resources'

describe('CRISIS_DIRECTORY', () => {
  it('has a healthy number of countries covered', () => {
    expect(CRISIS_DIRECTORY.length).toBeGreaterThanOrEqual(20)
  })

  it('has no duplicate countries', () => {
    const names = CRISIS_DIRECTORY.map((c) => c.country)
    expect(new Set(names).size).toBe(names.length)
  })

  it('every country has an emergency number and at least one resource', () => {
    for (const country of CRISIS_DIRECTORY) {
      expect(country.emergency.trim()).not.toBe('')
      expect(country.resources.length).toBeGreaterThan(0)
      for (const r of country.resources) {
        expect(r.name.trim()).not.toBe('')
        expect(r.contact.trim()).not.toBe('')
        expect(r.description.trim()).not.toBe('')
      }
    }
  })

  it('is sorted alphabetically by country name', () => {
    const names = CRISIS_DIRECTORY.map((c) => c.country)
    const sorted = [...names].sort((a, b) => a.localeCompare(b))
    expect(names).toEqual(sorted)
  })
})

describe('INTERNATIONAL_RESOURCES', () => {
  it('provides at least one global fallback directory', () => {
    expect(INTERNATIONAL_RESOURCES.length).toBeGreaterThan(0)
  })
})
