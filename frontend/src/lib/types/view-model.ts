export interface ActiveActivityFormModel {
  categoryId: string
  description: string
  startedAtLocal: string
}

export interface CompletedActivityFormModel {
  activityId?: string | null
  categoryId: string
  description: string
  startedAtLocal: string
  endedAtLocal: string
}

export interface CompletedActivityModalState {
  mode: 'create' | 'edit'
  form: CompletedActivityFormModel
}
