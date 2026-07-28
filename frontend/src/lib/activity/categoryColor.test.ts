import { describe, expect, it } from 'vitest'
import { categoryColor } from './categoryColor'

describe('categoryColor', () => {
  it('assigns the same category id a stable color', () => {
    expect(categoryColor('development')).toBe(categoryColor('development'))
    expect(categoryColor('development')).toMatch(/^bg-/)
  })
})
