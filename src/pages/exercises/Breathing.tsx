import { useEffect, useRef, useState } from 'react'
import { ExerciseHeader } from '../../components/ExerciseHeader'

const PHASES = [
  { label: 'Breathe in', seconds: 4, scale: 1.4 },
  { label: 'Hold', seconds: 4, scale: 1.4 },
  { label: 'Breathe out', seconds: 4, scale: 1 },
  { label: 'Hold', seconds: 4, scale: 1 },
] as const

export function Breathing() {
  const [running, setRunning] = useState(false)
  const [tick, setTick] = useState<{ phaseIndex: number; secondsLeft: number }>({
    phaseIndex: 0,
    secondsLeft: PHASES[0].seconds,
  })
  const [cycles, setCycles] = useState(0)
  const timerRef = useRef<number | null>(null)

  useEffect(() => {
    if (!running) return
    timerRef.current = window.setInterval(() => {
      setTick(({ phaseIndex, secondsLeft }) => {
        if (secondsLeft > 1) return { phaseIndex, secondsLeft: secondsLeft - 1 }
        const nextPhase = (phaseIndex + 1) % PHASES.length
        if (nextPhase === 0) setCycles((c) => c + 1)
        return { phaseIndex: nextPhase, secondsLeft: PHASES[nextPhase].seconds }
      })
    }, 1000)
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current)
    }
  }, [running])

  const phase = PHASES[tick.phaseIndex]
  const secondsLeft = tick.secondsLeft

  function start() {
    setTick({ phaseIndex: 0, secondsLeft: PHASES[0].seconds })
    setCycles(0)
    setRunning(true)
  }

  function stop() {
    setRunning(false)
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <ExerciseHeader
        title="Box breathing"
        subtitle="Inhale, hold, exhale, hold — each for 4 seconds. Follow the circle."
      />

      <div className="flex h-56 w-56 items-center justify-center">
        <div
          className="flex h-32 w-32 items-center justify-center rounded-full bg-sage-300 text-center text-sage-900 transition-transform duration-[4000ms] ease-in-out dark:bg-sage-600 dark:text-white"
          style={{ transform: `scale(${running ? phase.scale : 1})` }}
        >
          <div>
            <div className="font-semibold">{running ? phase.label : 'Ready?'}</div>
            {running && <div className="text-sm">{secondsLeft}s</div>}
          </div>
        </div>
      </div>

      {running ? (
        <>
          <p className="text-sm text-sage-500 dark:text-sage-400">Cycles completed: {cycles}</p>
          <button
            type="button"
            onClick={stop}
            className="rounded-full border border-sage-300 px-6 py-2.5 font-medium text-sage-700 hover:bg-sage-50 dark:border-sage-700 dark:text-sage-200 dark:hover:bg-sage-800"
          >
            Stop
          </button>
        </>
      ) : (
        <button
          type="button"
          onClick={start}
          className="rounded-full bg-sage-600 px-6 py-2.5 font-medium text-white hover:bg-sage-700"
        >
          {cycles > 0 ? 'Start again' : 'Start'}
        </button>
      )}
    </div>
  )
}
