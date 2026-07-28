import ActiveActivityCard from '@/features/activity/components/ActiveActivityCard'
import ActivityTimeline from '@/features/activity/components/ActivityTimeline'
import CompletedActivityDialog from '@/features/activity/components/CompletedActivityDialog'
import DailySummary from '@/features/activity/components/DailySummary'
import EditActiveActivityDialog from '@/features/activity/components/EditActiveActivityDialog'
import StartActivityForm from '@/features/activity/components/StartActivityForm'
import { useActivityDashboard } from '@/features/activity/hooks/useActivityDashboard'
import type { ActivityResponseDto } from '@/generated/types'
import { formatToday } from '@/lib/activity/date'
import { showDialog } from '@/lib/ui/components/Dialog'
import EmptyState from '@/lib/ui/components/EmptyState'
import { LoadingState } from '@/lib/ui/components/Feedback'
import PageHeader from '@/lib/ui/components/PageHeader'
import SegmentedTabs from '@/lib/ui/components/SegmentedTabs'
import { PlusIcon } from '@heroicons/react/24/solid'
import { useState } from 'react'
import { Link } from 'react-router-dom'

type HomeTab = 'current' | 'timeline' | 'summary'

const homeTabs = [
  { value: 'current', label: '現在の記録' },
  { value: 'timeline', label: 'タイムライン' },
  { value: 'summary', label: '今日の記録時間' },
] as const

const IndexPage = () => {
  const { state, actions } = useActivityDashboard()
  const [selectedActivity, setSelectedActivity] = useState<ActivityResponseDto | null>(null)
  const [isCompletedDialogOpen, setIsCompletedDialogOpen] = useState(false)
  const [isActiveEditorOpen, setIsActiveEditorOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<HomeTab>('current')

  const openAddDialog = () => {
    setSelectedActivity(null)
    setIsCompletedDialogOpen(true)
  }

  const openEditDialog = (activity: ActivityResponseDto) => {
    setSelectedActivity(activity)
    setIsCompletedDialogOpen(true)
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
        title={formatToday()}
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
          action={
            <Link to="/categories" className="btn btn-primary">
              カテゴリを管理する
            </Link>
          }
        />
      ) : (
        <>
          <section className="flex flex-col gap-4" aria-label="今日の記録の詳細">
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
                onClick={openAddDialog}
                disabled={isPending}
              >
                <PlusIcon className="h-4 w-4" />
                <span className="hidden sm:inline">手動で記録を追加</span>
                <span className="sm:hidden">追加</span>
              </button>
            </div>
            <div className="h-112 sm:h-120" role="tabpanel">
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
                      onEditorOpen={() => setIsActiveEditorOpen(true)}
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
                  onEdit={openEditDialog}
                  onEditActive={() => setIsActiveEditorOpen(true)}
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

      <CompletedActivityDialog
        activity={selectedActivity}
        categories={state.categories}
        open={isCompletedDialogOpen}
        isSubmitting={state.pendingAction === 'save-completed'}
        date={state.activityState.date}
        createForm={actions.completedFormFor}
        onClose={() => setIsCompletedDialogOpen(false)}
        onSave={actions.saveCompleted}
      />
      {state.activityState.activeActivity ? (
        <EditActiveActivityDialog
          activity={state.activityState.activeActivity}
          categories={state.categories}
          open={isActiveEditorOpen}
          isSubmitting={state.pendingAction === 'save-active'}
          createForm={actions.activeFormFor}
          onClose={() => setIsActiveEditorOpen(false)}
          onSave={actions.saveActive}
        />
      ) : null}
    </div>
  )
}

export default IndexPage
