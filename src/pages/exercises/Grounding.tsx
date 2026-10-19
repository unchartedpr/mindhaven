import { useState } from 'react'
import { ExerciseHeader } from '../../components/ExerciseHeader'
import { Button, ButtonLink } from '../../components/ui'

const STEPS = [
  { count: 5, sense: 'things you can see', emoji: '👀' },
  { count: 4, sense: 'things you can touch', emoji: '✋' },
  { count: 3, sense: 'things you can hear', emoji: '👂' },
  { count: 2, sense: 'things you can smell', emoji: '👃' },
  { count: 1, sense: 'thing you can taste', emoji: '👅' },
] as const

export function Grounding() {
  const [stepIndex, setStepIndex] = useState(0)
  const [values, setValues] = useState<string[][]>(STEPS.map((s) => Array(s.count).fill('')))
  const done = stepIndex >= STEPS.length

  function updateValue(itemIndex: number, value: string) {
    setValues((prev) => {
      const copy = prev.map((arr) => [...arr])
      copy[stepIndex][itemIndex] = value
      return copy
    })
  }

  function restart() {
    setStepIndex(0)
    setValues(STEPS.map((s) => Array(s.count).fill('')))
  }

  if (done) {
    return (
      <div className="flex flex-col items-center gap-4 text-center">
        <ExerciseHeader title="5-4-3-2-1 grounding" subtitle="Nice work grounding yourself in the present." />
        <p className="text-4xl" aria-hidden="true">
          🌿
        </p>
        <p className="text-sage-600 dark:text-sage-300">
          Take one more slow breath before you go back to what you were doing.
        </p>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={restart}>
            Do it again
          </Button>
          <ButtonLink to="/exercises">Back to exercises</ButtonLink>
        </div>
      </div>
    )
  }

  const step = STEPS[stepIndex]

  return (
    <div className="flex flex-col gap-6">
      <ExerciseHeader title="5-4-3-2-1 grounding" subtitle="Notice your surroundings, one sense at a time." />

      <div className="flex items-center justify-center gap-2" aria-hidden="true">
        {STEPS.map((_, i) => (
          <span
            key={i}
            className={`h-1.5 rounded-full transition-all ${
              i === stepIndex
                ? 'w-6 bg-sage-600 dark:bg-sage-300'
                : i < stepIndex
                  ? 'w-1.5 bg-sage-400 dark:bg-sage-600'
                  : 'w-1.5 bg-sage-200 dark:bg-sage-800'
            }`}
          />
        ))}
      </div>

      <h2 className="flex items-center gap-3 text-lg font-medium text-sage-800 dark:text-sage-100">
        <span className="text-2xl" aria-hidden="true">
          {step.emoji}
        </span>
        <span>
          <span className="sr-only">
            Step {stepIndex + 1} of {STEPS.length}:{' '}
          </span>
          Name {step.count} {step.sense}
        </span>
      </h2>

      <div className="flex flex-col gap-2">
        {Array.from({ length: step.count }).map((_, i) => (
          <input
            key={`${stepIndex}-${i}`}
            value={values[stepIndex][i]}
            onChange={(e) => updateValue(i, e.target.value)}
            maxLength={200}
            placeholder={`${i + 1}.`}
            aria-label={`${step.sense.replace(/^things?/, 'Thing')} — ${i + 1} of ${step.count}`}
            className="min-h-11 rounded-lg border border-sage-200 bg-white p-2.5 text-sm outline-none focus:border-sage-500 dark:border-sage-800 dark:bg-sage-900/40"
          />
        ))}
      </div>

      <div className="flex justify-between">
        <Button variant="secondary" disabled={stepIndex === 0} onClick={() => setStepIndex((i) => Math.max(0, i - 1))}>
          Back
        </Button>
        <Button onClick={() => setStepIndex((i) => i + 1)}>{stepIndex === STEPS.length - 1 ? 'Finish' : 'Next'}</Button>
      </div>
    </div>
  )
}
