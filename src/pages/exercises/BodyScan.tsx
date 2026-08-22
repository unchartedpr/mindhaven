import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ExerciseHeader } from '../../components/ExerciseHeader'

const STEP_SECONDS = 15

const STEPS = [
  { part: 'Feet', instruction: 'Bring your attention to your feet. Notice any tension, then let them soften.' },
  { part: 'Legs', instruction: 'Move up to your legs and calves. Let them feel heavy and relaxed.' },
  { part: 'Stomach & chest', instruction: 'Notice your stomach rising and falling. Let your breathing settle.' },
  { part: 'Hands & arms', instruction: 'Bring awareness to your hands and arms. Let them rest, heavy and loose.' },
  { part: 'Shoulders & neck', instruction: 'Notice any tightness in your shoulders and neck. Let it melt away.' },
  { part: 'Face & jaw', instruction: 'Soften your forehead, your eyes, and your jaw.' },
  { part: 'Whole body', instruction: 'Take a moment to notice your whole body, relaxed and supported.' },
] as const

export function BodyScan() {
  const [started, setStarted] = useState(false)
  const [running, setRunning] = useState(false)
  const [stepIndex, setStepIndex] = useState(0)
  const [secondsLeft, setSecondsLeft] = useState(STEP_SECONDS)
  const done = started && stepIndex >= STEPS.length

  useEffect(() => {
    if (!running || done) return
    const timer = window.setInterval(() => {
      setSecondsLeft((s) => {
        if (s > 1) return s - 1
        setStepIndex((i) => i + 1)
        return STEP_SECONDS
      })
    }, 1000)
    return () => window.clearInterval(timer)
  }, [running, done])

  function start() {
    setStepIndex(0)
    setSecondsLeft(STEP_SECONDS)
    setStarted(true)
    setRunning(true)
  }

  function goTo(index: number) {
    setStepIndex(index)
    setSecondsLeft(STEP_SECONDS)
  }

  if (done) {
    return (
      <div className="flex flex-col items-center gap-4 text-center">
        <ExerciseHeader title="Body scan" subtitle="You made it through — well done." />
        <p className="text-4xl">🧘</p>
        <p className="text-sage-600 dark:text-sage-300">
          Take a moment before you move on. Notice how your body feels now compared to when you
          started.
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={start}
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

  if (!started) {
    return (
      <div className="flex flex-col items-center gap-6 text-center">
        <ExerciseHeader
          title="Body scan"
          subtitle="A guided progressive relaxation. Find a comfortable position — you'll move through 7 areas of your body, about 15 seconds each."
        />
        <button
          type="button"
          onClick={start}
          className="rounded-full bg-sage-600 px-6 py-2.5 font-medium text-white hover:bg-sage-700"
        >
          Start
        </button>
      </div>
    )
  }

  const step = STEPS[stepIndex]

  return (
    <div className="flex flex-col items-center gap-6 text-center">
      <ExerciseHeader title="Body scan" subtitle="Follow along at your own pace." />

      <div className="w-full max-w-sm rounded-2xl border border-sage-200 bg-white p-8 dark:border-sage-800 dark:bg-sage-900/40">
        <div className="text-sm font-medium uppercase tracking-wide text-sage-400">
          Step {stepIndex + 1} of {STEPS.length}
        </div>
        <div className="mt-2 text-xl font-semibold text-sage-800 dark:text-sage-100">{step.part}</div>
        <p className="mt-3 text-sage-600 dark:text-sage-300">{step.instruction}</p>
        <div className="mt-4 text-3xl font-bold text-sage-500 dark:text-sage-400" aria-live="polite">
          {secondsLeft}s
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          disabled={stepIndex === 0}
          onClick={() => goTo(Math.max(0, stepIndex - 1))}
          className="rounded-full border border-sage-300 px-4 py-2 text-sm font-medium text-sage-700 disabled:opacity-30 dark:border-sage-700 dark:text-sage-200"
        >
          Back
        </button>
        <button
          type="button"
          onClick={() => setRunning((r) => !r)}
          className="rounded-full border border-sage-300 px-4 py-2 text-sm font-medium text-sage-700 dark:border-sage-700 dark:text-sage-200"
        >
          {running ? 'Pause' : 'Resume'}
        </button>
        <button
          type="button"
          onClick={() => goTo(stepIndex + 1)}
          className="rounded-full bg-sage-600 px-4 py-2 text-sm font-medium text-white hover:bg-sage-700"
        >
          {stepIndex === STEPS.length - 1 ? 'Finish' : 'Next'}
        </button>
      </div>
    </div>
  )
}
