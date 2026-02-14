import ActiveActivityCard from '@/lib/ui/dashboard/ActiveActivityCard'
import CompletedActivitiesCard from '@/lib/ui/dashboard/CompletedActivitiesCard'
import DateNavigatorCard from '@/lib/ui/dashboard/DateNavigatorCard'
import ActivityEditorModal from '@/lib/ui/dashboard/modals/ActivityEditorModal'
import type { DashboardSectionProps } from '@/lib/ui/dashboard/types'

const DashboardLayout = (props: DashboardSectionProps) => (
  <div class="page-content">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <h1 class="text-2xl font-semibold">Dashboard</h1>
    </div>

    <DateNavigatorCard model={props.model} />
    <ActiveActivityCard model={props.model} />
    <CompletedActivitiesCard model={props.model} />

    <ActivityEditorModal model={props.model} />
  </div>
)

export default DashboardLayout
