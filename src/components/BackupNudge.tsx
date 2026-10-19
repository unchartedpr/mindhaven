import { useState } from 'react'
import { shouldNudgeBackup } from '../lib/backup'
import { useLastBackupAt } from '../lib/useStore'
import { ButtonLink, Card } from './ui'

/** A gentle, dismissible reminder that this browser is the only copy of the user's data. */
export function BackupNudge({ entryCount }: { entryCount: number }) {
  const lastBackupAt = useLastBackupAt()
  const [dismissed, setDismissed] = useState(false)

  if (dismissed || !shouldNudgeBackup({ entryCount, lastBackupAt })) return null

  return (
    <Card className="flex flex-wrap items-center justify-between gap-3">
      <p className="text-sm text-sage-700 dark:text-sage-200">
        <strong className="font-medium">Your entries live only in this browser.</strong>{' '}
        {lastBackupAt === null ? 'You haven’t made a backup yet.' : 'It’s been a while since your last backup.'}
      </p>
      <div className="flex gap-2">
        <ButtonLink to="/settings">Back up now</ButtonLink>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="min-h-11 rounded-full px-3 text-sm text-sage-700 underline hover:text-sage-900 dark:text-sage-300"
        >
          Later
        </button>
      </div>
    </Card>
  )
}
