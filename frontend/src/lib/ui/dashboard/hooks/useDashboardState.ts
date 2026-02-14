import {
  cancelActiveActivity,
  deleteCompletedActivity,
  getActivityState,
  getAllCategories,
  saveActiveActivity,
  saveCompletedActivity,
  startActivity,
  stopActivity,
} from '@/generated/commands'
import type { ActivityResponseDto } from '@/generated/types'
import type { ActiveActivityFormModel, CompletedActivityModalState } from '@/lib/types/view-model'
import { useModalContext } from '@/lib/ui/components/ModalProvider'
import { useToastContext } from '@/lib/ui/components/ToastProvider'
import { createObjectPatch } from '@/lib/ui/hooks/useObjectPatch'
import { toErrorMessage, useActionRunner } from '@/lib/ui/hooks/useActionRunner'
import {
  getTodayDateString,
  isToday,
  isValidRange,
  shiftDate,
  toLocalInputFromUtcIso,
  toUtcIsoFromLocalInput,
} from '@/lib/utils/datetime'
import type {
  ActiveActionConfirmType,
  DashboardActions,
  DashboardStateModel,
  DashboardViewModel,
} from '@/lib/ui/dashboard/types'
import { useActivityStateEvent } from '@/lib/ui/dashboard/hooks/useActivityStateEvent'
import { createCompletedForm, nowLocalInput } from '@/lib/ui/dashboard/utils/factories'
import { formatTimeLabel } from '@/lib/ui/dashboard/utils/formatters'
import { createEffect, createMemo, createResource, createSignal } from 'solid-js'

const normalizeOptionalText = (value: string): string | null => {
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

const getActiveActionMessage = (action: ActiveActionConfirmType): { title: string; message: string; confirmText: string } =>
  action === 'stop'
    ? {
        title: '活動を停止しますか？',
        message: '停止すると完了活動として記録されます。',
        confirmText: '停止する',
      }
    : {
        title: '進行中の活動をキャンセルしますか？',
        message: 'キャンセルすると進行中の活動は記録されません。',
        confirmText: 'キャンセルする',
      }

export const useDashboardState = (): DashboardViewModel => {
  const toast = useToastContext()
  const modal = useModalContext()
  const { pendingAction, runAction } = useActionRunner()

  const [selectedDate, setSelectedDate] = createSignal(getTodayDateString())
  const [activeDurationSeconds, setActiveDurationSeconds] = createSignal<number | null>(null)
  const [activeForm, setActiveForm] = createSignal<ActiveActivityFormModel>({
    categoryId: '',
    description: '',
    startedAtLocal: nowLocalInput(),
  })
  const [completedModal, setCompletedModal] = createSignal<CompletedActivityModalState | null>(null)
  const [isActiveEditing, setIsActiveEditing] = createSignal(false)

  const patchActiveForm = createObjectPatch(setActiveForm)

  const [activityState, { refetch: refetchActivityState }] = createResource(selectedDate, (date) =>
    getActivityState({ identity: { date } }),
  )
  const [categories] = createResource(() => getAllCategories())

  const isTodaySelected = createMemo(() => isToday(selectedDate()))
  const isActionPending = createMemo(() => pendingAction() !== null)
  const isSelectedDateLocked = createMemo(() => isActionPending() || !isTodaySelected())
  const hasCategories = createMemo(() => (categories()?.length ?? 0) > 0)

  const resolvedDurationSeconds = createMemo(() => {
    const active = activityState()?.activeActivity
    if (!active) {
      return null
    }

    return activeDurationSeconds() ?? active.durationSeconds
  })

  createEffect(() => {
    const state = activityState()
    if (!state) {
      return
    }

    const active = state.activeActivity
    if (active) {
      setActiveForm({
        categoryId: active.category.id,
        description: active.description ?? '',
        startedAtLocal: toLocalInputFromUtcIso(active.startedAt),
      })
      return
    }

    setIsActiveEditing(false)
    setActiveForm((prev) => ({
      categoryId: prev.categoryId || categories()?.[0]?.id || '',
      description: prev.description,
      startedAtLocal: prev.startedAtLocal || nowLocalInput(),
    }))
  })

  createEffect(() => {
    const active = activityState()?.activeActivity
    if (!active) {
      setActiveDurationSeconds(null)
      return
    }

    setActiveDurationSeconds(active.durationSeconds)
  })

  useActivityStateEvent({
    selectedDate,
    onDurationChange: setActiveDurationSeconds,
    onError: (error) => {
      toast.error(toErrorMessage(error))
    },
  })

  const runDashboardAction = (
    actionKey: string,
    action: () => Promise<void>,
    successMessage?: string,
  ): Promise<boolean> =>
    runAction(actionKey, action, {
      successMessage,
      onSuccess: async () => {
        await refetchActivityState()
      },
    })

  const actions: DashboardActions = {
    setSelectedDate,
    shiftDate: (deltaDays) => {
      setSelectedDate((prev) => shiftDate(prev, deltaDays))
    },
    setActiveForm: patchActiveForm,
    setCompletedForm: (patch) => {
      setCompletedModal((prev) =>
        prev
          ? {
              ...prev,
              form: {
                ...prev.form,
                ...patch,
              },
            }
          : prev,
      )
    },
    setIsActiveEditing,
    startActivity: async (event) => {
      event.preventDefault()
      if (!hasCategories()) {
        toast.error('先にカテゴリを作成してください。')
        return
      }
      if (!activeForm().categoryId) {
        toast.error('カテゴリを選択してください。')
        return
      }

      const form = activeForm()
      await runDashboardAction(
        'start',
        () =>
          startActivity({
            request: {
              categoryId: form.categoryId,
              description: normalizeOptionalText(form.description),
            },
          }),
        '活動を開始しました。',
      )
    },
    saveActive: async () => {
      if (!activeForm().categoryId) {
        toast.error('カテゴリを選択してください。')
        return
      }

      const form = activeForm()
      const isSaved = await runDashboardAction(
        'save-active',
        () =>
          saveActiveActivity({
            request: {
              categoryId: form.categoryId,
              description: normalizeOptionalText(form.description),
              startedAt: toUtcIsoFromLocalInput(form.startedAtLocal),
            },
          }),
        '進行中の活動を保存しました。',
      )

      if (isSaved) {
        setIsActiveEditing(false)
      }
    },
    confirmActiveAction: async (action) => {
      const modalArgs = getActiveActionMessage(action)
      const confirmed = await modal.confirm({
        title: modalArgs.title,
        message: modalArgs.message,
        confirmText: modalArgs.confirmText,
        cancelText: '戻る',
      })

      if (!confirmed) {
        return
      }

      const isSuccess =
        action === 'stop'
          ? await runDashboardAction('stop', () => stopActivity(), '活動を停止しました。')
          : await runDashboardAction(
              'cancel',
              () => cancelActiveActivity(),
              '進行中の活動をキャンセルしました。',
            )

      if (isSuccess) {
        setIsActiveEditing(false)
      }
    },
    openCreateCompletedModal: () => {
      setCompletedModal({
        mode: 'create',
        form: createCompletedForm(categories() ?? []),
      })
    },
    openEditCompletedModal: (activity) => {
      setCompletedModal({
        mode: 'edit',
        form: {
          activityId: activity.id,
          categoryId: activity.category.id,
          description: activity.description ?? '',
          startedAtLocal: toLocalInputFromUtcIso(activity.startedAt),
          endedAtLocal: toLocalInputFromUtcIso(activity.endedAt ?? activity.startedAt),
        },
      })
    },
    closeCompletedModal: () => {
      setCompletedModal(null)
    },
    saveCompleted: async (event) => {
      event.preventDefault()
      const modalState = completedModal()
      if (!modalState) {
        return
      }
      if (!modalState.form.categoryId) {
        toast.error('カテゴリを選択してください。')
        return
      }
      if (!isValidRange(modalState.form.startedAtLocal, modalState.form.endedAtLocal)) {
        toast.error('開始時刻は終了時刻より前にしてください。')
        return
      }

      const date = selectedDate()
      const isSaved = await runDashboardAction(
        'save-completed',
        () =>
          saveCompletedActivity({
            identity: {
              date,
              activityId: modalState.form.activityId ?? null,
            },
            request: {
              categoryId: modalState.form.categoryId,
              description: normalizeOptionalText(modalState.form.description),
              startedAt: toUtcIsoFromLocalInput(modalState.form.startedAtLocal),
              endedAt: toUtcIsoFromLocalInput(modalState.form.endedAtLocal),
            },
          }),
        modalState.mode === 'create' ? '完了活動を追加しました。' : '完了活動を更新しました。',
      )

      if (isSaved) {
        setCompletedModal(null)
      }
    },
    deleteCompleted: async (activity: ActivityResponseDto) => {
      const confirmed = await modal.confirm({
        title: '完了活動を削除しますか？',
        message: `${activity.category.name} / ${formatTimeLabel(activity.startedAt)} - ${activity.endedAt ? formatTimeLabel(activity.endedAt) : '-'}\nこの操作は取り消せません。`,
        confirmText: '削除する',
        cancelText: 'キャンセル',
      })

      if (!confirmed) {
        return
      }

      const date = selectedDate()
      await runDashboardAction(
        'delete-completed',
        () =>
          deleteCompletedActivity({
            identity: {
              date,
              activityId: activity.id,
            },
          }),
        '完了活動を削除しました。',
      )
    },
  }

  const state: DashboardStateModel = {
    selectedDate,
    pendingAction,
    isActionPending,
    activeDurationSeconds,
    activeForm,
    completedModal,
    isActiveEditing,
    activityState,
    categories,
    isTodaySelected,
    isSelectedDateLocked,
    hasCategories,
    resolvedDurationSeconds,
  }

  return {
    state,
    actions,
  }
}
