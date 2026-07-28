import type { ActivityResponseDto } from '@/generated/types'
import { formatDuration, formatTime } from '@/lib/activity/date'
import AsyncButton from '@/lib/ui/components/AsyncButton'
import { PencilSquareIcon, StopIcon, XMarkIcon } from '@heroicons/react/24/solid'

interface ActiveActivityCardProps {
  activity: ActivityResponseDto
  durationSeconds: number
  isSubmitting: boolean
  onStop: () => Promise<boolean>
  onCancel: () => Promise<boolean>
  onEditorOpen: () => void
}

const ActiveActivityCard = ({
  activity,
  durationSeconds,
  isSubmitting,
  onStop,
  onCancel,
  onEditorOpen,
}: ActiveActivityCardProps) => (
  <section className="overflow-hidden rounded-2xl bg-primary text-primary-content shadow-lg shadow-primary/15">
    <div className="flex flex-col gap-6 p-6 sm:p-7">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span
            className="h-3 w-3 rounded-full ring-4 ring-white/20"
            style={{ backgroundColor: activity.category.color }}
          />
          <div>
            <p className="text-sm opacity-75">いま記録中</p>
            <h2 className="text-2xl font-semibold">{activity.category.name}</h2>
          </div>
        </div>
        <button
          type="button"
          className="btn btn-sm btn-ghost text-primary-content"
          onClick={onEditorOpen}
        >
          <PencilSquareIcon className="h-4 w-4" />
          編集
        </button>
      </div>

      <div>
        <p className="font-mono text-5xl font-semibold tracking-tight sm:text-6xl">
          {formatDuration(durationSeconds)}
        </p>
        <p className="mt-2 text-sm opacity-75">
          {formatTime(activity.startedAt)} から{' '}
          {activity.description ? `・ ${activity.description}` : '記録中'}
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <AsyncButton
          type="button"
          className="btn-neutral"
          loading={isSubmitting}
          onClick={() => void onStop()}
        >
          <StopIcon className="h-4 w-4" />
          停止して保存
        </AsyncButton>
        <AsyncButton
          type="button"
          className="btn-ghost text-primary-content"
          loading={isSubmitting}
          onClick={() => void onCancel()}
        >
          <XMarkIcon className="h-4 w-4" />
          キャンセル
        </AsyncButton>
      </div>
    </div>
  </section>
)

export default ActiveActivityCard
