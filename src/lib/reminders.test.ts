import { describe, expect, it } from 'vitest'
import { buildReminderICS, isValidTime } from './reminders'

const NOW = new Date(2026, 9, 15, 12, 0, 0)

describe('isValidTime', () => {
  it('accepts HH:MM in 24-hour time', () => {
    for (const t of ['00:00', '08:05', '20:00', '23:59']) expect(isValidTime(t)).toBe(true)
  })
  it('rejects anything else', () => {
    for (const t of ['', '8:05', '24:00', '12:60', '12:5', 'noon', '12:00:00', '12:00\nEVIL']) {
      expect(isValidTime(t)).toBe(false)
    }
  })
})

describe('buildReminderICS', () => {
  const ics = buildReminderICS({ time: '20:30', url: 'https://example.org/', now: NOW, uid: 'test-uid' })

  it('is a well-formed calendar with CRLF line endings', () => {
    expect(ics.startsWith('BEGIN:VCALENDAR\r\n')).toBe(true)
    expect(ics.endsWith('END:VCALENDAR\r\n')).toBe(true)
    expect(ics.replace(/\r\n/g, '')).not.toMatch(/[\r\n]/)
    expect(ics).toContain('BEGIN:VEVENT')
    expect(ics).toContain('END:VEVENT')
  })

  it('repeats daily at the chosen local time, starting tomorrow', () => {
    expect(ics).toContain('RRULE:FREQ=DAILY')
    expect(ics).toContain('DTSTART:20261016T203000')
    expect(ics).not.toMatch(/DTSTART:.*Z/) // floating local time, not UTC
  })

  it('includes an alarm so the calendar actually notifies', () => {
    expect(ics).toContain('BEGIN:VALARM')
    expect(ics).toContain('TRIGGER:PT0S')
  })

  it('keeps every line within the 75-character limit', () => {
    const long = buildReminderICS({ time: '09:00', url: 'https://example.org/' + 'a'.repeat(200), now: NOW })
    for (const line of long.split('\r\n')) expect(line.length).toBeLessThanOrEqual(75)
  })

  it('refuses an invalid time', () => {
    expect(() => buildReminderICS({ time: '25:99', url: 'https://example.org/' })).toThrow()
  })

  it('escapes characters that are special in iCalendar text', () => {
    const escaped = buildReminderICS({ time: '09:00', url: 'https://example.org/?a=1;b=2,c', now: NOW })
    expect(escaped).toContain('\\;')
    expect(escaped).toContain('\\,')
  })
})
