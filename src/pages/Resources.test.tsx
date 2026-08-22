import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Resources } from './Resources'

describe('Resources page', () => {
  it('shows resources for the default selected country', () => {
    render(<Resources />)
    expect(screen.getByRole('heading', { name: /crisis resources/i })).toBeInTheDocument()
    // The select defaults to the first country alphabetically.
    const select = screen.getByLabelText(/select your country/i) as HTMLSelectElement
    expect(select.value).toBeTruthy()
  })

  it('updates the shown resources when a different country is selected', () => {
    render(<Resources />)
    const select = screen.getByLabelText(/select your country/i) as HTMLSelectElement
    fireEvent.change(select, { target: { value: 'United States' } })
    expect(select.value).toBe('United States')
    expect(screen.getByText(/988 Suicide & Crisis Lifeline/i)).toBeInTheDocument()
    expect(screen.getByText(/Emergency: 911/i)).toBeInTheDocument()
  })

  it('always shows international fallback resources', () => {
    render(<Resources />)
    expect(screen.getByText(/find a helpline/i)).toBeInTheDocument()
  })
})
