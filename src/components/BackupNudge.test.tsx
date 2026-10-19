import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { BackupNudge } from './BackupNudge'
import { backupMeta } from '../lib/storage'

beforeEach(() => {
  localStorage.clear()
})

const renderNudge = (entryCount: number) =>
  render(
    <MemoryRouter>
      <BackupNudge entryCount={entryCount} />
    </MemoryRouter>,
  )

describe('BackupNudge', () => {
  it('stays hidden until there is data worth protecting', () => {
    renderNudge(2)
    expect(screen.queryByText(/live only in this browser/i)).not.toBeInTheDocument()
  })

  it('appears when there is data and no backup yet', () => {
    renderNudge(10)
    expect(screen.getByText(/haven’t made a backup yet/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /back up now/i })).toHaveAttribute('href', '/settings')
  })

  it('stays hidden right after a backup', () => {
    backupMeta.markBackedUp()
    renderNudge(10)
    expect(screen.queryByText(/live only in this browser/i)).not.toBeInTheDocument()
  })

  it('reminds after a long time, with different wording', () => {
    backupMeta.markBackedUp(Date.now() - 90 * 24 * 60 * 60 * 1000)
    renderNudge(10)
    expect(screen.getByText(/been a while since your last backup/i)).toBeInTheDocument()
  })

  it('can be dismissed', () => {
    renderNudge(10)
    fireEvent.click(screen.getByRole('button', { name: /later/i }))
    expect(screen.queryByText(/live only in this browser/i)).not.toBeInTheDocument()
  })
})
