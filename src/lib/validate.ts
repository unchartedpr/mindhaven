import type {
  GratitudeEntry,
  MoodEntry,
  MoodValue,
  SafetyContact,
  SafetyPlan,
  ThoughtReframeEntry,
  WorryEntry,
} from './types'

/**
 * Sanitizers turn untrusted input (localStorage that may be stale or hand-edited,
 * or an imported backup file) into a well-formed entry, or `null` if it can't be
 * salvaged. Everything the UI renders has passed through one of these, so a bad
 * record can never crash a page.
 */

export const LIMITS = {
  shortText: 200,
  longText: 5000,
  listItems: 50,
  tags: 20,
} as const

type Obj = Record<string, unknown>

function isObj(v: unknown): v is Obj {
  return typeof v === 'object' && v !== null && !Array.isArray(v)
}

function str(v: unknown, max: number): string {
  return typeof v === 'string' ? v.slice(0, max) : ''
}

function strList(v: unknown, maxItems: number, maxLen: number): string[] {
  if (!Array.isArray(v)) return []
  const out: string[] = []
  for (const item of v) {
    if (typeof item !== 'string') continue
    const trimmed = item.trim().slice(0, maxLen)
    if (trimmed) out.push(trimmed)
    if (out.length >= maxItems) break
  }
  return out
}

function baseFields(v: unknown): { id: string; timestamp: number; obj: Obj } | null {
  if (!isObj(v)) return null
  const { id, timestamp } = v
  if (typeof id !== 'string' || id === '' || id.length > 100) return null
  // Reject NaN/Infinity and absurd dates; Date would render "Invalid Date" otherwise.
  if (typeof timestamp !== 'number' || !Number.isFinite(timestamp)) return null
  if (timestamp < 0 || timestamp > 8.64e15) return null
  return { id, timestamp, obj: v }
}

export function sanitizeMood(v: unknown): MoodEntry | null {
  const base = baseFields(v)
  if (!base) return null
  const mood = base.obj.mood
  if (typeof mood !== 'number' || !Number.isInteger(mood) || mood < 1 || mood > 5) return null
  const note = str(base.obj.note, LIMITS.longText)
  return {
    id: base.id,
    timestamp: base.timestamp,
    mood: mood as MoodValue,
    tags: strList(base.obj.tags, LIMITS.tags, 40),
    ...(note ? { note } : {}),
  }
}

export function sanitizeGratitude(v: unknown): GratitudeEntry | null {
  const base = baseFields(v)
  if (!base) return null
  const items = strList(base.obj.items, LIMITS.listItems, LIMITS.shortText)
  if (items.length === 0) return null
  return { id: base.id, timestamp: base.timestamp, items }
}

export function sanitizeReframe(v: unknown): ThoughtReframeEntry | null {
  const base = baseFields(v)
  if (!base) return null
  const o = base.obj
  const entry = {
    id: base.id,
    timestamp: base.timestamp,
    situation: str(o.situation, LIMITS.longText),
    automaticThought: str(o.automaticThought, LIMITS.longText),
    evidenceFor: str(o.evidenceFor, LIMITS.longText),
    evidenceAgainst: str(o.evidenceAgainst, LIMITS.longText),
    balancedThought: str(o.balancedThought, LIMITS.longText),
  }
  // An entirely empty reframe carries no information.
  if (!entry.situation && !entry.automaticThought && !entry.balancedThought) return null
  return entry
}

export function sanitizeWorry(v: unknown): WorryEntry | null {
  const base = baseFields(v)
  if (!base) return null
  const worry = str(base.obj.worry, LIMITS.longText)
  if (!worry.trim()) return null
  return { id: base.id, timestamp: base.timestamp, worry }
}

function sanitizeContacts(v: unknown): SafetyContact[] {
  if (!Array.isArray(v)) return []
  const out: SafetyContact[] = []
  for (const item of v) {
    if (!isObj(item)) continue
    const name = str(item.name, 100).trim()
    // Keep only characters a phone number can contain, so the value is safe to put in a tel: link.
    const phone = str(item.phone, 40).replace(/[^\d+()\-.\s*#]/g, '').trim()
    if (!name && !phone) continue
    out.push({ name, phone })
    if (out.length >= 10) break
  }
  return out
}

export function sanitizeSafetyPlan(v: unknown): SafetyPlan | null {
  if (!isObj(v)) return null
  const updatedAt = typeof v.updatedAt === 'number' && Number.isFinite(v.updatedAt) ? v.updatedAt : Date.now()
  return {
    updatedAt,
    warningSigns: strList(v.warningSigns, LIMITS.listItems, LIMITS.shortText),
    copingStrategies: strList(v.copingStrategies, LIMITS.listItems, LIMITS.shortText),
    distractionPeople: sanitizeContacts(v.distractionPeople),
    supportPeople: sanitizeContacts(v.supportPeople),
    professionals: sanitizeContacts(v.professionals),
    safeEnvironment: strList(v.safeEnvironment, LIMITS.listItems, LIMITS.shortText),
    reasonsToLive: strList(v.reasonsToLive, LIMITS.listItems, LIMITS.shortText),
  }
}

export function emptySafetyPlan(): SafetyPlan {
  return {
    updatedAt: 0,
    warningSigns: [],
    copingStrategies: [],
    distractionPeople: [],
    supportPeople: [],
    professionals: [],
    safeEnvironment: [],
    reasonsToLive: [],
  }
}

export function isSafetyPlanEmpty(plan: SafetyPlan | null): boolean {
  if (!plan) return true
  return (
    plan.warningSigns.length +
      plan.copingStrategies.length +
      plan.distractionPeople.length +
      plan.supportPeople.length +
      plan.professionals.length +
      plan.safeEnvironment.length +
      plan.reasonsToLive.length ===
    0
  )
}
