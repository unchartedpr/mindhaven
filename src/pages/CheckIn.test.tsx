import { fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { CheckIn } from './CheckIn'
import { moodStore, safetyPlanStore } from '../lib/storage'
import { emptySafetyPlan } from '../lib/validate'

beforeEach(() => {
  localStorage.clear()
})

afterEach(() => {
  vi.restoreAllMocks()
})

function renderPage() {
  return render(
    <MemoryRouter>
      <CheckIn />
    </MemoryRouter>,
  )
}

const save = () => fireEvent.click(screen.getByRole('button', { name: /Save check-in/i }))

describe('CheckIn page', () => {
  it('lets a user log a mood and saves it to the store', () => {
    renderPage()
    fireEvent.click(screen.getByRole('radio', { name: /Okay/i }))
    save()
    expect(screen.getByRole('status')).toHaveTextContent(/Saved/i)
    expect(moodStore.all()).toHaveLength(1)
    expect(moodStore.all()[0].mood).toBe(3)
  })

  it('disables save until a mood is picked', () => {
    renderPage()
    expect(screen.getByRole('button', { name: /Save check-in/i })).toBeDisabled()
  })

  it('saves the chosen tags and note', () => {
    renderPage()
    fireEvent.click(screen.getByRole('radio', { name: /Rough/i }))
    fireEvent.click(screen.getByRole('button', { name: 'anxious' }))
    fireEvent.click(screen.getByRole('button', { name: 'tired' }))
    fireEvent.change(screen.getByLabelText(/anything you want to note/i), { target: { value: 'bad night' } })
    save()
    expect(moodStore.all()[0]).toMatchObject({ mood: 2, tags: ['anxious', 'tired'], note: 'bad night' })
  })

  it('clears the form after saving so another check-in can be logged', () => {
    renderPage()
    fireEvent.click(screen.getByRole('radio', { name: /Good/i }))
    fireEvent.click(screen.getByRole('button', { name: 'calm' }))
    save()
    expect(screen.getByRole('button', { name: /Save check-in/i })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'calm' })).toHaveAttribute('aria-pressed', 'false')
  })

  describe('follow-up after saving', () => {
    it('suggests exercises that match the tags', () => {
      renderPage()
      fireEvent.click(screen.getByRole('radio', { name: /Okay/i }))
      fireEvent.click(screen.getByRole('button', { name: 'anxious' }))
      save()
      const status = screen.getByRole('status')
      expect(within(status).getByRole('link', { name: /box breathing/i })).toHaveAttribute('href', '/exercises/breathing')
      expect(within(status).getByRole('link', { name: /grounding/i })).toBeInTheDocument()
    })

    it('points to support and offers to make a safety plan after a low check-in', () => {
      renderPage()
      fireEvent.click(screen.getByRole('radio', { name: /Awful/i }))
      save()
      const status = screen.getByRole('status')
      expect(within(status).getByRole('link', { name: /make a safety plan/i })).toBeInTheDocument()
      expect(within(status).getByRole('link', { name: /support lines/i })).toHaveAttribute('href', '/resources')
    })

    it('refers to the existing safety plan when there is one', () => {
      safetyPlanStore.set({ ...emptySafetyPlan(), updatedAt: 1, warningSigns: ['x'] })
      renderPage()
      fireEvent.click(screen.getByRole('radio', { name: /Rough/i }))
      save()
      const status = screen.getByRole('status')
      expect(within(status).getByRole('link', { name: /^safety plan$/i })).toBeInTheDocument()
      expect(within(status).queryByRole('link', { name: /make a safety plan/i })).not.toBeInTheDocument()
    })

    it('does not point to crisis support after an ordinary good day', () => {
      renderPage()
      fireEvent.click(screen.getByRole('radio', { name: /Great/i }))
      save()
      expect(within(screen.getByRole('status')).queryByRole('link', { name: /support lines/i })).not.toBeInTheDocument()
    })
  })

  describe('recent check-ins', () => {
    it('appears and updates live', () => {
      renderPage()
      expect(screen.queryByText(/recent check-ins/i)).not.toBeInTheDocument()
      fireEvent.click(screen.getByRole('radio', { name: /Good/i }))
      save()
      expect(screen.getByText(/recent check-ins/i)).toBeInTheDocument()
    })

    it('deletes one check-in after a second, deliberate click', () => {
      moodStore.add({ mood: 4, tags: [], timestamp: 2000 })
      moodStore.add({ mood: 2, tags: [], timestamp: 1000 })
      renderPage()
      const [first] = screen.getAllByRole('button', { name: /delete check-in/i })

      fireEvent.click(first)
      expect(moodStore.all()).toHaveLength(2)
      expect(screen.getByRole('alert')).toHaveTextContent(/confirm delete/i)

      fireEvent.click(first)
      expect(moodStore.all()).toHaveLength(1)
      expect(moodStore.all()[0].mood).toBe(2)
    })
  })

  it('keeps what was typed and says so when the browser cannot save', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('full', 'QuotaExceededError')
    })
    renderPage()
    fireEvent.click(screen.getByRole('radio', { name: /Okay/i }))
    save()
    expect(screen.getByRole('alert')).toHaveTextContent(/couldn’t be saved/i)
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
    // The selection is still there, so the person can retry.
    expect(screen.getByRole('radio', { name: /Okay/i })).toHaveAttribute('aria-checked', 'true')
  })
})
