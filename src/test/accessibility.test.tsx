import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { axe } from 'vitest-axe'
import { Home } from '../pages/Home'
import { CheckIn } from '../pages/CheckIn'
import { Resources } from '../pages/Resources'
import { Settings } from '../pages/Settings'
import { Journal } from '../pages/Journal'
import { Exercises } from '../pages/Exercises'
import { Onboarding } from '../components/Onboarding'

// jsdom can't compute real rendered colors from Tailwind classes, so
// color-contrast checks are unreliable here and are covered instead by
// manual/visual review. Everything else axe checks (labels, roles, focus
// order, aria usage, form structure) is meaningful even without layout.
const AXE_OPTIONS = { rules: { 'color-contrast': { enabled: false } } }

function renderWithRouter(ui: React.ReactElement, initialEntries = ['/']) {
  return render(<MemoryRouter initialEntries={initialEntries}>{ui}</MemoryRouter>)
}

describe('accessibility', () => {
  it('Home page has no axe violations', async () => {
    const { container } = renderWithRouter(<Home />)
    expect(await axe(container, AXE_OPTIONS)).toHaveNoViolations()
  })

  it('CheckIn page has no axe violations', async () => {
    const { container } = renderWithRouter(<CheckIn />)
    expect(await axe(container, AXE_OPTIONS)).toHaveNoViolations()
  })

  it('Resources page has no axe violations', async () => {
    const { container } = renderWithRouter(<Resources />)
    expect(await axe(container, AXE_OPTIONS)).toHaveNoViolations()
  })

  it('Settings page has no axe violations', async () => {
    const { container } = renderWithRouter(<Settings />)
    expect(await axe(container, AXE_OPTIONS)).toHaveNoViolations()
  })

  it('Journal page (empty state) has no axe violations', async () => {
    const { container } = renderWithRouter(<Journal />)
    expect(await axe(container, AXE_OPTIONS)).toHaveNoViolations()
  })

  it('Exercises list page has no axe violations', async () => {
    const { container } = renderWithRouter(<Exercises />)
    expect(await axe(container, AXE_OPTIONS)).toHaveNoViolations()
  })

  it('the exercise detail pages (breathing, grounding, body-scan, reframe, worry-time, gratitude) have no axe violations', async () => {
    for (const path of ['/breathing', '/grounding', '/body-scan', '/reframe', '/worry-time', '/gratitude']) {
      const { container, unmount } = renderWithRouter(<Exercises />, [path])
      expect(await axe(container, AXE_OPTIONS)).toHaveNoViolations()
      unmount()
    }
  })

  it('Onboarding modal has no axe violations', async () => {
    const { container } = renderWithRouter(<Onboarding />)
    expect(await axe(container, AXE_OPTIONS)).toHaveNoViolations()
  })
})
