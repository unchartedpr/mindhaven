// vitest-axe@0.1.0 ships broken/type-only declarations for its matcher
// (see setup.ts), so we declare correct types for it ourselves here.
export {}

declare module 'vitest-axe/matchers' {
  import type { AxeResults } from 'axe-core'
  export function toHaveNoViolations(results: AxeResults): { message(): string; pass: boolean }
}

interface AxeMatchers<R = unknown> {
  toHaveNoViolations(): R
}

declare module 'vitest' {
  interface Assertion<T = unknown> extends AxeMatchers<T> {}
  interface AsymmetricMatchersContaining extends AxeMatchers {}
}
