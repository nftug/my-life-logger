import type { CategoryResponseDto } from '@/generated/types'
import ActivityEditorForm from '@/lib/ui/dashboard/ActivityEditorForm'
import type { DashboardViewModel } from '@/lib/ui/dashboard/types'
import { createMemo, Show } from 'solid-js'

interface ActivityEditorModalFrameProps {
  open: boolean
  title: string
  onClose: () => void
  onSave: (event: Event) => void
  saveDisabled?: boolean
  categories: CategoryResponseDto[]
  categoryId: string
  startedAtLocal: string
  endedAtLocal?: string
  description: string
  descriptionPlaceholder: string
  showStartedAt?: boolean
  onCategoryIdChange: (value: string) => void
  onStartedAtChange: (value: string) => void
  onEndedAtChange?: (value: string) => void
  onDescriptionChange: (value: string) => void
  warningMessage?: string
}

interface ActivityEditorModalProps {
  model: DashboardViewModel
}

type EditorConfig = Omit<ActivityEditorModalFrameProps, 'open'>

const ActivityEditorModalFrame = (props: ActivityEditorModalFrameProps) => (
  <Show when={props.open}>
    <div class="modal modal-open">
      <div class="modal-box max-w-2xl">
        <h3 class="text-lg font-semibold">{props.title}</h3>
        <form class="mt-4 space-y-3" onSubmit={(event) => props.onSave(event)}>
          <ActivityEditorForm
            categories={props.categories}
            categoryId={props.categoryId}
            startedAtLocal={props.startedAtLocal}
            endedAtLocal={props.endedAtLocal}
            description={props.description}
            descriptionPlaceholder={props.descriptionPlaceholder}
            showStartedAt={props.showStartedAt}
            onCategoryIdChange={props.onCategoryIdChange}
            onStartedAtChange={props.onStartedAtChange}
            onEndedAtChange={props.onEndedAtChange}
            onDescriptionChange={props.onDescriptionChange}
          />
          <Show when={props.warningMessage}>
            <div class="alert alert-warning">{props.warningMessage}</div>
          </Show>
          <div class="modal-action">
            <button type="button" class="btn" onClick={() => props.onClose()}>
              閉じる
            </button>
            <button type="submit" class="btn btn-primary" disabled={props.saveDisabled ?? false}>
              保存
            </button>
          </div>
        </form>
      </div>
      <div class="modal-backdrop">
        <button type="button" onClick={() => props.onClose()}>
          close
        </button>
      </div>
    </div>
  </Show>
)

const ActivityEditorModal = (props: ActivityEditorModalProps) => {
  const editorConfig = createMemo<EditorConfig | null>(() => {
    const categories = props.model.state.categories() ?? []
    const isLocked = props.model.state.isSelectedDateLocked()

    const completedModal = props.model.state.completedModal()
    if (completedModal) {
      return {
        title: completedModal.mode === 'create' ? '完了活動を追加' : '完了活動を編集',
        onClose: props.model.actions.closeCompletedModal,
        onSave: (event) => {
          void props.model.actions.saveCompleted(event)
        },
        saveDisabled: isLocked,
        categories,
        categoryId: completedModal.form.categoryId,
        startedAtLocal: completedModal.form.startedAtLocal,
        endedAtLocal: completedModal.form.endedAtLocal,
        description: completedModal.form.description,
        descriptionPlaceholder: '完了した活動のメモ',
        onCategoryIdChange: (value) => props.model.actions.setCompletedForm({ categoryId: value }),
        onStartedAtChange: (value) => props.model.actions.setCompletedForm({ startedAtLocal: value }),
        onEndedAtChange: (value) => props.model.actions.setCompletedForm({ endedAtLocal: value }),
        onDescriptionChange: (value) => props.model.actions.setCompletedForm({ description: value }),
        warningMessage: props.model.state.isTodaySelected()
          ? undefined
          : '過去日の保存・削除は未対応です。入力内容は保持できますが保存はできません。',
      }
    }

    const active = props.model.state.activityState()?.activeActivity
    if (active && props.model.state.isActiveEditing()) {
      return {
        title: '進行中の活動を編集',
        onClose: () => props.model.actions.setIsActiveEditing(false),
        onSave: (event) => {
          event.preventDefault()
          void props.model.actions.saveActive()
        },
        saveDisabled: isLocked,
        categories,
        categoryId: props.model.state.activeForm().categoryId,
        startedAtLocal: props.model.state.activeForm().startedAtLocal,
        description: props.model.state.activeForm().description,
        descriptionPlaceholder: '何をしているか簡単にメモできます',
        onCategoryIdChange: (value) => props.model.actions.setActiveForm({ categoryId: value }),
        onStartedAtChange: (value) => props.model.actions.setActiveForm({ startedAtLocal: value }),
        onDescriptionChange: (value) => props.model.actions.setActiveForm({ description: value }),
        warningMessage: props.model.state.isTodaySelected()
          ? undefined
          : '過去日の保存は未対応です。入力内容は保持できますが保存はできません。',
      }
    }

    return null
  })

  return (
    <Show when={editorConfig()}>
      {(configAccessor) => {
        const config = configAccessor()
        return <ActivityEditorModalFrame open {...config} />
      }}
    </Show>
  )
}

export default ActivityEditorModal
