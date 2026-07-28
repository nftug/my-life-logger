import type { CategoryResponseDto } from '@/generated/types'
import FormField from '@/lib/ui/components/FormField'

interface CategorySelectProps {
  categories: CategoryResponseDto[]
  value: string
  onChange: (value: string) => void
  error?: string
}

const CategorySelect = ({ categories, value, onChange, error }: CategorySelectProps) => (
  <FormField label="カテゴリ" error={error}>
    <select
      className="select select-bordered w-full"
      value={value}
      onChange={(event) => onChange(event.currentTarget.value)}
    >
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
