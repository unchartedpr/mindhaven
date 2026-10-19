import type {
  GratitudeEntry,
  MindHavenExport,
  MoodEntry,
  SafetyPlan,
  ThoughtReframeEntry,
  WorryEntry,
} from './types'
import {
  isSafetyPlanEmpty,
  sanitizeGratitude,
  sanitizeMood,
  sanitizeReframe,
  sanitizeSafetyPlan,
  sanitizeWorry,
} from './validate'

/**
 * The single persistence layer for MindHaven.
 *
 * Everything lives in `localStorage` under `mindhaven:v1:*` keys. This module is
 * the only code that touches it. Responsibilities:
 *  - validate everything read back (a bad record is dropped, never rendered),
 *  - fall back to memory when the browser blocks storage, and say so,
 *  - never silently destroy data it couldn't parse,
 *  - tell the UI when something changes (this tab or another) so it stays live.
 */

const KEYS = {
  moods: 'mindhaven:v1:moods',
  gratitude: 'mindhaven:v1:gratitude',
  reframes: 'mindhaven:v1:reframes',
  worries: 'mindhaven:v1:worries',
  safetyPlan: 'mindhaven:v1:safety-plan',
  theme: 'mindhaven:v1:theme',
  onboarded: 'mindhaven:v1:onboarded',
  lastBackupAt: 'mindhaven:v1:last-backup-at',
} as const

// ---------------------------------------------------------------------------
// Backend: localStorage, with an in-memory fallback
// ---------------------------------------------------------------------------

const memory = new Map<string, string>()
let usingMemory = false

export interface StorageStatus {
  /** False when the browser blocks storage; data then only lives until the tab closes. */
  available: boolean
  /** True after a write failed (usually: storage full). Cleared by the next successful write. */
  writeFailed: boolean
}

let status: StorageStatus = { available: true, writeFailed: false }
const statusListeners = new Set<() => void>()

function setStatus(patch: Partial<StorageStatus>): void {
  const next = { ...status, ...patch }
  if (next.available === status.available && next.writeFailed === status.writeFailed) return
  status = next
  statusListeners.forEach((l) => l())
}

export const storageStatus = {
  get: (): StorageStatus => status,
  subscribe(listener: () => void): () => void {
    statusListeners.add(listener)
    return () => statusListeners.delete(listener)
  },
}

function probeLocalStorage(): void {
  try {
    const k = 'mindhaven:probe'
    localStorage.setItem(k, '1')
    localStorage.removeItem(k)
  } catch {
    usingMemory = true
    setStatus({ available: false })
  }
}
probeLocalStorage()

function getItem(key: string): string | null {
  if (usingMemory) return memory.get(key) ?? null
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

function setItem(key: string, value: string): boolean {
  if (usingMemory) {
    memory.set(key, value)
    return true
  }
  try {
    localStorage.setItem(key, value)
    setStatus({ writeFailed: false })
    return true
  } catch {
    // Quota exceeded or storage turned read-only. Keep the app usable and let the UI warn.
    setStatus({ writeFailed: true })
    return false
  }
}

function removeItem(key: string): void {
  if (usingMemory) {
    memory.delete(key)
    return
  }
  try {
    localStorage.removeItem(key)
  } catch {
    /* nothing useful to do */
  }
}

// ---------------------------------------------------------------------------
// Change notification (this tab + other tabs)
// ---------------------------------------------------------------------------

const listeners = new Set<() => void>()
let crossTabAttached = false

function emit(): void {
  listeners.forEach((l) => l())
}

function onStorageEvent(e: StorageEvent): void {
  if (e.key === null || e.key.startsWith('mindhaven:')) emit()
}

/** Subscribe to any data change. Compatible with React's `useSyncExternalStore`. */
export function subscribe(listener: () => void): () => void {
  listeners.add(listener)
  if (!crossTabAttached && typeof window !== 'undefined') {
    window.addEventListener('storage', onStorageEvent)
    crossTabAttached = true
  }
  return () => {
    listeners.delete(listener)
    if (listeners.size === 0 && crossTabAttached && typeof window !== 'undefined') {
      window.removeEventListener('storage', onStorageEvent)
      crossTabAttached = false
    }
  }
}

// ---------------------------------------------------------------------------
// Persistence request (asks the browser not to evict our data under pressure)
// ---------------------------------------------------------------------------

let persistenceRequested = false

/** Ask the browser to treat this origin's storage as persistent. Safe to call repeatedly. */
export function ensurePersistence(): void {
  if (persistenceRequested || typeof navigator === 'undefined') return
  persistenceRequested = true
  try {
    void navigator.storage?.persist?.()
  } catch {
    /* unsupported — fine */
  }
}

// ---------------------------------------------------------------------------
// Collections: lists of timestamped entries
// ---------------------------------------------------------------------------

interface Entry {
  id: string
  timestamp: number
}

export type NewEntry<T extends Entry> = Omit<T, 'id' | 'timestamp'> & { timestamp?: number }

export interface Collection<T extends Entry> {
  /** Newest first. The returned array is frozen and referentially stable until the data changes. */
  all(): readonly T[]
  add(entry: NewEntry<T>): T
  remove(id: string): void
  clear(): void
  /** Merge untrusted entries in by id. Existing ids are never overwritten. */
  mergeIn(raw: readonly unknown[]): { added: number; invalid: number }
  subscribe: typeof subscribe
}

function newId(): string {
  const rand =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).slice(2, 10)
  return `${Date.now().toString(36)}-${rand}`
}

function createCollection<T extends Entry>(key: string, sanitize: (v: unknown) => T | null): Collection<T> {
  let cache: { raw: string | null; value: readonly T[] } | null = null

  function parseRaw(raw: string | null): { list: T[]; invalid: number; unreadable: boolean } {
    if (!raw) return { list: [], invalid: 0, unreadable: false }
    let parsed: unknown
    try {
      parsed = JSON.parse(raw)
    } catch {
      return { list: [], invalid: 0, unreadable: true }
    }
    if (!Array.isArray(parsed)) return { list: [], invalid: 0, unreadable: true }
    const list: T[] = []
    let invalid = 0
    for (const item of parsed) {
      const clean = sanitize(item)
      if (clean) list.push(clean)
      else invalid += 1
    }
    return { list, invalid, unreadable: false }
  }

  function load(): readonly T[] {
    const raw = getItem(key)
    if (cache && cache.raw === raw) return cache.value
    const { list } = parseRaw(raw)
    // Stored in insertion order; newest first, with later inserts winning timestamp ties.
    const sorted = list
      .map((entry, index) => ({ entry, index }))
      .sort((a, b) => b.entry.timestamp - a.entry.timestamp || b.index - a.index)
      .map((x) => x.entry)
    cache = { raw, value: Object.freeze(sorted) }
    return cache.value
  }

  /** Persist in insertion order (oldest first) so ties stay deterministic. */
  function persist(list: readonly T[]): boolean {
    const raw = getItem(key)
    if (raw && parseRaw(raw).unreadable) {
      // Never overwrite something we couldn't parse without keeping a copy of it.
      const backupKey = `${key}:unreadable-backup`
      if (getItem(backupKey) === null) setItem(backupKey, raw)
    }
    const chronological = [...list].sort((a, b) => a.timestamp - b.timestamp)
    const ok = setItem(key, JSON.stringify(chronological))
    emit()
    return ok
  }

  return {
    all: load,
    add(input) {
      const clean = sanitize({ ...input, id: newId(), timestamp: input.timestamp ?? Date.now() })
      if (!clean) throw new Error('Invalid entry')
      const ok = persist([...load(), clean])
      if (ok) ensurePersistence()
      return clean
    },
    remove(id) {
      persist(load().filter((e) => e.id !== id))
    },
    clear() {
      persist([])
    },
    mergeIn(rawEntries) {
      const existing = load()
      const known = new Set(existing.map((e) => e.id))
      const additions: T[] = []
      let invalid = 0
      for (const raw of rawEntries) {
        const clean = sanitize(raw)
        if (!clean) invalid += 1
        else if (!known.has(clean.id)) {
          known.add(clean.id)
          additions.push(clean)
        }
      }
      if (additions.length > 0) persist([...existing, ...additions])
      return { added: additions.length, invalid }
    },
    subscribe,
  }
}

export const moodStore = createCollection<MoodEntry>(KEYS.moods, sanitizeMood)
export const gratitudeStore = createCollection<GratitudeEntry>(KEYS.gratitude, sanitizeGratitude)
export const reframeStore = createCollection<ThoughtReframeEntry>(KEYS.reframes, sanitizeReframe)
export const worryStore = createCollection<WorryEntry>(KEYS.worries, sanitizeWorry)

// ---------------------------------------------------------------------------
// Single documents and small preferences
// ---------------------------------------------------------------------------

export interface Document<T> {
  get(): T | null
  set(value: T): void
  clear(): void
  subscribe: typeof subscribe
}

function createDocument<T>(key: string, sanitize: (v: unknown) => T | null): Document<T> {
  let cache: { raw: string | null; value: T | null } | null = null
  return {
    get() {
      const raw = getItem(key)
      if (cache && cache.raw === raw) return cache.value
      let value: T | null = null
      if (raw) {
        try {
          value = sanitize(JSON.parse(raw))
        } catch {
          value = null
        }
      }
      cache = { raw, value }
      return value
    },
    set(value) {
      if (setItem(key, JSON.stringify(value))) ensurePersistence()
      emit()
    },
    clear() {
      removeItem(key)
      emit()
    },
    subscribe,
  }
}

export const safetyPlanStore = createDocument<SafetyPlan>(KEYS.safetyPlan, sanitizeSafetyPlan)

function readJSON<T>(key: string, fallback: T): T {
  const raw = getItem(key)
  if (!raw) return fallback
  try {
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export const themeStore = {
  get(): 'light' | 'dark' | null {
    const v = readJSON<unknown>(KEYS.theme, null)
    return v === 'light' || v === 'dark' ? v : null
  },
  set(theme: 'light' | 'dark'): void {
    setItem(KEYS.theme, JSON.stringify(theme))
  },
}

export const onboardingStore = {
  isComplete(): boolean {
    return readJSON<unknown>(KEYS.onboarded, false) === true
  },
  markComplete(): void {
    setItem(KEYS.onboarded, JSON.stringify(true))
  },
}

/** When the user last downloaded a backup, so we can nudge them if it's been a while. */
export const backupMeta = {
  lastBackupAt(): number | null {
    const v = readJSON<unknown>(KEYS.lastBackupAt, null)
    return typeof v === 'number' && Number.isFinite(v) ? v : null
  },
  markBackedUp(at: number = Date.now()): void {
    setItem(KEYS.lastBackupAt, JSON.stringify(at))
    emit()
  },
}

// ---------------------------------------------------------------------------
// Export / import / delete-everything
// ---------------------------------------------------------------------------

const MAX_IMPORT_ENTRIES = 100_000

/** Bundles all user data into a single downloadable snapshot. */
export function exportData(): MindHavenExport {
  return {
    version: 2,
    exportedAt: Date.now(),
    moods: [...moodStore.all()],
    gratitude: [...gratitudeStore.all()],
    reframes: [...reframeStore.all()],
    worries: [...worryStore.all()],
    safetyPlan: safetyPlanStore.get(),
  }
}

export function hasAnyData(): boolean {
  return (
    moodStore.all().length > 0 ||
    gratitudeStore.all().length > 0 ||
    reframeStore.all().length > 0 ||
    worryStore.all().length > 0 ||
    !isSafetyPlanEmpty(safetyPlanStore.get())
  )
}

export type ImportResult =
  | { ok: true; imported: number; skipped: number }
  | { ok: false; error: string }

const NOT_AN_EXPORT = 'That file doesn’t look like a MindHaven export.'

/**
 * Restores data from a previously exported snapshot. Entries are validated one
 * by one (invalid ones are skipped and counted), and merged by id: anything
 * already on this device is kept exactly as it is.
 */
export function importData(raw: unknown): ImportResult {
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
    return { ok: false, error: NOT_AN_EXPORT }
  }
  const data = raw as Record<string, unknown>
  const listKeys = ['moods', 'gratitude', 'reframes', 'worries'] as const
  const present = listKeys.filter((k) => data[k] !== undefined)
  if (present.length === 0 && data.safetyPlan === undefined) {
    return { ok: false, error: NOT_AN_EXPORT }
  }
  let total = 0
  for (const k of present) {
    const v = data[k]
    if (!Array.isArray(v)) return { ok: false, error: NOT_AN_EXPORT }
    total += v.length
  }
  if (total > MAX_IMPORT_ENTRIES) {
    return { ok: false, error: 'That file contains more entries than MindHaven can import.' }
  }

  let imported = 0
  let skipped = 0
  const apply = (store: Pick<Collection<Entry>, 'mergeIn'>, list: unknown) => {
    if (!Array.isArray(list)) return
    const { added, invalid } = store.mergeIn(list)
    imported += added
    skipped += invalid
  }
  apply(moodStore, data.moods)
  apply(gratitudeStore, data.gratitude)
  apply(reframeStore, data.reframes)
  apply(worryStore, data.worries)

  if (data.safetyPlan) {
    const incoming = sanitizeSafetyPlan(data.safetyPlan)
    const current = safetyPlanStore.get()
    if (incoming && !isSafetyPlanEmpty(incoming)) {
      if (!current || isSafetyPlanEmpty(current) || incoming.updatedAt > current.updatedAt) {
        safetyPlanStore.set(incoming)
        imported += 1
      }
    } else {
      skipped += 1
    }
  }

  return { ok: true, imported, skipped }
}

/** Permanently deletes all MindHaven data from this device (preferences are kept). */
export function clearAllData(): void {
  moodStore.clear()
  gratitudeStore.clear()
  reframeStore.clear()
  worryStore.clear()
  safetyPlanStore.clear()
  removeItem(KEYS.lastBackupAt)
  for (const key of [KEYS.moods, KEYS.gratitude, KEYS.reframes, KEYS.worries]) {
    removeItem(`${key}:unreadable-backup`)
  }
  emit()
}

/**
 * Every MindHaven key exactly as stored, unparsed. A last-resort escape hatch for the crash
 * screen: it works even if parsing/validation is what is failing, so data is never trapped.
 */
export function rawStorageDump(): Record<string, string> {
  const out: Record<string, string> = {}
  if (usingMemory) {
    for (const [k, v] of memory) if (k.startsWith('mindhaven:')) out[k] = v
    return out
  }
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)
      if (k && k.startsWith('mindhaven:')) out[k] = localStorage.getItem(k) ?? ''
    }
  } catch {
    /* storage unreadable — return what we have */
  }
  return out
}
