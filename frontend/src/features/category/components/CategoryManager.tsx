import type { CategoryResponseDto } from '@/generated/types'
import CategoryColorPicker, {
  CATEGORY_DEFAULT_COLOR,
} from '@/features/category/components/CategoryColorPicker'
import { categoryFormSchema, type CategoryFormValues } from '@/features/category/categoryFormSchema'
import AsyncButton from '@/lib/ui/components/AsyncButton'
import EmptyState from '@/lib/ui/components/EmptyState'
import FormField from '@/lib/ui/components/FormField'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { PencilIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/solid'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

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
  const [editingId, setEditingId] = useState<string | null>(null)
  const createForm = useForm<CategoryFormValues>({
    resolver: valibotResolver(categoryFormSchema),
    defaultValues: { name: '', color: CATEGORY_DEFAULT_COLOR },
  })
  const editForm = useForm<CategoryFormValues>({ resolver: valibotResolver(categoryFormSchema) })

  const create = async ({ name, color }: CategoryFormValues) => {
    if (await onCreate(name, color)) createForm.reset()
  }

  const rename = async ({ name, color }: CategoryFormValues, categoryId: string) => {
    if (await onRename(categoryId, name, color)) setEditingId(null)
  }

  return (
    <div className="grid gap-6">
      <section className="card border border-base-200 bg-base-100 shadow-sm">
        <div className="card-body">
          <h2 className="card-title text-lg">カテゴリを追加</h2>
          <form
            className="mt-2 grid max-w-xl gap-4"
            onSubmit={createForm.handleSubmit(create)}
          >
            <FormField label="カテゴリ名" error={createForm.formState.errors.name?.message}>
              <input
                className="input input-bordered w-full"
                maxLength={100}
                placeholder="例：開発、勉強、休憩"
                {...createForm.register('name')}
              />
            </FormField>
            <CategoryColorPicker
              color={createForm.watch('color')}
              onChange={(color) => createForm.setValue('color', color, { shouldValidate: true })}
            />
            <AsyncButton
              type="submit"
              className="btn-primary justify-self-start"
              loading={pendingAction === 'create'}
            >
              <PlusIcon className="h-4 w-4" />
              追加
            </AsyncButton>
          </form>
        </div>
      </section>

      <section className="card border border-base-200 bg-base-100 shadow-sm">
        <div className="card-body">
          <div className="flex items-center justify-between gap-3">
            <h2 className="card-title text-lg">カテゴリ一覧</h2>
            <span className="badge badge-outline">{categories.length} 件</span>
          </div>
          {categories.length > 0 ? (
            <div className="h-80 overflow-y-auto pr-1">
              <ul className="divide-y divide-base-200">
                {categories.map((category) => (
                  <li key={category.id} className="py-3 first:pt-1 last:pb-0">
                    {editingId === category.id ? (
                      <form
                        className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end"
                        onSubmit={editForm.handleSubmit((form) => rename(form, category.id))}
                      >
                        <div className="grid gap-3">
                          <input
                            autoFocus
                            className="input input-bordered input-sm min-w-0"
                            maxLength={100}
                            aria-invalid={Boolean(editForm.formState.errors.name)}
                            {...editForm.register('name')}
                          />
                          <CategoryColorPicker
                            color={editForm.watch('color')}
                            onChange={(color) =>
                              editForm.setValue('color', color, { shouldValidate: true })
                            }
                          />
                        </div>
                        <div className="flex gap-2">
                          <AsyncButton
                            type="submit"
                            className="btn-primary btn-sm"
                            loading={pendingAction === 'rename'}
                          >
                            保存
                          </AsyncButton>
                          <button
                            type="button"
                            className="btn btn-ghost btn-sm"
                            onClick={() => {
                              setEditingId(null)
                              editForm.reset()
                            }}
                          >
                            戻る
                          </button>
                        </div>
                      </form>
                    ) : (
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
                            onClick={() => {
                              setEditingId(category.id)
                              editForm.reset({ name: category.name, color: category.color })
                            }}
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
                    )}
                    {editingId === category.id && editForm.formState.errors.name?.message ? (
                      <p className="mt-1 text-sm text-error">
                        {editForm.formState.errors.name.message}
                      </p>
                    ) : null}
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
    </div>
  )
}

export default CategoryManager
