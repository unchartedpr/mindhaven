import { useSyncExternalStore } from 'react'
import { dayKey } from './insights'
import { backupMeta, storageStatus, subscribe } from './storage'
import type { Collection, Document, StorageStatus } from './storage'

/**
 * React bindings for the storage layer. Components read data through these hooks
 * so they re-render when it changes — in this tab (after a save or delete) or in
 * another tab — instead of reading localStorage once at mount.
 */

export function useCollection<T extends { id: string; timestamp: number }>(store: Collection<T>): readonly T[] {
  return useSyncExternalStore(store.subscribe, store.all, store.all)
}

export function useDocument<T>(store: Document<T>): T | null {
  return useSyncExternalStore(store.subscribe, store.get, store.get)
}

export function useStorageStatus(): StorageStatus {
  return useSyncExternalStore(storageStatus.subscribe, storageStatus.get, storageStatus.get)
}

export function useLastBackupAt(): number | null {
  return useSyncExternalStore(subscribe, backupMeta.lastBackupAt, backupMeta.lastBackupAt)
}

/** Calls back at the next local midnight, and whenever the tab becomes visible again (the clock may have moved on). */
function subscribeToDayChange(onChange: () => void): () => void {
  let timer: number | undefined
  const schedule = () => {
    const now = new Date()
    const nextMidnight = new Date(now)
    nextMidnight.setHours(24, 0, 0, 50)
    timer = window.setTimeout(() => {
      onChange()
      schedule()
    }, nextMidnight.getTime() - now.getTime())
  }
  const onVisible = () => {
    if (document.visibilityState === 'visible') onChange()
  }
  schedule()
  document.addEventListener('visibilitychange', onVisible)
  return () => {
    window.clearTimeout(timer)
    document.removeEventListener('visibilitychange', onVisible)
  }
}

const currentDay = () => dayKey(Date.now())

/**
 * Today's date as a key like "2026-10-19", kept current: components that depend on it re-render when the
 * day rolls over, so an app left open overnight doesn't show yesterday's streak or "checked in today" state.
 */
export function useToday(): string {
  return useSyncExternalStore(subscribeToDayChange, currentDay, currentDay)
}
