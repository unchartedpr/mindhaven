import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { axe } from 'vitest-axe'
import { Home } from '../pages/Home'
import { CheckIn } from '../pages/CheckIn'
import { Resources } from '../pages/Resources'
import { Settings } from '../pages/Settings'
import { Journal } from '../pages/Journal'
import { Insights } from '../pages/Insights'
import { SafetyPlan } from '../pages/SafetyPlan'
import { NotFound } from '../pages/NotFound'
import { Exercises } from '../pages/Exercises'
import { Onboarding } from '../components/Onboarding'
import { Layout } from '../components/Layout'
import { ErrorBoundary } from '../components/ErrorBoundary'
import { gratitudeStore, moodStore, onboardingStore, reframeStore, safetyPlanStore, worryStore } from '../lib/storage'
import { emptySafetyPlan } from '../lib/validate'

/**
 * Structural accessibility checks (labels, roles, names, landmarks, ARIA, focus) via axe-core in jsdom.
 *
 * jsdom has no layout engine or real colour rendering, so colour-contrast is disabled here — it is
 * checked in a real browser by the end-to-end suite (e2e/accessibility.spec.ts), which is where the
 * contrast failures that jsdom cannot see were found.
 */
const AXE_OPTIONS = { rules: { 'color-contrast': { enabled: false } } }

function renderWithRouter(ui: React.ReactElement, initialEntries = ['/']) {
  return render(<MemoryRouter initialEntries={initialEntries}>{ui}</MemoryRouter>)
}

function seed() {
  const now = Date.now()
  for (let i = 0; i < 8; i++) moodStore.add({ mood: ((i % 5) + 1) as 1, tags: i % 2 ? ['anxious'] : ['calm'], note: 'n', timestamp: now - i * 86_400_000 })
  gratitudeStore.add({ items: ['coffee', 'sun'] })
  reframeStore.add({ situation: 's', automaticThought: 't', evidenceFor: '', evidenceAgainst: '', balancedThought: 'b' })
  worryStore.add({ worry: 'a worry' })
}

describe('accessibility', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('Layout (header, footer, both nav bars) has no axe violations', async () => {
    onboardingStore.markComplete()
    const { container } = render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<div>Page content</div>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    )
    expect(await axe(container, AXE_OPTIONS)).toHaveNoViolations()
  })

  describe('with an empty app', () => {
    it.each([
      ['Home', Home],
      ['CheckIn', CheckIn],
      ['Resources', Resources],
      ['Settings', Settings],
      ['Journal', Journal],
      ['Insights', Insights],
      ['SafetyPlan (editor)', SafetyPlan],
      ['Exercises list', Exercises],
      ['NotFound', NotFound],
    ])('%s has no axe violations', async (_name, Page) => {
      const { container } = renderWithRouter(<Page />)
      expect(await axe(container, AXE_OPTIONS)).toHaveNoViolations()
    })
  })

  describe('with data (the states a real user sees)', () => {
    beforeEach(seed)

    it.each([
      ['Home', Home],
      ['Journal', Journal],
      ['Insights', Insights],
      ['CheckIn (recent list with delete buttons)', CheckIn],
    ])('%s has no axe violations', async (_name, Page) => {
      const { container } = renderWithRouter(<Page />)
      expect(await axe(container, AXE_OPTIONS)).toHaveNoViolations()
    })

    it('SafetyPlan (read view) has no axe violations', async () => {
      safetyPlanStore.set({
        ...emptySafetyPlan(),
        updatedAt: 1,
        warningSigns: ['x'],
        supportPeople: [{ name: 'Sam', phone: '555-0100' }],
      })
      const { container } = renderWithRouter(<SafetyPlan />)
      expect(await axe(container, AXE_OPTIONS)).toHaveNoViolations()
    })

    it('SafetyPlan editor with rows added has no axe violations', async () => {
      const { container } = renderWithRouter(<SafetyPlan />)
      for (const btn of screen.getAllByRole('button', { name: /^\+ add/i })) fireEvent.click(btn)
      expect(await axe(container, AXE_OPTIONS)).toHaveNoViolations()
    })

    it('CheckIn after saving (follow-up card) has no axe violations', async () => {
      const { container } = renderWithRouter(<CheckIn />)
      fireEvent.click(screen.getByRole('radio', { name: /awful/i }))
      fireEvent.click(screen.getByRole('button', { name: 'anxious' }))
      fireEvent.click(screen.getByRole('button', { name: /save check-in/i }))
      expect(await axe(container, AXE_OPTIONS)).toHaveNoViolations()
    })
  })

  it('every exercise screen has no axe violations', async () => {
    for (const path of ['/breathing', '/grounding', '/body-scan', '/reframe', '/worry-time', '/gratitude', '/not-an-exercise']) {
      const { container, unmount } = renderWithRouter(<Exercises />, [path])
      expect(await axe(container, AXE_OPTIONS)).toHaveNoViolations()
      unmount()
    }
  })

  it('exercise screens while running have no axe violations', async () => {
    const { container } = renderWithRouter(<Exercises />, ['/body-scan'])
    fireEvent.click(screen.getByRole('button', { name: /^start$/i }))
    expect(await axe(container, AXE_OPTIONS)).toHaveNoViolations()
  })

  it('Onboarding modal has no axe violations (checked on the whole body, since it portals out of the container)', async () => {
    renderWithRouter(<Onboarding />)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(await axe(document.body, AXE_OPTIONS)).toHaveNoViolations()
  })

  it('the crash screen has no axe violations', async () => {
    const Boom = (): never => {
      throw new Error('boom')
    }
    const spy = console.error
    console.error = () => {}
    try {
      const { container } = render(
        <ErrorBoundary>
          <Boom />
        </ErrorBoundary>,
      )
      expect(await axe(container, AXE_OPTIONS)).toHaveNoViolations()
    } finally {
      console.error = spy
    }
  })
})
