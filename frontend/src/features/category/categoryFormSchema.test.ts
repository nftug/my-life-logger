import { categoryFormSchema } from '@/features/category/categoryFormSchema'
import * as v from 'valibot'
import { describe, expect, it } from 'vitest'

describe('categoryFormSchema', () => {
  it('accepts a category name with an RGB hex color', () => {
    const result = v.safeParse(categoryFormSchema, { name: '開発', color: '#8B5CF6' })

    expect(result.success).toBe(true)
  })

  it('rejects a color that is not an RGB hex value', () => {
    const result = v.safeParse(categoryFormSchema, { name: '開発', color: 'violet' })

    expect(result.success).toBe(false)
  })
})
