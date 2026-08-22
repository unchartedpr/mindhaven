import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { WorryTime } from './WorryTime'
import { worryStore } from '../../lib/storage'

beforeEach(() => {
  localStorage.clear()
})

describe('WorryTime exercise', () => {
  it('saves the worry and shows confirmation', () => {
    render(
      <MemoryRouter>
        <WorryTime />
      </MemoryRouter>,
    )

    fireEvent.change(screen.getByLabelText(/what's on your mind/i), {
      target: { value: 'Will the presentation go well?' },
    })
    fireEvent.click(screen.getByRole('button', { name: /set this worry aside/i }))

    expect(screen.getByText(/has been set aside/i)).toBeInTheDocument()
    expect(worryStore.all()).toHaveLength(1)
    expect(worryStore.all()[0].worry).toBe('Will the presentation go well?')
  })

  it('disables save until something is written', () => {
    render(
      <MemoryRouter>
        <WorryTime />
      </MemoryRouter>,
    )
    expect(screen.getByRole('button', { name: /set this worry aside/i })).toBeDisabled()
  })
})
