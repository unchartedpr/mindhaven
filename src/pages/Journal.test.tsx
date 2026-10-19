import { render, screen, fireEvent } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { Journal } from './Journal'
import { gratitudeStore, reframeStore, worryStore } from '../lib/storage'

beforeEach(() => {
  localStorage.clear()
})

describe('Journal page', () => {
  it('shows an empty state with links when there is no data at all', () => {
    render(
      <MemoryRouter>
        <Journal />
      </MemoryRouter>,
    )
    expect(screen.getByText(/nothing here yet/i)).toBeInTheDocument()
    expect(screen.getByText(/write a gratitude note/i)).toBeInTheDocument()
    expect(screen.getByText(/set a worry aside/i)).toBeInTheDocument()
  })

  it('lists gratitude, reframe, and worry entries together', () => {
    gratitudeStore.add({ items: ['a walk outside'] })
    worryStore.add({ worry: 'the deadline tomorrow' })
    reframeStore.add({
      situation: 'Missed a call',
      automaticThought: 'They must be upset with me',
      evidenceFor: '',
      evidenceAgainst: '',
      balancedThought: '',
    })

    render(
      <MemoryRouter>
        <Journal />
      </MemoryRouter>,
    )

    expect(screen.getByText('a walk outside')).toBeInTheDocument()
    expect(screen.getByText('the deadline tomorrow')).toBeInTheDocument()
    expect(screen.getByText('Missed a call')).toBeInTheDocument()
  })

  it('filters entries by search text', () => {
    gratitudeStore.add({ items: ['a walk outside'] })
    worryStore.add({ worry: 'the deadline tomorrow' })

    render(
      <MemoryRouter>
        <Journal />
      </MemoryRouter>,
    )

    fireEvent.change(screen.getByPlaceholderText(/search your journal/i), {
      target: { value: 'deadline' },
    })

    expect(screen.getByText('the deadline tomorrow')).toBeInTheDocument()
    expect(screen.queryByText('a walk outside')).not.toBeInTheDocument()
  })

  it('filters entries by type', () => {
    gratitudeStore.add({ items: ['a walk outside'] })
    worryStore.add({ worry: 'the deadline tomorrow' })

    render(
      <MemoryRouter>
        <Journal />
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByRole('button', { name: /^worry$/i }))

    expect(screen.getByText('the deadline tomorrow')).toBeInTheDocument()
    expect(screen.queryByText('a walk outside')).not.toBeInTheDocument()
  })

  it('lists the newest entries first', () => {
    gratitudeStore.add({ items: ['older'] })
    worryStore.add({ worry: 'newer', timestamp: Date.now() + 5000 })

    render(
      <MemoryRouter>
        <Journal />
      </MemoryRouter>,
    )

    const items = screen.getAllByRole('listitem').map((li) => li.textContent ?? '')
    expect(items.findIndex((t) => t.includes('newer'))).toBeLessThan(items.findIndex((t) => t.includes('older')))
  })

  describe('deleting entries', () => {
    it('removes a single entry after a second, deliberate click', () => {
      gratitudeStore.add({ items: ['keep me'] })
      worryStore.add({ worry: 'delete me' })

      render(
        <MemoryRouter>
          <Journal />
        </MemoryRouter>,
      )

      fireEvent.click(screen.getByRole('button', { name: /delete this worry entry/i }))
      expect(worryStore.all()).toHaveLength(1) // first click only arms it

      fireEvent.click(screen.getByRole('button', { name: /delete this worry entry/i }))
      expect(worryStore.all()).toHaveLength(0)
      expect(screen.queryByText('delete me')).not.toBeInTheDocument()
      expect(screen.getByText('keep me')).toBeInTheDocument()
    })

    it('can delete each kind of entry', () => {
      gratitudeStore.add({ items: ['g'] })
      reframeStore.add({ situation: 's', automaticThought: 't', evidenceFor: '', evidenceAgainst: '', balancedThought: '' })

      render(
        <MemoryRouter>
          <Journal />
        </MemoryRouter>,
      )

      for (const type of ['gratitude', 'reframe']) {
        const name = new RegExp(`delete this ${type} entry`, 'i')
        fireEvent.click(screen.getByRole('button', { name }))
        fireEvent.click(screen.getByRole('button', { name }))
      }
      expect(gratitudeStore.all()).toHaveLength(0)
      expect(reframeStore.all()).toHaveLength(0)
      expect(screen.getByText(/nothing here yet/i)).toBeInTheDocument()
    })
  })

  describe('with damaged data on the device', () => {
    it('renders the entries that are fine instead of crashing', () => {
      localStorage.setItem(
        'mindhaven:v1:gratitude',
        JSON.stringify([
          { id: 'ok', timestamp: 5, items: ['still here'] },
          { id: 'bad', timestamp: 6, items: 'not-an-array' },
        ]),
      )
      localStorage.setItem('mindhaven:v1:worries', '{not json')

      render(
        <MemoryRouter>
          <Journal />
        </MemoryRouter>,
      )

      expect(screen.getByText('still here')).toBeInTheDocument()
    })
  })
})
