import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ErrorBoundary } from './ErrorBoundary'
import { moodStore } from '../lib/storage'
import * as storage from '../lib/storage'

let shouldThrow = true
function Flaky() {
  if (shouldThrow) throw new Error('kaboom')
  return <p>all good</p>
}

let blobs: Blob[] = []

beforeEach(() => {
  localStorage.clear()
  shouldThrow = true
  blobs = []
  vi.spyOn(console, 'error').mockImplementation(() => {})
  URL.createObjectURL = vi.fn((b: Blob) => {
    blobs.push(b)
    return 'blob:test'
  })
  URL.revokeObjectURL = vi.fn()
  vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('ErrorBoundary', () => {
  it('renders children normally', () => {
    shouldThrow = false
    render(
      <ErrorBoundary>
        <Flaky />
      </ErrorBoundary>,
    )
    expect(screen.getByText('all good')).toBeInTheDocument()
  })

  it('shows a calm recovery screen instead of a blank page, and reassures about data', () => {
    render(
      <ErrorBoundary>
        <Flaky />
      </ErrorBoundary>,
    )
    expect(screen.getByRole('alert')).toHaveTextContent(/something went wrong/i)
    expect(screen.getByText(/haven’t been deleted/i)).toBeInTheDocument()
    expect(screen.getByText('kaboom')).toBeInTheDocument()
  })

  it('keeps crisis resources reachable from the crash screen', () => {
    render(
      <ErrorBoundary>
        <Flaky />
      </ErrorBoundary>,
    )
    expect(screen.getByRole('link', { name: /crisis resources/i })).toHaveAttribute('href', '#/resources')
  })

  it('"Try again" re-renders once the problem is gone', () => {
    render(
      <ErrorBoundary>
        <Flaky />
      </ErrorBoundary>,
    )
    shouldThrow = false
    fireEvent.click(screen.getByRole('button', { name: /try again/i }))
    expect(screen.getByText('all good')).toBeInTheDocument()
  })

  it('recovers automatically when the reset key changes (e.g. navigating elsewhere)', () => {
    const { rerender } = render(
      <ErrorBoundary resetKey="/a">
        <Flaky />
      </ErrorBoundary>,
    )
    expect(screen.getByRole('alert')).toBeInTheDocument()
    shouldThrow = false
    rerender(
      <ErrorBoundary resetKey="/b">
        <Flaky />
      </ErrorBoundary>,
    )
    expect(screen.getByText('all good')).toBeInTheDocument()
  })

  it('lets the person download their data from the crash screen', async () => {
    moodStore.add({ mood: 3, tags: [], note: 'keep me' })
    render(
      <ErrorBoundary>
        <Flaky />
      </ErrorBoundary>,
    )
    fireEvent.click(screen.getByRole('button', { name: /download a copy of my data/i }))
    const saved = JSON.parse(await blobs[0].text())
    expect(saved.moods[0].note).toBe('keep me')
  })

  it('falls back to the raw stored data if the normal export itself fails', async () => {
    localStorage.setItem('mindhaven:v1:moods', '{broken')
    vi.spyOn(storage, 'exportData').mockImplementation(() => {
      throw new Error('export broke')
    })
    render(
      <ErrorBoundary>
        <Flaky />
      </ErrorBoundary>,
    )
    fireEvent.click(screen.getByRole('button', { name: /download a copy of my data/i }))
    const saved = JSON.parse(await blobs[0].text())
    expect(saved['mindhaven:v1:moods']).toBe('{broken')
  })
})
