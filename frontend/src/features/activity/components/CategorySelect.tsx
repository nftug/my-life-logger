import type { CategoryResponseDto } from '@/generated/types'
import FormField from '@/lib/ui/components/FormField'
import type { UseFormRegisterReturn } from 'react-hook-form'

interface CategorySelectProps {
  categories: CategoryResponseDto[]
  registration: UseFormRegisterReturn
  error?: string
}

const CategorySelect = ({ categories, registration, error }: CategorySelectProps) => (
  <FormField label="カテゴリ" error={error}>
    <select className="select select-bordered w-full" {...registration}>
      <option value="">カテゴリを選択</option>
      {categories.map((category) => (
        <option key={category.id} value={category.id}>
          {category.name}
        </option>
      ))}
    </select>
  </FormField>
)

export default CategorySelect
