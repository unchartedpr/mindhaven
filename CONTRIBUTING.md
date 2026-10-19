# Contributing to MindHaven

Thank you. Please read the [architecture notes](docs/ARCHITECTURE.md) and keep the product's promises:
**free, private, no account, nothing leaves the device.** Changes that add tracking, third-party requests, or
remote storage will not be merged.

## Setup

```bash
npm ci
npm run dev
```

Node 22 or newer.

## Before you open a PR

```bash
npm run check        # type-check, lint, unit tests
npm run test:coverage
npm run build
npx playwright install chromium   # first time only
npm run e2e          # real-browser tests against the production build
```

CI runs the same checks. If the sandbox you work in can't download Playwright's browser, point
`E2E_CHROMIUM_PATH` at any Chromium binary.

## Guidelines

* **Safety content needs a source.** Changes to crisis numbers (`src/lib/resources.ts`) or exercise guidance
  must link to the service's or clinical source's own page in the PR description. Never guess a number.
* **Test the sad paths.** Corrupt storage, blocked storage, empty states, keyboard-only use.
* **Accessibility is a gate, not a nice-to-have.** New screens must pass the e2e axe checks in light and dark;
  add the route to `ROUTES` in `e2e/helpers.ts`.
* **Wording matters.** Be warm and plain. Describe patterns as associations ("on days you tagged *tired*…"),
  never as causes or diagnoses.
* **No new runtime dependencies without discussion.** The bundle is small on purpose.
* **Storage access goes through `src/lib/storage.ts`** and every stored value through a sanitiser.

## Reporting a wrong or outdated crisis line

Open an issue with the country, the number, and a link to the service's own page. This is the most valuable
contribution you can make.
