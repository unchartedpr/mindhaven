import AxeBuilder from '@axe-core/playwright'
import { expect, type Page } from '@playwright/test'

export const DAY = 24 * 60 * 60 * 1000

/** Every page a user can reach by URL. */
export const ROUTES = [
  '/',
  '/check-in',
  '/insights',
  '/safety-plan',
  '/exercises',
  '/exercises/breathing',
  '/exercises/grounding',
  '/exercises/body-scan',
  '/exercises/reframe',
  '/exercises/worry-time',
  '/exercises/gratitude',
  '/journal',
  '/resources',
  '/settings',
  '/definitely-not-a-page',
] as const

export type Seed = Record<string, unknown>

/** A believable few weeks of use, so pages render their "full" states rather than empty ones. */
export function sampleData(): Seed {
  const now = Date.now()
  const tags = [['anxious'], ['tired', 'stressed'], ['grateful', 'calm'], ['lonely'], []]
  const moods = Array.from({ length: 20 }, (_, i) => ({
    id: `m${i}`,
    timestamp: now - i * DAY,
    mood: ((i * 7) % 5) + 1,
    tags: tags[i % 5],
    ...(i % 3 === 0 ? { note: `note ${i}` } : {}),
  }))
  return {
    'mindhaven:v1:onboarded': true,
    'mindhaven:v1:moods': moods,
    'mindhaven:v1:gratitude': [{ id: 'g1', timestamp: now, items: ['coffee', 'sun'] }],
    'mindhaven:v1:reframes': [
      { id: 'r1', timestamp: now, situation: 'sit', automaticThought: 'thought', evidenceFor: '', evidenceAgainst: '', balancedThought: 'bal' },
    ],
    'mindhaven:v1:worries': [{ id: 'w1', timestamp: now, worry: 'a worry' }],
    'mindhaven:v1:safety-plan': {
      updatedAt: now,
      warningSigns: ['not sleeping'],
      copingStrategies: ['walk'],
      distractionPeople: [],
      supportPeople: [{ name: 'Sam', phone: '+1 (555) 010-0100' }],
      professionals: [{ name: 'Dr Lee', phone: '' }],
      safeEnvironment: [],
      reasonsToLive: ['my dog'],
    },
  }
}

/** Skips the welcome dialog and optionally preloads data. Must be called before the first navigation. */
export async function seed(page: Page, data: Seed = { 'mindhaven:v1:onboarded': true }, theme?: 'light' | 'dark') {
  await page.addInitScript(
    ([entries, t]) => {
      // Only seed once per context, so a reload within a test doesn't overwrite what the test changed.
      if (sessionStorage.getItem('e2e-seeded')) return
      sessionStorage.setItem('e2e-seeded', '1')
      for (const [k, v] of Object.entries(entries as Record<string, unknown>)) localStorage.setItem(k, JSON.stringify(v))
      if (t) localStorage.setItem('mindhaven:v1:theme', JSON.stringify(t))
    },
    [data, theme] as const,
  )
}

/** Waits for a lazily-loaded page to finish rendering (every page has a level-one heading). */
export async function waitForPage(page: Page) {
  await page.waitForSelector('h1', { timeout: 10_000 })
}

/** Collects everything that should never happen in a healthy session. */
export function watchForProblems(page: Page) {
  const consoleErrors: string[] = []
  const pageErrors: string[] = []
  const hosts = new Set<string>()
  page.on('console', (m) => {
    if (m.type() === 'error') consoleErrors.push(m.text())
  })
  page.on('pageerror', (e) => pageErrors.push(e.message))
  page.on('request', (r) => {
    try {
      hosts.add(new URL(r.url()).host)
    } catch {
      /* data: URLs etc. */
    }
  })
  return { consoleErrors, pageErrors, hosts }
}

/** Runs axe-core in the real browser, including colour contrast, and fails with a readable list. */
export async function expectNoA11yViolations(page: Page, label: string) {
  const results = await new AxeBuilder({ page }).analyze()
  const summary = results.violations.map(
    (v) =>
      `${v.id} [${v.impact}] x${v.nodes.length}: ${v.help}\n` +
      v.nodes
        .slice(0, 3)
        .map((n) => `    ${n.target.join(' ')} — ${(n.any[0]?.message ?? n.failureSummary ?? '').split('\n')[0]}`)
        .join('\n'),
  )
  expect(summary, `Accessibility violations on ${label}:\n${summary.join('\n')}`).toEqual([])
}
