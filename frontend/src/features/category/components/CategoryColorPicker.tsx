export const CATEGORY_DEFAULT_COLOR = '#8B5CF6'

const categoryColorOptions = [
  { name: '紫', value: '#8B5CF6' },
  { name: '水色', value: '#0EA5E9' },
  { name: '緑', value: '#10B981' },
  { name: '黄', value: '#F59E0B' },
  { name: 'ピンク', value: '#F43F5E' },
  { name: '藍', value: '#6366F1' },
]

interface CategoryColorPickerProps {
  color: string
  onChange: (color: string) => void
}

const CategoryColorPicker = ({ color, onChange }: CategoryColorPickerProps) => (
  <fieldset>
    <legend className="mb-2 text-sm font-medium">カラー</legend>
    <div className="flex flex-wrap items-center gap-2" role="radiogroup" aria-label="既定カラー">
      {categoryColorOptions.map((option) => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={color === option.value}
          aria-label={`${option.name}（${option.value}）`}
          className={`h-8 w-8 rounded-full border-2 transition focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-primary ${
            color === option.value
              ? 'border-base-content ring-2 ring-base-content/20'
              : 'border-base-100'
          }`}
          style={{ backgroundColor: option.value }}
          onClick={() => onChange(option.value)}
        />
      ))}
      <label className="ml-1 flex items-center gap-2 text-sm text-base-content/70">
        <span>カスタム</span>
        <input
          type="color"
          aria-label="カスタムカラー"
          className="h-8 w-10 cursor-pointer rounded border border-base-300 bg-base-100 p-0.5"
          value={color}
          onChange={(event) => onChange(event.target.value.toUpperCase())}
        />
      </label>
    </div>
  </fieldset>
)

export default CategoryColorPicker
