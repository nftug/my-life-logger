import { atom, useSetAtom } from 'jotai'
import { useEffect } from 'react'
import { todayDate } from '@/lib/activity/date'

/** The current local calendar date shared by the screens that need "today". */
export const currentDateAtom = atom(todayDate())

export const millisecondsUntilNextMidnight = (now = new Date()) => {
  const nextMidnight = new Date(now)
  nextMidnight.setHours(24, 0, 0, 0)
  return Math.max(1, nextMidnight.getTime() - now.getTime())
}

/**
 * Keeps the shared date aligned with the local calendar without polling.
 * The focus/visibility handlers also cover applications that slept through midnight.
 */
export const CurrentDateSync = () => {
  const setCurrentDate = useSetAtom(currentDateAtom)

  useEffect(() => {
    let timeoutId: number | null = null

    const scheduleNextSync = () => {
      if (timeoutId !== null) window.clearTimeout(timeoutId)
      timeoutId = window.setTimeout(syncDate, millisecondsUntilNextMidnight() + 1)
    }

    const syncDate = () => {
      const nextDate = todayDate()
      setCurrentDate((previousDate) => (previousDate === nextDate ? previousDate : nextDate))
      scheduleNextSync()
    }

    const syncOnVisibilityChange = () => {
      if (document.visibilityState === 'visible') syncDate()
    }

    syncDate()
    window.addEventListener('focus', syncDate)
    document.addEventListener('visibilitychange', syncOnVisibilityChange)

    return () => {
      if (timeoutId !== null) window.clearTimeout(timeoutId)
      window.removeEventListener('focus', syncDate)
      document.removeEventListener('visibilitychange', syncOnVisibilityChange)
    }
  }, [setCurrentDate])

  return null
}
