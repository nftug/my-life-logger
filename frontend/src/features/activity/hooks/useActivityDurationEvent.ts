import { activityApi } from '@/lib/tauri/activityApi'
import { errorMessage } from '@/lib/activity/date'
import { showDialog } from '@/lib/ui/components/Dialog'
import { useEffect } from 'react'

interface UseActivityDurationEventOptions {
  date: string
  onDurationChange: (durationSeconds: number | null) => void
}

const showApiError = (message: string) =>
  showDialog({
    title: 'エラーが発生しました',
    message,
    buttons: [{ label: '閉じる', value: 'close', variant: 'primary' }],
  })

export const useActivityDurationEvent = ({
  date,
  onDurationChange,
}: UseActivityDurationEventOptions) => {
  useEffect(() => {
    let disposed = false
    let unlisten: (() => void) | undefined

    void activityApi
      .onStateEvent((event) => {
        if (event.date === date) onDurationChange(event.activeDurationSeconds ?? null)
      })
      .then((unsubscribe) => {
        if (disposed) {
          unsubscribe()
          return
        }
        unlisten = unsubscribe
      })
      .catch((eventError: unknown) => {
        if (!disposed) void showApiError(errorMessage(eventError))
      })

    return () => {
      disposed = true
      unlisten?.()
    }
  }, [date, onDurationChange])
}
