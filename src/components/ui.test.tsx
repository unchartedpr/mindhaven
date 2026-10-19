import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ConfirmButton } from './ui'

describe('ConfirmButton', () => {
  it('needs two clicks, and its accessible name follows its visible text', () => {
    const onConfirm = vi.fn()
    render(
      <ConfirmButton aria-label="Delete the thing" confirmLabel="Really delete?" onConfirm={onConfirm}>
        Delete
      </ConfirmButton>,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Delete the thing' }))
    expect(onConfirm).not.toHaveBeenCalled()
    expect(screen.getByRole('alert')).toHaveTextContent('Really delete?')

    const armed = screen.getByRole('button', { name: 'Really delete?' })
    expect(armed).toHaveTextContent('Really delete?')
    fireEvent.click(armed)
    expect(onConfirm).toHaveBeenCalledTimes(1)
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('disarms when focus leaves', () => {
    render(<ConfirmButton onConfirm={() => {}}>Delete</ConfirmButton>)
    const button = screen.getByRole('button', { name: 'Delete' })
    fireEvent.click(button)
    fireEvent.blur(screen.getByRole('button'))
    expect(screen.getByRole('button')).toHaveTextContent('Delete')
  })
})
