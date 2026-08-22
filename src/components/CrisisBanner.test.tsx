import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { CrisisBanner } from './CrisisBanner'

describe('CrisisBanner', () => {
  it('warns this is not a crisis service and links to resources', () => {
    render(
      <MemoryRouter>
        <CrisisBanner />
      </MemoryRouter>,
    )
    expect(screen.getByText(/immediate danger or crisis/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /see crisis resources/i })).toHaveAttribute(
      'href',
      '/resources',
    )
  })
})
