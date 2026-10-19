import { fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { MoodPicker } from './MoodPicker'
import type { MoodValue } from '../lib/types'

describe('MoodPicker', () => {
  it('renders all five mood options', () => {
    render(<MoodPicker value={null} onChange={() => {}} />)
    expect(screen.getAllByRole('radio')).toHaveLength(5)
  })

  it('marks the selected value as checked', () => {
    render(<MoodPicker value={4} onChange={() => {}} />)
    expect(screen.getByRole('radio', { name: /Good/i })).toHaveAttribute('aria-checked', 'true')
  })

  it('calls onChange with the clicked mood value', () => {
    const onChange = vi.fn()
    render(<MoodPicker value={null} onChange={onChange} />)
    fireEvent.click(screen.getByRole('radio', { name: /Great/i }))
    expect(onChange).toHaveBeenCalledWith(5)
  })

  describe('keyboard (radio group pattern)', () => {
    function Harness({ initial = null }: { initial?: MoodValue | null }) {
      const [v, setV] = useState<MoodValue | null>(initial)
      return <MoodPicker value={v} onChange={setV} />
    }

    it('is a single tab stop: the first option when nothing is chosen', () => {
      render(<Harness />)
      const tabIndexes = screen.getAllByRole('radio').map((r) => r.getAttribute('tabindex'))
      expect(tabIndexes).toEqual(['0', '-1', '-1', '-1', '-1'])
    })

    it('is a single tab stop: the selected option when one is chosen', () => {
      render(<Harness initial={3} />)
      const tabIndexes = screen.getAllByRole('radio').map((r) => r.getAttribute('tabindex'))
      expect(tabIndexes).toEqual(['-1', '-1', '0', '-1', '-1'])
    })

    it('arrow keys move focus and selection', () => {
      render(<Harness initial={3} />)
      fireEvent.keyDown(screen.getByRole('radio', { name: /Okay/i }), { key: 'ArrowRight' })
      expect(screen.getByRole('radio', { name: /Good/i })).toHaveFocus()
      expect(screen.getByRole('radio', { name: /Good/i })).toHaveAttribute('aria-checked', 'true')
      fireEvent.keyDown(screen.getByRole('radio', { name: /Good/i }), { key: 'ArrowLeft' })
      expect(screen.getByRole('radio', { name: /Okay/i })).toHaveFocus()
    })

    it('wraps around at both ends', () => {
      render(<Harness initial={5} />)
      fireEvent.keyDown(screen.getByRole('radio', { name: /Great/i }), { key: 'ArrowRight' })
      expect(screen.getByRole('radio', { name: /Awful/i })).toHaveFocus()
      fireEvent.keyDown(screen.getByRole('radio', { name: /Awful/i }), { key: 'ArrowUp' })
      expect(screen.getByRole('radio', { name: /Great/i })).toHaveFocus()
    })

    it('Home and End jump to the ends', () => {
      render(<Harness initial={3} />)
      fireEvent.keyDown(screen.getByRole('radio', { name: /Okay/i }), { key: 'End' })
      expect(screen.getByRole('radio', { name: /Great/i })).toHaveFocus()
      fireEvent.keyDown(screen.getByRole('radio', { name: /Great/i }), { key: 'Home' })
      expect(screen.getByRole('radio', { name: /Awful/i })).toHaveFocus()
    })
  })
})
