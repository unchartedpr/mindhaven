import { Link } from 'react-router-dom'
import { followUpFor } from '../lib/suggestions'
import { safetyPlanStore } from '../lib/storage'
import { useDocument } from '../lib/useStore'
import type { MoodValue } from '../lib/types'
import { isSafetyPlanEmpty } from '../lib/validate'
import { ButtonLink, Card } from './ui'

/**
 * Shown right after a check-in is saved: a warm acknowledgement and a few relevant next steps.
 * Suggestions come from a plain lookup table (see lib/suggestions.ts) — nothing is inferred or stored.
 */
export function CheckInFollowUp({ mood, tags }: { mood: MoodValue; tags: readonly string[] }) {
  const { message, suggestions, offerSupport } = followUpFor(mood, tags)
  const plan = useDocument(safetyPlanStore)
  const hasPlan = !isSafetyPlanEmpty(plan)

  return (
    <Card role="status" aria-live="polite" className="flex flex-col gap-3">
      <p className="font-medium text-sage-800 dark:text-sage-100">Saved. {message}</p>

      {suggestions.length > 0 && (
        <div>
          <p className="mb-2 text-sm text-sage-600 dark:text-sage-300">If it would help, you could try:</p>
          <ul className="flex flex-wrap gap-2">
            {suggestions.map((s) => (
              <li key={s.to}>
                <ButtonLink to={s.to} variant="secondary" size="sm" title={s.why}>
                  {s.label}
                </ButtonLink>
              </li>
            ))}
          </ul>
        </div>
      )}

      {offerSupport && (
        <p className="text-sm text-sage-700 dark:text-sage-300">
          You don’t have to carry this alone.{' '}
          {hasPlan ? (
            <>
              Your{' '}
              <Link to="/safety-plan" className="underline">
                safety plan
              </Link>{' '}
              is ready, and{' '}
            </>
          ) : (
            <>
              You can{' '}
              <Link to="/safety-plan" className="underline">
                make a safety plan
              </Link>{' '}
              for moments like this, and{' '}
            </>
          )}
          <Link to="/resources" className="underline">
            support lines
          </Link>{' '}
          are there any time.
        </p>
      )}

      <p className="text-sm">
        <Link to="/" className="text-sage-700 underline dark:text-sage-300">
          Back to home
        </Link>
      </p>
    </Card>
  )
}
