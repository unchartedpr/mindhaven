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
    gratitudeStore.add(['a walk outside'])
    worryStore.add('the deadline tomorrow')
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
    gratitudeStore.add(['a walk outside'])
    worryStore.add('the deadline tomorrow')

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
    gratitudeStore.add(['a walk outside'])
    worryStore.add('the deadline tomorrow')

    render(
      <MemoryRouter>
        <Journal />
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByRole('button', { name: /^worry$/i }))

    expect(screen.getByText('the deadline tomorrow')).toBeInTheDocument()
    expect(screen.queryByText('a walk outside')).not.toBeInTheDocument()
  })
})
