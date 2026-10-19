import type { MoodValue } from './types'

export interface Suggestion {
  to: string
  label: string
  why: string
}

export interface CheckInFollowUp {
  /** A short, warm line. Never a diagnosis or advice about the person's mental health. */
  message: string
  suggestions: Suggestion[]
  /** True when the check-in was low enough that pointing to support is appropriate. */
  offerSupport: boolean
}

const BREATHING: Suggestion = { to: '/exercises/breathing', label: 'Box breathing', why: 'Slows your body down' }
const GROUNDING: Suggestion = { to: '/exercises/grounding', label: '5-4-3-2-1 grounding', why: 'Brings you back to the present' }
const WORRY: Suggestion = { to: '/exercises/worry-time', label: 'Worry time', why: 'Get it out of your head and onto the page' }
const BODY_SCAN: Suggestion = { to: '/exercises/body-scan', label: 'Body scan', why: 'Gentle way to unwind' }
const REFRAME: Suggestion = { to: '/exercises/reframe', label: 'Thought reframing', why: 'Look at the thought behind the feeling' }
const GRATITUDE: Suggestion = { to: '/exercises/gratitude', label: 'Gratitude note', why: 'Hold on to this moment' }

const BY_TAG: Record<string, Suggestion[]> = {
  anxious: [BREATHING, GROUNDING],
  stressed: [BREATHING, WORRY],
  overwhelmed: [GROUNDING, WORRY],
  tired: [BODY_SCAN],
  sad: [REFRAME],
}

const POSITIVE_TAGS = new Set(['grateful', 'hopeful', 'calm', 'motivated'])

function messageFor(mood: MoodValue): string {
  switch (mood) {
    case 1:
      return 'That sounds really hard. Thank you for being honest about it.'
    case 2:
      return 'Rough days happen. You showed up for yourself anyway.'
    case 3:
      return 'Noted. Steady days count too.'
    case 4:
      return 'Glad it’s a good one.'
    case 5:
      return 'That’s lovely to hear.'
  }
}

/**
 * Picks a few relevant next steps from the mood and tags just logged.
 * Deliberately simple and transparent: a lookup table, no scoring, no inference about the person.
 */
export function followUpFor(mood: MoodValue, tags: readonly string[]): CheckInFollowUp {
  const picked: Suggestion[] = []
  const add = (s: Suggestion) => {
    if (!picked.some((p) => p.to === s.to)) picked.push(s)
  }

  for (const tag of tags) for (const s of BY_TAG[tag] ?? []) add(s)

  if (mood >= 4 && tags.some((t) => POSITIVE_TAGS.has(t))) add(GRATITUDE)
  if (mood <= 2 && picked.length === 0) add(BREATHING)
  if (mood === 5 && picked.length === 0) add(GRATITUDE)

  return {
    message: messageFor(mood),
    suggestions: picked.slice(0, 3),
    offerSupport: mood <= 2 || tags.includes('lonely'),
  }
}
