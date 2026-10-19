import { Link } from 'react-router-dom'

export function ExerciseHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div>
      <Link
        to="/exercises"
        className="mb-3 inline-flex items-center gap-1 text-sm text-sage-600 hover:text-sage-700 dark:text-sage-400 dark:hover:text-sage-200"
      >
        ← All exercises
      </Link>
      <h1 className="text-2xl font-semibold text-sage-800 dark:text-sage-50">{title}</h1>
      <p className="mt-1 text-sage-600 dark:text-sage-300">{subtitle}</p>
    </div>
  )
}
