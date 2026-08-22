import { useRef, useState } from 'react'
import { clearAllData, exportData, importData } from '../lib/storage'

export function Settings() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [importMessage, setImportMessage] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null)
  const [confirmingClear, setConfirmingClear] = useState(false)

  function handleExport() {
    const data = exportData()
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    const date = new Date().toISOString().slice(0, 10)
    a.href = url
    a.download = `mindhaven-backup-${date}.json`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  function handleImportClick() {
    fileInputRef.current?.click()
  }

  async function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    try {
      const text = await file.text()
      const parsed = JSON.parse(text)
      const result = importData(parsed)
      if (result.ok) {
        setImportMessage({
          kind: 'ok',
          text: `Imported successfully — ${result.imported} new ${result.imported === 1 ? 'entry' : 'entries'} added.`,
        })
      } else {
        setImportMessage({ kind: 'error', text: result.error })
      }
    } catch {
      setImportMessage({ kind: 'error', text: 'Could not read that file — make sure it’s a MindHaven export.' })
    }
  }

  function handleClearAll() {
    if (!confirmingClear) {
      setConfirmingClear(true)
      return
    }
    clearAllData()
    setConfirmingClear(false)
    setImportMessage({ kind: 'ok', text: 'All data has been cleared from this device.' })
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-sage-800 dark:text-sage-50">Settings & data</h1>
        <p className="mt-1 text-sage-600 dark:text-sage-300">
          Everything you've entered lives only in this browser. Back it up if you'd like to keep it
          safe or move it to another device.
        </p>
      </div>

      <section className="rounded-xl border border-sage-200 bg-white p-4 shadow-sm dark:border-sage-800 dark:bg-sage-900/40">
        <h2 className="font-semibold text-sage-800 dark:text-sage-100">Back up your data</h2>
        <p className="mt-1 text-sm text-sage-500 dark:text-sage-400">
          Download everything — mood check-ins, gratitude notes, thought reframes, and worry notes —
          as a single file you control.
        </p>
        <button
          type="button"
          onClick={handleExport}
          className="mt-3 rounded-full bg-sage-600 px-5 py-2 text-sm font-medium text-white hover:bg-sage-700"
        >
          Download backup
        </button>
      </section>

      <section className="rounded-xl border border-sage-200 bg-white p-4 shadow-sm dark:border-sage-800 dark:bg-sage-900/40">
        <h2 className="font-semibold text-sage-800 dark:text-sage-100">Restore from a backup</h2>
        <p className="mt-1 text-sm text-sage-500 dark:text-sage-400">
          Choose a previously downloaded backup file. New entries are merged in — nothing already
          here gets overwritten.
        </p>
        <button
          type="button"
          onClick={handleImportClick}
          className="mt-3 rounded-full border border-sage-300 px-5 py-2 text-sm font-medium text-sage-700 hover:bg-sage-50 dark:border-sage-700 dark:text-sage-200 dark:hover:bg-sage-800"
        >
          Choose backup file
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json"
          onChange={handleFileSelected}
          className="hidden"
          aria-label="Choose a MindHaven backup file to restore"
        />
        {importMessage && (
          <p
            role="status"
            className={`mt-3 rounded-lg px-3 py-2 text-sm ${
              importMessage.kind === 'ok'
                ? 'bg-sage-100 text-sage-700 dark:bg-sage-800 dark:text-sage-200'
                : 'bg-clay-50 text-clay-500 dark:bg-clay-500/10 dark:text-clay-200'
            }`}
          >
            {importMessage.text}
          </p>
        )}
      </section>

      <section className="rounded-xl border border-clay-200 bg-clay-50/60 p-4 shadow-sm dark:border-clay-500/30 dark:bg-clay-500/5">
        <h2 className="font-semibold text-sage-800 dark:text-sage-100">Delete all data</h2>
        <p className="mt-1 text-sm text-sage-500 dark:text-sage-400">
          Permanently erases everything from this device. This can't be undone unless you have a
          backup.
        </p>
        <button
          type="button"
          onClick={handleClearAll}
          onBlur={() => setConfirmingClear(false)}
          className="mt-3 rounded-full border border-clay-300 px-5 py-2 text-sm font-medium text-clay-500 hover:bg-clay-100 dark:border-clay-500/40 dark:text-clay-200 dark:hover:bg-clay-500/10"
        >
          {confirmingClear ? 'Click again to confirm — this can’t be undone' : 'Delete all my data'}
        </button>
      </section>
    </div>
  )
}
