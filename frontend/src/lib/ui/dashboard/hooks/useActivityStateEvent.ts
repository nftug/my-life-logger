import { onActivityStateEvent } from '@/generated/events'
import { isToday } from '@/lib/utils/datetime'
import { onCleanup, onMount, untrack, type Accessor } from 'solid-js'

interface UseActivityStateEventParams {
  selectedDate: Accessor<string>
  onDurationChange: (duration: number | null) => void
  onError: (error: unknown) => void
}

export const useActivityStateEvent = ({
  selectedDate,
  onDurationChange,
  onError,
}: UseActivityStateEventParams): void => {
  onMount(() => {
    let unlisten: (() => void) | null = null
    let isDisposed = false

    void onActivityStateEvent((payload) => {
      const currentSelectedDate = untrack(selectedDate)
      if (!isToday(currentSelectedDate)) {
        return
      }

      if (payload.date !== currentSelectedDate) {
        return
      }

      onDurationChange(payload.activeDurationSeconds ?? null)
    })
      .then((cleanup) => {
        if (isDisposed) {
          cleanup()
          return
        }

        unlisten = cleanup
      })
      .catch((error) => {
        onError(error)
      })

    onCleanup(() => {
      isDisposed = true
      if (unlisten) {
        unlisten()
      }
    })
  })
}
