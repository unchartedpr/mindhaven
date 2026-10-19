import { useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import { onboardingStore } from '../lib/storage'
import { useModal } from '../lib/useModal'
import { Button } from './ui'

export function Onboarding() {
  const [open, setOpen] = useState(() => !onboardingStore.isComplete())
  const dialogRef = useRef<HTMLDivElement>(null)
  const dismissRef = useRef<HTMLButtonElement>(null)

  function dismiss() {
    onboardingStore.markComplete()
    setOpen(false)
  }

  useModal(open, dialogRef, dismiss, dismissRef)

  if (!open) return null

  // Rendered into <body> (outside #root) so the app behind the dialog can be made inert.
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="onboarding-title"
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-xl dark:bg-sage-900"
      >
        <div className="mb-3 text-3xl" aria-hidden="true">
          🌿
        </div>
        <h1 id="onboarding-title" className="text-xl font-semibold text-sage-800 dark:text-sage-50">
          Welcome to MindHaven
        </h1>
        <p className="mt-2 text-sm text-sage-700 dark:text-sage-300">
          A quiet, private space to check in with yourself. Two quick things before you start:
        </p>

        <ul className="mt-4 flex flex-col gap-3 text-sm">
          <li className="flex gap-3 rounded-lg bg-sage-50 p-3 dark:bg-sage-800/50">
            <span aria-hidden="true">🔒</span>
            <span className="text-sage-700 dark:text-sage-200">
              <strong className="font-medium text-sage-800 dark:text-sage-100">
                Everything stays on this device.
              </strong>{' '}
              There's no account and nothing is sent to a server — your check-ins and journal are stored only in
              this browser. You can back them up any time from Settings.
            </span>
          </li>
          <li className="flex gap-3 rounded-lg bg-clay-50 p-3 dark:bg-clay-500/10">
            <span aria-hidden="true">⚠️</span>
            <span className="text-clay-700 dark:text-clay-200">
              <strong className="font-medium">This isn't crisis or clinical care.</strong> MindHaven offers
              self-care tools, not medical advice, and can't see or respond to what you write. If you're in
              immediate danger, please use{' '}
              <Link to="/resources" onClick={dismiss} className="underline">
                real crisis resources
              </Link>{' '}
              or your local emergency number.
            </span>
          </li>
        </ul>

        <Button ref={dismissRef} onClick={dismiss} className="mt-5 w-full">
          I understand, let's begin
        </Button>
      </div>
    </div>,
    document.body,
  )
}
