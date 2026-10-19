import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { MoodCalendar } from './MoodCalendar'
import type { MoodEntry } from '../lib/types'

const entry = (day: number, mood: MoodEntry['mood'], hour = 9): MoodEntry => ({
  id: `${day}-${hour}`,
  timestamp: new Date(2026, 9, day, hour).getTime(),
  mood,
  tags: [],
})

describe('MoodCalendar', () => {
  it('is an accessible table with weekday headers and a caption', () => {
    render(<MoodCalendar entries={[]} year={2026} month={9} />)
    const table = screen.getByRole('table', { name: /check-ins for october 2026/i })
    expect(within(table).getAllByRole('columnheader')).toHaveLength(7)
  })

  it('shows every day of the month', () => {
    const { container } = render(<MoodCalendar entries={[]} year={2026} month={9} />)
    expect(container.querySelectorAll('tbody td[title]')).toHaveLength(31)
  })

  it('describes each logged day in words, not just colour', () => {
    render(<MoodCalendar entries={[entry(10, 5), entry(10, 3, 18)]} year={2026} month={9} />)
    // Two check-ins (5 and 3) average 4.0 = Good.
    expect(screen.getByText(/Good \(4\.0\), 2 check-ins/)).toBeInTheDocument()
  })

  it('says so when a day has no check-in', () => {
    render(<MoodCalendar entries={[]} year={2026} month={9} />)
    expect(screen.getAllByText(/no check-in/).length).toBe(31)
  })

  it('shows an emoji on logged days so colour is never the only signal', () => {
    const { container } = render(<MoodCalendar entries={[entry(3, 1)]} year={2026} month={9} />)
    expect(container.textContent).toContain('😞')
  })

  it('does not bleed entries from other months', () => {
    const other: MoodEntry = { id: 'x', timestamp: new Date(2026, 8, 10, 9).getTime(), mood: 5, tags: [] }
    render(<MoodCalendar entries={[other]} year={2026} month={9} />)
    expect(screen.queryByText(/Great/)).not.toBeInTheDocument()
  })
})
