import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { Onboarding } from './Onboarding'
import { onboardingStore } from '../lib/storage'

function renderOnboarding() {
  // The real app mounts into #root; the dialog must portal out of it so #root can be made inert.
  const root = document.createElement('div')
  root.id = 'root'
  document.body.appendChild(root)
  const opener = document.createElement('button')
  opener.textContent = 'opener'
  root.appendChild(opener)
  opener.focus()
  const utils = render(
    <MemoryRouter>
      <Onboarding />
    </MemoryRouter>,
    { container: root.appendChild(document.createElement('div')) },
  )
  return { root, opener, ...utils }
}

beforeEach(() => {
  localStorage.clear()
})

afterEach(() => {
  document.getElementById('root')?.remove()
})

describe('Onboarding', () => {
  it('shows on first visit and dismisses on acknowledgement', () => {
    renderOnboarding()
    expect(screen.getByRole('dialog')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /I understand, let's begin/i }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(onboardingStore.isComplete()).toBe(true)
  })

  it('does not show again once completed', () => {
    onboardingStore.markComplete()
    renderOnboarding()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('dismisses on Escape', () => {
    renderOnboarding()
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(onboardingStore.isComplete()).toBe(true)
  })

  it('moves focus into the dialog, onto the primary action', () => {
    renderOnboarding()
    expect(screen.getByRole('button', { name: /I understand/i })).toHaveFocus()
  })

  it('makes the app behind it inert while open, and restores it after', () => {
    const { root } = renderOnboarding()
    expect(root).toHaveAttribute('inert')
    fireEvent.click(screen.getByRole('button', { name: /I understand/i }))
    expect(root).not.toHaveAttribute('inert')
  })

  it('renders the dialog outside the app root so the root can be inert', () => {
    const { root } = renderOnboarding()
    expect(root.contains(screen.getByRole('dialog'))).toBe(false)
  })

  it('returns focus to where it was when it closes', () => {
    const { opener } = renderOnboarding()
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(opener).toHaveFocus()
  })

  it('keeps Tab inside the dialog (wraps from last to first and back)', () => {
    renderOnboarding()
    const link = screen.getByRole('link', { name: /real crisis resources/i })
    const button = screen.getByRole('button', { name: /I understand/i })

    button.focus()
    fireEvent.keyDown(document, { key: 'Tab' })
    expect(link).toHaveFocus()

    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true })
    expect(button).toHaveFocus()
  })
})
