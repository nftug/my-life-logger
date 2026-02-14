import { createContext, createSignal, onCleanup, useContext, type ParentProps } from 'solid-js'

export type ModalResult = 'confirmed' | 'cancelled'

export interface ModalOptions {
  title: string
  message: string
  confirmText?: string
  cancelText?: string
}

interface ModalState extends ModalOptions {
  isOpen: boolean
}

interface ModalContextValue {
  open: (options: ModalOptions) => Promise<ModalResult>
  confirm: (options: ModalOptions) => Promise<boolean>
}

const EXIT_ANIMATION_MS = 300

const defaultState: ModalState = {
  isOpen: false,
  title: '',
  message: '',
  confirmText: 'OK',
  cancelText: 'Cancel',
}

const ModalContext = createContext<ModalContextValue>()

export const useModalContext = (): ModalContextValue => {
  const context = useContext(ModalContext)
  if (!context) {
    throw new Error('useModalContext must be used within ModalProvider')
  }

  return context
}

const ModalProvider = (props: ParentProps) => {
  const [state, setState] = createSignal<ModalState>(defaultState)
  let pendingResolver: ((result: ModalResult) => void) | null = null
  let resetTimer: number | null = null

  const clearResetTimer = () => {
    if (resetTimer !== null) {
      window.clearTimeout(resetTimer)
      resetTimer = null
    }
  }

  const resolve = (result: ModalResult) => {
    if (pendingResolver) {
      pendingResolver(result)
      pendingResolver = null
    }

    setState((prev) => ({ ...prev, isOpen: false }))

    clearResetTimer()
    resetTimer = window.setTimeout(() => {
      setState(defaultState)
    }, EXIT_ANIMATION_MS)
  }

  const open = (options: ModalOptions): Promise<ModalResult> => {
    if (pendingResolver) {
      pendingResolver('cancelled')
      pendingResolver = null
    }

    clearResetTimer()
    setState({
      isOpen: true,
      title: options.title,
      message: options.message,
      confirmText: options.confirmText ?? 'OK',
      cancelText: options.cancelText ?? 'Cancel',
    })

    return new Promise<ModalResult>((resolver) => {
      pendingResolver = resolver
    })
  }

  onCleanup(() => {
    clearResetTimer()
    if (pendingResolver) {
      pendingResolver('cancelled')
      pendingResolver = null
    }
  })

  const context: ModalContextValue = {
    open,
    confirm: async (options) => (await open(options)) === 'confirmed',
  }

  return (
    <ModalContext.Provider value={context}>
      {props.children}

      <input
        type="checkbox"
        class="modal-toggle"
        checked={state().isOpen}
        onChange={() => resolve('cancelled')}
      />

      <div class="modal" role="dialog" classList={{ 'modal-open': state().isOpen }}>
        <div class="modal-box">
          <h3 class="text-lg font-bold">{state().title}</h3>
          <p class="py-4 whitespace-pre-line">{state().message}</p>

          <div class="modal-action">
            <button type="button" class="btn btn-primary" onClick={() => resolve('confirmed')}>
              {state().confirmText}
            </button>
            <button type="button" class="btn" onClick={() => resolve('cancelled')}>
              {state().cancelText}
            </button>
          </div>
        </div>
      </div>
    </ModalContext.Provider>
  )
}

export default ModalProvider
