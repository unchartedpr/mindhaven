import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { onboardingStore } from '../lib/storage'

export function Onboarding() {
  const [open, setOpen] = useState(() => !onboardingStore.isComplete())
  const dismissRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (open) dismissRef.current?.focus()
  }, [open])

  useEffect(() => {
    if (!open) return
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') dismiss()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  function dismiss() {
    onboardingStore.markComplete()
    setOpen(false)
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div
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
        <p className="mt-2 text-sm text-sage-600 dark:text-sage-300">
          A quiet, private space to check in with yourself. Two quick things before you start:
        </p>

        <ul className="mt-4 flex flex-col gap-3 text-sm">
          <li className="flex gap-3 rounded-lg bg-sage-50 p-3 dark:bg-sage-800/50">
            <span aria-hidden="true">🔒</span>
            <span className="text-sage-700 dark:text-sage-200">
              <strong className="font-medium text-sage-800 dark:text-sage-100">
                Everything stays on this device.
              </strong>{' '}
              There's no account and nothing is sent to a server — your check-ins and journal are
              stored only in this browser. You can back them up any time from Settings.
            </span>
          </li>
          <li className="flex gap-3 rounded-lg bg-clay-50 p-3 dark:bg-clay-500/10">
            <span aria-hidden="true">⚠️</span>
            <span className="text-clay-500 dark:text-clay-200">
              <strong className="font-medium">This isn't crisis or clinical care.</strong> MindHaven
              offers self-care tools, not medical advice, and can't see or respond to what you write.
              If you're in immediate danger, please use{' '}
              <Link to="/resources" onClick={dismiss} className="underline">
                real crisis resources
              </Link>{' '}
              or your local emergency number.
            </span>
          </li>
        </ul>

        <button
          ref={dismissRef}
          type="button"
          onClick={dismiss}
          className="mt-5 w-full rounded-full bg-sage-600 py-2.5 text-sm font-medium text-white hover:bg-sage-700"
        >
          I understand, let's begin
        </button>
      </div>
    </div>
  )
}
