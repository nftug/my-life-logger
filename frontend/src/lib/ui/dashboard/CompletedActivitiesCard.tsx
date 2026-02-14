import type { DashboardSectionProps } from '@/lib/ui/dashboard/types'
import { formatDuration, formatTimeLabel } from '@/lib/ui/dashboard/utils/formatters'
import { For, Show } from 'solid-js'

const CompletedActivitiesCard = (props: DashboardSectionProps) => (
  <div class="card border border-base-300 bg-base-100 shadow-sm">
    <div class="card-body gap-4">
      <div class="flex flex-wrap items-center justify-between gap-2">
        <h2 class="card-title text-lg">完了活動</h2>
        <button
          type="button"
          class="btn btn-primary btn-sm"
          onClick={() => props.model.actions.openCreateCompletedModal()}
          disabled={
            props.model.state.isActionPending() ||
            !props.model.state.hasCategories() ||
            !props.model.state.isTodaySelected()
          }
        >
          完了活動を追加
        </button>
      </div>
      <div class="overflow-x-auto">
        <table class="table table-zebra">
          <thead>
            <tr>
              <th>カテゴリ</th>
              <th>開始</th>
              <th>終了</th>
              <th>時間</th>
              <th>メモ</th>
              <th class="text-right">操作</th>
            </tr>
          </thead>
          <tbody>
            <Show
              when={(props.model.state.activityState()?.completedActivities.length ?? 0) > 0}
              fallback={
                <tr>
                  <td colspan={6} class="text-center text-base-content/70">
                    完了活動はまだありません。
                  </td>
                </tr>
              }
            >
              <For each={props.model.state.activityState()?.completedActivities ?? []}>
                {(activity) => (
                  <tr>
                    <td>{activity.category.name}</td>
                    <td class="font-mono">{formatTimeLabel(activity.startedAt)}</td>
                    <td class="font-mono">{activity.endedAt ? formatTimeLabel(activity.endedAt) : '-'}</td>
                    <td class="font-mono">{formatDuration(activity.durationSeconds)}</td>
                    <td>{activity.description || '-'}</td>
                    <td>
                      <div class="flex justify-end gap-2">
                        <button
                          type="button"
                          class="btn btn-xs"
                          onClick={() => props.model.actions.openEditCompletedModal(activity)}
                          disabled={props.model.state.isActionPending()}
                        >
                          編集
                        </button>
                        <button
                          type="button"
                          class="btn btn-error btn-xs btn-outline"
                          onClick={() => void props.model.actions.deleteCompleted(activity)}
                          disabled={props.model.state.isActionPending()}
                        >
                          削除
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </For>
            </Show>
          </tbody>
        </table>
      </div>
    </div>
  </div>
)

export default CompletedActivitiesCard
