import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { CheckIn } from './CheckIn'
import { moodStore } from '../lib/storage'

beforeEach(() => {
  localStorage.clear()
})

describe('CheckIn page', () => {
  it('lets a user log a mood and saves it to the store', () => {
    render(
      <MemoryRouter>
        <CheckIn />
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByRole('radio', { name: /Okay/i }))
    fireEvent.click(screen.getByRole('button', { name: /Save check-in/i }))

    expect(screen.getByRole('status')).toHaveTextContent(/Saved/i)
    expect(moodStore.all()).toHaveLength(1)
    expect(moodStore.all()[0].mood).toBe(3)
  })

  it('disables save until a mood is picked', () => {
    render(
      <MemoryRouter>
        <CheckIn />
      </MemoryRouter>,
    )
    expect(screen.getByRole('button', { name: /Save check-in/i })).toBeDisabled()
  })
})
