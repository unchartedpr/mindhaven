import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { Reframe } from './Reframe'
import { reframeStore } from '../../lib/storage'

beforeEach(() => {
  localStorage.clear()
})

describe('Reframe exercise', () => {
  it('requires at least situation and automatic thought before saving', () => {
    render(
      <MemoryRouter>
        <Reframe />
      </MemoryRouter>,
    )
    expect(screen.getByRole('button', { name: /save to journal/i })).toBeDisabled()

    fireEvent.change(screen.getByLabelText(/what happened/i), { target: { value: 'Missed a deadline' } })
    expect(screen.getByRole('button', { name: /save to journal/i })).toBeDisabled()

    fireEvent.change(screen.getByLabelText(/automatic thought/i), { target: { value: "I'm a failure" } })
    expect(screen.getByRole('button', { name: /save to journal/i })).toBeEnabled()
  })

  it('saves the entry and shows confirmation', () => {
    render(
      <MemoryRouter>
        <Reframe />
      </MemoryRouter>,
    )
    fireEvent.change(screen.getByLabelText(/what happened/i), { target: { value: 'Missed a deadline' } })
    fireEvent.change(screen.getByLabelText(/automatic thought/i), { target: { value: "I'm a failure" } })
    fireEvent.click(screen.getByRole('button', { name: /save to journal/i }))

    expect(screen.getByText(/saved to your journal/i)).toBeInTheDocument()
    expect(reframeStore.all()).toHaveLength(1)
    expect(reframeStore.all()[0].situation).toBe('Missed a deadline')
  })
})
