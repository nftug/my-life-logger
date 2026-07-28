import { describe, expect, it } from 'vitest'
import { formatDuration, isTodayLocal, toDateTimeLocal, toUtcIso, todayDate } from './date'

describe('activity date utilities', () => {
  it('formats elapsed time as a fixed-width timer', () => {
    expect(formatDuration(3_661)).toBe('01:01:01')
    expect(formatDuration(-10)).toBe('00:00:00')
  })

  it('round-trips a local datetime through UTC', () => {
    const localValue = `${todayDate()}T09:30`
    expect(toDateTimeLocal(toUtcIso(localValue))).toBe(localValue)
  })

  it('accepts today and rejects a different local date', () => {
    expect(isTodayLocal(`${todayDate()}T12:00`)).toBe(true)
    expect(isTodayLocal('2000-01-01T12:00')).toBe(false)
  })
})
