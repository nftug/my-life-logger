import type { ActivityResponseDto, CategoryResponseDto } from '@/generated/types'
import type { ActiveActivityFormValues } from '@/features/activity/hooks/useActivityDashboard'
import CategorySelect from '@/features/activity/components/CategorySelect'
import AsyncButton from '@/lib/ui/components/AsyncButton'
import FormField from '@/lib/ui/components/FormField'
import Modal from '@/lib/ui/components/Modal'
import { useEffect, useState } from 'react'

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
  const [form, setForm] = useState(() => createForm(activity))

  useEffect(() => {
    if (open) setForm(createForm(activity))
  }, [activity, createForm, open])

  const save = async () => {
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
            value={form.categoryId}
            onChange={(categoryId) => setForm((current) => ({ ...current, categoryId }))}
          />
          <FormField label="開始時刻">
            <input
              type="datetime-local"
              className="input input-bordered w-full"
              value={form.startedAtLocal}
              onChange={(event) => {
                const startedAtLocal = event.currentTarget.value
                setForm((current) => ({ ...current, startedAtLocal }))
              }}
            />
          </FormField>
          <FormField label="メモ" hint="任意">
            <textarea
              className="textarea textarea-bordered min-h-28 w-full resize-y"
              value={form.description}
              maxLength={200}
              onChange={(event) => {
                const description = event.currentTarget.value
                setForm((current) => ({ ...current, description }))
              }}
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
          onClick={() => void save()}
        >
          保存
        </AsyncButton>
      </Modal.Actions>
    </Modal.Root>
  )
}

export default EditActiveActivityDialog
