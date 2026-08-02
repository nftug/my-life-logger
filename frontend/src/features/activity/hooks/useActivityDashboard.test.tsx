import type { ActivityStateResponseDto } from '@/generated/types'
import { activityApi } from '@/lib/tauri/activityApi'
import { categoryApi } from '@/lib/tauri/categoryApi'
import { cleanup, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useActivityDashboard } from './useActivityDashboard'

const createDeferred = <T,>() => {
  let resolve!: (value: T) => void
  const promise = new Promise<T>((nextResolve) => {
    resolve = nextResolve
  })
  return { promise, resolve }
}

const activityState = (date: string): ActivityStateResponseDto => ({
  date,
  activeActivity: null,
  completedActivities: [],
})

describe('useActivityDashboard', () => {
  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  it('does not let a previous date response overwrite the current date', async () => {
    const oldRequest = createDeferred<ActivityStateResponseDto>()
    const newRequest = createDeferred<ActivityStateResponseDto>()
    vi.spyOn(activityApi, 'getState').mockImplementation(({ identity }) =>
      identity.date === '2026-08-01' ? oldRequest.promise : newRequest.promise,
    )
    vi.spyOn(activityApi, 'onStateEvent').mockResolvedValue(() => undefined)
    vi.spyOn(categoryApi, 'getAll').mockResolvedValue([])

    const { result, rerender } = renderHook(
      ({ date }: { date: string }) => useActivityDashboard(date),
      {
        initialProps: { date: '2026-08-01' },
      },
    )

    rerender({ date: '2026-08-02' })
    newRequest.resolve(activityState('2026-08-02'))
    await newRequest.promise

    expect(result.current.state.activityState.date).toBe('2026-08-02')

    oldRequest.resolve(activityState('2026-08-01'))
    await oldRequest.promise

    expect(result.current.state.activityState.date).toBe('2026-08-02')
  })
})
