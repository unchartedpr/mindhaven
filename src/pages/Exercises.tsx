import { Link, Route, Routes } from 'react-router-dom'
import { Breathing } from './exercises/Breathing'
import { Grounding } from './exercises/Grounding'
import { Reframe } from './exercises/Reframe'
import { Gratitude } from './exercises/Gratitude'
import { WorryTime } from './exercises/WorryTime'
import { NotFound } from './NotFound'
import { PageHeader } from '../components/ui'
import { cardClass } from '../components/uiClasses'
import { BodyScan } from './exercises/BodyScan'

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
    to: 'body-scan',
    title: 'Body scan',
    desc: 'A guided progressive relaxation, moving attention through your body.',
    emoji: '🧘',
    time: '~2 min',
  },
  {
    to: 'reframe',
    title: 'Thought reframing',
    desc: 'A CBT-style worksheet to examine and balance a difficult thought.',
    emoji: '🔄',
    time: '5–10 min',
  },
  {
    to: 'worry-time',
    title: 'Worry time',
    desc: 'Write a worry down fully, then consciously set it aside for later.',
    emoji: '📦',
    time: '2–5 min',
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
      <PageHeader
        title="Coping exercises"
        subtitle="Short, evidence-informed practices you can do anytime. Pick whatever feels right."
      />
      <div className="grid gap-3 sm:grid-cols-2">
        {EXERCISES.map((ex) => (
          <Link key={ex.to} to={ex.to} className={cardClass('default', true, 'flex flex-col gap-1')}>
            <span className="text-2xl" aria-hidden="true">
              {ex.emoji}
            </span>
            <span className="font-medium text-sage-800 dark:text-sage-100">{ex.title}</span>
            <span className="text-sm text-sage-600 dark:text-sage-400">{ex.desc}</span>
            <span className="mt-1 text-xs font-medium uppercase tracking-wide text-sage-600">{ex.time}</span>
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
      <Route path="body-scan" element={<BodyScan />} />
      <Route path="reframe" element={<Reframe />} />
      <Route path="worry-time" element={<WorryTime />} />
      <Route path="gratitude" element={<Gratitude />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
