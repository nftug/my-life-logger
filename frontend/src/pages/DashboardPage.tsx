import DashboardLayout from '@/lib/ui/dashboard/DashboardLayout'
import { useDashboardState } from '@/lib/ui/dashboard/hooks/useDashboardState'

const DashboardPage = () => {
  const model = useDashboardState()

  return <DashboardLayout model={model} />
}

export default DashboardPage
