import ActivityEditorForm from '@/lib/ui/dashboard/ActivityEditorForm'
import type { DashboardSectionProps } from '@/lib/ui/dashboard/types'
import { Show } from 'solid-js'

const CompletedActivityModal = (props: DashboardSectionProps) => (
  <Show when={props.model.state.completedModal()}>
    {(modalStateAccessor) => {
      const modalState = modalStateAccessor()

      return (
        <div class="modal modal-open">
          <div class="modal-box max-w-2xl">
            <h3 class="text-lg font-semibold">
              {modalState.mode === 'create' ? '完了活動を追加' : '完了活動を編集'}
            </h3>
            <form class="mt-4 space-y-3" onSubmit={(event) => void props.model.actions.saveCompleted(event)}>
              <ActivityEditorForm
                categories={props.model.state.categories() ?? []}
                categoryId={modalState.form.categoryId}
                startedAtLocal={modalState.form.startedAtLocal}
                endedAtLocal={modalState.form.endedAtLocal}
                description={modalState.form.description}
                descriptionPlaceholder="完了した活動のメモ"
                onCategoryIdChange={(value) => props.model.actions.setCompletedForm({ categoryId: value })}
                onStartedAtChange={(value) => props.model.actions.setCompletedForm({ startedAtLocal: value })}
                onEndedAtChange={(value) => props.model.actions.setCompletedForm({ endedAtLocal: value })}
                onDescriptionChange={(value) => props.model.actions.setCompletedForm({ description: value })}
              />

              <Show when={!props.model.state.isTodaySelected()}>
                <div class="alert alert-warning">
                  過去日の保存・削除は未対応です。入力内容は保持できますが保存はできません。
                </div>
              </Show>
              <div class="modal-action">
                <button type="button" class="btn" onClick={props.model.actions.closeCompletedModal}>
                  閉じる
                </button>
                <button
                  type="submit"
                  class="btn btn-primary"
                  disabled={props.model.state.pendingAction() !== null || !props.model.state.isTodaySelected()}
                >
                  保存
                </button>
              </div>
            </form>
          </div>
          <div class="modal-backdrop">
            <button type="button" onClick={props.model.actions.closeCompletedModal}>
              close
            </button>
          </div>
        </div>
      )
    }}
  </Show>
)

export default CompletedActivityModal
