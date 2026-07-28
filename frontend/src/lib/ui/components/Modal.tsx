import type { ReactNode } from 'react'

interface ModalRootProps {
  children: ReactNode
  open: boolean
  onClose: () => void
  title: string
}

const Root = ({ children, open, onClose, title }: ModalRootProps) => {
  if (!open) return null
  return (
    <dialog className="modal modal-open" aria-modal="true" aria-label={title}>
      <div className="modal-box max-w-xl p-0">{children}</div>
      <button
        type="button"
        className="modal-backdrop"
        aria-label={`${title}を閉じる`}
        onClick={onClose}
      />
    </dialog>
  )
}

const Header = ({ children }: { children: ReactNode }) => (
  <div className="border-b border-base-200 px-6 py-5">{children}</div>
)

const Body = ({ children }: { children: ReactNode }) => <div className="px-6 py-5">{children}</div>

const Actions = ({ children }: { children: ReactNode }) => (
  <div className="flex flex-wrap justify-end gap-2 border-t border-base-200 px-6 py-4">
    {children}
  </div>
)

const Modal = { Root, Header, Body, Actions }

export default Modal
