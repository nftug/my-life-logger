import type { CategoryResponseDto } from '@/generated/types'
import CategoryColorPicker, {
  CATEGORY_DEFAULT_COLOR,
} from '@/features/category/components/CategoryColorPicker'
import { categoryFormSchema, type CategoryFormValues } from '@/features/category/categoryFormSchema'
import AsyncButton from '@/lib/ui/components/AsyncButton'
import FormField from '@/lib/ui/components/FormField'
import Modal from '@/lib/ui/components/Modal'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'

interface CategoryEditorDialogProps {
  category: CategoryResponseDto | null
  open: boolean
  isSubmitting: boolean
  onClose: () => void
  onCreate: (name: string, color: string) => Promise<boolean>
  onRename: (categoryId: string, name: string, color: string) => Promise<boolean>
}

const createDefaultValues = (): CategoryFormValues => ({
  name: '',
  color: CATEGORY_DEFAULT_COLOR,
})

const CategoryEditorDialog = ({
  category,
  open,
  isSubmitting,
  onClose,
  onCreate,
  onRename,
}: CategoryEditorDialogProps) => {
  const isEditing = category !== null
  const title = isEditing ? 'カテゴリを編集' : 'カテゴリを追加'
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CategoryFormValues>({
    resolver: valibotResolver(categoryFormSchema),
    defaultValues: createDefaultValues(),
  })

  useEffect(() => {
    if (!open) return
    reset(category ? { name: category.name, color: category.color } : createDefaultValues())
  }, [category, open, reset])

  const save = async ({ name, color }: CategoryFormValues) => {
    const isSaved = category
      ? await onRename(category.id, name, color)
      : await onCreate(name, color)

    if (isSaved) onClose()
  }

  return (
    <Modal.Root open={open} onClose={onClose} title={title}>
      <Modal.Header>
        <h2 className="text-xl font-semibold">{title}</h2>
        <p className="mt-1 text-sm text-base-content/65">
          よく使う活動を登録して、記録をスムーズに始めましょう。
        </p>
      </Modal.Header>
      <form onSubmit={handleSubmit(save)}>
        <Modal.Body>
          <div className="grid gap-4">
            <FormField label="カテゴリ名" error={errors.name?.message}>
              <input
                autoFocus
                className="input input-bordered w-full"
                maxLength={100}
                placeholder="例：開発、勉強、休憩"
                {...register('name')}
              />
            </FormField>
            <CategoryColorPicker
              color={watch('color')}
              onChange={(color) => setValue('color', color, { shouldValidate: true })}
            />
          </div>
        </Modal.Body>
        <Modal.Actions>
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            戻る
          </button>
          <AsyncButton type="submit" className="btn-primary" loading={isSubmitting}>
            保存
          </AsyncButton>
        </Modal.Actions>
      </form>
    </Modal.Root>
  )
}

export default CategoryEditorDialog
