import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  backupMeta,
  clearAllData,
  exportData,
  gratitudeStore,
  hasAnyData,
  importData,
  moodStore,
  onboardingStore,
  rawStorageDump,
  reframeStore,
  safetyPlanStore,
  themeStore,
  worryStore,
} from './storage'
import { emptySafetyPlan } from './validate'

const MOODS_KEY = 'mindhaven:v1:moods'

beforeEach(() => {
  localStorage.clear()
})

describe('collections (moodStore)', () => {
  it('starts empty', () => {
    expect(moodStore.all()).toEqual([])
  })

  it('returns entries newest first', () => {
    moodStore.add({ mood: 3, tags: [], timestamp: 1000 })
    moodStore.add({ mood: 5, tags: ['grateful'], timestamp: 2000 })
    expect(moodStore.all().map((e) => e.mood)).toEqual([5, 3])
  })

  it('puts the later insert first when timestamps tie', () => {
    moodStore.add({ mood: 1, tags: [], timestamp: 1000 })
    moodStore.add({ mood: 2, tags: [], timestamp: 1000 })
    expect(moodStore.all().map((e) => e.mood)).toEqual([2, 1])
  })

  it('removes an entry by id and can clear everything', () => {
    const a = moodStore.add({ mood: 2, tags: [] })
    moodStore.add({ mood: 4, tags: [] })
    moodStore.remove(a.id)
    expect(moodStore.all()).toHaveLength(1)
    moodStore.clear()
    expect(moodStore.all()).toEqual([])
  })

  it('stores entries in localStorage', () => {
    moodStore.add({ mood: 4, tags: [] })
    expect(JSON.parse(localStorage.getItem(MOODS_KEY)!)).toHaveLength(1)
  })

  it('refuses an invalid entry instead of storing it', () => {
    expect(() => moodStore.add({ mood: 9 as never, tags: [] })).toThrow()
    expect(moodStore.all()).toEqual([])
  })

  it('returns the same array until the data changes (required by useSyncExternalStore)', () => {
    moodStore.add({ mood: 3, tags: [] })
    const first = moodStore.all()
    expect(moodStore.all()).toBe(first)
    moodStore.add({ mood: 4, tags: [] })
    expect(moodStore.all()).not.toBe(first)
  })

  it('returns a frozen array so callers cannot mutate shared state', () => {
    moodStore.add({ mood: 3, tags: [] })
    expect(Object.isFrozen(moodStore.all())).toBe(true)
  })

  it('notifies subscribers on change, and stops after unsubscribe', () => {
    const listener = vi.fn()
    const unsubscribe = moodStore.subscribe(listener)
    const e = moodStore.add({ mood: 3, tags: [] })
    moodStore.remove(e.id)
    expect(listener).toHaveBeenCalledTimes(2)
    unsubscribe()
    moodStore.add({ mood: 3, tags: [] })
    expect(listener).toHaveBeenCalledTimes(2)
  })

  it('notifies subscribers when another tab changes the data', () => {
    const listener = vi.fn()
    const unsubscribe = moodStore.subscribe(listener)
    localStorage.setItem(MOODS_KEY, JSON.stringify([{ id: 'x', timestamp: 5, mood: 3, tags: [] }]))
    window.dispatchEvent(new StorageEvent('storage', { key: MOODS_KEY }))
    expect(listener).toHaveBeenCalled()
    expect(moodStore.all().map((e) => e.id)).toEqual(['x'])
    unsubscribe()
  })

  it('ignores storage events for unrelated keys', () => {
    const listener = vi.fn()
    const unsubscribe = moodStore.subscribe(listener)
    window.dispatchEvent(new StorageEvent('storage', { key: 'some-other-app' }))
    expect(listener).not.toHaveBeenCalled()
    unsubscribe()
  })
})

describe('resilience to bad stored data', () => {
  it('drops malformed entries and keeps the good ones', () => {
    localStorage.setItem(
      MOODS_KEY,
      JSON.stringify([
        { id: 'ok', timestamp: 10, mood: 3, tags: ['calm'] },
        { id: 'bad-mood', timestamp: 11, mood: 99, tags: [] },
        { id: 'bad-tags', timestamp: 12, mood: 2, tags: 'nope' },
        { timestamp: 13, mood: 3, tags: [] },
        null,
        'a string',
        { id: 'nan', timestamp: 'x', mood: 3, tags: [] },
      ]),
    )
    const ids = moodStore.all().map((e) => e.id)
    expect(ids).toContain('ok')
    expect(ids).not.toContain('bad-mood')
    // 'bad-tags' has a valid mood, so it survives with its tags coerced to an empty list.
    expect(moodStore.all().find((e) => e.id === 'bad-tags')?.tags).toEqual([])
    expect(ids).toHaveLength(2)
  })

  it('treats unparseable JSON as empty without throwing', () => {
    localStorage.setItem(MOODS_KEY, '{not json')
    expect(moodStore.all()).toEqual([])
  })

  it('treats a non-array value as empty', () => {
    localStorage.setItem(MOODS_KEY, JSON.stringify({ oops: true }))
    expect(moodStore.all()).toEqual([])
  })

  it('keeps a copy of unreadable data before overwriting it', () => {
    localStorage.setItem(MOODS_KEY, '{not json')
    moodStore.add({ mood: 3, tags: [] })
    expect(localStorage.getItem(`${MOODS_KEY}:unreadable-backup`)).toBe('{not json')
    expect(moodStore.all()).toHaveLength(1)
  })

  it('does not overwrite an existing unreadable-data backup', () => {
    localStorage.setItem(MOODS_KEY, 'first-corruption')
    moodStore.add({ mood: 3, tags: [] })
    localStorage.setItem(MOODS_KEY, 'second-corruption')
    moodStore.add({ mood: 3, tags: [] })
    expect(localStorage.getItem(`${MOODS_KEY}:unreadable-backup`)).toBe('first-corruption')
  })

  it('heals bad entries on the next write', () => {
    localStorage.setItem(MOODS_KEY, JSON.stringify([{ id: 'bad', timestamp: 1, mood: 99, tags: [] }]))
    moodStore.add({ mood: 3, tags: [] })
    const stored = JSON.parse(localStorage.getItem(MOODS_KEY)!)
    expect(stored.every((e: { mood: number }) => e.mood >= 1 && e.mood <= 5)).toBe(true)
  })
})

describe('other collections', () => {
  it('gratitude: newest first', () => {
    vi.useFakeTimers()
    vi.setSystemTime(1000)
    gratitudeStore.add({ items: ['first'] })
    vi.setSystemTime(2000)
    gratitudeStore.add({ items: ['second'] })
    vi.useRealTimers()
    expect(gratitudeStore.all().map((e) => e.items[0])).toEqual(['second', 'first'])
  })

  it('gratitude: refuses an entry with no items', () => {
    expect(() => gratitudeStore.add({ items: ['   ', ''] })).toThrow()
  })

  it('reframes: round-trips an entry', () => {
    reframeStore.add({
      situation: 'Missed a deadline',
      automaticThought: "I'm a failure",
      evidenceFor: 'I was late',
      evidenceAgainst: 'I usually deliver on time',
      balancedThought: 'One missed deadline does not define me',
    })
    expect(reframeStore.all()[0].balancedThought).toBe('One missed deadline does not define me')
  })

  it('worries: stores the worry', () => {
    worryStore.add({ worry: 'Will the presentation go well?' })
    expect(worryStore.all()[0].worry).toBe('Will the presentation go well?')
  })
})

describe('safety plan document', () => {
  it('is null until saved, then round-trips', () => {
    expect(safetyPlanStore.get()).toBeNull()
    safetyPlanStore.set({ ...emptySafetyPlan(), updatedAt: 5, warningSigns: ['not sleeping'] })
    expect(safetyPlanStore.get()?.warningSigns).toEqual(['not sleeping'])
  })

  it('returns the same object until it changes', () => {
    safetyPlanStore.set({ ...emptySafetyPlan(), updatedAt: 5, warningSigns: ['x'] })
    expect(safetyPlanStore.get()).toBe(safetyPlanStore.get())
  })

  it('strips characters that do not belong in a phone number', () => {
    localStorage.setItem(
      'mindhaven:v1:safety-plan',
      JSON.stringify({ updatedAt: 1, supportPeople: [{ name: 'Sam', phone: '555-0100"><script>' }] }),
    )
    expect(safetyPlanStore.get()?.supportPeople[0].phone).toBe('555-0100')
  })

  it('can be cleared', () => {
    safetyPlanStore.set({ ...emptySafetyPlan(), updatedAt: 5, warningSigns: ['x'] })
    safetyPlanStore.clear()
    expect(safetyPlanStore.get()).toBeNull()
  })
})

describe('preferences', () => {
  it('ignores a junk theme value', () => {
    localStorage.setItem('mindhaven:v1:theme', JSON.stringify('purple'))
    expect(themeStore.get()).toBeNull()
    themeStore.set('dark')
    expect(themeStore.get()).toBe('dark')
  })

  it('remembers onboarding completion', () => {
    expect(onboardingStore.isComplete()).toBe(false)
    onboardingStore.markComplete()
    expect(onboardingStore.isComplete()).toBe(true)
  })

  it('tracks the last backup', () => {
    expect(backupMeta.lastBackupAt()).toBeNull()
    backupMeta.markBackedUp(1234)
    expect(backupMeta.lastBackupAt()).toBe(1234)
  })
})

describe('export / import / clear', () => {
  it('exports every kind of data, as version 2', () => {
    moodStore.add({ mood: 4, tags: ['calm'] })
    gratitudeStore.add({ items: ['coffee'] })
    reframeStore.add({ situation: 's', automaticThought: 't', evidenceFor: '', evidenceAgainst: '', balancedThought: '' })
    worryStore.add({ worry: 'a worry' })
    safetyPlanStore.set({ ...emptySafetyPlan(), updatedAt: 9, warningSigns: ['x'] })
    const data = exportData()
    expect(data.version).toBe(2)
    expect(data.moods).toHaveLength(1)
    expect(data.gratitude).toHaveLength(1)
    expect(data.reframes).toHaveLength(1)
    expect(data.worries).toHaveLength(1)
    expect(data.safetyPlan?.warningSigns).toEqual(['x'])
  })

  it('round-trips through export, clear, and import with no loss', () => {
    moodStore.add({ mood: 2, tags: ['tired'], note: 'long day' })
    gratitudeStore.add({ items: ['sunshine'] })
    safetyPlanStore.set({ ...emptySafetyPlan(), updatedAt: 9, reasonsToLive: ['my dog'] })
    const exported = JSON.parse(JSON.stringify(exportData()))
    clearAllData()
    expect(hasAnyData()).toBe(false)

    const result = importData(exported)
    expect(result).toEqual({ ok: true, imported: 3, skipped: 0 })
    expect(moodStore.all()[0].note).toBe('long day')
    expect(gratitudeStore.all()).toHaveLength(1)
    expect(safetyPlanStore.get()?.reasonsToLive).toEqual(['my dog'])
  })

  it('accepts a version 1 export (no safety plan)', () => {
    const v1 = {
      version: 1,
      exportedAt: 1,
      moods: [{ id: 'a', timestamp: 1, mood: 3, tags: [] }],
      gratitude: [],
      reframes: [],
      worries: [],
    }
    expect(importData(v1)).toEqual({ ok: true, imported: 1, skipped: 0 })
  })

  it('merges by id and never overwrites what is already here', () => {
    localStorage.setItem(MOODS_KEY, JSON.stringify([{ id: 'same', timestamp: 1, mood: 5, tags: [], note: 'mine' }]))
    const result = importData({ moods: [{ id: 'same', timestamp: 1, mood: 1, tags: [], note: 'theirs' }] })
    expect(result).toEqual({ ok: true, imported: 0, skipped: 0 })
    expect(moodStore.all()[0].note).toBe('mine')
  })

  it('skips invalid entries and counts them, without letting them in', () => {
    const result = importData({
      moods: [
        { id: 'good', timestamp: 1, mood: 3, tags: [] },
        { id: 'bad', timestamp: 1, mood: 99, tags: 5 },
      ],
      gratitude: [{ id: 'g', timestamp: 1, items: 7 }],
    })
    expect(result).toEqual({ ok: true, imported: 1, skipped: 2 })
    expect(moodStore.all().map((e) => e.id)).toEqual(['good'])
    expect(gratitudeStore.all()).toEqual([])
  })

  it('cleans the contents of an imported entry', () => {
    importData({ moods: [{ id: 'x', timestamp: 1, mood: 3, tags: ['ok', 5, null, { a: 1 }] }] })
    expect(moodStore.all()[0].tags).toEqual(['ok'])
  })

  it('rejects things that are not exports, without throwing', () => {
    for (const bad of [null, undefined, 'text', 42, [], {}, { hello: 'world' }]) {
      expect(importData(bad).ok).toBe(false)
    }
  })

  it('rejects an export whose lists are not lists', () => {
    expect(importData({ moods: 'nope' }).ok).toBe(false)
    expect(importData({ moods: [], gratitude: {} }).ok).toBe(false)
  })

  it('applies an imported safety plan only if there is none, or it is newer', () => {
    const plan = (updatedAt: number, sign: string) => ({ ...emptySafetyPlan(), updatedAt, warningSigns: [sign] })
    expect(importData({ safetyPlan: plan(5, 'first') })).toEqual({ ok: true, imported: 1, skipped: 0 })
    importData({ safetyPlan: plan(3, 'older') })
    expect(safetyPlanStore.get()?.warningSigns).toEqual(['first'])
    importData({ safetyPlan: plan(8, 'newer') })
    expect(safetyPlanStore.get()?.warningSigns).toEqual(['newer'])
  })

  it('clearAllData wipes everything, including the backup record and unreadable-data copies', () => {
    moodStore.add({ mood: 1, tags: [] })
    gratitudeStore.add({ items: ['x'] })
    worryStore.add({ worry: 'x' })
    safetyPlanStore.set({ ...emptySafetyPlan(), updatedAt: 1, warningSigns: ['x'] })
    backupMeta.markBackedUp(5)
    localStorage.setItem(`${MOODS_KEY}:unreadable-backup`, 'junk')
    clearAllData()
    expect(hasAnyData()).toBe(false)
    expect(safetyPlanStore.get()).toBeNull()
    expect(backupMeta.lastBackupAt()).toBeNull()
    expect(localStorage.getItem(`${MOODS_KEY}:unreadable-backup`)).toBeNull()
  })

  it('keeps preferences when clearing data', () => {
    themeStore.set('dark')
    onboardingStore.markComplete()
    clearAllData()
    expect(themeStore.get()).toBe('dark')
    expect(onboardingStore.isComplete()).toBe(true)
  })

  it('rawStorageDump returns every MindHaven key unparsed, and nothing else', () => {
    localStorage.setItem(MOODS_KEY, '{broken')
    localStorage.setItem('unrelated', 'x')
    expect(rawStorageDump()).toEqual({ [MOODS_KEY]: '{broken' })
  })
})

describe('when the browser misbehaves', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.resetModules()
  })

  function fakeStorage(opts: { failWritesExceptProbe: boolean; blockAll?: boolean }) {
    const data = new Map<string, string>()
    return {
      getItem: (k: string) => data.get(k) ?? null,
      setItem: (k: string, v: string) => {
        if (opts.blockAll) throw new DOMException('blocked', 'SecurityError')
        if (opts.failWritesExceptProbe && k !== 'mindhaven:probe') throw new DOMException('full', 'QuotaExceededError')
        data.set(k, v)
      },
      removeItem: (k: string) => void data.delete(k),
      key: (i: number) => [...data.keys()][i] ?? null,
      get length() {
        return data.size
      },
      clear: () => data.clear(),
    }
  }

  it('falls back to memory when storage is blocked, and reports it', async () => {
    vi.resetModules()
    vi.stubGlobal('localStorage', fakeStorage({ failWritesExceptProbe: false, blockAll: true }))
    const fresh = await import('./storage')
    expect(fresh.storageStatus.get().available).toBe(false)
    fresh.moodStore.add({ mood: 3, tags: [] })
    expect(fresh.moodStore.all()).toHaveLength(1)
  })

  it('reports a failed write (e.g. storage full) instead of failing silently', async () => {
    vi.resetModules()
    vi.stubGlobal('localStorage', fakeStorage({ failWritesExceptProbe: true }))
    const fresh = await import('./storage')
    expect(fresh.storageStatus.get()).toEqual({ available: true, writeFailed: false })
    fresh.moodStore.add({ mood: 3, tags: [] })
    expect(fresh.storageStatus.get().writeFailed).toBe(true)
  })
})
