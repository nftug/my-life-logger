import type {
  ActivityResponseDto,
  ActivityStateResponseDto,
  CategoryResponseDto,
} from '@/generated/types'
import type {
  ActiveActivityFormValues,
  ActivityFormValues,
  CompletedActivityFormValues,
} from '@/features/activity/activityFormSchema'
import {
  defaultEndTime,
  defaultStartTime,
  errorMessage,
  toDateTimeLocal,
  toUtcIso,
  todayDate,
} from '@/lib/activity/date'
import { activityApi } from '@/lib/tauri/activityApi'
import { categoryApi } from '@/lib/tauri/categoryApi'
import { showDialog } from '@/lib/ui/components/Dialog'
import { useActivityDurationEvent } from './useActivityDurationEvent'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

export type { ActiveActivityFormValues, ActivityFormValues, CompletedActivityFormValues }

export type AsyncAction =
  | 'start'
  | 'save-active'
  | 'stop'
  | 'cancel'
  | 'save-completed'
  | 'delete-completed'
  | null

interface Notice {
  tone: 'success' | 'error'
  message: string
}

const showApiError = (message: string) =>
  showDialog({
    title: 'エラーが発生しました',
    message,
    buttons: [{ label: '閉じる', value: 'close', variant: 'primary' }],
  })

const emptyState = (date: string): ActivityStateResponseDto => ({
  date,
  activeActivity: null,
  completedActivities: [],
})

const trimDescription = (description: string) => description.trim() || null

export const useActivityDashboard = (date = todayDate()) => {
  const [activityState, setActivityState] = useState<ActivityStateResponseDto>(() =>
    emptyState(date),
  )
  const [categories, setCategories] = useState<CategoryResponseDto[]>([])
  const [activeDurationSeconds, setActiveDurationSeconds] = useState<number | null>(null)
  const [pendingAction, setPendingAction] = useState<AsyncAction>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [notice, setNotice] = useState<Notice | null>(null)
  const requestVersion = useRef(0)

  const refresh = useCallback(async () => {
    const version = requestVersion.current + 1
    requestVersion.current = version
    try {
      const [nextState, nextCategories] = await Promise.all([
        activityApi.getState({ identity: { date } }),
        categoryApi.getAll(),
      ])
      if (version !== requestVersion.current) return
      setActivityState(nextState)
      setCategories(nextCategories)
      setActiveDurationSeconds(nextState.activeActivity?.durationSeconds ?? null)
    } catch (nextError) {
      if (version === requestVersion.current) void showApiError(errorMessage(nextError))
    } finally {
      if (version === requestVersion.current) setIsLoading(false)
    }
  }, [date])

  useEffect(() => {
    setIsLoading(true)
    setActivityState(emptyState(date))
    setActiveDurationSeconds(null)
    void refresh()
  }, [date, refresh])

  useActivityDurationEvent({ date, onDurationChange: setActiveDurationSeconds })

  useEffect(() => {
    if (!notice) return
    const timeout = window.setTimeout(() => setNotice(null), 3500)
    return () => window.clearTimeout(timeout)
  }, [notice])

  const run = useCallback(
    async (
      action: Exclude<AsyncAction, null>,
      operation: () => Promise<void>,
      successMessage: string,
    ) => {
      if (pendingAction) return false
      setPendingAction(action)
      try {
        await operation()
        setNotice({ tone: 'success', message: successMessage })
        await refresh()
        return true
      } catch (nextError) {
        const message = errorMessage(nextError)
        await showApiError(message)
        return false
      } finally {
        setPendingAction(null)
      }
    },
    [pendingAction, refresh],
  )

  const start = useCallback(
    async (form: ActivityFormValues) => {
      const didStart = await run(
        'start',
        () =>
          activityApi.start({
            request: {
              categoryId: form.categoryId,
              description: trimDescription(form.description),
            },
          }),
        '活動を開始しました。',
      )
      return didStart
    },
    [run],
  )

  const saveActive = useCallback(
    (form: ActiveActivityFormValues) => {
      return run(
        'save-active',
        () =>
          activityApi.saveActive({
            request: {
              categoryId: form.categoryId,
              description: trimDescription(form.description),
              startedAt: toUtcIso(form.startedAtLocal),
            },
          }),
        '進行中の活動を更新しました。',
      )
    },
    [run],
  )

  const saveCompleted = useCallback(
    (activityId: string | null, form: CompletedActivityFormValues) => {
      return run(
        'save-completed',
        () =>
          activityApi.saveCompleted({
            identity: { activityId },
            request: {
              categoryId: form.categoryId,
              description: trimDescription(form.description),
              startedAt: toUtcIso(form.startedAtLocal),
              endedAt: toUtcIso(form.endedAtLocal),
            },
          }),
        activityId ? '記録を更新しました。' : '記録を追加しました。',
      )
    },
    [run],
  )

  const completedFormFor = useCallback(
    (activity?: ActivityResponseDto, date = todayDate()): CompletedActivityFormValues => ({
      categoryId: activity?.category.id ?? '',
      description: activity?.description ?? '',
      startedAtLocal: activity ? toDateTimeLocal(activity.startedAt) : defaultStartTime(date),
      endedAtLocal: activity?.endedAt ? toDateTimeLocal(activity.endedAt) : defaultEndTime(date),
    }),
    [],
  )

  const activeFormFor = useCallback(
    (activity: ActivityResponseDto): ActiveActivityFormValues => ({
      categoryId: activity.category.id,
      description: activity.description ?? '',
      startedAtLocal: toDateTimeLocal(activity.startedAt),
    }),
    [],
  )

  const allActivities = useMemo(
    () =>
      [
        ...activityState.completedActivities,
        ...(activityState.activeActivity ? [activityState.activeActivity] : []),
      ].sort(
        (left, right) => new Date(left.startedAt).getTime() - new Date(right.startedAt).getTime(),
      ),
    [activityState.activeActivity, activityState.completedActivities],
  )

  const totalSeconds = useMemo(
    () =>
      activityState.completedActivities.reduce(
        (total, activity) => total + activity.durationSeconds,
        0,
      ) + (activeDurationSeconds ?? 0),
    [activeDurationSeconds, activityState.completedActivities],
  )

  return {
    state: {
      activityState,
      categories,
      activeDurationSeconds,
      pendingAction,
      isLoading,
      notice,
      allActivities,
      totalSeconds,
    },
    actions: {
      refresh,
      clearNotice: () => setNotice(null),
      start,
      saveActive,
      stop: () => run('stop', () => activityApi.stop(), '活動を停止しました。'),
      cancel: () => run('cancel', () => activityApi.cancel(), '進行中の活動をキャンセルしました。'),
      saveCompleted,
      deleteCompleted: (activityId: string) =>
        run(
          'delete-completed',
          () => activityApi.deleteCompleted({ identity: { activityId, date } }),
          '記録を削除しました。',
        ),
      completedFormFor,
      activeFormFor,
    },
  }
}
