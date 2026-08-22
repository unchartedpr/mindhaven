export type MoodValue = 1 | 2 | 3 | 4 | 5

export interface MoodEntry {
  id: string
  /** ms since epoch */
  timestamp: number
  mood: MoodValue
  tags: string[]
  note?: string
}

export interface GratitudeEntry {
  id: string
  timestamp: number
  items: string[]
}

export interface ThoughtReframeEntry {
  id: string
  timestamp: number
  situation: string
  automaticThought: string
  evidenceFor: string
  evidenceAgainst: string
  balancedThought: string
}

export interface WorryEntry {
  id: string
  timestamp: number
  worry: string
}

export interface MindHavenExport {
  version: 1
  exportedAt: number
  moods: MoodEntry[]
  gratitude: GratitudeEntry[]
  reframes: ThoughtReframeEntry[]
  worries: WorryEntry[]
}

export const MOOD_LABELS: Record<MoodValue, string> = {
  1: 'Awful',
  2: 'Rough',
  3: 'Okay',
  4: 'Good',
  5: 'Great',
}

export const MOOD_EMOJI: Record<MoodValue, string> = {
  1: '😞',
  2: '😕',
  3: '😐',
  4: '🙂',
  5: '😄',
}

export const MOOD_TAGS = [
  'anxious',
  'tired',
  'stressed',
  'lonely',
  'grateful',
  'hopeful',
  'overwhelmed',
  'calm',
  'sad',
  'motivated',
] as const
