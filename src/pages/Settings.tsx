import { useEffect, useRef, useState } from 'react'
import { Button, Card, ConfirmButton, PageHeader } from '../components/ui'
import { downloadFile, today } from '../lib/download'
import { moodsToCSV } from '../lib/insights'
import { DEFAULT_REMINDER_TIME, buildReminderICS, isValidTime } from '../lib/reminders'
import { backupMeta, clearAllData, ensurePersistence, exportData, importData, moodStore } from '../lib/storage'
import { useCollection, useLastBackupAt } from '../lib/useStore'

const MAX_IMPORT_BYTES = 5_000_000

type Message = { kind: 'ok' | 'error'; text: string }

function StatusMessage({ message }: { message: Message | null }) {
  if (!message) return null
  return (
    <p
      role="status"
      className={`mt-3 rounded-lg px-3 py-2 text-sm ${
        message.kind === 'ok'
          ? 'bg-sage-100 text-sage-800 dark:bg-sage-800 dark:text-sage-200'
          : 'bg-clay-50 text-clay-700 dark:bg-clay-500/10 dark:text-clay-200'
      }`}
    >
      {message.text}
    </p>
  )
}

function formatBytes(n: number): string {
  if (n < 1024 * 1024) return `${Math.max(1, Math.round(n / 1024))} KB`
  return `${(n / (1024 * 1024)).toFixed(1)} MB`
}

function StorageInfo() {
  const [persisted, setPersisted] = useState<boolean | null>(null)
  const [usage, setUsage] = useState<number | null>(null)
  const supported = typeof navigator !== 'undefined' && !!navigator.storage?.persist

  useEffect(() => {
    let cancelled = false
    void (async () => {
      try {
        const [p, estimate] = await Promise.all([navigator.storage?.persisted?.(), navigator.storage?.estimate?.()])
        if (cancelled) return
        if (typeof p === 'boolean') setPersisted(p)
        if (estimate?.usage !== undefined) setUsage(estimate.usage)
      } catch {
        /* unsupported — leave as unknown */
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  async function requestPersistence() {
    ensurePersistence()
    try {
      setPersisted((await navigator.storage?.persist?.()) ?? null)
    } catch {
      /* ignore */
    }
  }

  return (
    <Card>
      <h2 className="font-semibold text-sage-800 dark:text-sage-100">Storage on this device</h2>
      <p className="mt-1 text-sm text-sage-700 dark:text-sage-300">
        Browsers can clear a site’s stored data when space runs low, or after long periods of not visiting
        (Safari does this). Asking the browser to keep it, installing MindHaven to your home screen, and keeping a
        recent backup all reduce the risk.
      </p>
      <p className="mt-2 text-sm text-sage-800 dark:text-sage-100">
        Protected from automatic cleanup:{' '}
        <strong className="font-medium">{persisted === null ? 'unknown' : persisted ? 'yes' : 'not yet'}</strong>
        {usage !== null && <> · Using about {formatBytes(usage)}</>}
      </p>
      {supported && persisted === false && (
        <Button variant="secondary" className="mt-3" onClick={requestPersistence}>
          Ask my browser to keep my data
        </Button>
      )}
    </Card>
  )
}

export function Settings() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [importMessage, setImportMessage] = useState<Message | null>(null)
  const [clearMessage, setClearMessage] = useState<Message | null>(null)
  const [reminderTime, setReminderTime] = useState(DEFAULT_REMINDER_TIME)
  const moods = useCollection(moodStore)
  const lastBackupAt = useLastBackupAt()

  function handleExport() {
    downloadFile(`mindhaven-backup-${today()}.json`, 'application/json', JSON.stringify(exportData(), null, 2))
    backupMeta.markBackedUp()
  }

  async function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    if (file.size > MAX_IMPORT_BYTES) {
      setImportMessage({ kind: 'error', text: 'That file is too large to be a MindHaven backup.' })
      return
    }
    try {
      const parsed: unknown = JSON.parse(await file.text())
      const result = importData(parsed)
      if (!result.ok) {
        setImportMessage({ kind: 'error', text: result.error })
        return
      }
      const skipped = result.skipped > 0 ? ` ${result.skipped} item${result.skipped === 1 ? ' was' : 's were'} skipped because they weren’t valid.` : ''
      setImportMessage({
        kind: 'ok',
        text: `Imported successfully — ${result.imported} new ${result.imported === 1 ? 'entry' : 'entries'} added.${skipped}`,
      })
    } catch {
      setImportMessage({ kind: 'error', text: 'Could not read that file — make sure it’s a MindHaven export.' })
    }
  }

  function handleReminder() {
    if (!isValidTime(reminderTime)) return
    downloadFile(
      'mindhaven-daily-reminder.ics',
      'text/calendar',
      buildReminderICS({ time: reminderTime, url: window.location.origin + window.location.pathname }),
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Settings & data"
        subtitle="Everything you've entered lives only in this browser. Back it up if you'd like to keep it safe or move it to another device."
      />

      <Card>
        <h2 className="font-semibold text-sage-800 dark:text-sage-100">Back up your data</h2>
        <p className="mt-1 text-sm text-sage-700 dark:text-sage-300">
          Download everything — mood check-ins, gratitude notes, thought reframes, worry notes, and your safety
          plan — as a single file you control.
        </p>
        <p className="mt-1 text-sm text-sage-700 dark:text-sage-400">
          {lastBackupAt === null
            ? 'You haven’t made a backup yet.'
            : `Last backup: ${new Date(lastBackupAt).toLocaleDateString()}.`}
        </p>
        <Button className="mt-3" onClick={handleExport}>
          Download backup
        </Button>
      </Card>

      <Card>
        <h2 className="font-semibold text-sage-800 dark:text-sage-100">Restore from a backup</h2>
        <p className="mt-1 text-sm text-sage-700 dark:text-sage-300">
          Choose a previously downloaded backup file. New entries are merged in — nothing already here gets
          overwritten.
        </p>
        <Button variant="secondary" className="mt-3" onClick={() => fileInputRef.current?.click()}>
          Choose backup file
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json,.json"
          onChange={handleFileSelected}
          className="hidden"
          aria-label="Choose a MindHaven backup file to restore"
        />
        <StatusMessage message={importMessage} />
      </Card>

      <Card>
        <h2 className="font-semibold text-sage-800 dark:text-sage-100">Export check-ins as a spreadsheet</h2>
        <p className="mt-1 text-sm text-sage-700 dark:text-sage-300">
          A CSV of your mood check-ins (date, mood, tags, notes) that opens in Excel, Numbers, or Google Sheets.
          Handy for sharing with a therapist or doctor.
        </p>
        <Button
          variant="secondary"
          className="mt-3"
          disabled={moods.length === 0}
          onClick={() => downloadFile(`mindhaven-checkins-${today()}.csv`, 'text/csv', moodsToCSV(moods))}
        >
          Download CSV
        </Button>
      </Card>

      <Card>
        <h2 className="font-semibold text-sage-800 dark:text-sage-100">Daily check-in reminder</h2>
        <p className="mt-1 text-sm text-sage-700 dark:text-sage-300">
          Websites can’t reliably remind you when they’re closed without tracking you, so MindHaven doesn’t try.
          Instead, add a repeating event to your own calendar app — it works offline and nobody else sees it.
        </p>
        <div className="mt-3 flex flex-wrap items-end gap-3">
          <label className="text-sm font-medium text-sage-700 dark:text-sage-200">
            Remind me at
            <input
              type="time"
              value={reminderTime}
              onChange={(e) => setReminderTime(e.target.value)}
              className="mt-1 block min-h-11 rounded-lg border border-sage-200 bg-white p-2 text-sm dark:border-sage-800 dark:bg-sage-900/40"
            />
          </label>
          <Button variant="secondary" disabled={!isValidTime(reminderTime)} onClick={handleReminder}>
            Add to my calendar
          </Button>
        </div>
      </Card>

      <StorageInfo />

      <Card tone="danger">
        <h2 className="font-semibold text-sage-800 dark:text-sage-100">Delete all data</h2>
        <p className="mt-1 text-sm text-sage-700 dark:text-sage-300">
          Permanently erases everything from this device. This can't be undone unless you have a backup.
        </p>
        <div className="mt-3">
          <ConfirmButton
            confirmLabel="Click again to confirm — this can’t be undone"
            onConfirm={() => {
              clearAllData()
              setClearMessage({ kind: 'ok', text: 'All data has been cleared from this device.' })
            }}
          >
            Delete all my data
          </ConfirmButton>
        </div>
        <StatusMessage message={clearMessage} />
      </Card>
    </div>
  )
}
