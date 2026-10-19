import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter, Route, Routes, useNavigate } from 'react-router-dom'
import { Layout } from './Layout'
import { onboardingStore, themeStore } from '../lib/storage'

beforeEach(() => {
  localStorage.clear()
  onboardingStore.markComplete()
  document.documentElement.classList.remove('dark')
  window.scrollTo = vi.fn()
})

function Goto({ to, label }: { to: string; label: string }) {
  const navigate = useNavigate()
  return <button onClick={() => navigate(to)}>{label}</button>
}

function Boom(): never {
  throw new Error('kaboom')
}

function renderLayout(initial = '/') {
  return render(
    <MemoryRouter initialEntries={[initial]}>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<div>Home content</div>} />
          <Route path="resources" element={<div>Resources content</div>} />
          <Route path="journal" element={<div>Journal content</div>} />
          <Route path="boom" element={<Boom />} />
          <Route path="nav" element={<Goto to="/journal" label="go to journal" />} />
          <Route path="*" element={<div>Not found content</div>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  )
}

describe('Layout', () => {
  it('renders desktop and mobile navigation with the five main sections, and the outlet content', () => {
    renderLayout()
    const desktop = screen.getByRole('navigation', { name: /^main navigation$/i })
    const mobile = screen.getByRole('navigation', { name: /main navigation, mobile/i })
    for (const nav of [desktop, mobile]) {
      for (const label of ['Home', 'Check In', 'Exercises', 'Journal', 'Insights']) {
        expect(nav).toHaveTextContent(label)
      }
    }
    expect(screen.getByText('Home content')).toBeInTheDocument()
  })

  it('keeps crisis resources one tap away on every page via "Get help"', () => {
    renderLayout()
    expect(screen.getByRole('link', { name: /get help/i })).toHaveAttribute('href', '/resources')
  })

  it('links to settings and the safety plan', () => {
    renderLayout()
    expect(screen.getByRole('link', { name: /settings and data/i })).toHaveAttribute('href', '/settings')
    expect(screen.getByRole('link', { name: /^safety plan$/i })).toHaveAttribute('href', '/safety-plan')
  })

  it('toggles the theme and persists the choice', () => {
    renderLayout()
    fireEvent.click(screen.getByRole('button', { name: /switch to dark theme/i }))
    expect(document.documentElement.classList.contains('dark')).toBe(true)
    expect(themeStore.get()).toBe('dark')

    fireEvent.click(screen.getByRole('button', { name: /switch to light theme/i }))
    expect(document.documentElement.classList.contains('dark')).toBe(false)
    expect(themeStore.get()).toBe('light')
  })

  describe('navigation announcements (single-page app)', () => {
    it('sets the document title for the current page', () => {
      renderLayout('/journal')
      expect(document.title).toBe('Journal · MindHaven')
    })

    it('uses a generic title for unknown pages', () => {
      renderLayout('/nowhere')
      expect(document.title).toMatch(/^MindHaven/)
    })

    it('does not steal focus on first load', () => {
      renderLayout()
      expect(screen.getByRole('main')).not.toHaveFocus()
    })

    it('moves focus to the main content and scrolls to top after navigating', () => {
      renderLayout('/nav')
      fireEvent.click(screen.getByRole('button', { name: /go to journal/i }))
      expect(screen.getByText('Journal content')).toBeInTheDocument()
      expect(screen.getByRole('main')).toHaveFocus()
      expect(window.scrollTo).toHaveBeenCalledWith(0, 0)
      expect(document.title).toBe('Journal · MindHaven')
    })
  })

  it('"Skip to content" focuses the main region without navigating away', () => {
    renderLayout('/journal')
    fireEvent.click(screen.getByText(/skip to content/i))
    expect(screen.getByRole('main')).toHaveFocus()
    expect(screen.getByText('Journal content')).toBeInTheDocument()
  })

  it('contains a crashing page: navigation stays, and recovery is offered', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    renderLayout('/boom')
    expect(screen.getByRole('alert')).toHaveTextContent(/something went wrong/i)
    expect(screen.getByRole('link', { name: /get help/i })).toBeInTheDocument()
    expect(screen.getByRole('navigation', { name: /^main navigation$/i })).toBeInTheDocument()
  })
})
