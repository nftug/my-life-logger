import type { CategoryResponseDto } from '@/generated/types'
import type { ActivityFormValues } from '@/features/activity/hooks/useActivityDashboard'
import CategorySelect from '@/features/activity/components/CategorySelect'
import AsyncButton from '@/lib/ui/components/AsyncButton'
import FormField from '@/lib/ui/components/FormField'
import { PlayIcon } from '@heroicons/react/24/solid'
import type { FormEvent } from 'react'

interface StartActivityFormProps {
  categories: CategoryResponseDto[]
  value: ActivityFormValues
  isSubmitting: boolean
  onChange: (value: ActivityFormValues) => void
  onSubmit: () => Promise<boolean>
}

const StartActivityForm = ({
  categories,
  value,
  isSubmitting,
  onChange,
  onSubmit,
}: StartActivityFormProps) => {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    void onSubmit()
  }

  return (
    <section className="card border border-base-200 bg-base-100 shadow-sm">
      <div className="card-body gap-5">
        <div>
          <p className="text-sm font-medium text-primary">いまから記録</p>
          <h2 className="card-title mt-1">次の活動をはじめましょう</h2>
          <p className="text-sm text-base-content/65">開始時刻は自動で記録されます。</p>
        </div>
        <form className="flex max-w-2xl flex-col gap-4" onSubmit={handleSubmit}>
          <CategorySelect
            categories={categories}
            value={value.categoryId}
            onChange={(categoryId) => onChange({ ...value, categoryId })}
          />
          <FormField label="メモ" hint="任意">
            <textarea
              className="textarea textarea-bordered min-h-28 w-full resize-y"
              value={value.description}
              onChange={(event) => onChange({ ...value, description: event.currentTarget.value })}
              maxLength={200}
              placeholder="例：タイマー画面の実装"
            />
          </FormField>
          <AsyncButton type="submit" className="btn-primary self-start" loading={isSubmitting}>
            <PlayIcon className="h-4 w-4" />
            開始
          </AsyncButton>
        </form>
      </div>
    </section>
  )
}

export default StartActivityForm
