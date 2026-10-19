const DAY = 24 * 60 * 60 * 1000

/** How long before we suggest a fresh backup. */
export const BACKUP_STALE_AFTER_DAYS = 30
/** Don't nag people who have barely used the app. */
export const BACKUP_MIN_ENTRIES = 5

/**
 * Data lives only in this browser, so a backup is the user's only safety net. Nudge — gently, and only
 * once there's something worth protecting — when they've never backed up or it has been a while.
 */
export function shouldNudgeBackup(opts: { entryCount: number; lastBackupAt: number | null; now?: number }): boolean {
  const { entryCount, lastBackupAt, now = Date.now() } = opts
  if (entryCount < BACKUP_MIN_ENTRIES) return false
  if (lastBackupAt === null) return true
  return now - lastBackupAt > BACKUP_STALE_AFTER_DAYS * DAY
}
