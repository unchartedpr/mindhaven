import '@testing-library/jest-dom/vitest'
import { expect } from 'vitest'
import { toHaveNoViolations } from 'vitest-axe/matchers'

// vitest-axe's own `extend-expect` entrypoint ships empty in v0.1.0 —
// register the matcher directly instead.
expect.extend({ toHaveNoViolations })
