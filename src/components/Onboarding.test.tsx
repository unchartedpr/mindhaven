import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { Onboarding } from './Onboarding'
import { onboardingStore } from '../lib/storage'

beforeEach(() => {
  localStorage.clear()
})

describe('Onboarding', () => {
  it('shows on first visit and dismisses on acknowledgement', () => {
    render(
      <MemoryRouter>
        <Onboarding />
      </MemoryRouter>,
    )
    expect(screen.getByRole('dialog')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /I understand, let's begin/i }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(onboardingStore.isComplete()).toBe(true)
  })

  it('does not show again once completed', () => {
    onboardingStore.markComplete()
    render(
      <MemoryRouter>
        <Onboarding />
      </MemoryRouter>,
    )
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('dismisses on Escape', () => {
    render(
      <MemoryRouter>
        <Onboarding />
      </MemoryRouter>,
    )
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(onboardingStore.isComplete()).toBe(true)
  })
})
