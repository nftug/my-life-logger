import type { CategoryResponseDto } from '@/generated/types'
import { errorMessage } from '@/lib/activity/date'
import { categoryApi } from '@/lib/tauri/categoryApi'
import { showDialog } from '@/lib/ui/components/Dialog'
import { useCallback, useEffect, useState } from 'react'

type PendingAction = 'create' | 'rename' | 'delete' | null

const showApiError = (message: string) =>
  showDialog({
    title: 'エラーが発生しました',
    message,
    buttons: [{ label: '閉じる', value: 'close', variant: 'primary' }],
  })

export const useCategories = () => {
  const [categories, setCategories] = useState<CategoryResponseDto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [pendingAction, setPendingAction] = useState<PendingAction>(null)

  const refresh = useCallback(async () => {
    setError(null)
    try {
      setCategories(await categoryApi.getAll())
    } catch (nextError) {
      void showApiError(errorMessage(nextError))
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  useEffect(() => {
    if (!notice) return
    const timeout = window.setTimeout(() => setNotice(null), 3500)
    return () => window.clearTimeout(timeout)
  }, [notice])

  const run = useCallback(
    async (
      action: Exclude<PendingAction, null>,
      operation: () => Promise<unknown>,
      successMessage: string,
    ) => {
      if (pendingAction) return false
      setPendingAction(action)
      setError(null)
      try {
        await operation()
        await refresh()
        setNotice(successMessage)
        return true
      } catch (nextError) {
        await showApiError(errorMessage(nextError))
        return false
      } finally {
        setPendingAction(null)
      }
    },
    [pendingAction, refresh],
  )

  const validName = (name: string) => {
    const trimmed = name.trim()
    if (!trimmed) {
      setError('カテゴリ名を入力してください。')
      return null
    }
    return trimmed
  }

  return {
    state: { categories, isLoading, error, notice, pendingAction },
    actions: {
      refresh,
      clearError: () => setError(null),
      create: (name: string, color: string) => {
        const valid = validName(name)
        return valid
          ? run(
              'create',
              () => categoryApi.create({ request: { name: valid, color } }),
              'カテゴリを追加しました。',
            )
          : Promise.resolve(false)
      },
      rename: (categoryId: string, name: string, color: string) => {
        const valid = validName(name)
        return valid
          ? run(
              'rename',
              () => categoryApi.rename({ identity: { categoryId }, request: { name: valid, color } }),
              'カテゴリを更新しました。',
            )
          : Promise.resolve(false)
      },
      delete: (categoryId: string) =>
        run(
          'delete',
          () => categoryApi.delete({ identity: { categoryId } }),
          'カテゴリを削除しました。',
        ),
    },
  }
}
