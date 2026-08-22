import type { GratitudeEntry, MindHavenExport, MoodEntry, ThoughtReframeEntry, WorryEntry } from './types'

const KEYS = {
  moods: 'mindhaven:v1:moods',
  gratitude: 'mindhaven:v1:gratitude',
  reframes: 'mindhaven:v1:reframes',
  worries: 'mindhaven:v1:worries',
  theme: 'mindhaven:v1:theme',
  onboarded: 'mindhaven:v1:onboarded',
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

export const worryStore = {
  all(): WorryEntry[] {
    return read<WorryEntry[]>(KEYS.worries, []).sort((a, b) => b.timestamp - a.timestamp)
  },
  add(worry: string): WorryEntry {
    const full: WorryEntry = { id: newId(), timestamp: Date.now(), worry }
    const all = read<WorryEntry[]>(KEYS.worries, [])
    all.push(full)
    write(KEYS.worries, all)
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

export const onboardingStore = {
  isComplete(): boolean {
    return read<boolean>(KEYS.onboarded, false)
  },
  markComplete(): void {
    write(KEYS.onboarded, true)
  },
}

/** Bundles all user data into a single downloadable snapshot. */
export function exportData(): MindHavenExport {
  return {
    version: 1,
    exportedAt: Date.now(),
    moods: read<MoodEntry[]>(KEYS.moods, []),
    gratitude: read<GratitudeEntry[]>(KEYS.gratitude, []),
    reframes: read<ThoughtReframeEntry[]>(KEYS.reframes, []),
    worries: read<WorryEntry[]>(KEYS.worries, []),
  }
}

/**
 * Restores data from a previously exported snapshot. Merges by id with any
 * existing data (so importing twice, or on a device with some data already,
 * doesn't create duplicates) rather than overwriting.
 */
export function importData(raw: unknown): { ok: true; imported: number } | { ok: false; error: string } {
  if (typeof raw !== 'object' || raw === null) {
    return { ok: false, error: 'That file doesn’t look like a MindHaven export.' }
  }
  const data = raw as Partial<MindHavenExport>
  if (
    !Array.isArray(data.moods) ||
    !Array.isArray(data.gratitude) ||
    !Array.isArray(data.reframes) ||
    !Array.isArray(data.worries)
  ) {
    return { ok: false, error: 'That file doesn’t look like a MindHaven export.' }
  }

  function mergeById<T extends { id: string }>(key: string, incoming: T[]): number {
    const existing = read<T[]>(key, [])
    const byId = new Map(existing.map((e) => [e.id, e]))
    let added = 0
    for (const entry of incoming) {
      if (!entry || typeof entry.id !== 'string') continue
      if (!byId.has(entry.id)) added += 1
      byId.set(entry.id, entry)
    }
    write(key, Array.from(byId.values()))
    return added
  }

  const imported =
    mergeById(KEYS.moods, data.moods) +
    mergeById(KEYS.gratitude, data.gratitude) +
    mergeById(KEYS.reframes, data.reframes) +
    mergeById(KEYS.worries, data.worries)

  return { ok: true, imported }
}

/** Permanently deletes all MindHaven data from this device. */
export function clearAllData(): void {
  write(KEYS.moods, [])
  write(KEYS.gratitude, [])
  write(KEYS.reframes, [])
  write(KEYS.worries, [])
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
