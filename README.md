# 🌿 MindHaven

A free, private, no-login mental wellbeing companion. Check in with your
mood, work through a few short guided exercises, keep a private journal, and
find real crisis resources if you ever need them — all without creating an
account or sending your data anywhere.

**Live app:** deployed via GitHub Pages once this repo is public — see
[Deployment](#deployment) below. Until then, run it locally (see
[Getting started](#getting-started)).

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

- **Mood check-in** — a quick, judgment-free way to log how you're feeling, with optional tags and notes, a 14-day trend chart, and a weekly insight comparing this week's average mood to last week's.
- **Streaks** — gentle positive reinforcement for showing up for yourself.
- **Guided exercises**
  - 🌬️ Box breathing (4-4-4-4 guided timer)
  - 🌳 5-4-3-2-1 grounding technique
  - 🧘 Guided body scan (progressive relaxation)
  - 🔄 CBT-style thought reframing worksheet
  - 📦 Worry time (write a worry down, then consciously set it aside)
  - ✨ Gratitude notes
- **Journal** — a private, searchable history of your gratitude notes, thought reframes, and worries.
- **Crisis resources** — a curated directory covering 28 countries across every populated continent (988, Crisis Text Line, Samaritans, Lifeline, and more), plus international directories for anywhere else.
- **Backup & restore** — download all your data as a single JSON file any time, and restore it later or on another device, from Settings.
- **Installable & offline-capable** — add it to your home screen; it keeps working with no connection.
- **Privacy by design** — no accounts, no analytics, no network requests for your data.
- **Onboarding** on first visit explains the privacy model and that this isn't crisis care, before you start entering anything.
- Light/dark theme, mobile bottom navigation, keyboard-accessible, screen-reader-tested (automated `axe-core` audits on every page).

## Important disclaimer

MindHaven is a self-care companion, **not** a substitute for professional
mental health care, and **not** a crisis service — it cannot see, monitor, or
respond to anything you write. If you are in immediate danger or crisis,
please contact your local emergency number or a crisis line right away (see
the in-app Resources page, or [findahelpline.com](https://findahelpline.com)).

## Getting started

Requires [Node.js](https://nodejs.org/) 20+.

```bash
npm install
npm run dev       # start the dev server
npm run test      # run the test suite
npm run build     # type-check and build for production
npm run lint      # lint with oxlint
```

## Tech stack

- [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/), built with [Vite](https://vite.dev/)
- [Tailwind CSS v4](https://tailwindcss.com/) for styling
- [React Router](https://reactrouter.com/) (hash-based routing, for static hosting)
- [vite-plugin-pwa](https://vite-pwa-org.netlify.app/) for the installable, offline-capable service worker
- [Vitest](https://vitest.dev/), [Testing Library](https://testing-library.com/), and [axe-core](https://github.com/dequelabs/axe-core) (via `vitest-axe`) for tests, including automated accessibility checks — 80+ tests total
- No backend, no database — persistence is entirely client-side (`localStorage`)

## Deployment

This repo includes GitHub Actions workflows:

- `ci.yml` runs lint, tests, and a production build on every pull request.
- `deploy.yml` builds the app and publishes it to GitHub Pages on every push
  to `main`.

To enable Pages deployment: the repo needs to be public (or on a GitHub plan
that supports Pages for private repos), then in **Settings → Pages**, set the
source to **GitHub Actions**.

## Contributing

Issues and pull requests are welcome — especially additions or corrections to
the crisis resource directory in `src/lib/resources.ts`, translations, and
accessibility improvements. Please keep the privacy-first, no-tracking,
no-account philosophy intact.

## License

MIT — see [LICENSE](./LICENSE).
