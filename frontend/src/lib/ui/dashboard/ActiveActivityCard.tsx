import ActivityEditorForm from '@/lib/ui/dashboard/ActivityEditorForm'
import { formatDuration, formatTimeLabel } from '@/lib/ui/dashboard/utils/formatters'
import type { DashboardSectionProps } from '@/lib/ui/dashboard/types'
import { Show } from 'solid-js'

const ActiveActivityCard = (props: DashboardSectionProps) => (
  <div class="card border border-base-300 bg-base-100 shadow-sm">
    <div class="card-body gap-4">
      <div class="flex items-center justify-between">
        <h2 class="card-title text-lg">アクティブ活動</h2>
        <Show when={props.model.state.resolvedDurationSeconds() !== null}>
          <div class="badge badge-primary badge-lg font-mono">
            {formatDuration(props.model.state.resolvedDurationSeconds() ?? 0)}
          </div>
        </Show>
      </div>

      <Show
        when={props.model.state.activityState()?.activeActivity}
        fallback={
          <form class="space-y-3" onSubmit={(event) => void props.model.actions.startActivity(event)}>
            <ActivityEditorForm
              categories={props.model.state.categories() ?? []}
              categoryId={props.model.state.activeForm().categoryId}
              startedAtLocal={props.model.state.activeForm().startedAtLocal}
              description={props.model.state.activeForm().description}
              descriptionPlaceholder="何をしているか簡単にメモできます"
              onCategoryIdChange={(value) => props.model.actions.setActiveForm({ categoryId: value })}
              onStartedAtChange={(value) => props.model.actions.setActiveForm({ startedAtLocal: value })}
              onDescriptionChange={(value) => props.model.actions.setActiveForm({ description: value })}
            />

            <div class="flex flex-wrap items-center gap-2">
              <button
                type="submit"
                class="btn btn-primary"
                disabled={
                  props.model.state.pendingAction() !== null ||
                  !props.model.state.hasCategories() ||
                  !props.model.state.isTodaySelected() ||
                  !props.model.state.activeForm().categoryId
                }
              >
                活動を開始
              </button>
              <Show when={!props.model.state.isTodaySelected()}>
                <span class="text-sm text-warning">過去日の開始は未対応です。</span>
              </Show>
            </div>
          </form>
        }
      >
        {(active) => (
          <div class="space-y-3">
            <Show
              when={props.model.state.isActiveEditing()}
              fallback={
                <button
                  type="button"
                  class="w-full rounded-box border border-base-300 p-0 text-left transition hover:border-base-content/40"
                  onClick={() => props.model.actions.setIsActiveEditing(true)}
                >
                  <div class="flex items-center justify-between border-b border-base-300 px-4 py-3">
                    <span class="text-sm text-base-content/70">カテゴリ</span>
                    <span class="font-medium">{active().category.name}</span>
                  </div>
                  <div class="flex items-center justify-between border-b border-base-300 px-4 py-3">
                    <span class="text-sm text-base-content/70">開始時刻</span>
                    <span class="font-mono">{formatTimeLabel(active().startedAt)}</span>
                  </div>
                  <div class="flex items-center justify-between px-4 py-3">
                    <span class="text-sm text-base-content/70">メモ</span>
                    <span class="max-w-[70%] truncate text-right">{active().description || '-'}</span>
                  </div>
                </button>
              }
            >
              <ActivityEditorForm
                categories={props.model.state.categories() ?? []}
                categoryId={props.model.state.activeForm().categoryId}
                startedAtLocal={props.model.state.activeForm().startedAtLocal}
                description={props.model.state.activeForm().description}
                descriptionPlaceholder="何をしているか簡単にメモできます"
                onCategoryIdChange={(value) => props.model.actions.setActiveForm({ categoryId: value })}
                onStartedAtChange={(value) => props.model.actions.setActiveForm({ startedAtLocal: value })}
                onDescriptionChange={(value) => props.model.actions.setActiveForm({ description: value })}
              />
            </Show>

            <div class="flex flex-wrap items-center gap-2">
              <Show when={props.model.state.isActiveEditing()}>
                <button
                  type="button"
                  class="btn btn-primary"
                  onClick={() => void props.model.actions.saveActive()}
                  disabled={props.model.state.pendingAction() !== null || !props.model.state.isTodaySelected()}
                >
                  編集を保存
                </button>
                <button
                  type="button"
                  class="btn"
                  onClick={() => props.model.actions.setIsActiveEditing(false)}
                  disabled={props.model.state.pendingAction() !== null}
                >
                  編集をやめる
                </button>
              </Show>

              <button
                type="button"
                class="btn btn-outline"
                onClick={() => void props.model.actions.confirmActiveAction('stop')}
                disabled={props.model.state.pendingAction() !== null || !props.model.state.isTodaySelected()}
              >
                停止
              </button>
              <button
                type="button"
                class="btn btn-ghost"
                onClick={() => void props.model.actions.confirmActiveAction('cancel')}
                disabled={props.model.state.pendingAction() !== null || !props.model.state.isTodaySelected()}
              >
                キャンセル
              </button>
              <Show when={!props.model.state.isTodaySelected()}>
                <span class="text-sm text-warning">過去日の編集保存は未対応です。</span>
              </Show>
            </div>
          </div>
        )}
      </Show>
    </div>
  </div>
)

export default ActiveActivityCard
