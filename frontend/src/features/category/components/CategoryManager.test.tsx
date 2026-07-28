import type { CategoryResponseDto } from '@/generated/types'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import CategoryEditorDialogCall from './CategoryEditorDialogCall'
import CategoryManager from './CategoryManager'

const category: CategoryResponseDto = {
  id: 'category-1',
  name: '開発',
  color: '#8B5CF6',
}

const renderManager = ({
  categories = [category],
  onCreate = vi.fn().mockResolvedValue(true),
  onRename = vi.fn().mockResolvedValue(true),
} = {}) => {
  render(
    <>
      <CategoryManager
        categories={categories}
        pendingAction={null}
        onCreate={onCreate}
        onRename={onRename}
        onDelete={vi.fn()}
      />
      <CategoryEditorDialogCall.Root />
    </>,
  )

  return { onCreate, onRename }
}

describe('CategoryManager', () => {
  afterEach(cleanup)

  it('opens the create dialog with empty default values and closes it after saving', async () => {
    const { onCreate } = renderManager()

    fireEvent.click(screen.getByRole('button', { name: 'カテゴリを追加' }))

    expect(screen.getByRole('dialog', { name: 'カテゴリを追加' })).toBeDefined()
    expect((screen.getByPlaceholderText('例：開発、勉強、休憩') as HTMLInputElement).value).toBe('')
    expect(screen.getByRole('radio', { name: '紫（#8B5CF6）' }).getAttribute('aria-checked')).toBe(
      'true',
    )

    fireEvent.change(screen.getByPlaceholderText('例：開発、勉強、休憩'), {
      target: { value: '  休憩  ' },
    })
    await waitFor(() => expect(screen.getByRole('button', { name: '保存' }).disabled).toBe(false))
    fireEvent.click(screen.getByRole('button', { name: '保存' }))

    await waitFor(() => expect(onCreate).toHaveBeenCalledWith('休憩', '#8B5CF6'))
    expect(screen.queryByRole('dialog', { name: 'カテゴリを追加' })).toBeNull()
  })

  it('opens the edit dialog with the selected category values and saves updates', async () => {
    const { onRename } = renderManager()

    fireEvent.click(screen.getByRole('button', { name: '開発を編集' }))

    expect(screen.getByRole('dialog', { name: 'カテゴリを編集' })).toBeDefined()
    expect((screen.getByPlaceholderText('例：開発、勉強、休憩') as HTMLInputElement).value).toBe(
      '開発',
    )
    expect(screen.getByRole('radio', { name: '紫（#8B5CF6）' }).getAttribute('aria-checked')).toBe(
      'true',
    )

    fireEvent.change(screen.getByPlaceholderText('例：開発、勉強、休憩'), {
      target: { value: '設計' },
    })
    fireEvent.click(screen.getByRole('radio', { name: '緑（#10B981）' }))
    await waitFor(() => expect(screen.getByRole('button', { name: '保存' }).disabled).toBe(false))
    fireEvent.click(screen.getByRole('button', { name: '保存' }))

    await waitFor(() => expect(onRename).toHaveBeenCalledWith('category-1', '設計', '#10B981'))
    expect(screen.queryByRole('dialog', { name: 'カテゴリを編集' })).toBeNull()
  })

  it('disables saving when the category name is empty', () => {
    renderManager()

    fireEvent.click(screen.getByRole('button', { name: 'カテゴリを追加' }))

    expect(screen.getByRole('button', { name: '保存' }).disabled).toBe(true)
  })

  it('discards unsaved values when the dialog is closed and reopened', () => {
    renderManager()

    fireEvent.click(screen.getByRole('button', { name: 'カテゴリを追加' }))
    fireEvent.change(screen.getByPlaceholderText('例：開発、勉強、休憩'), {
      target: { value: '一時入力' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'カテゴリを追加を閉じる' }))
    fireEvent.click(screen.getByRole('button', { name: 'カテゴリを追加' }))

    expect((screen.getByPlaceholderText('例：開発、勉強、休憩') as HTMLInputElement).value).toBe('')
  })
})
