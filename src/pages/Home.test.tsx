import { act, render, screen, within } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { Home } from './Home'
import { backupMeta, gratitudeStore, moodStore } from '../lib/storage'

beforeEach(() => {
  localStorage.clear()
})

const DAY = 24 * 60 * 60 * 1000

const renderHome = () =>
  render(
    <MemoryRouter>
      <Home />
    </MemoryRouter>,
  )

const lastCheckInCard = () => screen.getByRole('heading', { name: /last check-in/i }).parentElement!
const streakCard = () => screen.getByRole('heading', { name: /your streak/i }).closest('div')!.parentElement!

describe('Home page', () => {
  it('shows a zero streak and no check-ins when there is no data', () => {
    renderHome()
    expect(within(streakCard()).getByText('0')).toBeInTheDocument()
    expect(screen.getByText(/no check-ins yet/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /check in now/i })).toBeInTheDocument()
  })

  it('shows the streak and last check-in once data exists', () => {
    moodStore.add({ mood: 4, tags: [] })
    renderHome()
    expect(within(streakCard()).getByText('1')).toBeInTheDocument()
    expect(screen.queryByText(/no check-ins yet/i)).not.toBeInTheDocument()
    expect(within(lastCheckInCard()).getByText('Good')).toBeInTheDocument()
    // Already checked in today, so there is no "check in now" prompt.
    expect(screen.queryByRole('link', { name: /check in now/i })).not.toBeInTheDocument()
  })

  it('keeps showing a live streak in the morning, before today’s check-in', () => {
    moodStore.add({ mood: 3, tags: [], timestamp: Date.now() - DAY })
    moodStore.add({ mood: 3, tags: [], timestamp: Date.now() - 2 * DAY })
    renderHome()
    expect(within(streakCard()).getByText('2')).toBeInTheDocument()
    expect(screen.getByText(/check in today to keep it going/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /check in now/i })).toBeInTheDocument()
  })

  it('shows the weekly insight once there is enough mood data', () => {
    moodStore.add({ mood: 5, tags: ['grateful'] })
    renderHome()
    expect(screen.getByText(/this week you're averaging/i)).toBeInTheDocument()
  })

  it('updates live when data changes elsewhere (e.g. another tab)', () => {
    renderHome()
    expect(screen.getByText(/no check-ins yet/i)).toBeInTheDocument()
    act(() => {
      moodStore.add({ mood: 5, tags: [] })
    })
    expect(screen.queryByText(/no check-ins yet/i)).not.toBeInTheDocument()
    expect(within(lastCheckInCard()).getByText('Great')).toBeInTheDocument()
  })

  it('links to every part of the app, including the safety plan and insights', () => {
    renderHome()
    const explore = screen.getByRole('heading', { name: /explore/i }).parentElement!
    for (const [name, href] of [
      [/daily check-in/i, '/check-in'],
      [/coping exercises/i, '/exercises'],
      [/journal/i, '/journal'],
      [/insights/i, '/insights'],
      [/safety plan/i, '/safety-plan'],
      [/crisis resources/i, '/resources'],
    ] as const) {
      expect(within(explore).getByRole('link', { name })).toHaveAttribute('href', href)
    }
  })

  describe('backup nudge', () => {
    it('is not shown to someone who has barely started', () => {
      moodStore.add({ mood: 3, tags: [] })
      renderHome()
      expect(screen.queryByText(/live only in this browser/i)).not.toBeInTheDocument()
    })

    it('appears once there is enough data and no backup, counting every kind of entry', () => {
      for (let i = 0; i < 3; i++) moodStore.add({ mood: 3, tags: [] })
      gratitudeStore.add({ items: ['a'] })
      gratitudeStore.add({ items: ['b'] })
      renderHome()
      expect(screen.getByText(/live only in this browser/i)).toBeInTheDocument()
    })

    it('goes away after a backup', () => {
      for (let i = 0; i < 6; i++) moodStore.add({ mood: 3, tags: [] })
      backupMeta.markBackedUp()
      renderHome()
      expect(screen.queryByText(/live only in this browser/i)).not.toBeInTheDocument()
    })
  })
})
