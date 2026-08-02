import ActiveActivityCard from '@/features/activity/components/ActiveActivityCard'
import ActivityTimeline from '@/features/activity/components/ActivityTimeline'
import CompletedActivityDialogCall from '@/features/activity/components/CompletedActivityDialogCall'
import DailySummary from '@/features/activity/components/DailySummary'
import EditActiveActivityDialogCall from '@/features/activity/components/EditActiveActivityDialogCall'
import StartActivityForm from '@/features/activity/components/StartActivityForm'
import { useActivityDashboard } from '@/features/activity/hooks/useActivityDashboard'
import type { ActivityResponseDto } from '@/generated/types'
import { formatDate } from '@/lib/activity/date'
import { currentDateAtom } from '@/lib/state/currentDate'
import { showDialog } from '@/lib/ui/components/Dialog'
import EmptyState from '@/lib/ui/components/EmptyState'
import { LoadingState } from '@/lib/ui/components/Feedback'
import PageHeader from '@/lib/ui/components/PageHeader'
import SegmentedTabs from '@/lib/ui/components/SegmentedTabs'
import { PlusIcon } from '@heroicons/react/24/solid'
import { useState } from 'react'
import { useAtomValue } from 'jotai'
import { Link } from 'react-router-dom'

type HomeTab = 'current' | 'timeline' | 'summary'

const homeTabs = [
  { value: 'current', label: '現在の記録' },
  { value: 'timeline', label: 'タイムライン' },
  { value: 'summary', label: '今日の記録時間' },
] as const

const IndexPage = () => {
  const currentDate = useAtomValue(currentDateAtom)
  const { state, actions } = useActivityDashboard(currentDate)
  const [activeTab, setActiveTab] = useState<HomeTab>('current')

  const openAddDialog = () =>
    CompletedActivityDialogCall.call({
      activity: null,
      categories: state.categories,
      date: state.activityState.date,
      createForm: actions.completedFormFor,
      onSave: actions.saveCompleted,
    })

  const openEditDialog = (activity: ActivityResponseDto) =>
    CompletedActivityDialogCall.call({
      activity,
      categories: state.categories,
      date: state.activityState.date,
      createForm: actions.completedFormFor,
      onSave: actions.saveCompleted,
    })

  const openActiveEditor = () => {
    const activity = state.activityState.activeActivity
    if (!activity) return
    void EditActiveActivityDialogCall.call({
      activity,
      categories: state.categories,
      createForm: actions.activeFormFor,
      onSave: actions.saveActive,
    })
  }

  const confirmStop = async () => {
    const result = await showDialog<'stop'>({
      title: '活動を停止しますか？',
      message: '停止すると、現在時刻までの記録として保存されます。',
      buttons: [
        { label: '戻る', value: 'cancel', variant: 'ghost' },
        { label: '停止して保存', value: 'stop', variant: 'primary' },
      ],
    })
    if (result === 'stop') return actions.stop()
    return false
  }

  const confirmCancel = async () => {
    const result = await showDialog<'cancel'>({
      title: '活動をキャンセルしますか？',
      message: '進行中の記録は保存されません。',
      buttons: [
        { label: '戻る', value: 'back', variant: 'ghost' },
        { label: 'キャンセルする', value: 'cancel', variant: 'error' },
      ],
    })
    if (result === 'cancel') return actions.cancel()
    return false
  }

  const confirmDelete = async (activity: ActivityResponseDto) => {
    const result = await showDialog<'delete'>({
      title: 'この記録を削除しますか？',
      message: `${activity.category.name}の記録は削除後に元に戻せません。`,
      buttons: [
        { label: '戻る', value: 'cancel', variant: 'ghost' },
        { label: '削除する', value: 'delete', variant: 'error' },
      ],
    })
    if (result === 'delete') await actions.deleteCompleted(activity.id)
  }

  if (state.isLoading) return <LoadingState />

  const hasCategories = state.categories.length > 0
  const isPending = state.pendingAction !== null
  return (
    <div className="page-content">
      <PageHeader
        eyebrow="TODAY"
        title={formatDate(currentDate)}
        description="活動を記録して、今日の流れを振り返りましょう。"
      />

      {state.notice ? (
        <div className={`toast toast-top toast-end z-50`} role="status">
          <div
            className={`alert ${state.notice.tone === 'success' ? 'alert-success' : 'alert-error'}`}
          >
            <span>{state.notice.message}</span>
            <button
              type="button"
              className="btn btn-ghost btn-xs"
              onClick={actions.clearNotice}
              aria-label="通知を閉じる"
            >
              ×
            </button>
          </div>
        </div>
      ) : null}

      {!hasCategories ? (
        <EmptyState
          title="まずはカテゴリを作りましょう"
          description="活動を記録するにはカテゴリが必要です。たとえば「開発」「勉強」「休憩」などから始めるのがおすすめです。"
          className="flex min-h-0 flex-1 flex-col items-center justify-center"
          action={
            <Link to="/categories" className="btn btn-primary">
              カテゴリを管理する
            </Link>
          }
        />
      ) : (
        <>
          <section className="flex min-h-0 flex-1 flex-col gap-4" aria-label="今日の記録の詳細">
            <div className="flex items-center justify-between gap-3">
              <SegmentedTabs
                ariaLabel="今日の記録の表示を切り替え"
                tabs={[...homeTabs]}
                value={activeTab}
                onChange={setActiveTab}
              />
              <button
                type="button"
                className="btn btn-outline btn-sm shrink-0"
                onClick={() => void openAddDialog()}
                disabled={isPending}
              >
                <PlusIcon className="h-4 w-4" />
                <span className="hidden sm:inline">手動で記録を追加</span>
                <span className="sm:hidden">追加</span>
              </button>
            </div>
            <div className="min-h-0 flex-1" role="tabpanel">
              {activeTab === 'current' ? (
                <div className="h-full overflow-y-auto pr-1">
                  {state.activityState.activeActivity ? (
                    <ActiveActivityCard
                      activity={state.activityState.activeActivity}
                      durationSeconds={
                        state.activeDurationSeconds ??
                        state.activityState.activeActivity.durationSeconds
                      }
                      isSubmitting={isPending}
                      onStop={confirmStop}
                      onCancel={confirmCancel}
                      onEditorOpen={openActiveEditor}
                    />
                  ) : (
                    <StartActivityForm
                      categories={state.categories}
                      isSubmitting={state.pendingAction === 'start'}
                      onSubmit={actions.start}
                    />
                  )}
                </div>
              ) : activeTab === 'timeline' ? (
                <ActivityTimeline
                  activities={state.allActivities}
                  activeDurationSeconds={state.activeDurationSeconds}
                  onEdit={(activity) => void openEditDialog(activity)}
                  onEditActive={openActiveEditor}
                  onCancelActive={() => void confirmCancel()}
                  onDelete={(activity) => void confirmDelete(activity)}
                />
              ) : (
                <DailySummary
                  activities={state.allActivities}
                  activeDurationSeconds={state.activeDurationSeconds}
                  totalSeconds={state.totalSeconds}
                />
              )}
            </div>
          </section>
        </>
      )}

      <CompletedActivityDialogCall.Root />
      <EditActiveActivityDialogCall.Root />
    </div>
  )
}

export default IndexPage
