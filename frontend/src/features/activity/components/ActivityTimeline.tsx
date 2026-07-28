import type { ActivityResponseDto } from '@/generated/types'
import { categoryColor } from '@/lib/activity/categoryColor'
import { formatDuration, formatTime } from '@/lib/activity/date'
import { PencilIcon, TrashIcon } from '@heroicons/react/24/solid'

interface ActivityTimelineProps {
  activities: ActivityResponseDto[]
  activeDurationSeconds: number | null
  onEdit: (activity: ActivityResponseDto) => void
  onEditActive: () => void
  onCancelActive: () => void
  onDelete: (activity: ActivityResponseDto) => void
}

const ActivityTimeline = ({
  activities,
  activeDurationSeconds,
  onEdit,
  onEditActive,
  onCancelActive,
  onDelete,
}: ActivityTimelineProps) => (
  <section className="card h-full border border-base-200 bg-base-100 shadow-sm">
    <div className="card-body h-full min-h-0 gap-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="card-title">今日のタイムライン</h2>
          <p className="text-sm text-base-content/60">開始時刻順に表示しています。</p>
        </div>
        <span className="badge badge-ghost">{activities.length} 件</span>
      </div>

      {activities.length > 0 ? (
        <ol className="min-h-0 flex-1 divide-y divide-base-200 overflow-y-auto pr-1">
          {activities.map((activity) => (
            <li
              key={activity.id}
              className="grid grid-cols-[4.5rem_minmax(0,1fr)_auto_auto] items-center gap-3 py-4 first:pt-0 last:pb-0"
            >
              <div className="font-mono text-sm text-base-content/60">
                {formatTime(activity.startedAt)}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className={`h-2.5 w-2.5 shrink-0 rounded-full ${categoryColor(activity.category.id)}`}
                  />
                  <p className="truncate font-medium">{activity.category.name}</p>
                </div>
                <p className="mt-1 truncate text-sm text-base-content/60">
                  {activity.description || 'メモなし'}
                </p>
              </div>
              {activity.endedAt ? (
                <span className="font-mono text-xs text-base-content/55">
                  {formatDuration(activity.durationSeconds)}
                </span>
              ) : (
                <span className="badge badge-primary badge-sm gap-1 font-mono text-[0.65rem]">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary-content" />
                  {formatDuration(activeDurationSeconds ?? activity.durationSeconds)}
                </span>
              )}
              {activity.endedAt ? (
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    className="btn btn-ghost btn-square btn-sm"
                    aria-label="記録を編集"
                    onClick={() => onEdit(activity)}
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost btn-square btn-sm text-error"
                    aria-label="記録を削除"
                    onClick={() => onDelete(activity)}
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    className="btn btn-ghost btn-square btn-sm"
                    aria-label="進行中の記録を編集"
                    onClick={onEditActive}
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost btn-square btn-sm text-error"
                    aria-label="進行中の記録をキャンセル"
                    onClick={onCancelActive}
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              )}
            </li>
          ))}
        </ol>
      ) : (
        <div className="flex flex-1 items-center justify-center rounded-xl bg-base-200/60 px-5 py-8 text-center text-sm text-base-content/60">
          今日の記録はまだありません。上のフォームから活動を開始してみましょう。
        </div>
      )}
    </div>
  </section>
)

export default ActivityTimeline
