import {
  createCategory,
  deleteCategory,
  getAllCategories,
  renameCategory,
} from '@/generated/commands'
import type { CategoryResponseDto } from '@/generated/types'
import { useModalContext } from '@/lib/ui/components/ModalProvider'
import { useToastContext } from '@/lib/ui/components/ToastProvider'
import { useActionRunner } from '@/lib/ui/hooks/useActionRunner'
import { createMemo, createResource, createSignal, type Accessor } from 'solid-js'

interface CategoriesState {
  newCategoryName: Accessor<string>
  editingId: Accessor<string | null>
  renameDraft: Accessor<string>
  pendingAction: Accessor<string | null>
  categories: Accessor<CategoryResponseDto[] | undefined>
  categoryCount: Accessor<number>
}

interface CategoriesActions {
  refresh: () => Promise<void>
  setNewCategoryName: (value: string) => void
  setRenameDraft: (value: string) => void
  startRename: (categoryId: string, name: string) => void
  cancelRename: () => void
  create: (event: Event) => Promise<void>
  rename: (categoryId: string) => Promise<void>
  remove: (category: CategoryResponseDto) => Promise<void>
}

export interface CategoriesViewModel {
  state: CategoriesState
  actions: CategoriesActions
}

export const useCategoriesState = (): CategoriesViewModel => {
  const modal = useModalContext()
  const toast = useToastContext()
  const { pendingAction, runAction } = useActionRunner()

  const [newCategoryName, setNewCategoryName] = createSignal('')
  const [editingId, setEditingId] = createSignal<string | null>(null)
  const [renameDraft, setRenameDraft] = createSignal('')

  const [categories, { refetch }] = createResource<CategoryResponseDto[]>(() => getAllCategories())
  const categoryCount = createMemo(() => categories()?.length ?? 0)

  const runCategoriesAction = (
    actionKey: string,
    action: () => Promise<void>,
    successMessage: string,
  ): Promise<boolean> =>
    runAction(actionKey, action, {
      successMessage,
      onSuccess: async () => {
        await Promise.resolve(refetch())
      },
    })

  return {
    state: {
      newCategoryName,
      editingId,
      renameDraft,
      pendingAction,
      categories,
      categoryCount,
    },
    actions: {
      refresh: async () => {
        await Promise.resolve(refetch())
      },
      setNewCategoryName,
      setRenameDraft,
      startRename: (categoryId, name) => {
        setEditingId(categoryId)
        setRenameDraft(name)
      },
      cancelRename: () => {
        setEditingId(null)
        setRenameDraft('')
      },
      create: async (event) => {
        event.preventDefault()
        const name = newCategoryName().trim()
        if (!name) {
          toast.error('カテゴリ名を入力してください。')
          return
        }

        const isCreated = await runCategoriesAction(
          'create-category',
          async () => {
            await createCategory({ request: { name } })
          },
          'カテゴリを作成しました。',
        )

        if (isCreated) {
          setNewCategoryName('')
        }
      },
      rename: async (categoryId) => {
        const name = renameDraft().trim()
        if (!name) {
          toast.error('カテゴリ名を入力してください。')
          return
        }

        const isRenamed = await runCategoriesAction(
          'rename-category',
          () =>
            renameCategory({
              identity: { categoryId },
              request: { name },
            }),
          'カテゴリ名を更新しました。',
        )

        if (isRenamed) {
          setEditingId(null)
          setRenameDraft('')
        }
      },
      remove: async (category) => {
        const confirmed = await modal.confirm({
          title: 'カテゴリを削除しますか？',
          message: `${category.name} を削除します。\nこのカテゴリに紐づく活動データも一緒に削除されます（Cascade）。`,
          confirmText: '削除する',
          cancelText: 'キャンセル',
        })

        if (!confirmed) {
          return
        }

        await runCategoriesAction(
          'delete-category',
          () =>
            deleteCategory({
              identity: { categoryId: category.id },
            }),
          'カテゴリを削除しました。',
        )
      },
    },
  }
}
