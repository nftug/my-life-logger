import type { ActivityResponseDto, ActivityStateResponseDto, CategoryResponseDto } from '@/generated/types'
import type {
  ActiveActivityFormModel,
  CompletedActivityFormModel,
  CompletedActivityModalState,
} from '@/lib/types/view-model'
import type { Accessor } from 'solid-js'

export type ActiveActionConfirmType = 'stop' | 'cancel'

export interface DashboardStateModel {
  selectedDate: Accessor<string>
  pendingAction: Accessor<string | null>
  activeDurationSeconds: Accessor<number | null>
  activeForm: Accessor<ActiveActivityFormModel>
  completedModal: Accessor<CompletedActivityModalState | null>
  isActiveEditing: Accessor<boolean>
  activityState: Accessor<ActivityStateResponseDto | undefined>
  categories: Accessor<CategoryResponseDto[] | undefined>
  isTodaySelected: Accessor<boolean>
  isSelectedDateLocked: Accessor<boolean>
  hasCategories: Accessor<boolean>
  resolvedDurationSeconds: Accessor<number | null>
}

export interface DashboardActions {
  setSelectedDate: (value: string) => void
  shiftDate: (deltaDays: number) => void
  setActiveForm: (patch: Partial<ActiveActivityFormModel>) => void
  setCompletedForm: (patch: Partial<CompletedActivityFormModel>) => void
  setIsActiveEditing: (value: boolean) => void
  startActivity: (event: Event) => Promise<void>
  saveActive: () => Promise<void>
  confirmActiveAction: (action: ActiveActionConfirmType) => Promise<void>
  openCreateCompletedModal: () => void
  openEditCompletedModal: (activity: ActivityResponseDto) => void
  closeCompletedModal: () => void
  saveCompleted: (event: Event) => Promise<void>
  deleteCompleted: (activity: ActivityResponseDto) => Promise<void>
}

export interface DashboardViewModel {
  state: DashboardStateModel
  actions: DashboardActions
}

export interface DashboardSectionProps {
  model: DashboardViewModel
}
