# MindHaven — roadmap

Ideas, ordered by value for users per unit of risk. None of these are promises. Anything that would send
data off the device needs a written threat model first — that line is the product.

## Next (high value, low risk)

1. **Verified crisis data.** Every number in `src/lib/resources.ts` should be checked by a person against
   the service's own website, with a `reviewedOn` date per country shown in the UI and a CI warning when
   an entry is older than ~12 months. Today the 35 countries are from public sources but not independently
   verified. *This is the most important item on the list.*
2. **Tap-to-call and tap-to-text for crisis lines.** Contacts in `resources.ts` are free text ("Call or text
   988"), so only the safety plan offers `tel:` links. Add structured `tel` / `sms` fields per line so someone in
   distress can act in one tap (each one verified, per item 1).
3. **Edit and back-fill check-ins.** Fix a mis-tapped mood; log yesterday.
4. **Journal pagination / virtualisation.** Years of entries will make the list heavy.
5. **Encourage backups without nagging.** Offer the File System Access API (where available) to write the
   backup to a chosen file/folder, so "back up" can be one tap.
6. **More exercises.** Progressive muscle relaxation, a "5-minute urge surf", self-compassion break,
   behavioural-activation planner, sleep wind-down. Each needs a reviewed source.
7. **Weekly reflection prompt** based on the user's own tags — still computed locally.

## Later (needs design or review)

* **Translations.** Highest-impact reach feature, but mistranslated crisis guidance is harmful. Requires
  native-speaker review per language and a way to mark a translation as reviewed. Start with Spanish,
  French, Portuguese, Hindi, Arabic (RTL).
* **Optional encrypted sync / multi-device.** End-to-end encrypted with a user-held key; the server (if any)
  stores ciphertext only. Needs a threat model, key-recovery UX, and a hosting decision — and should be opt-in
  with the local-only mode staying first-class.
* **Host with response headers** (e.g. Cloudflare Pages / Netlify) to add `frame-ancestors`, HSTS preload,
  and `Permissions-Policy`.
* **Clinician-friendly export.** A PDF summary of mood over a date range (still generated on-device) to
  bring to an appointment.
* **Standardised self-checks (PHQ-9 / GAD-7).** Valuable but clinically sensitive: needs licensing check,
  careful scoring language, and a "what to do with this score" flow. Do not ship half-way.
* **Widgets / notifications.** Web Push needs a server; Notification Triggers aren't broadly available. The
  `.ics` reminder remains the privacy-preserving option until that changes.
* **Accessibility research with real users** (screen-reader users, low-vision, motor impairment, people in
  distress). Automated checks are a floor, not a ceiling.

## Engineering

* Bump `@vitejs/plugin-react` and other deferred majors when the npm resolver allows (Dependabot).
* Visual-regression snapshots for the key screens.
* Run the e2e suite on WebKit and Firefox in CI (currently Chromium only).
* Lighthouse CI budget (performance, PWA, best practices).
* Error telemetry is deliberately **not** on the list. If it ever is, it must be opt-in, content-free, and
  self-hosted.

## Won't do

* Accounts, analytics, ads, third-party SDKs, or anything that makes the privacy statement untrue.
* AI-generated therapeutic advice or "chat with a bot" features. The app is a set of simple, reviewed tools
  and a route to real help.
