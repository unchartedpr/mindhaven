import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { Settings } from './Settings'
import { backupMeta, moodStore, safetyPlanStore } from '../lib/storage'
import { emptySafetyPlan } from '../lib/validate'

let blobs: Blob[] = []

beforeEach(() => {
  localStorage.clear()
  blobs = []
  // jsdom has no object-URL support or real downloads; capture what would have been saved.
  URL.createObjectURL = vi.fn((b: Blob) => {
    blobs.push(b)
    return 'blob:test'
  })
  URL.revokeObjectURL = vi.fn()
  vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
})

afterEach(() => {
  vi.restoreAllMocks()
})

const fileInput = () => screen.getByLabelText(/choose a mindhaven backup file/i) as HTMLInputElement

async function upload(contents: string, name = 'backup.json') {
  fireEvent.change(fileInput(), { target: { files: [new File([contents], name, { type: 'application/json' })] } })
}

describe('Settings: backup', () => {
  it('says when there has been no backup, then records one on download', async () => {
    render(<Settings />)
    expect(screen.getByText(/you haven’t made a backup yet/i)).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /download backup/i }))

    expect(backupMeta.lastBackupAt()).not.toBeNull()
    expect(await screen.findByText(/last backup:/i)).toBeInTheDocument()
    const exported = JSON.parse(await blobs[0].text())
    expect(exported.version).toBe(2)
  })

  it('includes the safety plan in the download', async () => {
    safetyPlanStore.set({ ...emptySafetyPlan(), updatedAt: 1, reasonsToLive: ['my dog'] })
    render(<Settings />)
    fireEvent.click(screen.getByRole('button', { name: /download backup/i }))
    expect(JSON.parse(await blobs[0].text()).safetyPlan.reasonsToLive).toEqual(['my dog'])
  })
})

describe('Settings: restore', () => {
  it('reports how many entries were added', async () => {
    render(<Settings />)
    await upload(
      JSON.stringify({ version: 2, moods: [{ id: 'm1', timestamp: Date.now(), mood: 4, tags: [] }], gratitude: [], reframes: [], worries: [] }),
    )
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent(/imported successfully — 1 new entry/i))
    expect(moodStore.all()).toHaveLength(1)
  })

  it('says how many items were skipped as invalid', async () => {
    render(<Settings />)
    await upload(
      JSON.stringify({
        moods: [
          { id: 'ok', timestamp: 1, mood: 3, tags: [] },
          { id: 'bad', timestamp: 1, mood: 99, tags: [] },
        ],
      }),
    )
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent(/1 item was skipped/i))
  })

  it('shows an error for a file that is not JSON', async () => {
    render(<Settings />)
    await upload('not json')
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent(/could not read/i))
  })

  it('shows an error for JSON that is not a backup', async () => {
    render(<Settings />)
    await upload(JSON.stringify({ hello: 'world' }))
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent(/doesn.t look like a mindhaven export/i))
  })

  it('refuses an oversized file without reading it', async () => {
    render(<Settings />)
    const big = new File(['{}'], 'big.json', { type: 'application/json' })
    Object.defineProperty(big, 'size', { value: 6_000_000 })
    fireEvent.change(fileInput(), { target: { files: [big] } })
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent(/too large/i))
  })

  it('does not break the app when the imported entries are malformed', async () => {
    render(<Settings />)
    await upload(JSON.stringify({ moods: [{ id: 'x', timestamp: 1, mood: 3, tags: 'not-an-array' }] }))
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent(/imported successfully/i))
    expect(moodStore.all()[0].tags).toEqual([])
  })
})

describe('Settings: spreadsheet export', () => {
  it('is disabled until there is something to export', () => {
    render(<Settings />)
    expect(screen.getByRole('button', { name: /download csv/i })).toBeDisabled()
  })

  it('downloads check-ins as CSV', async () => {
    moodStore.add({ mood: 4, tags: ['calm'], note: '=1+1' })
    render(<Settings />)
    fireEvent.click(screen.getByRole('button', { name: /download csv/i }))
    expect(blobs[0].type).toContain('text/csv')
    const text = await blobs[0].text()
    expect(text.split('\r\n')[0]).toBe('date,time,mood,mood_label,tags,note')
    expect(text).toContain("'=1+1") // formula neutralised
  })
})

describe('Settings: daily reminder', () => {
  it('downloads a calendar file for the chosen time', async () => {
    render(<Settings />)
    fireEvent.change(screen.getByLabelText(/remind me at/i), { target: { value: '07:45' } })
    fireEvent.click(screen.getByRole('button', { name: /add to my calendar/i }))
    expect(blobs[0].type).toContain('text/calendar')
    const text = await blobs[0].text()
    expect(text).toContain('RRULE:FREQ=DAILY')
    expect(text).toMatch(/DTSTART:\d{8}T074500/)
  })

  it('cannot be used with no time chosen', () => {
    render(<Settings />)
    fireEvent.change(screen.getByLabelText(/remind me at/i), { target: { value: '' } })
    expect(screen.getByRole('button', { name: /add to my calendar/i })).toBeDisabled()
  })
})

describe('Settings: delete everything', () => {
  it('requires a second click before clearing data', () => {
    moodStore.add({ mood: 3, tags: [] })
    safetyPlanStore.set({ ...emptySafetyPlan(), updatedAt: 1, warningSigns: ['x'] })
    render(<Settings />)

    fireEvent.click(screen.getByRole('button', { name: /delete all my data/i }))
    expect(moodStore.all()).toHaveLength(1)
    expect(screen.getAllByText(/click again to confirm/i).length).toBeGreaterThan(0)

    fireEvent.click(screen.getByRole('button', { name: /click again to confirm/i }))
    expect(moodStore.all()).toHaveLength(0)
    expect(safetyPlanStore.get()).toBeNull()
    expect(screen.getByRole('status')).toHaveTextContent(/all data has been cleared/i)
  })

  it('disarms if focus moves away, so a stray tap cannot leave it loaded', () => {
    moodStore.add({ mood: 3, tags: [] })
    render(<Settings />)
    const button = screen.getByRole('button', { name: /delete all my data/i })
    fireEvent.click(button)
    fireEvent.blur(screen.getByRole('button', { name: /click again to confirm/i }))
    expect(screen.getByRole('button', { name: /delete all my data/i })).toBeInTheDocument()
    expect(moodStore.all()).toHaveLength(1)
  })
})

describe('Settings: storage info', () => {
  it('says "unknown" where the browser cannot tell us', () => {
    render(<Settings />)
    expect(screen.getByText(/protected from automatic cleanup/i)).toBeInTheDocument()
  })
})
