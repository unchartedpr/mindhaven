import { render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'

afterEach(() => {
  vi.unstubAllGlobals()
  vi.resetModules()
  vi.restoreAllMocks()
})

async function renderWithFreshStorage(storageImpl?: Partial<Storage>) {
  vi.resetModules()
  if (storageImpl) vi.stubGlobal('localStorage', storageImpl)
  const { StorageBanner } = await import('./StorageBanner')
  const { moodStore } = await import('../lib/storage')
  render(
    <MemoryRouter>
      <StorageBanner />
    </MemoryRouter>,
  )
  return { moodStore }
}

describe('StorageBanner', () => {
  it('shows nothing when storage works', async () => {
    await renderWithFreshStorage()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('warns that nothing will be kept when the browser blocks storage', async () => {
    await renderWithFreshStorage({
      getItem: () => null,
      setItem: () => {
        throw new DOMException('blocked', 'SecurityError')
      },
      removeItem: () => {},
    })
    expect(screen.getByRole('alert')).toHaveTextContent(/blocking storage/i)
    expect(screen.getByRole('link', { name: /settings/i })).toHaveAttribute('href', '/settings')
  })

  it('appears when a write fails because storage is full, with a way to back up', async () => {
    const data = new Map<string, string>()
    const { moodStore } = await renderWithFreshStorage({
      getItem: (k) => data.get(k) ?? null,
      setItem: (k, v) => {
        if (k !== 'mindhaven:probe') throw new DOMException('full', 'QuotaExceededError')
        data.set(k, v)
      },
      removeItem: (k) => void data.delete(k),
    })
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    const { act } = await import('@testing-library/react')
    act(() => {
      moodStore.add({ mood: 3, tags: [] })
    })
    expect(await screen.findByRole('alert')).toHaveTextContent(/couldn’t save your last change/i)
    expect(screen.getByRole('link', { name: /download a backup/i })).toBeInTheDocument()
  })
})
