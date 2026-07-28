import type { CategoryResponseDto } from '@/generated/types'
import {
  startActivitySchema,
  type ActivityFormValues,
} from '@/features/activity/activityFormSchema'
import CategorySelect from '@/features/activity/components/CategorySelect'
import AsyncButton from '@/lib/ui/components/AsyncButton'
import FormField from '@/lib/ui/components/FormField'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { PlayIcon } from '@heroicons/react/24/solid'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'

interface StartActivityFormProps {
  categories: CategoryResponseDto[]
  isSubmitting: boolean
  onSubmit: (form: ActivityFormValues) => Promise<boolean>
}

const StartActivityForm = ({ categories, isSubmitting, onSubmit }: StartActivityFormProps) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ActivityFormValues>({
    resolver: valibotResolver(startActivitySchema),
    defaultValues: { categoryId: categories[0]?.id ?? '', description: '' },
  })

  useEffect(() => {
    reset({ categoryId: categories[0]?.id ?? '', description: '' })
  }, [categories, reset])

  const submit = async (form: ActivityFormValues) => {
    if (await onSubmit(form)) reset({ categoryId: categories[0]?.id ?? '', description: '' })
  }

  return (
    <section className="card border border-base-200 bg-base-100 shadow-sm">
      <div className="card-body gap-5">
        <div>
          <p className="text-sm font-medium text-primary">いまから記録</p>
          <h2 className="card-title mt-1">次の活動をはじめましょう</h2>
          <p className="text-sm text-base-content/65">開始時刻は自動で記録されます。</p>
        </div>
        <form className="flex max-w-2xl flex-col gap-4" onSubmit={handleSubmit(submit)}>
          <CategorySelect
            categories={categories}
            registration={register('categoryId')}
            error={errors.categoryId?.message}
          />
          <FormField label="メモ" hint="任意" error={errors.description?.message}>
            <textarea
              className="textarea textarea-bordered min-h-28 w-full resize-y"
              {...register('description')}
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
