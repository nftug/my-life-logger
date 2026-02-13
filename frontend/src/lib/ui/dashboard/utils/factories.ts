import dayjs from 'dayjs'
import type { CategoryResponseDto } from '@/generated/types'
import type { CompletedActivityFormModel } from '@/lib/types/view-model'

const DATETIME_LOCAL_FORMAT = 'YYYY-MM-DDTHH:mm'

export const nowLocalInput = (): string => dayjs().format(DATETIME_LOCAL_FORMAT)

export const createCompletedForm = (categories: CategoryResponseDto[]): CompletedActivityFormModel => ({
  activityId: null,
  categoryId: categories[0]?.id ?? '',
  description: '',
  startedAtLocal: nowLocalInput(),
  endedAtLocal: dayjs().add(30, 'minute').format(DATETIME_LOCAL_FORMAT),
})
