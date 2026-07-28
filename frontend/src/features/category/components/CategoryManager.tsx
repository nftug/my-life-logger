import type { CategoryResponseDto } from '@/generated/types'
import CategoryEditorDialog from '@/features/category/components/CategoryEditorDialog'
import EmptyState from '@/lib/ui/components/EmptyState'
import { PencilIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/solid'
import { useState } from 'react'

interface CategoryManagerProps {
  categories: CategoryResponseDto[]
  pendingAction: string | null
  onCreate: (name: string, color: string) => Promise<boolean>
  onRename: (categoryId: string, name: string, color: string) => Promise<boolean>
  onDelete: (category: CategoryResponseDto) => void
}

const CategoryManager = ({
  categories,
  pendingAction,
  onCreate,
  onRename,
  onDelete,
}: CategoryManagerProps) => {
  const [editingCategory, setEditingCategory] = useState<CategoryResponseDto | null>(null)
  const [isEditorOpen, setIsEditorOpen] = useState(false)

  const openCreateDialog = () => {
    setEditingCategory(null)
    setIsEditorOpen(true)
  }

  const openEditDialog = (category: CategoryResponseDto) => {
    setEditingCategory(category)
    setIsEditorOpen(true)
  }

  const closeEditorDialog = () => {
    setIsEditorOpen(false)
    setEditingCategory(null)
  }

  return (
    <>
      <section className="card border border-base-200 bg-base-100 shadow-sm">
        <div className="card-body">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center">
              <h2 className="card-title text-lg">カテゴリ一覧</h2>
              <span className="badge badge-outline ml-3">{categories.length} 件</span>
            </div>
            <button type="button" className="btn btn-primary btn-sm" onClick={openCreateDialog}>
              <PlusIcon className="h-4 w-4" />
              カテゴリを追加
            </button>
          </div>
          {categories.length > 0 ? (
            <div className="h-80 overflow-y-auto pr-1">
              <ul className="divide-y divide-base-200">
                {categories.map((category) => (
                  <li key={category.id} className="py-3 first:pt-1 last:pb-0">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-2">
                        <span
                          className="h-3 w-3 shrink-0 rounded-full"
                          style={{ backgroundColor: category.color }}
                        />
                        <span className="truncate font-medium">{category.name}</span>
                      </div>
                      <div className="flex gap-1">
                        <button
                          type="button"
                          className="btn btn-ghost btn-square btn-sm"
                          aria-label={`${category.name}を編集`}
                          onClick={() => openEditDialog(category)}
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          className="btn btn-ghost btn-square btn-sm text-error"
                          aria-label={`${category.name}を削除`}
                          disabled={pendingAction !== null}
                          onClick={() => onDelete(category)}
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <EmptyState
              title="カテゴリはまだありません"
              description="よく使う活動を追加すると、すぐに記録を始められます。"
            />
          )}
        </div>
      </section>
      <CategoryEditorDialog
        category={editingCategory}
        open={isEditorOpen}
        isSubmitting={pendingAction === 'create' || pendingAction === 'rename'}
        onClose={closeEditorDialog}
        onCreate={onCreate}
        onRename={onRename}
      />
    </>
  )
}

export default CategoryManager
