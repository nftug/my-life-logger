import ActivityTimeline from '@/features/activity/components/ActivityTimeline'
import CompletedActivityDialogCall from '@/features/activity/components/CompletedActivityDialogCall'
import DailySummary from '@/features/activity/components/DailySummary'
import { useActivityDashboard } from '@/features/activity/hooks/useActivityDashboard'
import type { ActivityResponseDto } from '@/generated/types'
import { formatDate, yesterdayDate } from '@/lib/activity/date'
import { showDialog } from '@/lib/ui/components/Dialog'
import EmptyState from '@/lib/ui/components/EmptyState'
import { LoadingState } from '@/lib/ui/components/Feedback'
import PageHeader from '@/lib/ui/components/PageHeader'
import SegmentedTabs from '@/lib/ui/components/SegmentedTabs'
import { PlusIcon } from '@heroicons/react/24/solid'
import { useCallback, useState } from 'react'

type HistoryTab = 'timeline' | 'summary'

const historyTabs = [
  { value: 'timeline', label: 'タイムライン' },
  { value: 'summary', label: '記録時間' },
] as const

const HistoryPage = () => {
  const [selectedDate, setSelectedDate] = useState(yesterdayDate)
  const [activeTab, setActiveTab] = useState<HistoryTab>('timeline')
  const { state, actions } = useActivityDashboard(selectedDate)
  const { completedFormFor } = actions
  const dateLabel = formatDate(selectedDate)

  const completedFormForSelectedDate = useCallback(
    (activity?: ActivityResponseDto) => completedFormFor(activity, selectedDate),
    [completedFormFor, selectedDate],
  )

  const openAddDialog = () =>
    CompletedActivityDialogCall.call({
      activity: null,
      categories: state.categories,
      date: selectedDate,
      dateLabel,
      createForm: completedFormForSelectedDate,
      onSave: actions.saveCompleted,
    })

  const openEditDialog = (activity: ActivityResponseDto) =>
    CompletedActivityDialogCall.call({
      activity,
      categories: state.categories,
      date: selectedDate,
      dateLabel,
      createForm: completedFormForSelectedDate,
      onSave: actions.saveCompleted,
    })

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

  const isPending = state.pendingAction !== null
  return (
    <div className="page-content">
      <PageHeader
        eyebrow="HISTORY"
        title={`${dateLabel}の記録`}
        description="日付を選んで、保存済みの活動を編集・削除できます。"
      />

      {state.notice ? (
        <div className="toast toast-top toast-end z-50" role="status">
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

      <section className="flex min-h-0 flex-1 flex-col gap-4" aria-label="過去の記録の詳細">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <SegmentedTabs
            ariaLabel="過去の記録の表示を切り替え"
            tabs={[...historyTabs]}
            value={activeTab}
            onChange={setActiveTab}
          />
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <label className="form-control w-full sm:w-auto">
              <span className="sr-only">表示する日付</span>
              <input
                type="date"
                className="input input-bordered w-full sm:w-48"
                value={selectedDate}
                max={yesterdayDate()}
                onChange={(event) => {
                  if (event.target.value) setSelectedDate(event.target.value)
                }}
              />
            </label>
            <button
              type="button"
              className="btn btn-outline w-full shrink-0 sm:w-auto"
              onClick={() => void openAddDialog()}
              disabled={isPending || state.categories.length === 0}
            >
              <PlusIcon className="h-4 w-4" />
              記録を追加
            </button>
          </div>
        </div>
        <div className="min-h-0 flex-1" role="tabpanel">
          {activeTab === 'timeline' ? (
            state.allActivities.length > 0 ? (
              <ActivityTimeline
                activities={state.allActivities}
                activeDurationSeconds={state.activeDurationSeconds}
                title={`${dateLabel}のタイムライン`}
                onEdit={(activity) => void openEditDialog(activity)}
                onEditActive={() => undefined}
                onCancelActive={() => undefined}
                onDelete={(activity) => void confirmDelete(activity)}
              />
            ) : (
              <EmptyState
                title="この日の記録はありません"
                description="別の日付を選ぶと、その日の記録を確認・編集できます。"
                className="flex h-full min-h-0 flex-col items-center justify-center"
              />
            )
          ) : (
            <DailySummary
              activities={state.allActivities}
              activeDurationSeconds={state.activeDurationSeconds}
              totalSeconds={state.totalSeconds}
              title={`${dateLabel}の記録時間`}
            />
          )}
        </div>
      </section>

      <CompletedActivityDialogCall.Root />
    </div>
  )
}

export default HistoryPage
