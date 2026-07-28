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
import { useCallback, useEffect, useMemo, useState } from 'react'

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

const emptyState = (): ActivityStateResponseDto => ({
  date: todayDate(),
  activeActivity: null,
  completedActivities: [],
})

const trimDescription = (description: string) => description.trim() || null

export const useActivityDashboard = (date = todayDate()) => {
  const [activityState, setActivityState] = useState<ActivityStateResponseDto>(() => emptyState())
  const [categories, setCategories] = useState<CategoryResponseDto[]>([])
  const [activeDurationSeconds, setActiveDurationSeconds] = useState<number | null>(null)
  const [pendingAction, setPendingAction] = useState<AsyncAction>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<Notice | null>(null)

  const refresh = useCallback(async () => {
    setError(null)
    try {
      const [nextState, nextCategories] = await Promise.all([
        activityApi.getState({ identity: { date } }),
        categoryApi.getAll(),
      ])
      setActivityState(nextState)
      setCategories(nextCategories)
      setActiveDurationSeconds(nextState.activeActivity?.durationSeconds ?? null)
    } catch (nextError) {
      setError(errorMessage(nextError))
    } finally {
      setIsLoading(false)
    }
  }, [date])

  useEffect(() => {
    void refresh()
  }, [refresh])

  useEffect(() => {
    let disposed = false
    let unlisten: (() => void) | undefined

    void activityApi
      .onStateEvent((event) => {
        if (event.date === date) setActiveDurationSeconds(event.activeDurationSeconds ?? null)
      })
      .then((unsubscribe) => {
        if (disposed) {
          unsubscribe()
          return
        }
        unlisten = unsubscribe
      })
      .catch((eventError: unknown) => {
        if (!disposed) setError(errorMessage(eventError))
      })

    return () => {
      disposed = true
      unlisten?.()
    }
  }, [date])

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
      setError(null)
      try {
        await operation()
        setNotice({ tone: 'success', message: successMessage })
        await refresh()
        return true
      } catch (nextError) {
        const message = errorMessage(nextError)
        setError(message)
        setNotice({ tone: 'error', message })
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
      categoryId: activity?.category.id ?? categories[0]?.id ?? '',
      description: activity?.description ?? '',
      startedAtLocal: activity ? toDateTimeLocal(activity.startedAt) : defaultStartTime(date),
      endedAtLocal: activity?.endedAt ? toDateTimeLocal(activity.endedAt) : defaultEndTime(date),
    }),
    [categories],
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
      error,
      notice,
      allActivities,
      totalSeconds,
    },
    actions: {
      refresh,
      clearError: () => setError(null),
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
