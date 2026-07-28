import { isTodayLocal } from '@/lib/activity/date'
import * as v from 'valibot'

const categoryId = v.pipe(v.string(), v.nonEmpty('カテゴリを選択してください。'))
const description = v.pipe(v.string(), v.maxLength(200, 'メモは200文字以内で入力してください。'))
const todayDateTime = (label: string) =>
  v.pipe(
    v.string(),
    v.nonEmpty(`${label}を入力してください。`),
    v.check(isTodayLocal, '今日の日付の時刻を指定してください。'),
  )

export const startActivitySchema = v.object({ categoryId, description })

export const activeActivitySchema = v.object({
  categoryId,
  description,
  startedAtLocal: todayDateTime('開始時刻'),
})

export const completedActivitySchema = v.pipe(
  v.object({
    categoryId,
    description,
    startedAtLocal: todayDateTime('開始時刻'),
    endedAtLocal: todayDateTime('終了時刻'),
  }),
  v.forward(
    v.partialCheck(
      [['startedAtLocal'], ['endedAtLocal']],
      ({ startedAtLocal, endedAtLocal }) => new Date(startedAtLocal) < new Date(endedAtLocal),
      '終了時刻は開始時刻より後にしてください。',
    ),
    ['endedAtLocal'],
  ),
)

export type ActivityFormValues = v.InferOutput<typeof startActivitySchema>
export type ActiveActivityFormValues = v.InferOutput<typeof activeActivitySchema>
export type CompletedActivityFormValues = v.InferOutput<typeof completedActivitySchema>
