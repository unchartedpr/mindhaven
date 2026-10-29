# MindHaven — architecture review

*October 2026. Scope: the whole app as deployed at <https://unchartedpr.github.io/mindhaven/> (v1), reviewed
as an architect would before a public launch: correctness, resilience, privacy, security,
accessibility, performance, maintainability, and product gaps.*

**Method.** Read all code, then audited the production build in a real browser (Chromium via
Playwright) on a phone and a desktop viewport, in light and dark themes, with realistic and with
hostile stored data: axe-core (including colour contrast), a network log of every request, console
and page errors, offline reload, keyboard-only walkthroughs, reduced-motion, and `npm audit`.
Every fix below has a regression test, and most of the checks are now permanent end-to-end tests
(`e2e/`), so they run on every push.

## Verdict

The v1 foundation was sound — small, dependency-light, private by construction, with good tests for
the pure logic. The weaknesses were all in the places jsdom unit tests can't see (real rendering,
real browsers, real storage) and in how data was read back: **anything written to `localStorage` was
trusted on the way out**, so one corrupt value could take a page down, and there was no way to tell the user
that their data wasn't being saved. Those are fixed. What remains is mostly product scope (see the
[roadmap](./ROADMAP.md)), not structural risk.

## Findings

Severity: **High** = could lose data, harm a user, or break the app; **Medium** = real defect or
risk with a workaround; **Low** = polish.

### Reliability and data integrity

| # | Finding | Sev. | Evidence | Resolution |
|---|---------|------|----------|------------|
| R1 | Stored data was parsed and cast, never validated. A corrupt or hand-edited value (or an old format) crashed whatever page read it. | High | Seeding malformed entries made the pages that read them throw. | Every read and every import goes through per-entry sanitisers (`lib/validate.ts`): bad entries are dropped, good ones kept, lengths and list sizes bounded. Tested with hostile data in unit and e2e tests. |
| R2 | No error boundary: any render error produced a white page, with the user's data inaccessible. | High | Code review: no boundary anywhere in the tree. | `ErrorBoundary` at the app and the route level. Recovery screen offers retry, a **download-your-data** fallback straight from raw storage, and a plain link to crisis resources that doesn't depend on React state. |
| R3 | Unreadable data was silently overwritten by the next save. | High | Non-JSON in a key was replaced on first write. | The unreadable value is copied to `<key>:unreadable-backup` before anything overwrites it. |
| R4 | Storage failures were invisible. In a private window, with blocked storage, or with a full disk, "Saved" was shown but nothing persisted. | High | Blocked storage → data lost on reload with no message. | In-memory fallback so the app still works; `storageStatus` drives a visible banner; a failed write is reported on the check-in screen instead of "Saved". |
| R5 | Browsers may evict `localStorage` for sites that aren't "persistent". | Medium | n/a (platform behaviour) | Request `navigator.storage.persist()`; explain the outcome in Settings; nudge the user to back up when they have unsaved-elsewhere data (`BackupNudge`). |
| R6 | Import reported only success, with no account of what was kept or dropped. | Medium | Import gave no feedback on what was kept or dropped. | Import **merges by id and never overwrites**, caps file size, validates, and reports `imported` and `skipped` counts. |
| R7 | State was read once at mount: two tabs, or a delete, left the UI stale. | Medium | Add a worry in tab B → tab A unchanged. | Stores expose `subscribe`; components use `useSyncExternalStore` hooks; `storage` events sync tabs. Snapshots are frozen and referentially stable. Covered by an e2e cross-tab test. |
| R8 | Streak logic broke before the first check-in of the day, and "today" went stale if the app stayed open overnight. | Medium | Code review and unit tests: the streak counted from today only. | `computeStreak` keeps the streak alive until the end of today; `useToday()` re-renders at local midnight and on tab focus. |
| R9 | An unknown URL rendered nothing (or the home page). | Low | `/#/nope` rendered a blank page in the browser audit. | A real 404 page with routes back and to help; exercises catch-all. |
| R10 | No way to delete a single entry. | Medium | n/a | Two-step `ConfirmButton` on check-ins and journal entries. |

### Privacy and security

| # | Finding | Sev. | Evidence | Resolution |
|---|---------|------|----------|------------|
| P1 | The page fetched fonts from Google. For an app whose promise is *nothing leaves your device*, this leaked every visit's IP address and user agent to a third party. | High | Network log showed `fonts.googleapis.com` / `fonts.gstatic.com` on every route. | Inter is self-hosted (`public/fonts`, OFL licence included, precached by the service worker). Network log now shows **only the app's own origin**; an e2e test enforces this on every route. |
| P2 | No Content-Security-Policy. | Medium | No CSP header or meta. | A strict policy (`default-src 'self'`, no inline script, no `unsafe-*`, `connect-src 'self'`, `object-src 'none'`) injected at build time; an e2e test checks it is present and that it really blocks an injected inline script. `referrer: no-referrer` too. |
| P3 | CSV export was vulnerable to spreadsheet formula injection (a note like `=HYPERLINK(...)` executes in Excel when opened). | Medium | Exported note started with `=`. | Cells starting with `= + - @` (or tab/CR) are prefixed with `'`; fields are quoted per RFC 4180. Tested, including in e2e. |
| P4 | Phone numbers from the (user-editable or imported) safety plan were put into `tel:` links verbatim. | Medium | Code review: the value flowed into `href="tel:…"` unchecked. | Phone input is sanitised to digits and phone-safe characters on write and on read. |
| P5 | The crisis country was guessed from the language alone (e.g. `en` → US). Showing a US number to someone in Ireland is worse than showing nothing. | Medium | `navigator.language === 'en'` selected the US. | Preselect only when the browser reports an explicit region (`en-GB` → UK); otherwise ask. |
| P6 | Dependencies had known advisories. | Low | `npm audit`: advisories. | Updated; `npm audit` reports 0 vulnerabilities. Dependabot added. |
| P7 | `frame-ancestors` (clickjacking protection) cannot be set from a `<meta>` CSP, and GitHub Pages cannot send custom headers. | Low | Known limitation. | **Accepted.** The app takes no destructive one-click actions, and "Delete all" is a two-step confirm. Fixing it needs a host that can set headers (see roadmap). |

### Accessibility

| # | Finding | Sev. | Evidence | Resolution |
|---|---------|------|----------|------------|
| A1 | **94 colour-contrast failures** in a real browser (light-mode `sage-400/500` and `clay-500` text, plus muted greys). jsdom cannot evaluate contrast, so unit-level axe passed. | High | axe-core in Chromium: 94 nodes. | Tokens and usages adjusted (`text-sage-600`, `clay-600/700`). Now **0** across every route × light/dark × phone/desktop, enforced by e2e. |
| A2 | The welcome dialog didn't trap focus, didn't hide the page from assistive tech, and didn't return focus. | High | Code review: no trap, no `inert`, no focus restore. | `useModal`: portal outside `#root`, `inert` on the app, focus trap, Escape to close, focus restore. E2E-tested. |
| A3 | No route-change handling: title never changed, scroll stayed put, screen readers heard nothing. | Medium | Navigating Journal → Exercises kept the old title and scroll offset. | Title per route, scroll to top, focus moved to `<main>`, polite announcement. |
| A4 | Mood picker was a row of tab stops with no arrow-key support. | Medium | n/a | Radio group with roving tabindex, arrow/Home/End keys. |
| A5 | The breathing circle animated regardless of `prefers-reduced-motion`; live regions announced every tick. | Medium | Code review and browser check: scale still animated under `prefers-reduced-motion`. | Static under reduced motion (`--breath-scale` variable); live regions only for phase and step changes. |
| A6 | The mood calendar relied on colour alone. | Medium | Review of the markup: the level was conveyed by background colour alone. | Accessible table, each cell carries emoji + label as well as colour. |
| A7 | "Skip to content" changed the URL hash, which in a hash-routed app navigates away. | Medium | Code review: a plain `href="#main"` anchor conflicts with `HashRouter`. | `preventDefault` + programmatic focus. |

### Architecture and maintainability

| # | Finding | Sev. | Resolution |
|---|---------|------|------------|
| M1 | Each store hand-rolled its own parse/serialise/ID logic. | Medium | One `createCollection` factory (+ `createDocument`) with a sanitiser per type. New data types are ~10 lines. |
| M2 | Buttons, cards, headers, and text inputs were copy-pasted Tailwind strings across pages. | Medium | Shared primitives (`ui.tsx`, `uiClasses.ts`); exercise pages migrated. |
| M3 | Single JS bundle. | Low | Route-level `lazy()`; the initial load is ≈84 KB gzipped. |
| M4 | Tests only covered logic in jsdom. | Medium | 282 unit/component tests (≈95 % line coverage, thresholds enforced) **plus** a real-browser end-to-end suite covering a11y, user journeys, privacy, offline, and layout. |
| M5 | CI ran only on pull requests; nothing ran on feature branches; deploys weren't gated by browser tests. | Medium | CI runs on every non-`main` push and on PRs; the deploy workflow now runs lint, coverage-gated tests, build, **and e2e** before publishing. Dependabot (weekly, grouped). |
| M6 | Stale API surface (`gratitudeStore.add(string[])`, etc.) made call sites ambiguous. | Low | Object arguments; types in `lib/types.ts`. |

### Product

| # | Gap | Resolution |
|---|-----|------------|
| F1 | No plan for the worst moment. | **Safety plan** (Stanley–Brown structure: warning signs, coping, people/places, people to ask, professionals, making the environment safe, reasons to live), tap-to-call, printable. |
| F2 | Data collected but not reflected back. | **Insights** page: range summary, mood calendar, mood-by-tag associations (worded as associations, never causes). |
| F3 | Check-in ended at "Saved". | Follow-up suggestions matched to the mood and tags (`lib/suggestions.ts`), escalating to support lines for the lowest moods. |
| F4 | Habit support without a push server. | Daily reminder as a downloadable `.ics` calendar event (works with any calendar, preserves "nothing leaves your device"). |
| F5 | Data portability. | CSV export in addition to JSON; backup tracking and nudges. |
| F6 | Navigation to help. | A persistent "Get help" button on every page; installed-app shortcuts for Check in / Get help / Safety plan. |

## Corrections to earlier claims

* The crisis directory covers **35 countries**, not 28 as the first README and my earlier summary said.
  The README is corrected.
* The crisis numbers have **not been independently verified** against each service's current
  published number. They are from public sources, but they should be reviewed by a person (see
  [ROADMAP](./ROADMAP.md), "Verified crisis data").

## Known limits (deliberately left)

* No `frame-ancestors` (see P7).
* No translations: a mistranslated crisis instruction is worse than an English one. Needs
  native-speaker review per language.
* `localStorage` only: data lives on one device unless the user backs up. Encrypted sync is a roadmap
  item, not something to bolt on without a threat model.
* Two dependency bumps are deferred because of an npm resolver bug in this build environment
  (`@vitejs/plugin-react` peer chain); Dependabot will open them from CI where the resolver works.
