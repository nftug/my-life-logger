import type { CategoryResponseDto } from '@/generated/types'
import { For, Show } from 'solid-js'

interface ActivityEditorFormProps {
  categories: CategoryResponseDto[]
  categoryId: string
  startedAtLocal: string
  showStartedAt?: boolean
  endedAtLocal?: string
  description: string
  descriptionPlaceholder: string
  onCategoryIdChange: (value: string) => void
  onStartedAtChange: (value: string) => void
  onEndedAtChange?: (value: string) => void
  onDescriptionChange: (value: string) => void
}

const ActivityEditorForm = (props: ActivityEditorFormProps) => (
  <div class="w-full rounded-box border border-base-300 p-0">
    <div class="flex items-center justify-between gap-3 border-b border-base-300 px-4 py-3">
      <span class="text-sm text-base-content/70">カテゴリ</span>
      <select
        class="select select-bordered select-sm w-56 max-w-[70%]"
        value={props.categoryId}
        onInput={(event) => props.onCategoryIdChange(event.currentTarget.value)}
      >
        <option value="" disabled>
          カテゴリを選択
        </option>
        <For each={props.categories}>{(category) => <option value={category.id}>{category.name}</option>}</For>
      </select>
    </div>

    <Show when={props.showStartedAt ?? true}>
      <div class="flex items-center justify-between gap-3 border-b border-base-300 px-4 py-3">
        <span class="text-sm text-base-content/70">開始時刻</span>
        <input
          type="datetime-local"
          class="input input-bordered input-sm w-56 max-w-[70%]"
          value={props.startedAtLocal}
          onInput={(event) => props.onStartedAtChange(event.currentTarget.value)}
        />
      </div>
    </Show>

    <Show when={props.onEndedAtChange !== undefined}>
      <div class="flex items-center justify-between gap-3 border-b border-base-300 px-4 py-3">
        <span class="text-sm text-base-content/70">終了時刻</span>
        <input
          type="datetime-local"
          class="input input-bordered input-sm w-56 max-w-[70%]"
          value={props.endedAtLocal ?? ''}
          onInput={(event) => props.onEndedAtChange?.(event.currentTarget.value)}
        />
      </div>
    </Show>

    <div class="flex items-start justify-between gap-3 px-4 py-3">
      <span class="pt-2 text-sm text-base-content/70">メモ</span>
      <textarea
        class="textarea textarea-bordered textarea-sm min-h-20 w-80 max-w-[70%]"
        value={props.description}
        onInput={(event) => props.onDescriptionChange(event.currentTarget.value)}
        placeholder={props.descriptionPlaceholder}
      />
    </div>
  </div>
)

export default ActivityEditorForm
