import { Link, Route, Routes } from 'react-router-dom'
import { Breathing } from './exercises/Breathing'
import { Grounding } from './exercises/Grounding'
import { Reframe } from './exercises/Reframe'
import { Gratitude } from './exercises/Gratitude'

const EXERCISES = [
  {
    to: 'breathing',
    title: 'Box breathing',
    desc: 'A guided 4-4-4-4 breathing pattern to calm your nervous system.',
    emoji: '🌬️',
    time: '2–5 min',
  },
  {
    to: 'grounding',
    title: '5-4-3-2-1 grounding',
    desc: 'Use your senses to gently anchor yourself in the present moment.',
    emoji: '🌳',
    time: '3–5 min',
  },
  {
    to: 'reframe',
    title: 'Thought reframing',
    desc: 'A CBT-style worksheet to examine and balance a difficult thought.',
    emoji: '🔄',
    time: '5–10 min',
  },
  {
    to: 'gratitude',
    title: 'Gratitude note',
    desc: 'Jot down a few things, big or small, that you appreciate right now.',
    emoji: '✨',
    time: '2 min',
  },
]

function ExercisesList() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-sage-800 dark:text-sage-50">Coping exercises</h1>
        <p className="mt-1 text-sage-600 dark:text-sage-300">
          Short, evidence-informed practices you can do anytime. Pick whatever feels right.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {EXERCISES.map((ex) => (
          <Link
            key={ex.to}
            to={ex.to}
            className="flex flex-col gap-1 rounded-xl border border-sage-200 bg-white p-4 transition-colors hover:bg-sage-50 dark:border-sage-800 dark:bg-sage-900/40 dark:hover:bg-sage-800/50"
          >
            <span className="text-2xl" aria-hidden="true">
              {ex.emoji}
            </span>
            <span className="font-medium text-sage-800 dark:text-sage-100">{ex.title}</span>
            <span className="text-sm text-sage-500 dark:text-sage-400">{ex.desc}</span>
            <span className="mt-1 text-xs font-medium uppercase tracking-wide text-sage-400">{ex.time}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}

export function Exercises() {
  return (
    <Routes>
      <Route index element={<ExercisesList />} />
      <Route path="breathing" element={<Breathing />} />
      <Route path="grounding" element={<Grounding />} />
      <Route path="reframe" element={<Reframe />} />
      <Route path="gratitude" element={<Gratitude />} />
    </Routes>
  )
}
