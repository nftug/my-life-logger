import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import { afterEach, describe, expect, it } from 'vitest'
import CategoryColorPicker, { CATEGORY_DEFAULT_COLOR } from './CategoryColorPicker'

const ColorPickerHarness = () => {
  const [color, setColor] = useState(CATEGORY_DEFAULT_COLOR)
  return (
    <>
      <CategoryColorPicker color={color} onChange={setColor} />
      <output>{color}</output>
    </>
  )
}

describe('CategoryColorPicker', () => {
  afterEach(cleanup)

  it('updates the selected preset color', () => {
    render(<ColorPickerHarness />)

    fireEvent.click(screen.getByRole('radio', { name: '緑（#10B981）' }))

    expect(screen.getByRole('radio', { name: '緑（#10B981）' }).getAttribute('aria-checked')).toBe(
      'true',
    )
  })

  it('updates the color from the custom color picker', () => {
    render(<ColorPickerHarness />)

    fireEvent.change(screen.getByLabelText('カスタムカラー'), { target: { value: '#f43f5e' } })

    expect(screen.getByText('#F43F5E')).toBeDefined()
  })
})
