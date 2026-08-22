import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { Home } from './Home'
import { moodStore } from '../lib/storage'

beforeEach(() => {
  localStorage.clear()
})

describe('Home page', () => {
  it('shows a zero streak and no check-ins when there is no data', () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>,
    )
    expect(screen.getByText('0')).toBeInTheDocument()
    expect(screen.getByText(/no check-ins yet/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /check in now/i })).toBeInTheDocument()
  })

  it('shows the streak and last check-in once data exists', () => {
    moodStore.add({ mood: 4, tags: [] })
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>,
    )
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.queryByText(/no check-ins yet/i)).not.toBeInTheDocument()
    // Already checked in today, so there should be no "check in now" prompt on the streak card.
    expect(screen.queryByRole('link', { name: /check in now/i })).not.toBeInTheDocument()
  })

  it('shows the weekly insight once there is enough mood data', () => {
    moodStore.add({ mood: 5, tags: ['grateful'] })
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>,
    )
    expect(screen.getByText(/this week you're averaging/i)).toBeInTheDocument()
  })
})
