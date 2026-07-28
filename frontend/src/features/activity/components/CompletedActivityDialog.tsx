import {
  createCompletedActivitySchema,
  type CompletedActivityFormValues,
} from '@/features/activity/activityFormSchema'
import CategorySelect from '@/features/activity/components/CategorySelect'
import type { ActivityResponseDto, CategoryResponseDto } from '@/generated/types'
import AsyncButton from '@/lib/ui/components/AsyncButton'
import FormField from '@/lib/ui/components/FormField'
import Modal from '@/lib/ui/components/Modal'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'

interface CompletedActivityDialogProps {
  activity: ActivityResponseDto | null
  categories: CategoryResponseDto[]
  open: boolean
  isSubmitting: boolean
  date: string
  dateLabel?: string
  createForm: (activity?: ActivityResponseDto) => CompletedActivityFormValues
  onClose: () => void
  onSave: (activityId: string | null, form: CompletedActivityFormValues) => Promise<boolean>
}

const CompletedActivityDialog = ({
  activity,
  categories,
  open,
  isSubmitting,
  date,
  dateLabel = '今日',
  createForm,
  onClose,
  onSave,
}: CompletedActivityDialogProps) => {
  const schema = useMemo(() => createCompletedActivitySchema(date), [date])
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CompletedActivityFormValues>({
    resolver: valibotResolver(schema),
    defaultValues: createForm(activity ?? undefined),
  })

  useEffect(() => {
    if (open) reset(createForm(activity ?? undefined))
  }, [activity, createForm, open, reset])

  const save = async (form: CompletedActivityFormValues) => {
    if (await onSave(activity?.id ?? null, form)) onClose()
  }

  const title = activity ? '記録を編集' : '記録を追加'
  return (
    <Modal.Root open={open} onClose={onClose} title={title}>
      <Modal.Header>
        <h2 className="text-xl font-semibold">{title}</h2>
        <p className="mt-1 text-sm text-base-content/65">
          {dateLabel}の活動として時間帯を記録します。
        </p>
      </Modal.Header>
      <Modal.Body>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <CategorySelect
              categories={categories}
              registration={register('categoryId')}
              error={errors.categoryId?.message}
            />
          </div>
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
          <FormField label="終了時刻">
            <input
              type="datetime-local"
              className="input input-bordered w-full"
              {...register('endedAtLocal')}
            />
            {errors.endedAtLocal?.message ? (
              <span className="text-sm text-error">{errors.endedAtLocal.message}</span>
            ) : null}
          </FormField>
          <div className="sm:col-span-2">
            <FormField label="メモ" hint="任意" error={errors.description?.message}>
              <textarea
                className="textarea textarea-bordered min-h-28 w-full resize-y"
                maxLength={200}
                placeholder="例：設計の見直し"
                {...register('description')}
              />
            </FormField>
          </div>
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

export default CompletedActivityDialog
