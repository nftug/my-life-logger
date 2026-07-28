import { createCallable, type ReactCall } from 'react-call'
import { useEffect, useId } from 'react'

type ButtonVariant =
  | 'neutral'
  | 'primary'
  | 'secondary'
  | 'accent'
  | 'info'
  | 'success'
  | 'warning'
  | 'error'
  | 'ghost'
  | 'link'
  | 'outline'
  | 'soft'
  | 'dash'

interface DialogButton {
  label: string
  value: string
  variant?: ButtonVariant
}

export interface DialogProps {
  title: string
  message?: string
  buttons: DialogButton[]
}

export type DialogResponse = string | null

const DialogComponent: ReactCall.UserComponent<
  DialogProps,
  DialogResponse,
  Record<string, never>
> = ({ call, title, message, buttons }) => {
  const titleId = useId()
  useEffect(() => {
    if (call.ended) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        call.end(null)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [call, call.ended])

  const handleButtonClick = (value: string) => {
    if (call.ended) return
    call.end(value)
  }

  const handleBackdropClick = () => {
    if (call.ended) return
    call.end(null)
  }

  return (
    <dialog
      className={`modal${call.ended ? '' : ' modal-open'}`}
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <div className="modal-box">
        <h3 id={titleId} className="text-lg font-bold">
          {title}
        </h3>
        {message && <p className="py-4">{message}</p>}
        <div className="modal-action">
          {buttons.map((btn) => (
            <button
              key={btn.value}
              className={`btn${btn.variant ? ` btn-${btn.variant}` : ''}`}
              onClick={() => handleButtonClick(btn.value)}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button onClick={handleBackdropClick}>close</button>
      </form>
    </dialog>
  )
}

export const Dialog = createCallable<DialogProps, DialogResponse>(DialogComponent, 200)

export const showDialog = <T extends string>(props: DialogProps): Promise<T | null> =>
  Dialog.call(props) as Promise<T | null>
