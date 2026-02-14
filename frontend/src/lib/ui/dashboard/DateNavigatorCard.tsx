import { formatDateLabel } from '@/lib/ui/dashboard/utils/formatters'
import type { DashboardSectionProps } from '@/lib/ui/dashboard/types'

const DateNavigatorCard = (props: DashboardSectionProps) => (
  <div class="card border border-base-300 bg-base-100 shadow-sm">
    <div class="card-body gap-4">
      <div class="flex flex-wrap items-center gap-2">
        <button
          type="button"
          class="btn btn-outline btn-sm"
          onClick={() => props.model.actions.shiftDate(-1)}
        >
          前日
        </button>
        <input
          type="date"
          class="input input-bordered input-sm w-44"
          value={props.model.state.selectedDate()}
          onInput={(event) => props.model.actions.setSelectedDate(event.currentTarget.value)}
        />
        <button
          type="button"
          class="btn btn-outline btn-sm"
          onClick={() => props.model.actions.shiftDate(1)}
        >
          翌日
        </button>
        <div class="badge badge-outline">{formatDateLabel(props.model.state.selectedDate())}</div>
      </div>
    </div>
  </div>
)

export default DateNavigatorCard
