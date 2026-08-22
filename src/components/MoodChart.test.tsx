import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { MoodChart } from './MoodChart'
import type { MoodEntry } from '../lib/types'

describe('MoodChart', () => {
  it('shows a hint when there are no entries', () => {
    render(<MoodChart entries={[]} />)
    expect(screen.getByText(/check in a few times/i)).toBeInTheDocument()
  })

  it('renders a data point with a tooltip for a logged day', () => {
    const entries: MoodEntry[] = [{ id: '1', timestamp: Date.now(), mood: 5, tags: [] }]
    const { container } = render(<MoodChart entries={entries} />)
    expect(screen.queryByText(/check in a few times/i)).not.toBeInTheDocument()
    const titles = container.querySelectorAll('title')
    expect(titles.length).toBeGreaterThan(0)
    expect(titles[titles.length - 1].textContent).toMatch(/Great \(5\.0\)/)
  })
})
