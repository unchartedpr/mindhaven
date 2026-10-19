import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { Breathing } from './Breathing'

afterEach(() => {
  vi.useRealTimers()
})

describe('Breathing exercise', () => {
  it('shows a ready state before starting', () => {
    render(
      <MemoryRouter>
        <Breathing />
      </MemoryRouter>,
    )
    expect(screen.getByText('Ready?')).toBeInTheDocument()
  })

  it('starts the cycle and shows the first phase', () => {
    render(
      <MemoryRouter>
        <Breathing />
      </MemoryRouter>,
    )
    fireEvent.click(screen.getByRole('button', { name: /^start$/i }))
    // Shown on the circle, and announced once to screen readers via the live region.
    expect(screen.getAllByText('Breathe in')).toHaveLength(2)
    expect(screen.getByText('4s')).toBeInTheDocument()
  })

  it('announces phase changes, not every second', () => {
    vi.useFakeTimers()
    const { container } = render(
      <MemoryRouter>
        <Breathing />
      </MemoryRouter>,
    )
    fireEvent.click(screen.getByRole('button', { name: /^start$/i }))
    const live = container.querySelector('[aria-live="polite"]')!
    expect(live.textContent).toBe('Breathe in')
    act(() => {
      vi.advanceTimersByTime(2_000) // mid-phase: nothing new to announce
    })
    expect(live.textContent).toBe('Breathe in')
    act(() => {
      vi.advanceTimersByTime(2_000) // phase boundary
    })
    expect(live.textContent).toBe('Hold')
  })

  it('progresses through phases and counts a completed cycle', () => {
    vi.useFakeTimers()
    render(
      <MemoryRouter>
        <Breathing />
      </MemoryRouter>,
    )
    fireEvent.click(screen.getByRole('button', { name: /^start$/i }))
    expect(screen.getAllByText('Breathe in').length).toBeGreaterThan(0)

    // 4 phases x 4s = one full cycle back to "Breathe in".
    act(() => {
      vi.advanceTimersByTime(16_000)
    })
    expect(screen.getAllByText('Breathe in').length).toBeGreaterThan(0)
    expect(screen.getByText(/cycles completed: 1/i)).toBeInTheDocument()
  })

  it('can be stopped, returning to the ready state', () => {
    render(
      <MemoryRouter>
        <Breathing />
      </MemoryRouter>,
    )
    fireEvent.click(screen.getByRole('button', { name: /^start$/i }))
    fireEvent.click(screen.getByRole('button', { name: /stop/i }))
    expect(screen.getByText('Ready?')).toBeInTheDocument()
  })
})
