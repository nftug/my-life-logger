import { createNanoEvents } from 'nanoevents'
import {
  createContext,
  createSignal,
  For,
  onCleanup,
  onMount,
  untrack,
  useContext,
  type ParentProps,
} from 'solid-js'

const EXIT_ANIMATION_MS = 200

export type ToastKind = 'info' | 'success' | 'warning' | 'error'

export interface ToastArgs {
  message: string
  kind: ToastKind
  durationMs?: number
}

interface ToastItem {
  id: number
  message: string
  kind: ToastKind
  durationMs?: number
  closing: boolean
}

interface ToastEvents {
  scheduleClose: (payload: { id: number; durationMs?: number }) => void
}

interface ToastContextValue {
  push: (args: ToastArgs) => number
  info: (message: string, durationMs?: number) => number
  success: (message: string, durationMs?: number) => number
  warning: (message: string, durationMs?: number) => number
  error: (message: string, durationMs?: number) => number
  dismiss: (id: number) => void
}

const ToastContext = createContext<ToastContextValue>()

const alertClassMap: Record<ToastKind, string> = {
  info: 'alert-info',
  success: 'alert-success',
  warning: 'alert-warning',
  error: 'alert-error',
}

export const useToastContext = (): ToastContextValue => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToastContext must be used within ToastProvider')
  }

  return context
}

interface ToastProviderProps extends ParentProps {
  durationMs?: number
}

const ToastProvider = (props: ToastProviderProps) => {
  const defaultDurationMs = untrack(() => props.durationMs ?? 3000)
  const [items, setItems] = createSignal<ToastItem[]>([])
  const [nextId, setNextId] = createSignal(0)
  const closingEmitter = createNanoEvents<ToastEvents>()

  const closeTimers = new Map<number, number>()
  const exitTimers = new Map<number, number>()

  const clearTimer = (map: Map<number, number>, id: number) => {
    const timer = map.get(id)
    if (timer === undefined) {
      return
    }

    window.clearTimeout(timer)
    map.delete(id)
  }

  const dismiss = (id: number) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, closing: true } : item)))
    clearTimer(closeTimers, id)
    clearTimer(exitTimers, id)

    const exitTimer = window.setTimeout(() => {
      setItems((prev) => prev.filter((item) => item.id !== id))
      exitTimers.delete(id)
    }, EXIT_ANIMATION_MS)

    exitTimers.set(id, exitTimer)
  }

  const push = (args: ToastArgs): number => {
    const id = nextId()
    setNextId((prev) => prev + 1)

    setItems((prev) => [
      ...prev,
      {
        id,
        message: args.message,
        kind: args.kind,
        durationMs: args.durationMs,
        closing: false,
      },
    ])

    closingEmitter.emit('scheduleClose', { id, durationMs: args.durationMs })

    return id
  }

  onMount(() => {
    const unsubscribe = closingEmitter.on('scheduleClose', ({ id, durationMs }) => {
      clearTimer(closeTimers, id)

      const closeTimer = window.setTimeout(() => {
        dismiss(id)
      }, durationMs ?? defaultDurationMs)

      closeTimers.set(id, closeTimer)
    })

    onCleanup(() => {
      unsubscribe()
      for (const timer of closeTimers.values()) {
        window.clearTimeout(timer)
      }
      for (const timer of exitTimers.values()) {
        window.clearTimeout(timer)
      }
      closeTimers.clear()
      exitTimers.clear()
    })
  })

  const context: ToastContextValue = {
    push,
    info: (message, durationMs) => push({ message, kind: 'info', durationMs }),
    success: (message, durationMs) => push({ message, kind: 'success', durationMs }),
    warning: (message, durationMs) => push({ message, kind: 'warning', durationMs }),
    error: (message, durationMs) => push({ message, kind: 'error', durationMs }),
    dismiss,
  }

  return (
    <ToastContext.Provider value={context}>
      {props.children}

      <div class="toast toast-bottom toast-center z-50">
        <For each={items()}>
          {(item) => (
            <div
              class={`alert transition-all ${alertClassMap[item.kind]} ${item.closing ? 'opacity-0 translate-y-2' : ''}`}
              role="alert"
              onClick={() => dismiss(item.id)}
            >
              <span>{item.message}</span>
            </div>
          )}
        </For>
      </div>
    </ToastContext.Provider>
  )
}

export default ToastProvider
