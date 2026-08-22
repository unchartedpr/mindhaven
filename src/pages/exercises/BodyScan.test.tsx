import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { BodyScan } from './BodyScan'

beforeEach(() => {
  localStorage.clear()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('BodyScan exercise', () => {
  it('shows an intro screen before starting', () => {
    render(
      <MemoryRouter>
        <BodyScan />
      </MemoryRouter>,
    )
    expect(screen.getByRole('button', { name: /^start$/i })).toBeInTheDocument()
  })

  it('walks through steps and shows a completion screen at the end', () => {
    render(
      <MemoryRouter>
        <BodyScan />
      </MemoryRouter>,
    )
    fireEvent.click(screen.getByRole('button', { name: /^start$/i }))
    expect(screen.getByText('Feet')).toBeInTheDocument()

    // Manually advance through all 7 steps via the Next button.
    for (let i = 0; i < 6; i++) {
      fireEvent.click(screen.getByRole('button', { name: /next/i }))
    }
    fireEvent.click(screen.getByRole('button', { name: /finish/i }))

    expect(screen.getByText(/you made it through/i)).toBeInTheDocument()
  })

  it('pausing does not return to the intro screen', () => {
    render(
      <MemoryRouter>
        <BodyScan />
      </MemoryRouter>,
    )
    fireEvent.click(screen.getByRole('button', { name: /^start$/i }))
    fireEvent.click(screen.getByRole('button', { name: /pause/i }))
    expect(screen.getByText('Feet')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /^start$/i })).not.toBeInTheDocument()
  })

  it('auto-advances to the next step after the step duration', () => {
    vi.useFakeTimers()
    render(
      <MemoryRouter>
        <BodyScan />
      </MemoryRouter>,
    )
    fireEvent.click(screen.getByRole('button', { name: /^start$/i }))
    expect(screen.getByText('Feet')).toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(15_000)
    })
    expect(screen.getByText('Legs')).toBeInTheDocument()
  })
})
