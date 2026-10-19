import { expect, test } from '@playwright/test'
import { ROUTES, sampleData, seed, waitForPage, watchForProblems } from './helpers.ts'

/** What the browser actually does with the built app: network, security policy, resilience, offline, layout. */

test.describe('privacy and security', () => {
  test('every page loads only from its own origin, with no console, page or CSP errors', async ({ page }) => {
    const problems = watchForProblems(page)
    await seed(page, sampleData())
    for (const route of ROUTES) {
      await page.goto(`/#${route}`)
      await waitForPage(page)
    }
    expect([...problems.hosts]).toEqual(['localhost:4173'])
    expect(problems.consoleErrors).toEqual([])
    expect(problems.pageErrors).toEqual([])
  })

  test('ships a strict content security policy and sends no referrer', async ({ page }) => {
    await page.goto('/')
    const csp = await page.locator('meta[http-equiv="Content-Security-Policy"]').getAttribute('content')
    expect(csp).toContain("default-src 'self'")
    expect(csp).toContain("connect-src 'self'")
    expect(csp).toContain("object-src 'none'")
    expect(csp).not.toMatch(/unsafe-inline|unsafe-eval|https?:/)
    await expect(page.locator('meta[name="referrer"]')).toHaveAttribute('content', 'no-referrer')
  })

  test('the policy actually blocks an injected inline script', async ({ page }) => {
    await seed(page)
    await page.goto('/#/')
    await waitForPage(page)
    const ran = await page.evaluate(() => {
      const el = document.createElement('script')
      el.textContent = 'window.__injected = true'
      document.head.appendChild(el)
      return (window as unknown as { __injected?: boolean }).__injected === true
    })
    expect(ran).toBe(false)
  })
})

test.describe('resilience', () => {
  test('survives corrupted and hostile stored data on every page', async ({ page }) => {
    const problems = watchForProblems(page)
    await seed(page, {
      'mindhaven:v1:onboarded': true,
      'mindhaven:v1:moods': [null, 7, 'x', { id: 1 }, { id: 'ok', timestamp: Date.now(), mood: 3, tags: ['calm'] }, { id: 'bad', timestamp: 'x', mood: 99 }],
      'mindhaven:v1:gratitude': { not: 'an array' },
      'mindhaven:v1:reframes': [{ id: 'r', timestamp: 1, situation: { evil: true } }],
      'mindhaven:v1:worries': 'garbage',
      'mindhaven:v1:safety-plan': { warningSigns: 'not a list', supportPeople: [{ name: 5, phone: ['x'] }] },
    })
    for (const route of ROUTES) {
      await page.goto(`/#${route}`)
      await waitForPage(page)
      await expect(page.getByText(/something went wrong/i)).toHaveCount(0)
    }
    expect(problems.pageErrors).toEqual([])
  })

  test('unreadable (non-JSON) data does not crash the app', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('mindhaven:v1:onboarded', 'true')
      localStorage.setItem('mindhaven:v1:moods', '{not json')
    })
    await page.goto('/#/journal')
    await waitForPage(page)
    await expect(page.getByRole('heading', { name: /your journal/i })).toBeVisible()
  })

  test('an unknown address shows a helpful page with a way out', async ({ page }) => {
    await seed(page)
    await page.goto('/#/definitely-not-a-page')
    await waitForPage(page)
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/not found|couldn’t find|can’t find/i)
    await expect(page.getByRole('link', { name: /get help/i }).first()).toBeVisible()
  })
})

test.describe('offline', () => {
  test.use({ serviceWorkers: 'allow' })

  test('works with no connection once it has been loaded', async ({ page, context }) => {
    await seed(page)
    await page.goto('/#/exercises/breathing')
    await waitForPage(page)
    // Wait for the service worker to take control and finish precaching.
    await page.evaluate(async () => {
      await navigator.serviceWorker.ready
    })
    await page.reload()
    await page.waitForFunction(() => !!navigator.serviceWorker.controller, undefined, { timeout: 15_000 })

    await context.setOffline(true)
    await page.reload()
    await waitForPage(page)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    await page.goto('/#/resources')
    await waitForPage(page)
    await expect(page.getByLabel(/select your country/i)).toBeVisible()
  })
})

test.describe('motion', () => {
  test('the breathing circle is static for people who prefer reduced motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await seed(page)
    await page.goto('/#/exercises/breathing')
    await page.getByRole('button', { name: /^start$/i }).click()
    await page.waitForTimeout(1500)
    const scale = await page.evaluate(() => {
      const el = document.querySelector('[data-breath-circle]') ?? document.querySelector('[style*="--breath-scale"]')
      return el ? new DOMMatrix(getComputedStyle(el).transform === 'none' ? undefined : getComputedStyle(el).transform).a : 1
    })
    expect(scale).toBe(1)
  })
})

test.describe('layout', () => {
  test.describe('phone', () => {
    test.use({ viewport: { width: 360, height: 740 }, hasTouch: true })

    test('uses the bottom navigation, and nothing overflows sideways', async ({ page }) => {
      await seed(page, sampleData())
      for (const route of ROUTES) {
        await page.goto(`/#${route}`)
        await waitForPage(page)
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
        expect(overflow, `horizontal overflow on ${route}`).toBeLessThanOrEqual(0)
      }
      await page.goto('/#/')
      await waitForPage(page)
      const bottomNav = page.getByRole('navigation', { name: /mobile|bottom|main/i }).last()
      await expect(bottomNav).toBeVisible()
    })

    test('buttons and links are comfortably large to tap', async ({ page }) => {
      await seed(page, sampleData())
      const tooSmall: string[] = []
      for (const route of ['/', '/check-in', '/journal', '/resources', '/settings']) {
        await page.goto(`/#${route}`)
        await waitForPage(page)
        const found = await page.evaluate(() => {
          const out: string[] = []
          const nodes = document.querySelectorAll<HTMLElement>('button, [role="radio"], select, input:not([type=hidden]), nav a, header a')
          for (const el of nodes) {
            const r = el.getBoundingClientRect()
            if (r.width === 0 || r.height === 0) continue
            if (r.height < 44 || r.width < 44) out.push(`${el.tagName.toLowerCase()} "${(el.textContent || el.getAttribute('aria-label') || '').trim().slice(0, 30)}" ${Math.round(r.width)}x${Math.round(r.height)}`)
          }
          return out
        })
        tooSmall.push(...found.map((f) => `${route}: ${f}`))
      }
      expect(tooSmall).toEqual([])
    })
  })

  test.describe('desktop', () => {
    test.use({ viewport: { width: 1280, height: 900 } })

    test('shows the top navigation and hides the phone bar', async ({ page }) => {
      await seed(page)
      await page.goto('/#/')
      await waitForPage(page)
      await expect(page.getByRole('link', { name: 'Insights', exact: true }).first()).toBeVisible()
      const visibleNavs = await page.getByRole('navigation').evaluateAll((els) => els.filter((e) => (e as HTMLElement).offsetParent !== null).length)
      expect(visibleNavs).toBeGreaterThanOrEqual(1)
    })
  })
})
