import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { Settings } from './Settings'
import { moodStore } from '../lib/storage'

beforeEach(() => {
  localStorage.clear()
})

describe('Settings page', () => {
  it('requires a second click before clearing data', () => {
    moodStore.add({ mood: 3, tags: [] })
    render(<Settings />)

    const button = screen.getByRole('button', { name: /delete all my data/i })
    fireEvent.click(button)
    expect(moodStore.all()).toHaveLength(1)
    expect(screen.getByRole('button', { name: /click again to confirm/i })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /click again to confirm/i }))
    expect(moodStore.all()).toHaveLength(0)
  })

  it('shows an error message for an invalid backup file', async () => {
    render(<Settings />)
    const input = screen.getByLabelText(/choose a mindhaven backup file/i) as HTMLInputElement
    const file = new File(['not json'], 'bad.json', { type: 'application/json' })

    fireEvent.change(input, { target: { files: [file] } })

    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent(/could not read/i)
    })
  })

  it('imports a valid backup and reports how many entries were added', async () => {
    render(<Settings />)
    const input = screen.getByLabelText(/choose a mindhaven backup file/i) as HTMLInputElement
    const backup = {
      version: 1,
      exportedAt: Date.now(),
      moods: [{ id: 'm1', timestamp: Date.now(), mood: 4, tags: [] }],
      gratitude: [],
      reframes: [],
      worries: [],
    }
    const file = new File([JSON.stringify(backup)], 'backup.json', { type: 'application/json' })

    fireEvent.change(input, { target: { files: [file] } })

    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent(/imported successfully — 1 new entry/i)
    })
    expect(moodStore.all()).toHaveLength(1)
  })
})
