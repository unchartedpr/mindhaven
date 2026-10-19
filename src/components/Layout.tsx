import { Suspense, useEffect, useRef } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { useTheme } from '../lib/useTheme'
import { ErrorBoundary } from './ErrorBoundary'
import { Onboarding } from './Onboarding'
import { StorageBanner } from './StorageBanner'

const NAV_ITEMS = [
  { to: '/', label: 'Home', emoji: '🏡', end: true },
  { to: '/check-in', label: 'Check In', emoji: '📝' },
  { to: '/exercises', label: 'Exercises', emoji: '🌬️' },
  { to: '/journal', label: 'Journal', emoji: '📔' },
  { to: '/insights', label: 'Insights', emoji: '📊' },
]

const PAGE_TITLES: Record<string, string> = {
  '/': 'Home',
  '/check-in': 'Check in',
  '/exercises': 'Exercises',
  '/exercises/breathing': 'Box breathing',
  '/exercises/grounding': '5-4-3-2-1 grounding',
  '/exercises/body-scan': 'Body scan',
  '/exercises/reframe': 'Thought reframing',
  '/exercises/worry-time': 'Worry time',
  '/exercises/gratitude': 'Gratitude note',
  '/journal': 'Journal',
  '/insights': 'Insights',
  '/resources': 'Crisis resources',
  '/safety-plan': 'Safety plan',
  '/settings': 'Settings & data',
}

export function Layout() {
  const { theme, toggle } = useTheme()
  const { pathname } = useLocation()
  const mainRef = useRef<HTMLElement>(null)
  const firstRender = useRef(true)

  // A single-page app doesn't reload on navigation, so tell the browser and assistive tech that the
  // page changed: update the title, return to the top, and move focus to the new content.
  useEffect(() => {
    const page = PAGE_TITLES[pathname]
    document.title = page ? `${page} · MindHaven` : 'MindHaven — a quiet place to check in with yourself'
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    window.scrollTo(0, 0)
    mainRef.current?.focus({ preventScroll: true })
  }, [pathname])

  return (
    <div className="flex min-h-svh flex-col pb-16 sm:pb-0">
      <Onboarding />
      <a
        href="#main"
        onClick={(e) => {
          // The app uses hash routing, so a plain "#main" link would navigate to a route called "main".
          e.preventDefault()
          mainRef.current?.focus()
        }}
        className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded-md focus:bg-sage-700 focus:px-3 focus:py-2 focus:text-white"
      >
        Skip to content
      </a>
      <header className="sticky top-0 z-30 print:hidden border-b border-sage-200 bg-white/80 backdrop-blur dark:border-sage-800 dark:bg-[#141a15]/80">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-3 px-4 py-3">
          <NavLink to="/" className="flex min-h-11 items-center gap-2 text-lg font-semibold text-sage-800 dark:text-sage-100">
            <span aria-hidden="true">🌿</span> MindHaven
          </NavLink>
          <nav aria-label="Main navigation" className="hidden items-center gap-1 sm:flex">
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
          <div className="flex items-center gap-1.5">
            <NavLink
              to="/resources"
              className={({ isActive }) =>
                `flex min-h-11 items-center rounded-full border px-3 text-sm font-medium transition-colors ${
                  isActive
                    ? 'border-clay-600 bg-clay-100 text-clay-700 dark:bg-clay-500/20 dark:text-clay-200'
                    : 'border-clay-300 text-clay-700 hover:bg-clay-50 dark:border-clay-500/40 dark:text-clay-200 dark:hover:bg-clay-500/10'
                }`
              }
            >
              Get help
            </NavLink>
            <NavLink
              to="/settings"
              aria-label="Settings and data"
              className={({ isActive }) =>
                `flex size-11 items-center justify-center rounded-full border transition-colors ${
                  isActive
                    ? 'border-sage-500 bg-sage-100 text-sage-800 dark:bg-sage-800 dark:text-sage-100'
                    : 'border-sage-200 text-sage-700 hover:bg-sage-100 dark:border-sage-800 dark:text-sage-200 dark:hover:bg-sage-800'
                }`
              }
            >
              <span aria-hidden="true">⚙️</span>
            </NavLink>
            <button
              type="button"
              onClick={toggle}
              aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
              className="flex size-11 items-center justify-center rounded-full border border-sage-200 text-sage-700 hover:bg-sage-100 dark:border-sage-800 dark:text-sage-200 dark:hover:bg-sage-800"
            >
              <span aria-hidden="true">{theme === 'dark' ? '☀️' : '🌙'}</span>
            </button>
          </div>
        </div>
      </header>

      <StorageBanner />

      <main
        id="main"
        ref={mainRef}
        tabIndex={-1}
        className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 outline-none"
      >
        <ErrorBoundary resetKey={pathname}>
          <Suspense fallback={<p role="status" className="text-sage-700 dark:text-sage-300">Loading…</p>}>
            <Outlet />
          </Suspense>
        </ErrorBoundary>
      </main>

      <footer className="border-t border-sage-200 px-4 py-6 print:hidden text-center text-xs text-sage-700 dark:border-sage-800 dark:text-sage-400">
        <p>
          MindHaven stores everything only on this device — nothing is sent to a server. It offers self-care
          tools, not medical advice or diagnosis.
        </p>
        <p className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1">
          <Link to="/safety-plan" className="underline">
            Safety plan
          </Link>
          <Link to="/resources" className="underline">
            Crisis resources
          </Link>
          <Link to="/settings" className="underline">
            Settings &amp; data
          </Link>
          <a
            href="https://github.com/unchartedpr/mindhaven"
            className="underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Open source
          </a>
        </p>
      </footer>

      <nav
        aria-label="Main navigation, mobile"
        className="fixed inset-x-0 bottom-0 z-30 flex print:hidden border-t border-sage-200 bg-white/95 backdrop-blur sm:hidden dark:border-sage-800 dark:bg-[#141a15]/95"
      >
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[11px] font-medium transition-colors ${
                isActive ? 'text-sage-800 dark:text-sage-100' : 'text-sage-700 dark:text-sage-400'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span
                  aria-hidden="true"
                  className={`text-lg transition-transform motion-reduce:transition-none ${isActive ? 'scale-110' : ''}`}
                >
                  {item.emoji}
                </span>
                {item.label}
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
