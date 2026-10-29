import { readFile } from 'node:fs/promises'
import { expect, test, type Download } from '@playwright/test'
import { DAY, sampleData, seed, waitForPage } from './helpers.ts'

async function contents(download: Download): Promise<string> {
  return readFile(await download.path(), 'utf8')
}

test.describe('welcome dialog', () => {
  test.beforeEach(async ({ page }) => {
    await seed(page, {})
    await page.goto('./#/')
  })

  test('traps keyboard focus inside the dialog, and leaves the page behind inert', async ({ page }) => {
    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()
    await expect(page.locator('#root')).toHaveAttribute('inert', '')
    await expect(page.getByRole('button', { name: /I understand/i })).toBeFocused()

    for (let i = 0; i < 6; i++) {
      await page.keyboard.press('Tab')
      const inside = await page.evaluate(() => !!document.activeElement?.closest('[role="dialog"]'))
      expect(inside, `focus escaped the dialog after ${i + 1} Tab presses`).toBe(true)
    }
    for (let i = 0; i < 6; i++) {
      await page.keyboard.press('Shift+Tab')
      expect(await page.evaluate(() => !!document.activeElement?.closest('[role="dialog"]'))).toBe(true)
    }
  })

  test('closes with Escape, restores the page, and is not shown again', async ({ page }) => {
    await page.keyboard.press('Escape')
    await expect(page.getByRole('dialog')).toBeHidden()
    await expect(page.locator('#root')).not.toHaveAttribute('inert', '')
    await page.reload()
    await waitForPage(page)
    await expect(page.getByRole('dialog')).toHaveCount(0)
  })
})

test.describe('everyday journey', () => {
  test('check in, get relevant suggestions, see it in insights, then delete it', async ({ page }) => {
    await seed(page)
    await page.goto('./#/check-in')

    await page.getByRole('radio', { name: 'Rough' }).click()
    await page.getByRole('button', { name: 'anxious' }).click()
    await page.getByLabel(/anything you want to note/i).fill('big meeting tomorrow')
    await page.getByRole('button', { name: /save check-in/i }).click()

    const followUp = page.getByRole('status')
    await expect(followUp).toContainText('Saved')
    await expect(followUp.getByRole('link', { name: /box breathing/i })).toBeVisible()
    await expect(followUp.getByRole('link', { name: /support lines/i })).toBeVisible()
    await expect(page.getByText('big meeting tomorrow')).toBeVisible()

    await page.getByRole('link', { name: 'Insights', exact: true }).first().click()
    await waitForPage(page)
    await expect(page.getByRole('region', { name: /summary/i })).toContainText('1')

    await page.getByRole('link', { name: 'Check In', exact: true }).first().click()
    await page.getByRole('button', { name: /delete check-in/i }).click() // arm
    const confirm = page.getByRole('button', { name: /confirm delete/i })
    await expect(confirm).toBeVisible()
    await confirm.click()
    await expect(page.getByText('big meeting tomorrow')).toHaveCount(0)
  })

  test('the streak is still alive in the morning, before today’s check-in', async ({ page }) => {
    const now = Date.now()
    await seed(page, {
      'mindhaven:v1:onboarded': true,
      'mindhaven:v1:moods': [
        { id: 'a', timestamp: now - DAY, mood: 3, tags: [] },
        { id: 'b', timestamp: now - 2 * DAY, mood: 3, tags: [] },
      ],
    })
    await page.goto('./#/')
    const streak = page.getByRole('heading', { name: /your streak/i }).locator('xpath=../..')
    await expect(streak).toContainText('2')
    await expect(streak).toContainText(/check in today to keep it going/i)
  })

  test('data written in one tab appears live in another', async ({ context }) => {
    const first = await context.newPage()
    const second = await context.newPage()
    await seed(first)
    await seed(second)
    await first.goto('./#/journal')
    await second.goto('./#/exercises/worry-time')
    await waitForPage(first)
    await expect(first.getByText(/nothing here yet/i)).toBeVisible()

    await second.getByLabel(/what's on your mind/i).fill('cross-tab worry')
    await second.getByRole('button', { name: /set this worry aside/i }).click()

    await expect(first.getByText('cross-tab worry')).toBeVisible()
  })

  test('entries survive a reload', async ({ page }) => {
    await seed(page)
    await page.goto('./#/exercises/gratitude')
    await page.getByLabel('Gratitude 1 of 3').fill('a good coffee')
    await page.getByRole('button', { name: /^save$/i }).click()
    await page.reload()
    await page.goto('./#/journal')
    await expect(page.getByText('a good coffee')).toBeVisible()
  })
})

test.describe('keyboard and screen-reader behaviour', () => {
  test('the mood picker is one tab stop and uses arrow keys', async ({ page }) => {
    await seed(page)
    await page.goto('./#/check-in')
    await page.getByRole('radio', { name: 'Okay' }).focus()
    await page.keyboard.press('ArrowRight')
    await expect(page.getByRole('radio', { name: 'Good' })).toBeFocused()
    await expect(page.getByRole('radio', { name: 'Good' })).toHaveAttribute('aria-checked', 'true')
    await page.keyboard.press('End')
    await expect(page.getByRole('radio', { name: 'Great' })).toBeFocused()
  })

  test('navigating updates the title, resets scroll, and moves focus to the new content', async ({ page }) => {
    await seed(page, sampleData())
    await page.goto('./#/journal')
    await waitForPage(page)
    await expect(page).toHaveTitle('Journal · MindHaven')
    await page.evaluate(() => window.scrollTo(0, 400))

    await page.getByRole('link', { name: 'Exercises', exact: true }).first().click()
    await waitForPage(page)
    await expect(page).toHaveTitle('Exercises · MindHaven')
    await expect(page.getByRole('main')).toBeFocused()
    expect(await page.evaluate(() => window.scrollY)).toBe(0)
  })

  test('"Skip to content" works without leaving the page', async ({ page }) => {
    await seed(page, sampleData())
    await page.goto('./#/journal')
    await waitForPage(page)
    await page.keyboard.press('Tab')
    await expect(page.getByText('Skip to content')).toBeFocused()
    await page.keyboard.press('Enter')
    await expect(page.getByRole('main')).toBeFocused()
    await expect(page).toHaveTitle('Journal · MindHaven')
    await expect(page.getByRole('heading', { name: /your journal/i })).toBeVisible()
  })

  test('"Get help" is reachable from every page', async ({ page }) => {
    await seed(page, sampleData())
    for (const route of ['/', '/journal', '/exercises/breathing', '/settings', '/insights']) {
      await page.goto(`./#${route}`)
      await waitForPage(page)
      await expect(page.getByRole('link', { name: 'Get help' })).toBeVisible()
    }
  })
})

test.describe('backup and restore', () => {
  test('a downloaded backup restores everything after a full wipe', async ({ page }) => {
    await seed(page, sampleData())
    await page.goto('./#/settings')
    await waitForPage(page)

    const [backup] = await Promise.all([
      page.waitForEvent('download'),
      page.getByRole('button', { name: /download backup/i }).click(),
    ])
    const saved = JSON.parse(await contents(backup))
    expect(saved.version).toBe(2)
    expect(saved.moods).toHaveLength(20)
    expect(saved.safetyPlan.reasonsToLive).toEqual(['my dog'])
    await expect(page.getByText(/last backup:/i)).toBeVisible()

    const del = page.getByRole('button', { name: /delete all my data/i })
    await del.click()
    await page.getByRole('button', { name: /click again to confirm/i }).click()
    await expect(page.getByText(/all data has been cleared/i)).toBeVisible()

    await page.locator('input[type=file]').setInputFiles({
      name: 'backup.json',
      mimeType: 'application/json',
      buffer: Buffer.from(JSON.stringify(saved)),
    })
    await expect(page.getByRole('status').filter({ hasText: /imported successfully/i })).toContainText('new entries')

    await page.goto('./#/journal')
    await expect(page.getByText('coffee')).toBeVisible()
    await page.goto('./#/safety-plan')
    await expect(page.getByText('my dog')).toBeVisible()
  })

  test('exports check-ins as CSV with spreadsheet formulas neutralised', async ({ page }) => {
    await seed(page, {
      'mindhaven:v1:onboarded': true,
      'mindhaven:v1:moods': [{ id: 'x', timestamp: Date.now(), mood: 4, tags: ['calm'], note: '=HYPERLINK("http://evil.example","click")' }],
    })
    await page.goto('./#/settings')
    const [csv] = await Promise.all([
      page.waitForEvent('download'),
      page.getByRole('button', { name: /download csv/i }).click(),
    ])
    const text = await contents(csv)
    expect(text.split('\r\n')[0]).toBe('date,time,mood,mood_label,tags,note')
    expect(text).toContain(`'=HYPERLINK`)
    expect(text).not.toMatch(/,=HYPERLINK/)
  })

  test('creates a daily reminder calendar file at the chosen time', async ({ page }) => {
    await seed(page)
    await page.goto('./#/settings')
    await page.getByLabel(/remind me at/i).fill('07:45')
    const [ics] = await Promise.all([
      page.waitForEvent('download'),
      page.getByRole('button', { name: /add to my calendar/i }).click(),
    ])
    expect(ics.suggestedFilename()).toBe('mindhaven-daily-reminder.ics')
    const text = await contents(ics)
    expect(text).toContain('RRULE:FREQ=DAILY')
    expect(text).toMatch(/DTSTART:\d{8}T074500\r\n/)
    expect(text).toContain('BEGIN:VALARM')
  })
})

test.describe('safety plan', () => {
  test('can be written, is read back with tap-to-call, and survives a reload', async ({ page }) => {
    await seed(page)
    await page.goto('./#/safety-plan')

    const signs = page.getByRole('group', { name: /my warning signs/i })
    await signs.getByRole('button', { name: /add/i }).click()
    await signs.getByRole('textbox').fill('I stop answering messages')

    const help = page.getByRole('group', { name: /people i can ask for help/i })
    await help.getByRole('button', { name: /add a person/i }).click()
    await help.getByLabel(/name 1/i).fill('Alex')
    await help.getByLabel(/phone 1/i).fill('+1 555 0199')
    await page.getByRole('button', { name: /save my plan/i }).click()

    await expect(page.getByText('I stop answering messages')).toBeVisible()
    await expect(page.getByRole('link', { name: '+1 555 0199' })).toHaveAttribute('href', 'tel:+15550199')

    await page.reload()
    await expect(page.getByText('I stop answering messages')).toBeVisible()
  })

  test('the printout hides navigation and controls', async ({ page }) => {
    await seed(page, sampleData())
    await page.goto('./#/safety-plan')
    await waitForPage(page)
    await page.emulateMedia({ media: 'print' })
    await expect(page.getByRole('banner')).toBeHidden()
    await expect(page.getByRole('contentinfo')).toBeHidden()
    await expect(page.getByRole('button', { name: /edit my plan/i })).toBeHidden()
    await expect(page.getByText('not sleeping')).toBeVisible()
  })
})

test.describe('crisis resources', () => {
  test.describe('browser language with a region', () => {
    test.use({ locale: 'en-GB' })
    test('preselects that country', async ({ page }) => {
      await seed(page)
      await page.goto('./#/resources')
      await expect(page.getByLabel(/select your country/i)).toHaveValue('GB')
      await expect(page.getByText('Samaritans')).toBeVisible()
    })
  })

  test.describe('browser language without a region', () => {
    test.use({ locale: 'en' })
    test('does not guess', async ({ page }) => {
      await seed(page)
      await page.goto('./#/resources')
      await expect(page.getByLabel(/select your country/i)).toHaveValue('')
      await expect(page.getByText(/pick your country to see local numbers/i)).toBeVisible()
    })
  })

  test('opens worldwide directories safely in a new tab', async ({ page }) => {
    await seed(page)
    await page.goto('./#/resources')
    const link = page.getByRole('link', { name: 'findahelpline.com' }).last()
    await expect(link).toHaveAttribute('target', '_blank')
    await expect(link).toHaveAttribute('rel', /noopener/)
  })
})
