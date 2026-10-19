import { useState } from 'react'
import { ExerciseHeader } from '../../components/ExerciseHeader'
import { Button, ButtonLink, TextArea } from '../../components/ui'
import { worryStore } from '../../lib/storage'

export function WorryTime() {
  const [worry, setWorry] = useState('')
  const [saved, setSaved] = useState(false)

  function handleSave() {
    if (!worry.trim()) return
    worryStore.add({ worry: worry.trim() })
    setSaved(true)
    setWorry('')
  }

  if (saved) {
    return (
      <div className="flex flex-col items-center gap-4 text-center">
        <ExerciseHeader title="Worry time" subtitle="Your worry has been set aside." />
        <p className="text-4xl" aria-hidden="true">
          📦
        </p>
        <p className="max-w-sm text-sage-600 dark:text-sage-300">
          You've written it down, which means you don't have to carry it in your head right now. If it resurfaces
          today, you can gently remind yourself: "I already wrote that down — I'll think about it later."
        </p>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => setSaved(false)}>
            Add another worry
          </Button>
          <ButtonLink to="/exercises">Back to exercises</ButtonLink>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <ExerciseHeader
        title="Worry time"
        subtitle="A technique for when a worry keeps circling: write it down fully, then consciously set it aside for later. You can't un-know it, but you don't have to solve it this second."
      />

      <TextArea
        label="What's on your mind?"
        rows={5}
        maxLength={5000}
        value={worry}
        onChange={(e) => setWorry(e.target.value)}
        placeholder="Write out the worry in as much detail as you need to."
      />

      <div>
        <Button disabled={!worry.trim()} onClick={handleSave}>
          Set this worry aside
        </Button>
      </div>
    </div>
  )
}
