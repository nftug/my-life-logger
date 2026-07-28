import type { ActivityResponseDto } from '@/generated/types'
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import ActivityTimeline from './ActivityTimeline'

const activity: ActivityResponseDto = {
  id: 'activity-1',
  date: '2026-07-28',
  category: { id: 'category-1', name: '開発' },
  description: 'UIを実装する',
  startedAt: '2026-07-28T00:30:00.000Z',
  endedAt: '2026-07-28T01:30:00.000Z',
  durationSeconds: 3600,
}

describe('ActivityTimeline', () => {
  it('offers edit and delete actions for a completed activity', () => {
    const onEdit = vi.fn()
    const onEditActive = vi.fn()
    const onDelete = vi.fn()
    render(
      <ActivityTimeline
        activities={[activity]}
        activeDurationSeconds={null}
        onEdit={onEdit}
        onEditActive={onEditActive}
        onCancelActive={vi.fn()}
        onDelete={onDelete}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: '記録を編集' }))
    fireEvent.click(screen.getByRole('button', { name: '記録を削除' }))

    expect(onEdit).toHaveBeenCalledWith(activity)
    expect(onDelete).toHaveBeenCalledWith(activity)
  })

  it('offers matching edit and cancel actions for the active activity', () => {
    const onEditActive = vi.fn()
    const onCancelActive = vi.fn()
    render(
      <ActivityTimeline
        activities={[{ ...activity, id: 'active-1', endedAt: null }]}
        activeDurationSeconds={7200}
        onEdit={vi.fn()}
        onEditActive={onEditActive}
        onCancelActive={onCancelActive}
        onDelete={vi.fn()}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: '進行中の記録を編集' }))
    fireEvent.click(screen.getByRole('button', { name: '進行中の記録をキャンセル' }))

    expect(onEditActive).toHaveBeenCalledOnce()
    expect(onCancelActive).toHaveBeenCalledOnce()
  })
})
