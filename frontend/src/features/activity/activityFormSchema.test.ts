import { createCompletedActivitySchema } from '@/features/activity/activityFormSchema'
import * as v from 'valibot'
import { describe, expect, it } from 'vitest'

describe('completedActivitySchema', () => {
  it('accepts a completed activity on a past date', () => {
    const result = v.safeParse(createCompletedActivitySchema('2026-07-01'), {
      categoryId: 'category-1',
      description: '振り返り',
      startedAtLocal: '2026-07-01T09:00',
      endedAtLocal: '2026-07-01T10:00',
    })

    expect(result.success).toBe(true)
  })

  it('rejects an end time that is not after the start time', () => {
    const result = v.safeParse(createCompletedActivitySchema('2026-07-01'), {
      categoryId: 'category-1',
      description: '',
      startedAtLocal: '2026-07-01T10:00',
      endedAtLocal: '2026-07-01T09:00',
    })

    expect(result.success).toBe(false)
  })

  it('rejects a completed activity on a different date', () => {
    const result = v.safeParse(createCompletedActivitySchema('2026-07-01'), {
      categoryId: 'category-1',
      description: '',
      startedAtLocal: '2026-07-02T09:00',
      endedAtLocal: '2026-07-02T10:00',
    })

    expect(result.success).toBe(false)
  })
})
