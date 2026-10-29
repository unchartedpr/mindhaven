# MindHaven — architecture

A static single-page app. There is no server, no account, and no network call for user data. Everything
below runs in the browser.

```
index.html ──► main.tsx ──► ErrorBoundary ──► App (HashRouter)
                                                 └─ Layout ── ErrorBoundary ── Suspense ── <Outlet/>
                                                       │            (resets on route change)
                                                       ├─ header / Get help / nav / footer
                                                       ├─ StorageBanner, BackupNudge, Onboarding (modal)
                                                       └─ pages (lazy): Home, CheckIn, Exercises/*, Journal,
                                                          Insights, SafetyPlan, Resources, Settings, NotFound
```

## Layers

| Layer | Where | Rule |
|-------|-------|------|
| Pages | `src/pages` | Compose components and hooks. No direct `localStorage`. |
| Components | `src/components` | Presentational; shared primitives in `ui.tsx` + `uiClasses.ts`. |
| React bindings | `src/lib/useStore.ts`, `useModal.ts`, `useTheme.ts` | The only place React meets the stores. |
| Domain logic | `src/lib/insights.ts`, `suggestions.ts`, `backup.ts`, `reminders.ts`, `resources.ts` | Pure functions, no React, no storage. Unit-tested exhaustively. |
| Validation | `src/lib/validate.ts` | Every value read from storage or an import passes through a sanitiser. |
| Persistence | `src/lib/storage.ts` | The only module that touches `localStorage`. |

Dependencies point downwards only. Anything in "Domain logic" can be tested without a DOM.

## Persistence

* Keys are namespaced `mindhaven:v1:*`. Versioned so a future format can migrate rather than guess.
* `createCollection<T>(key, sanitize)` → `all / add / remove / clear / mergeIn / subscribe`.
  `createDocument` does the same for the single safety-plan record.
* **Reads are validated.** A sanitiser returns a clean entry or `null`; invalid entries are dropped, the
  rest kept. Lengths and list sizes are bounded.
* **Snapshots are frozen and referentially stable** until the data changes, so `useSyncExternalStore`
  doesn't re-render needlessly or loop.
* **Reactive.** A write notifies in-tab subscribers; the browser's `storage` event notifies other tabs.
* **Failure is visible.** If storage is unavailable the app keeps working from memory and `storageStatus`
  drives a banner; a failed write is surfaced rather than reported as saved. Unreadable stored values are
  copied to `<key>:unreadable-backup` before being overwritten.
* **Portability.** `exportData` (JSON, versioned) and CSV for check-ins. `importData` validates, caps size,
  **merges by id without overwriting**, and returns `{ imported, skipped }`.
* `navigator.storage.persist()` is requested so the browser is less likely to evict the data.

## Privacy and security

* No third-party requests. Fonts are self-hosted; the build injects a strict CSP
  (`default-src 'self'`, no inline script, `connect-src 'self'`) and `referrer: no-referrer`.
  An end-to-end test asserts that every route only talks to its own origin.
* User text is rendered by React (escaped). CSV export neutralises formula injection. Phone numbers are
  sanitised before reaching `tel:` links.
* Known limit: GitHub Pages can't send response headers, so `frame-ancestors` isn't available.

## Accessibility

* Real-browser axe (including contrast) on every route × light/dark × phone/desktop is a CI gate.
* Modals use `useModal` (portal outside `#root`, `inert` on the app, focus trap, restore).
* Route changes set the title, scroll to top, move focus to `<main>`, and announce politely.
* Live regions are used sparingly (exercise phase/step changes, armed confirmations).
* Motion respects `prefers-reduced-motion`; colour is never the only signal (calendar uses emoji + label).
* Interactive targets are at least 44×44 px on a phone (enforced by an e2e test).

## Build and delivery

* Vite + React + TypeScript + Tailwind v4. HashRouter so static hosting needs no rewrite rules.
* Route-level `lazy()`; initial load ≈ 84 KB gzipped. `vite-plugin-pwa` precaches everything for offline use.
* **CI** (`ci.yml`): every PR and every non-`main` push → lint, unit tests with coverage thresholds, build,
  Playwright e2e.
* **Deploy** (`deploy.yml`): push to `main` → the same gates, then publish to GitHub Pages at
  <https://unchartedpr.github.io/mindhaven/>. A failing e2e blocks the deploy.
* Dependabot opens weekly grouped updates for npm and GitHub Actions.

## Testing strategy

| Level | Tool | What it's for |
|-------|------|---------------|
| Unit | Vitest | Pure logic: validation, streaks, insights, CSV, reminders, suggestions. |
| Component | Vitest + Testing Library | Behaviour per page/component, hostile stored data, keyboard handling. |
| Structural a11y | vitest-axe (jsdom) | Names, roles, landmarks. Contrast is disabled here — jsdom can't compute it. |
| End-to-end | Playwright + axe-core (Chromium) | Contrast, focus, downloads, offline/service worker, CSP, network, layout, user journeys. |

Run everything: `npm run check && npm run build && npm run e2e`.

## Adding a new kind of stored data

1. Add the type to `lib/types.ts` and a sanitiser to `lib/validate.ts` (with tests for bad input).
2. `export const fooStore = createCollection<Foo>('foo', sanitizeFoo)` in `lib/storage.ts`; include it in
   `exportData` / `importData` / `clearAllData` / `hasAnyData` / `rawStorageDump`.
3. Read it with `useCollection(fooStore)`.
4. Add it to the e2e hostile-data seed in `e2e/platform.spec.ts`.
