import { fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { Insights } from './Insights'
import { moodStore } from '../lib/storage'

const DAY = 24 * 60 * 60 * 1000
let blobs: Blob[] = []

beforeEach(() => {
  localStorage.clear()
  blobs = []
  URL.createObjectURL = vi.fn((b: Blob) => {
    blobs.push(b)
    return 'blob:test'
  })
  URL.revokeObjectURL = vi.fn()
  vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
})

afterEach(() => {
  vi.restoreAllMocks()
})

const renderPage = () =>
  render(
    <MemoryRouter>
      <Insights />
    </MemoryRouter>,
  )

function seed() {
  const now = Date.now()
  // Anxious days are low, calm days are high; enough of each to form a pattern.
  for (let i = 0; i < 4; i++) moodStore.add({ mood: 2, tags: ['anxious'], timestamp: now - i * DAY })
  for (let i = 4; i < 8; i++) moodStore.add({ mood: 5, tags: ['calm'], timestamp: now - i * DAY })
}

describe('Insights page', () => {
  it('invites a first check-in when there is no data', () => {
    renderPage()
    expect(screen.getByText(/no check-ins yet/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /do a check-in/i })).toHaveAttribute('href', '/check-in')
  })

  it('summarises the chosen range', () => {
    seed()
    renderPage()
    const summary = screen.getByRole('region', { name: /summary, last 30 days/i })
    expect(within(summary).getByText('Check-ins')).toBeInTheDocument()
    expect(within(summary).getByText('8')).toBeInTheDocument()
    expect(within(summary).getByText(/on 8 of 30 days/)).toBeInTheDocument()
  })

  it('switches range and says which range it is showing', () => {
    seed()
    renderPage()
    fireEvent.click(screen.getByRole('button', { name: '7 days' }))
    expect(screen.getByRole('button', { name: '7 days' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('region', { name: /summary, last 7 days/i })).toBeInTheDocument()
    expect(screen.getByRole('img', { name: /mood trend over the last 7 days/i })).toBeInTheDocument()
  })

  it('describes tag patterns as associations, not causes', () => {
    seed()
    renderPage()
    expect(screen.getByText(/“anxious”/)).toBeInTheDocument()
    expect(screen.getByText(/lower than your overall average/)).toBeInTheDocument()
    expect(screen.getByText(/higher than your overall average/)).toBeInTheDocument()
    expect(screen.getByText(/not causes/i)).toBeInTheDocument()
  })

  it('explains what is needed before patterns appear', () => {
    moodStore.add({ mood: 3, tags: ['calm'] })
    renderPage()
    expect(screen.getByText(/at least 3 check-ins/i)).toBeInTheDocument()
  })

  it('navigates months, but not into the future', () => {
    seed()
    renderPage()
    expect(screen.getByRole('button', { name: /next month/i })).toBeDisabled()
    const here = screen.getByRole('table').getAttribute('aria-label') ?? screen.getByRole('table').textContent
    fireEvent.click(screen.getByRole('button', { name: /previous month/i }))
    expect(screen.getByRole('button', { name: /next month/i })).toBeEnabled()
    expect(screen.getByRole('table').textContent).not.toBe(here)
  })

  it('downloads check-ins as CSV', async () => {
    seed()
    renderPage()
    fireEvent.click(screen.getByRole('button', { name: /download check-ins \(csv\)/i }))
    expect(blobs[0].type).toContain('text/csv')
    expect((await blobs[0].text()).split('\r\n')).toHaveLength(8 + 2) // header + 8 rows + trailing newline
  })

  it('offers a printable summary, and says the printout leaves notes out', () => {
    seed()
    renderPage()
    expect(screen.getByRole('button', { name: /print or save summary as pdf/i })).toBeInTheDocument()
    expect(screen.getByText(/not your notes/i)).toBeInTheDocument()
  })

  it('reflects deletions immediately', () => {
    seed()
    renderPage()
    expect(screen.getByRole('region', { name: /summary/i })).toHaveTextContent('8')
    moodStore.clear()
    // The page re-renders into its empty state when the data goes away.
    return screen.findByText(/no check-ins yet/i)
  })
})
