import type { CategoryResponseDto } from '@/generated/types'
import AsyncButton from '@/lib/ui/components/AsyncButton'
import EmptyState from '@/lib/ui/components/EmptyState'
import FormField from '@/lib/ui/components/FormField'
import { PencilIcon, TrashIcon } from '@heroicons/react/24/solid'
import { useState, type FormEvent } from 'react'

interface CategoryManagerProps {
  categories: CategoryResponseDto[]
  pendingAction: string | null
  onCreate: (name: string) => Promise<boolean>
  onRename: (categoryId: string, name: string) => Promise<boolean>
  onDelete: (category: CategoryResponseDto) => void
}

const CategoryManager = ({
  categories,
  pendingAction,
  onCreate,
  onRename,
  onDelete,
}: CategoryManagerProps) => {
  const [newName, setNewName] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')

  const create = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (await onCreate(newName)) setNewName('')
  }

  const rename = async (event: FormEvent<HTMLFormElement>, categoryId: string) => {
    event.preventDefault()
    if (await onRename(categoryId, editingName)) setEditingId(null)
  }

  return (
    <div className="grid gap-6">
      <section className="card border border-base-200 bg-base-100 shadow-sm">
        <div className="card-body">
          <h2 className="card-title text-lg">カテゴリを追加</h2>
          <form className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-end" onSubmit={create}>
            <FormField label="カテゴリ名">
              <input
                className="input input-bordered w-full"
                value={newName}
                maxLength={100}
                placeholder="例：開発、勉強、休憩"
                onChange={(event) => setNewName(event.currentTarget.value)}
              />
            </FormField>
            <AsyncButton type="submit" className="btn-primary" loading={pendingAction === 'create'}>
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
            <ul className="divide-y divide-base-200">
              {categories.map((category) => (
                <li key={category.id} className="py-3 first:pt-1 last:pb-0">
                  {editingId === category.id ? (
                    <form
                      className="flex gap-2"
                      onSubmit={(event) => void rename(event, category.id)}
                    >
                      <input
                        autoFocus
                        className="input input-bordered input-sm min-w-0 flex-1"
                        value={editingName}
                        maxLength={100}
                        onChange={(event) => setEditingName(event.currentTarget.value)}
                      />
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
                        onClick={() => setEditingId(null)}
                      >
                        戻る
                      </button>
                    </form>
                  ) : (
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-medium">{category.name}</span>
                      <div className="flex gap-1">
                        <button
                          type="button"
                          className="btn btn-ghost btn-square btn-sm"
                          aria-label={`${category.name}を編集`}
                          onClick={() => {
                            setEditingId(category.id)
                            setEditingName(category.name)
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
                </li>
              ))}
            </ul>
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
