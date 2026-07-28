import CompletedActivityDialog, {
  type CompletedActivityDialogProps,
} from '@/features/activity/components/CompletedActivityDialog'
import { useEffect, useRef, useState } from 'react'
import { createCallable, type ReactCall } from 'react-call'

type CompletedActivityDialogCallProps = Omit<
  CompletedActivityDialogProps,
  'open' | 'isSubmitting' | 'onClose'
>

const CompletedActivityDialogCallComponent: ReactCall.UserComponent<
  CompletedActivityDialogCallProps,
  boolean,
  object
> = ({ call, ...props }) => {
  const [isSaving, setIsSaving] = useState(false)
  const didSave = useRef(false)

  useEffect(() => {
    if (call.ended) return
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        call.end(false)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [call, call.ended])

  const close = () => {
    if (!call.ended) call.end(didSave.current)
  }

  const save = async (...args: Parameters<CompletedActivityDialogCallProps['onSave']>) => {
    setIsSaving(true)
    didSave.current = await props.onSave(...args)
    if (!didSave.current) setIsSaving(false)
    return didSave.current
  }

  return (
    <CompletedActivityDialog
      {...props}
      open={!call.ended}
      isSubmitting={isSaving}
      onClose={close}
      onSave={save}
    />
  )
}

const CompletedActivityDialogCall = createCallable<
  CompletedActivityDialogCallProps,
  boolean,
  object
>(CompletedActivityDialogCallComponent, 200)

export default CompletedActivityDialogCall
