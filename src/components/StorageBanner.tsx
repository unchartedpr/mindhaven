import { Link } from 'react-router-dom'
import { useStorageStatus } from '../lib/useStore'

/**
 * Tells the person when what they write is not actually being saved. Silent data loss is the worst
 * failure a journal can have, so this is an alert, not a footnote.
 */
export function StorageBanner() {
  const { available, writeFailed } = useStorageStatus()
  if (available && !writeFailed) return null

  return (
    <div
      role="alert"
      className="border-b border-clay-200 bg-clay-50 px-4 py-2 print:hidden text-center text-sm text-clay-700 dark:border-clay-500/30 dark:bg-clay-500/10 dark:text-clay-200"
    >
      {available ? (
        <>
          MindHaven couldn’t save your last change — this browser’s storage may be full. Please{' '}
          <Link to="/settings" className="underline">
            download a backup
          </Link>{' '}
          and free up some space.
        </>
      ) : (
        <>
          Your browser is blocking storage (private browsing, or a setting), so nothing you enter will be kept
          after you close this tab. Use{' '}
          <Link to="/settings" className="underline">
            Settings
          </Link>{' '}
          to download a backup before leaving.
        </>
      )}
    </div>
  )
}
