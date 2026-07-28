import type { ActivityResponseDto } from '@/generated/types'
import { formatDuration } from '@/lib/activity/date'
import { useMemo } from 'react'

interface DailySummaryProps {
  activities: ActivityResponseDto[]
  activeDurationSeconds: number | null
  totalSeconds: number
  title?: string
}

const DailySummary = ({
  activities,
  activeDurationSeconds,
  totalSeconds,
  title = '今日の記録時間',
}: DailySummaryProps) => {
  const byCategory = useMemo(() => {
    const summaries = new Map<
      string,
      { id: string; name: string; color: string; seconds: number }
    >()
    for (const activity of activities) {
      const current = summaries.get(activity.category.id) ?? {
        id: activity.category.id,
        name: activity.category.name,
        color: activity.category.color,
        seconds: 0,
      }
      const duration = activity.endedAt ? activity.durationSeconds : (activeDurationSeconds ?? 0)
      current.seconds += duration
      summaries.set(activity.category.id, current)
    }
    return [...summaries.values()].sort((left, right) => right.seconds - left.seconds)
  }, [activeDurationSeconds, activities])

  return (
    <section className="card flex h-full min-h-0 border border-base-200 bg-base-100 shadow-sm">
      <div className="card-body flex h-full min-h-0 flex-1 flex-col gap-5">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-base-content/60">{title}</p>
            <p className="mt-1 font-mono text-3xl font-semibold">{formatDuration(totalSeconds)}</p>
          </div>
          <span className="badge badge-outline">{activities.length} 件</span>
        </div>
        {byCategory.length > 0 ? (
          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
            {byCategory.map((summary) => (
              <div
                key={summary.id}
                className="grid grid-cols-[auto_1fr_auto] items-center gap-2 text-sm"
              >
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: summary.color }}
                />
                <span className="truncate">{summary.name}</span>
                <span className="font-mono text-base-content/70">
                  {formatDuration(summary.seconds)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-base-content/55">まだ記録はありません。</p>
        )}
      </div>
    </section>
  )
}

export default DailySummary
