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

/** A person the user can reach out to, with an optional phone number for one-tap calling. */
export interface SafetyContact {
  name: string
  phone: string
}

/**
 * A personal safety plan in the style of the Stanley–Brown Safety Planning
 * Intervention. Entirely user-authored; MindHaven never interprets it.
 */
export interface SafetyPlan {
  updatedAt: number
  warningSigns: string[]
  copingStrategies: string[]
  distractionPeople: SafetyContact[]
  supportPeople: SafetyContact[]
  professionals: SafetyContact[]
  safeEnvironment: string[]
  reasonsToLive: string[]
}

export interface MindHavenExport {
  version: 1 | 2
  exportedAt: number
  moods: MoodEntry[]
  gratitude: GratitudeEntry[]
  reframes: ThoughtReframeEntry[]
  worries: WorryEntry[]
  /** Added in version 2. */
  safetyPlan?: SafetyPlan | null
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
