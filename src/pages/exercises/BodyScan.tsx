import { useEffect, useState } from 'react'
import { ExerciseHeader } from '../../components/ExerciseHeader'
import { Button, ButtonLink, Card } from '../../components/ui'

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
        <p className="text-4xl" aria-hidden="true">
          🧘
        </p>
        <p className="text-sage-600 dark:text-sage-300">
          Take a moment before you move on. Notice how your body feels now compared to when you started.
        </p>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={start}>
            Do it again
          </Button>
          <ButtonLink to="/exercises">Back to exercises</ButtonLink>
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
        <Button onClick={start}>Start</Button>
      </div>
    )
  }

  const step = STEPS[stepIndex]

  return (
    <div className="flex flex-col items-center gap-6 text-center">
      <ExerciseHeader title="Body scan" subtitle="Follow along at your own pace." />

      <Card size="lg" className="w-full max-w-sm">
        <div className="text-sm font-medium uppercase tracking-wide text-sage-600">
          Step {stepIndex + 1} of {STEPS.length}
        </div>
        <div className="mt-2 text-xl font-semibold text-sage-800 dark:text-sage-100">{step.part}</div>
        <p className="mt-3 text-sage-600 dark:text-sage-300">{step.instruction}</p>
        {/* A ticking countdown is visual only: announcing it every second would drown out the guidance. */}
        <div className="mt-4 text-3xl font-bold text-sage-600 dark:text-sage-400">{secondsLeft}s</div>
      </Card>

      {/* Screen readers hear each new step once, when it begins. */}
      <p className="sr-only" aria-live="polite">
        {`Step ${stepIndex + 1} of ${STEPS.length}: ${step.part}. ${step.instruction}`}
      </p>

      <div className="flex gap-3">
        <Button variant="secondary" disabled={stepIndex === 0} onClick={() => goTo(Math.max(0, stepIndex - 1))}>
          Back
        </Button>
        <Button variant="secondary" onClick={() => setRunning((r) => !r)}>
          {running ? 'Pause' : 'Resume'}
        </Button>
        <Button onClick={() => goTo(stepIndex + 1)}>{stepIndex === STEPS.length - 1 ? 'Finish' : 'Next'}</Button>
      </div>
    </div>
  )
}
