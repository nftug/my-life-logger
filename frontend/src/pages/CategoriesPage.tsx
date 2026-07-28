import type { CategoryResponseDto } from '@/generated/types'
import CategoryManager from '@/features/category/components/CategoryManager'
import { useCategories } from '@/features/category/hooks/useCategories'
import { showDialog } from '@/lib/ui/components/Dialog'
import { ErrorAlert, LoadingState } from '@/lib/ui/components/Feedback'
import PageHeader from '@/lib/ui/components/PageHeader'

const CategoriesPage = () => {
  const { state, actions } = useCategories()

  const confirmDelete = async (category: CategoryResponseDto) => {
    const result = await showDialog<'delete'>({
      title: 'カテゴリを削除しますか？',
      message: `「${category.name}」に紐づく活動データも一緒に削除されます。`,
      buttons: [
        { label: '戻る', value: 'cancel', variant: 'ghost' },
        { label: '削除する', value: 'delete', variant: 'error' },
      ],
    })
    if (result === 'delete') await actions.delete(category.id)
  }

  if (state.isLoading) return <LoadingState />

  return (
    <div className="page-content">
      <PageHeader
        eyebrow="SETUP"
        title="カテゴリ"
        description="よく使う活動を登録して、記録をスムーズに始めましょう。"
      />
      {state.error ? <ErrorAlert message={state.error} onRetry={actions.refresh} /> : null}
      {state.notice ? (
        <div className="toast toast-top toast-end z-50" role="status">
          <div className="alert alert-success">
            <span>{state.notice}</span>
          </div>
        </div>
      ) : null}
      <CategoryManager
        categories={state.categories}
        pendingAction={state.pendingAction}
        onCreate={actions.create}
        onRename={actions.rename}
        onDelete={(category) => void confirmDelete(category)}
      />
    </div>
  )
}

export default CategoriesPage
