import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { Grounding } from './Grounding'

describe('Grounding exercise', () => {
  it('starts on the 5-things-you-can-see step', () => {
    render(
      <MemoryRouter>
        <Grounding />
      </MemoryRouter>,
    )
    expect(screen.getByText(/name 5 things you can see/i)).toBeInTheDocument()
    expect(screen.getAllByRole('textbox')).toHaveLength(5)
  })

  it('moves to the next step and shows a completion screen at the end', () => {
    render(
      <MemoryRouter>
        <Grounding />
      </MemoryRouter>,
    )
    const steps = [
      /name 4 things you can touch/i,
      /name 3 things you can hear/i,
      /name 2 things you can smell/i,
      /name 1 thing you can taste/i,
    ]
    for (const stepText of steps) {
      fireEvent.click(screen.getByRole('button', { name: /next/i }))
      expect(screen.getByText(stepText)).toBeInTheDocument()
    }
    fireEvent.click(screen.getByRole('button', { name: /finish/i }))
    expect(screen.getByText(/nice work grounding yourself/i)).toBeInTheDocument()
  })

  it('lets you go back a step', () => {
    render(
      <MemoryRouter>
        <Grounding />
      </MemoryRouter>,
    )
    fireEvent.click(screen.getByRole('button', { name: /next/i }))
    expect(screen.getByText(/name 4 things you can touch/i)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /back/i }))
    expect(screen.getByText(/name 5 things you can see/i)).toBeInTheDocument()
  })
})
