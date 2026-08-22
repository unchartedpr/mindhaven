import { useEffect, useState } from 'react'
import { themeStore } from './storage'

export function useTheme() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const stored = themeStore.get()
    if (stored) return stored
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  })

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    themeStore.set(theme)
  }, [theme])

  return {
    theme,
    toggle: () => setTheme((t) => (t === 'dark' ? 'light' : 'dark')),
  }
}
