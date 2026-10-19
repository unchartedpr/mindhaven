import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { Resources } from './Resources'

function setLanguages(languages: string[]) {
  Object.defineProperty(navigator, 'languages', { value: languages, configurable: true })
  Object.defineProperty(navigator, 'language', { value: languages[0] ?? '', configurable: true })
}

afterEach(() => {
  // Remove the instance overrides so the prototype getters are visible again.
  delete (navigator as unknown as Record<string, unknown>).languages
  delete (navigator as unknown as Record<string, unknown>).language
})

function renderPage() {
  return render(
    <MemoryRouter>
      <Resources />
    </MemoryRouter>,
  )
}

const select = () => screen.getByLabelText(/select your country/i) as HTMLSelectElement

describe('Resources page', () => {
  it('does not guess a country when the browser language names no region', () => {
    setLanguages(['en'])
    renderPage()
    expect(select().value).toBe('')
    expect(screen.getByText(/pick your country to see local numbers/i)).toBeInTheDocument()
    expect(screen.queryByText(/Emergency:/)).not.toBeInTheDocument()
  })

  it('preselects the country from an explicit region in the browser language', () => {
    setLanguages(['en-GB', 'en'])
    renderPage()
    expect(select().value).toBe('GB')
    expect(screen.getByText('Samaritans')).toBeInTheDocument()
    expect(screen.getByText(/Emergency: 999/)).toBeInTheDocument()
  })

  it('uses the first language that carries a region', () => {
    setLanguages(['fr', 'fr-CA'])
    renderPage()
    expect(select().value).toBe('CA')
  })

  it('does not preselect when the region is not in the directory', () => {
    setLanguages(['en-NG'])
    renderPage()
    expect(select().value).toBe('')
  })

  it('updates the listing when a different country is chosen', () => {
    setLanguages(['en'])
    renderPage()
    fireEvent.change(select(), { target: { value: 'US' } })
    expect(screen.getByText(/988 Suicide & Crisis Lifeline/i)).toBeInTheDocument()
    expect(screen.getByText(/Emergency: 911/)).toBeInTheDocument()
  })

  it('always shows the worldwide directories, as safe external links', () => {
    setLanguages(['en'])
    renderPage()
    const links = screen.getAllByRole('link', { name: 'findahelpline.com' })
    expect(links.length).toBeGreaterThan(0)
    for (const link of links) {
      expect(link).toHaveAttribute('href', 'https://findahelpline.com')
      expect(link).toHaveAttribute('rel', expect.stringContaining('noopener'))
      expect(link).toHaveAttribute('target', '_blank')
    }
  })

  it('links to the safety plan', () => {
    setLanguages(['en'])
    renderPage()
    expect(screen.getAllByRole('link', { name: /safety plan/i }).length).toBeGreaterThan(0)
  })

  it('lets people report an incorrect number, naming the selected country', () => {
    setLanguages(['en-GB'])
    renderPage()
    const report = screen.getByRole('link', { name: /report an incorrect or missing number/i })
    const href = report.getAttribute('href') ?? ''
    expect(href.startsWith('https://github.com/unchartedpr/mindhaven/issues/new')).toBe(true)
    expect(decodeURIComponent(href)).toContain('United Kingdom')
  })

  it('is honest that the list has not been independently verified', () => {
    setLanguages(['en'])
    renderPage()
    expect(screen.getByText(/hasn’t been independently verified/i)).toBeInTheDocument()
  })
})
