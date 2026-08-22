import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { MoodPicker } from './MoodPicker'

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
})
