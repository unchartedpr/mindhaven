import { describe, expect, it } from 'vitest'
import { BACKUP_MIN_ENTRIES, BACKUP_STALE_AFTER_DAYS, shouldNudgeBackup } from './backup'

const DAY = 24 * 60 * 60 * 1000
const NOW = 1_000_000_000_000

describe('shouldNudgeBackup', () => {
  it('stays quiet until there is something worth protecting', () => {
    expect(shouldNudgeBackup({ entryCount: BACKUP_MIN_ENTRIES - 1, lastBackupAt: null, now: NOW })).toBe(false)
  })

  it('nudges when there is data and no backup has ever been made', () => {
    expect(shouldNudgeBackup({ entryCount: BACKUP_MIN_ENTRIES, lastBackupAt: null, now: NOW })).toBe(true)
  })

  it('does not nudge right after a backup', () => {
    expect(shouldNudgeBackup({ entryCount: 50, lastBackupAt: NOW - 2 * DAY, now: NOW })).toBe(false)
  })

  it('nudges again once the backup is stale', () => {
    const stale = NOW - (BACKUP_STALE_AFTER_DAYS + 1) * DAY
    expect(shouldNudgeBackup({ entryCount: 50, lastBackupAt: stale, now: NOW })).toBe(true)
  })
})
