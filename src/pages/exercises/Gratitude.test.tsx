import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { Gratitude } from './Gratitude'
import { gratitudeStore } from '../../lib/storage'

beforeEach(() => {
  localStorage.clear()
})

describe('Gratitude exercise', () => {
  it('saves only the non-empty items', () => {
    render(
      <MemoryRouter>
        <Gratitude />
      </MemoryRouter>,
    )
    fireEvent.change(screen.getByPlaceholderText("1. I'm grateful for..."), {
      target: { value: 'Sunshine' },
    })
    fireEvent.click(screen.getByRole('button', { name: /^save$/i }))

    expect(screen.getByText(/saved to your journal/i)).toBeInTheDocument()
    expect(gratitudeStore.all()).toHaveLength(1)
    expect(gratitudeStore.all()[0].items).toEqual(['Sunshine'])
  })

  it('does not save when all fields are empty', () => {
    render(
      <MemoryRouter>
        <Gratitude />
      </MemoryRouter>,
    )
    fireEvent.click(screen.getByRole('button', { name: /^save$/i }))
    expect(gratitudeStore.all()).toHaveLength(0)
    expect(screen.queryByText(/saved to your journal/i)).not.toBeInTheDocument()
  })
})
