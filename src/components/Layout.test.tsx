import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { Layout } from './Layout'
import { onboardingStore, themeStore } from '../lib/storage'

beforeEach(() => {
  localStorage.clear()
  onboardingStore.markComplete()
  document.documentElement.classList.remove('dark')
})

function renderLayout() {
  return render(
    <MemoryRouter initialEntries={['/']}>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<div>Page content</div>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  )
}

describe('Layout', () => {
  it('renders both desktop and mobile navigation, and the outlet content', () => {
    renderLayout()
    expect(screen.getByRole('navigation', { name: /^main navigation$/i })).toBeInTheDocument()
    expect(screen.getByRole('navigation', { name: /main navigation, mobile/i })).toBeInTheDocument()
    expect(screen.getByText('Page content')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /settings and data/i })).toHaveAttribute('href', '/settings')
  })

  it('toggles the theme and persists the choice', () => {
    renderLayout()
    const toggle = screen.getByRole('button', { name: /switch to dark theme/i })
    fireEvent.click(toggle)
    expect(document.documentElement.classList.contains('dark')).toBe(true)
    expect(themeStore.get()).toBe('dark')

    fireEvent.click(screen.getByRole('button', { name: /switch to light theme/i }))
    expect(document.documentElement.classList.contains('dark')).toBe(false)
    expect(themeStore.get()).toBe('light')
  })
})
