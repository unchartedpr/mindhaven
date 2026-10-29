# 🌿 MindHaven

A free, private, no-login mental wellbeing companion. Check in with your
mood, work through a few short guided exercises, keep a private journal, and
find real crisis resources if you ever need them — all without creating an
account or sending your data anywhere.

**Live app:** <https://unchartedpr.github.io/mindhaven/> — free, no sign-up, works offline once loaded, and can be
installed to your home screen.

## Why this exists

Good mental-health tools are often locked behind subscriptions, accounts, or
apps that quietly harvest personal data. MindHaven is the opposite: it's free,
open source, installable, works offline, and **everything you write stays on
your own device** (in `localStorage`) — nothing is ever sent to a server,
because there is no server.

It isn't trying to replace therapy or crisis services. It's a small, honest
set of tools — the kind you'd want open in a tab (or on your home screen) at
2am when you just need a minute to breathe or write something down.

## Features

- **Mood check-in** — quick and judgment-free, with optional tags and a note. After saving you get gentle, relevant next steps (a breathing exercise, grounding, support lines for the hardest days). You can delete any entry.
- **Insights** — averages and best/hardest days over 7, 30 or 90 days, a colour-*and*-emoji mood calendar, and which tags tend to go with better or worse days (worded as patterns, never causes). Streaks that stay alive until the end of today.
- **Safety plan** — write your own plan for a crisis in the standard Stanley–Brown structure (warning signs, coping steps, people and places, who to ask for help, professionals, making things safer, reasons to live), with tap-to-call, saved on your device and printable.
- **Guided exercises** — box breathing, 5-4-3-2-1 grounding, body scan, thought reframing, worry time, gratitude notes. Respects reduced-motion settings.
- **Journal** — a private, searchable history of your gratitude notes, reframes and worries.
- **Crisis resources** — a **Get help** button on every page, and a directory of **35 countries** plus worldwide directories. The country is preselected only when your browser states an explicit region. *The numbers come from public sources and have not been independently verified — see [the roadmap](docs/ROADMAP.md#next-high-value-low-risk).*
- **Your data is yours** — download a JSON backup (restoring merges and never overwrites), export check-ins as a spreadsheet-safe CSV, add a daily reminder to any calendar (`.ics`), get a nudge to back up, and delete everything in one step. Warns you if your browser isn't saving data.
- **Resilient** — damaged or hand-edited data is skipped rather than crashing the app; if something does go wrong you can still download your data and reach help.
- **Installable & offline** — a PWA with home-screen shortcuts for Check in, Get help and Safety plan.
- **Private by construction** — no accounts, analytics, or third-party requests (the font is self-hosted). A strict Content-Security-Policy is enforced, and an automated test confirms every page only talks to its own origin.
- **Accessible** — automated axe-core checks in a real browser (including colour contrast) on every page, in light and dark, on phone and desktop; focus-managed dialogs; keyboard-operable controls; 44 px touch targets.

## Important disclaimer

MindHaven is a self-care companion, **not** a substitute for professional
mental health care, and **not** a crisis service — it cannot see, monitor, or
respond to anything you write. If you are in immediate danger or crisis,
please contact your local emergency number or a crisis line right away (see
the in-app Resources page, or [findahelpline.com](https://findahelpline.com)).

## Getting started

Requires [Node.js](https://nodejs.org/) 22+.

```bash
npm ci
npm run dev            # start the dev server
npm run check          # type-check, lint, unit tests
npm run test:coverage  # unit tests with coverage thresholds
npm run build          # type-check and build for production
npm run e2e            # real-browser tests (build first; `npx playwright install chromium` once)
```

## Tech stack

- [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/), built with [Vite](https://vite.dev/)
- [Tailwind CSS v4](https://tailwindcss.com/); [React Router](https://reactrouter.com/) (hash routing, for static hosting)
- [vite-plugin-pwa](https://vite-pwa-org.netlify.app/) for the offline-capable, installable service worker
- [Vitest](https://vitest.dev/) + Testing Library (280+ unit/component tests, ~95% line coverage) and [Playwright](https://playwright.dev/) + [axe-core](https://github.com/dequelabs/axe-core) (90+ real-browser tests)
- No backend, no database — persistence is client-side (`localStorage`), behind a validated, reactive storage layer

More: [architecture](docs/ARCHITECTURE.md) · [architecture review](docs/ARCHITECTURE_REVIEW.md) · [roadmap](docs/ROADMAP.md)

## Deployment

- `ci.yml` runs lint, tests with coverage, the production build, and the e2e suite on every pull request and every push to a branch other than `main`.
- `deploy.yml` runs the same gates on every push to `main`, then publishes to GitHub Pages at <https://unchartedpr.github.io/mindhaven/>. A failing check blocks the deploy.
- Dependabot opens weekly, grouped dependency updates.

Pages must be set to **Settings → Pages → Source: GitHub Actions**.

The app is built for the default GitHub Pages sub-path, `/mindhaven/` (Vite `base`). To serve it from a custom domain
instead, build with `BASE_PATH=/` (for example `BASE_PATH=/ npm run build`), add a `public/CNAME` file containing just
the domain name, and set the domain under **Settings → Pages**. `BASE_PATH` can be any other sub-path too; it is
normalised to start and end with `/`. The e2e suite assumes the default `/mindhaven/` base.

## Contributing

Issues and pull requests are welcome — especially additions or corrections to
the crisis resource directory in `src/lib/resources.ts` (with a link to the service's own page), translations reviewed by native speakers, and
accessibility improvements. See [CONTRIBUTING.md](CONTRIBUTING.md). Please keep the privacy-first, no-tracking,
no-account philosophy intact.

## License

MIT — see [LICENSE](./LICENSE).
