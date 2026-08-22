import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ExerciseHeader } from '../../components/ExerciseHeader'

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
        <p className="text-4xl">🌿</p>
        <p className="text-sage-600 dark:text-sage-300">
          Take one more slow breath before you go back to what you were doing.
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={restart}
            className="rounded-full border border-sage-300 px-5 py-2 text-sm font-medium text-sage-700 hover:bg-sage-50 dark:border-sage-700 dark:text-sage-200 dark:hover:bg-sage-800"
          >
            Do it again
          </button>
          <Link
            to="/exercises"
            className="rounded-full bg-sage-600 px-5 py-2 text-sm font-medium text-white hover:bg-sage-700"
          >
            Back to exercises
          </Link>
        </div>
      </div>
    )
  }

  const step = STEPS[stepIndex]

  return (
    <div className="flex flex-col gap-6">
      <ExerciseHeader
        title="5-4-3-2-1 grounding"
        subtitle="Notice your surroundings, one sense at a time."
      />

      <div className="flex items-center gap-3 text-lg font-medium text-sage-800 dark:text-sage-100">
        <span className="text-2xl" aria-hidden="true">
          {step.emoji}
        </span>
        Name {step.count} {step.sense}
      </div>

      <div className="flex flex-col gap-2">
        {Array.from({ length: step.count }).map((_, i) => (
          <input
            key={i}
            value={values[stepIndex][i]}
            onChange={(e) => updateValue(i, e.target.value)}
            placeholder={`${i + 1}.`}
            className="rounded-lg border border-sage-200 bg-white p-2.5 text-sm outline-none focus:border-sage-500 dark:border-sage-800 dark:bg-sage-900/40"
          />
        ))}
      </div>

      <div className="flex justify-between">
        <button
          type="button"
          disabled={stepIndex === 0}
          onClick={() => setStepIndex((i) => Math.max(0, i - 1))}
          className="rounded-full border border-sage-300 px-5 py-2 text-sm font-medium text-sage-700 disabled:opacity-30 dark:border-sage-700 dark:text-sage-200"
        >
          Back
        </button>
        <button
          type="button"
          onClick={() => setStepIndex((i) => i + 1)}
          className="rounded-full bg-sage-600 px-5 py-2 text-sm font-medium text-white hover:bg-sage-700"
        >
          {stepIndex === STEPS.length - 1 ? 'Finish' : 'Next'}
        </button>
      </div>
    </div>
  )
}
