import { Link } from 'react-router-dom'

/** Persistent, unmissable but non-alarming reminder that this app is not for emergencies. */
export function CrisisBanner({ compact = false }: { compact?: boolean }) {
  return (
    <div
      role="note"
      className={
        compact
          ? 'rounded-lg border border-clay-200 bg-clay-50 px-3 py-2 text-sm text-clay-500 dark:border-clay-500/30 dark:bg-clay-500/10 dark:text-clay-200'
          : 'rounded-xl border border-clay-200 bg-clay-50 p-4 text-sm text-clay-500 dark:border-clay-500/30 dark:bg-clay-500/10 dark:text-clay-200'
      }
    >
      <p>
        <strong className="font-semibold">If you're in immediate danger or crisis,</strong> please
        contact your local emergency number or a crisis line right away —{' '}
        <Link to="/resources" className="underline underline-offset-2 hover:opacity-80">
          see crisis resources
        </Link>
        . MindHaven is a self-care companion, not emergency or clinical care.
      </p>
    </div>
  )
}
