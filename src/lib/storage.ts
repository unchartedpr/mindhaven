import type { GratitudeEntry, MoodEntry, ThoughtReframeEntry } from './types'

const KEYS = {
  moods: 'mindhaven:v1:moods',
  gratitude: 'mindhaven:v1:gratitude',
  reframes: 'mindhaven:v1:reframes',
  theme: 'mindhaven:v1:theme',
} as const

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function write<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Storage full or unavailable (e.g. private browsing) — fail silently,
    // the app still works for the current session.
  }
}

function newId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`
}

export const moodStore = {
  all(): MoodEntry[] {
    return read<MoodEntry[]>(KEYS.moods, []).sort((a, b) => b.timestamp - a.timestamp)
  },
  add(entry: Omit<MoodEntry, 'id' | 'timestamp'> & { timestamp?: number }): MoodEntry {
    const full: MoodEntry = {
      id: newId(),
      timestamp: entry.timestamp ?? Date.now(),
      mood: entry.mood,
      tags: entry.tags,
      note: entry.note,
    }
    const all = read<MoodEntry[]>(KEYS.moods, [])
    all.push(full)
    write(KEYS.moods, all)
    return full
  },
  remove(id: string): void {
    const all = read<MoodEntry[]>(KEYS.moods, [])
    write(
      KEYS.moods,
      all.filter((e) => e.id !== id),
    )
  },
  clear(): void {
    write(KEYS.moods, [])
  },
}

export const gratitudeStore = {
  all(): GratitudeEntry[] {
    return read<GratitudeEntry[]>(KEYS.gratitude, []).sort((a, b) => b.timestamp - a.timestamp)
  },
  add(items: string[]): GratitudeEntry {
    const full: GratitudeEntry = { id: newId(), timestamp: Date.now(), items }
    const all = read<GratitudeEntry[]>(KEYS.gratitude, [])
    all.push(full)
    write(KEYS.gratitude, all)
    return full
  },
}

export const reframeStore = {
  all(): ThoughtReframeEntry[] {
    return read<ThoughtReframeEntry[]>(KEYS.reframes, []).sort((a, b) => b.timestamp - a.timestamp)
  },
  add(entry: Omit<ThoughtReframeEntry, 'id' | 'timestamp'>): ThoughtReframeEntry {
    const full: ThoughtReframeEntry = { id: newId(), timestamp: Date.now(), ...entry }
    const all = read<ThoughtReframeEntry[]>(KEYS.reframes, [])
    all.push(full)
    write(KEYS.reframes, all)
    return full
  },
}

export const themeStore = {
  get(): 'light' | 'dark' | null {
    return read<'light' | 'dark' | null>(KEYS.theme, null)
  },
  set(theme: 'light' | 'dark'): void {
    write(KEYS.theme, theme)
  },
}

/** Consecutive-day streak of mood check-ins, counting back from today. */
export function computeStreak(entries: MoodEntry[]): number {
  if (entries.length === 0) return 0
  const days = new Set(
    entries.map((e) => new Date(e.timestamp).toDateString()),
  )
  let streak = 0
  const cursor = new Date()
  cursor.setHours(0, 0, 0, 0)
  while (days.has(cursor.toDateString())) {
    streak += 1
    cursor.setDate(cursor.getDate() - 1)
  }
  return streak
}
