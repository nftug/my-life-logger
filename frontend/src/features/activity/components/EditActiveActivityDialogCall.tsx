import EditActiveActivityDialog, {
  type EditActiveActivityDialogProps,
} from '@/features/activity/components/EditActiveActivityDialog'
import { useEffect, useRef, useState } from 'react'
import { createCallable, type ReactCall } from 'react-call'

type EditActiveActivityDialogCallProps = Omit<
  EditActiveActivityDialogProps,
  'open' | 'isSubmitting' | 'onClose'
>

const EditActiveActivityDialogCallComponent: ReactCall.UserComponent<
  EditActiveActivityDialogCallProps,
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

  const save = async (...args: Parameters<EditActiveActivityDialogCallProps['onSave']>) => {
    setIsSaving(true)
    didSave.current = await props.onSave(...args)
    if (!didSave.current) setIsSaving(false)
    return didSave.current
  }

  return (
    <EditActiveActivityDialog
      {...props}
      open={!call.ended}
      isSubmitting={isSaving}
      onClose={close}
      onSave={save}
    />
  )
}

const EditActiveActivityDialogCall = createCallable<
  EditActiveActivityDialogCallProps,
  boolean,
  object
>(EditActiveActivityDialogCallComponent, 200)

export default EditActiveActivityDialogCall
