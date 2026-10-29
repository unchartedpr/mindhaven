import { expect, test } from '@playwright/test'
import { ROUTES, expectNoA11yViolations, sampleData, seed, waitForPage } from './helpers.ts'

/**
 * Real-browser accessibility checks (axe-core, including colour contrast, which the jsdom tests
 * can't evaluate). Every page, in light and dark, on a phone and a desktop.
 */

const VIEWPORTS = {
  phone: { width: 390, height: 844 },
  desktop: { width: 1280, height: 900 },
} as const

for (const theme of ['light', 'dark'] as const) {
  for (const [device, viewport] of Object.entries(VIEWPORTS)) {
    test.describe(`${theme} / ${device}`, () => {
      test.use({ viewport })

      for (const route of ROUTES) {
        test(`${route} has no accessibility violations`, async ({ page }) => {
          await seed(page, sampleData(), theme)
          await page.goto(`./#${route}`)
          await waitForPage(page)
          await expectNoA11yViolations(page, `${route} (${theme}, ${device})`)
        })
      }
    })
  }
}

test.describe('interactive states', () => {
  test.use({ viewport: VIEWPORTS.phone })

  test('welcome dialog', async ({ page }) => {
    await seed(page, {})
    await page.goto('./#/')
    await expect(page.getByRole('dialog')).toBeVisible()
    await expectNoA11yViolations(page, 'welcome dialog')
  })

  test('check-in follow-up after a low mood', async ({ page }) => {
    await seed(page)
    await page.goto('./#/check-in')
    await page.getByRole('radio', { name: 'Awful' }).click()
    await page.getByRole('button', { name: 'anxious' }).click()
    await page.getByRole('button', { name: /save check-in/i }).click()
    await expect(page.getByText(/you don’t have to carry this alone/i)).toBeVisible()
    await expectNoA11yViolations(page, 'check-in follow-up')
  })

  test('safety plan editor with a row in every section', async ({ page }) => {
    await seed(page)
    await page.goto('./#/safety-plan')
    // The page is lazy-loaded: without this the "+ Add" buttons may not exist yet when they are collected.
    await waitForPage(page)
    for (const add of await page.getByRole('button', { name: /^\+ add/i }).all()) await add.click()
    await expectNoA11yViolations(page, 'safety plan editor')
  })

  test('a delete button in its armed (confirm) state', async ({ page }) => {
    await seed(page, sampleData())
    await page.goto('./#/journal')
    await page.getByRole('button', { name: /delete this gratitude entry/i }).click()
    await expect(page.getByRole('alert').filter({ hasText: /confirm delete/i })).toBeAttached()
    await expectNoA11yViolations(page, 'armed delete button')
  })

  test('body scan while running', async ({ page }) => {
    await seed(page)
    await page.goto('./#/exercises/body-scan')
    await page.getByRole('button', { name: /^start$/i }).click()
    await expect(page.getByText(/step 1 of 7/i).first()).toBeVisible()
    await expectNoA11yViolations(page, 'body scan running')
  })
})
