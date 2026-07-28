import CategoryEditorDialog, {
  type CategoryEditorDialogProps,
} from '@/features/category/components/CategoryEditorDialog'
import { useEffect, useRef, useState } from 'react'
import { createCallable, type ReactCall } from 'react-call'

type CategoryEditorDialogCallProps = Omit<
  CategoryEditorDialogProps,
  'open' | 'isSubmitting' | 'onClose'
>

const CategoryEditorDialogCallComponent: ReactCall.UserComponent<
  CategoryEditorDialogCallProps,
  boolean,
  object
> = ({ call, category, onCreate, onRename }) => {
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

  const runSave = async (action: () => Promise<boolean>) => {
    setIsSaving(true)
    didSave.current = await action()
    if (!didSave.current) setIsSaving(false)
    return didSave.current
  }

  return (
    <CategoryEditorDialog
      category={category}
      open={!call.ended}
      isSubmitting={isSaving}
      onClose={close}
      onCreate={(name, color) => runSave(() => onCreate(name, color))}
      onRename={(categoryId, name, color) => runSave(() => onRename(categoryId, name, color))}
    />
  )
}

const CategoryEditorDialogCall = createCallable<CategoryEditorDialogCallProps, boolean, object>(
  CategoryEditorDialogCallComponent,
  200,
)

export default CategoryEditorDialogCall
