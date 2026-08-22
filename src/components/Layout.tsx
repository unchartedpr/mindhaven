import { NavLink, Outlet } from 'react-router-dom'
import { useTheme } from '../lib/useTheme'
import { Onboarding } from './Onboarding'

const NAV_ITEMS = [
  { to: '/', label: 'Home', end: true },
  { to: '/check-in', label: 'Check In' },
  { to: '/exercises', label: 'Exercises' },
  { to: '/journal', label: 'Journal' },
  { to: '/resources', label: 'Resources' },
]

export function Layout() {
  const { theme, toggle } = useTheme()

  return (
    <div className="flex min-h-svh flex-col">
      <Onboarding />
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded-md focus:bg-sage-700 focus:px-3 focus:py-2 focus:text-white"
      >
        Skip to content
      </a>
      <header className="border-b border-sage-200 bg-white/70 backdrop-blur dark:border-sage-800 dark:bg-[#141a15]/70">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-4 py-3">
          <NavLink to="/" className="flex items-center gap-2 text-lg font-semibold text-sage-800 dark:text-sage-100">
            <span aria-hidden="true">🌿</span> MindHaven
          </NavLink>
          <nav aria-label="Main navigation" className="flex items-center gap-1 overflow-x-auto">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-sage-600 text-white'
                      : 'text-sage-700 hover:bg-sage-100 dark:text-sage-200 dark:hover:bg-sage-800'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-1">
            <NavLink
              to="/settings"
              aria-label="Settings and data"
              className={({ isActive }) =>
                `rounded-full border p-2 transition-colors ${
                  isActive
                    ? 'border-sage-500 bg-sage-100 text-sage-800 dark:bg-sage-800 dark:text-sage-100'
                    : 'border-sage-200 text-sage-700 hover:bg-sage-100 dark:border-sage-800 dark:text-sage-200 dark:hover:bg-sage-800'
                }`
              }
            >
              ⚙️
            </NavLink>
            <button
              type="button"
              onClick={toggle}
              aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
              className="rounded-full border border-sage-200 p-2 text-sage-700 hover:bg-sage-100 dark:border-sage-800 dark:text-sage-200 dark:hover:bg-sage-800"
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
          </div>
        </div>
      </header>

      <main id="main" className="mx-auto w-full max-w-4xl flex-1 px-4 py-8">
        <Outlet />
      </main>

      <footer className="border-t border-sage-200 px-4 py-6 text-center text-xs text-sage-500 dark:border-sage-800 dark:text-sage-400">
        <p>
          MindHaven stores everything only on this device — nothing is sent to a server. It offers
          self-care tools, not medical advice or diagnosis.
        </p>
        <p className="mt-1">
          Made to be free, private, and available to anyone who needs a moment of support.
        </p>
      </footer>
    </div>
  )
}
