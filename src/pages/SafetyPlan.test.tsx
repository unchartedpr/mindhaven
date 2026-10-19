import { fireEvent, render, screen, within } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { SafetyPlan } from './SafetyPlan'
import { safetyPlanStore } from '../lib/storage'
import { emptySafetyPlan } from '../lib/validate'

beforeEach(() => {
  localStorage.clear()
})

const renderPage = () =>
  render(
    <MemoryRouter>
      <SafetyPlan />
    </MemoryRouter>,
  )

const savedPlan = () => ({
  ...emptySafetyPlan(),
  updatedAt: new Date(2026, 5, 1).getTime(),
  warningSigns: ['I stop answering messages'],
  copingStrategies: ['Go for a walk'],
  supportPeople: [{ name: 'Sam', phone: '+1 (555) 010-0100' }],
  professionals: [{ name: 'Dr Lee', phone: '' }],
  reasonsToLive: ['My dog'],
})

describe('SafetyPlan page (no plan yet)', () => {
  it('opens straight into the editor with a gentle framing and a crisis pointer', () => {
    renderPage()
    expect(screen.getByRole('heading', { name: /my safety plan/i })).toBeInTheDocument()
    expect(screen.getByText(/not medical advice/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /see crisis resources/i })).toHaveAttribute('href', '/resources')
    expect(screen.getByRole('button', { name: /save my plan/i })).toBeInTheDocument()
  })

  it('has every step of the plan', () => {
    renderPage()
    for (const name of [
      /my warning signs/i,
      /things i can do on my own/i,
      /people and places that help me feel better/i,
      /people i can ask for help/i,
      /professionals and crisis lines/i,
      /making my surroundings safer/i,
      /what’s worth holding on to/i,
    ]) {
      expect(screen.getByRole('group', { name })).toBeInTheDocument()
    }
  })

  it('saves what was written, trimming blanks', () => {
    renderPage()
    const signs = screen.getByRole('group', { name: /my warning signs/i })
    fireEvent.click(within(signs).getByRole('button', { name: /add/i }))
    fireEvent.change(within(signs).getByRole('textbox'), { target: { value: '  not sleeping  ' } })
    fireEvent.click(within(signs).getByRole('button', { name: /add/i })) // leaves a blank row behind

    const help = screen.getByRole('group', { name: /people i can ask for help/i })
    fireEvent.click(within(help).getByRole('button', { name: /add a person/i }))
    fireEvent.change(within(help).getByLabelText(/name 1/i), { target: { value: 'Alex' } })
    fireEvent.change(within(help).getByLabelText(/phone 1/i), { target: { value: '555-0199' } })

    fireEvent.click(screen.getByRole('button', { name: /save my plan/i }))

    const plan = safetyPlanStore.get()!
    expect(plan.warningSigns).toEqual(['not sleeping'])
    expect(plan.supportPeople).toEqual([{ name: 'Alex', phone: '555-0199' }])
    expect(plan.updatedAt).toBeGreaterThan(0)
    // Now it shows the plan rather than the editor.
    expect(screen.getByRole('button', { name: /edit my plan/i })).toBeInTheDocument()
  })

  it('lets a row be removed', () => {
    renderPage()
    const signs = screen.getByRole('group', { name: /my warning signs/i })
    fireEvent.click(within(signs).getByRole('button', { name: /add/i }))
    expect(within(signs).getAllByRole('textbox')).toHaveLength(1)
    fireEvent.click(within(signs).getByRole('button', { name: /remove/i }))
    expect(within(signs).queryByRole('textbox')).not.toBeInTheDocument()
  })
})

describe('SafetyPlan page (with a plan)', () => {
  beforeEach(() => safetyPlanStore.set(savedPlan()))

  it('shows the plan read-only, in calm sections, skipping empty ones', () => {
    renderPage()
    expect(screen.getByText('I stop answering messages')).toBeInTheDocument()
    expect(screen.getByText('My dog')).toBeInTheDocument()
    expect(screen.queryByText(/making my surroundings safer/i)).not.toBeInTheDocument()
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
  })

  it('turns phone numbers into one-tap call links, with only safe characters', () => {
    renderPage()
    const call = screen.getByRole('link', { name: '+1 (555) 010-0100' })
    expect(call).toHaveAttribute('href', 'tel:+15550100100')
  })

  it('shows contacts without a number as plain text', () => {
    renderPage()
    expect(screen.getByText('Dr Lee')).toBeInTheDocument()
  })

  it('can be edited, and cancelled without losing anything', () => {
    renderPage()
    fireEvent.click(screen.getByRole('button', { name: /edit my plan/i }))
    expect(screen.getByDisplayValue('Go for a walk')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }))
    expect(safetyPlanStore.get()?.copingStrategies).toEqual(['Go for a walk'])
    expect(screen.getByRole('button', { name: /edit my plan/i })).toBeInTheDocument()
  })

  it('saves edits', () => {
    renderPage()
    fireEvent.click(screen.getByRole('button', { name: /edit my plan/i }))
    fireEvent.change(screen.getByDisplayValue('Go for a walk'), { target: { value: 'Call a friend' } })
    fireEvent.click(screen.getByRole('button', { name: /save my plan/i }))
    expect(safetyPlanStore.get()?.copingStrategies).toEqual(['Call a friend'])
  })

  it('can be printed', () => {
    const print = vi.spyOn(window, 'print').mockImplementation(() => {})
    renderPage()
    fireEvent.click(screen.getByRole('button', { name: /print or save as pdf/i }))
    expect(print).toHaveBeenCalled()
  })

  it('deletes only after a second deliberate click', () => {
    renderPage()
    fireEvent.click(screen.getByRole('button', { name: /delete my safety plan/i }))
    expect(safetyPlanStore.get()).not.toBeNull()
    fireEvent.click(screen.getByRole('button', { name: /click again to delete my plan/i }))
    expect(safetyPlanStore.get()).toBeNull()
    expect(screen.getByRole('button', { name: /save my plan/i })).toBeInTheDocument()
  })
})
