import type { ActivityResponseDto, CategoryResponseDto } from '@/generated/types'
import type { CompletedActivityFormValues } from '@/features/activity/hooks/useActivityDashboard'
import CategorySelect from '@/features/activity/components/CategorySelect'
import AsyncButton from '@/lib/ui/components/AsyncButton'
import FormField from '@/lib/ui/components/FormField'
import Modal from '@/lib/ui/components/Modal'
import { useEffect, useState } from 'react'

interface CompletedActivityDialogProps {
  activity: ActivityResponseDto | null
  categories: CategoryResponseDto[]
  open: boolean
  isSubmitting: boolean
  createForm: (activity?: ActivityResponseDto) => CompletedActivityFormValues
  onClose: () => void
  onSave: (activityId: string | null, form: CompletedActivityFormValues) => Promise<boolean>
}

const CompletedActivityDialog = ({
  activity,
  categories,
  open,
  isSubmitting,
  createForm,
  onClose,
  onSave,
}: CompletedActivityDialogProps) => {
  const [form, setForm] = useState(() => createForm(activity ?? undefined))

  useEffect(() => {
    if (open) setForm(createForm(activity ?? undefined))
  }, [activity, createForm, open])

  const save = async () => {
    if (await onSave(activity?.id ?? null, form)) onClose()
  }

  const title = activity ? '記録を編集' : '記録を追加'
  return (
    <Modal.Root open={open} onClose={onClose} title={title}>
      <Modal.Header>
        <h2 className="text-xl font-semibold">{title}</h2>
        <p className="mt-1 text-sm text-base-content/65">今日の活動として時間帯を記録します。</p>
      </Modal.Header>
      <Modal.Body>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <CategorySelect
              categories={categories}
              value={form.categoryId}
              onChange={(categoryId) => setForm((current) => ({ ...current, categoryId }))}
            />
          </div>
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
          <FormField label="終了時刻">
            <input
              type="datetime-local"
              className="input input-bordered w-full"
              value={form.endedAtLocal}
              onChange={(event) => {
                const endedAtLocal = event.currentTarget.value
                setForm((current) => ({ ...current, endedAtLocal }))
              }}
            />
          </FormField>
          <div className="sm:col-span-2">
            <FormField label="メモ" hint="任意">
              <textarea
                className="textarea textarea-bordered min-h-28 w-full resize-y"
                value={form.description}
                maxLength={200}
                placeholder="例：設計の見直し"
                onChange={(event) => {
                  const description = event.currentTarget.value
                  setForm((current) => ({ ...current, description }))
                }}
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
          onClick={() => void save()}
        >
          保存
        </AsyncButton>
      </Modal.Actions>
    </Modal.Root>
  )
}

export default CompletedActivityDialog
