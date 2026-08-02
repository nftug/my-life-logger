import { Provider, createStore, useAtomValue } from 'jotai'
import { act, cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { todayDate } from '@/lib/activity/date'
import { CurrentDateSync, currentDateAtom, millisecondsUntilNextMidnight } from './currentDate'

const DateValue = () => <output>{useAtomValue(currentDateAtom)}</output>

describe('CurrentDateSync', () => {
  afterEach(() => {
    cleanup()
    vi.useRealTimers()
  })

  it('updates the shared date at local midnight and schedules the next update', async () => {
    vi.useFakeTimers()
    const beforeMidnight = new Date(2026, 7, 2, 23, 59, 59, 500)
    vi.setSystemTime(beforeMidnight)
    const store = createStore()

    const { unmount } = render(
      <Provider store={store}>
        <CurrentDateSync />
        <DateValue />
      </Provider>,
    )

    await act(async () => {
      vi.advanceTimersByTime(millisecondsUntilNextMidnight(beforeMidnight) + 1)
    })

    expect(store.get(currentDateAtom)).toBe(todayDate())
    expect(screen.getByText(todayDate())).toBeTruthy()
    expect(vi.getTimerCount()).toBe(1)

    unmount()
    expect(vi.getTimerCount()).toBe(0)
  })

  it('synchronizes after the app returns to the foreground', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 7, 2, 10, 0, 0))
    const store = createStore()

    render(
      <Provider store={store}>
        <CurrentDateSync />
        <DateValue />
      </Provider>,
    )

    vi.setSystemTime(new Date(2026, 7, 3, 0, 5, 0))
    await act(async () => {
      window.dispatchEvent(new Event('focus'))
    })

    expect(store.get(currentDateAtom)).toBe(todayDate())
    expect(screen.getByText(todayDate())).toBeTruthy()
  })
})
