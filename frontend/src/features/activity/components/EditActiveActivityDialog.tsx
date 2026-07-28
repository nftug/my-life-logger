import type { ActivityResponseDto, CategoryResponseDto } from '@/generated/types'
import {
  createActiveActivitySchema,
  type ActiveActivityFormValues,
} from '@/features/activity/activityFormSchema'
import CategorySelect from '@/features/activity/components/CategorySelect'
import AsyncButton from '@/lib/ui/components/AsyncButton'
import FormField from '@/lib/ui/components/FormField'
import Modal from '@/lib/ui/components/Modal'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'

interface EditActiveActivityDialogProps {
  activity: ActivityResponseDto
  categories: CategoryResponseDto[]
  open: boolean
  isSubmitting: boolean
  createForm: (activity: ActivityResponseDto) => ActiveActivityFormValues
  onClose: () => void
  onSave: (form: ActiveActivityFormValues) => Promise<boolean>
}

const EditActiveActivityDialog = ({
  activity,
  categories,
  open,
  isSubmitting,
  createForm,
  onClose,
  onSave,
}: EditActiveActivityDialogProps) => {
  const schema = useMemo(() => createActiveActivitySchema(activity.date), [activity.date])
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ActiveActivityFormValues>({
    resolver: valibotResolver(schema),
    defaultValues: createForm(activity),
  })

  useEffect(() => {
    if (open) reset(createForm(activity))
  }, [activity, createForm, open, reset])

  const save = async (form: ActiveActivityFormValues) => {
    if (await onSave(form)) onClose()
  }

  return (
    <Modal.Root open={open} onClose={onClose} title="進行中の活動を編集">
      <Modal.Header>
        <h2 className="text-xl font-semibold">進行中の活動を編集</h2>
        <p className="mt-1 text-sm text-base-content/65">開始時刻やメモを調整できます。</p>
      </Modal.Header>
      <Modal.Body>
        <div className="grid gap-4">
          <CategorySelect
            categories={categories}
            registration={register('categoryId')}
            error={errors.categoryId?.message}
          />
          <FormField label="開始時刻">
            <input
              type="datetime-local"
              className="input input-bordered w-full"
              {...register('startedAtLocal')}
            />
            {errors.startedAtLocal?.message ? (
              <span className="text-sm text-error">{errors.startedAtLocal.message}</span>
            ) : null}
          </FormField>
          <FormField label="メモ" hint="任意" error={errors.description?.message}>
            <textarea
              className="textarea textarea-bordered min-h-28 w-full resize-y"
              maxLength={200}
              {...register('description')}
            />
          </FormField>
        </div>
      </Modal.Body>
      <Modal.Actions>
        <button type="button" className="btn btn-ghost" onClick={onClose}>
          戻る
        </button>
        <AsyncButton
          type="button"
          className="btn-primary"
          loading={isSubmitting}
          onClick={() => void handleSubmit(save)()}
        >
          保存
        </AsyncButton>
      </Modal.Actions>
    </Modal.Root>
  )
}

export default EditActiveActivityDialog
