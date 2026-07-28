import * as v from 'valibot'

const categoryId = v.pipe(v.string(), v.nonEmpty('カテゴリを選択してください。'))
const description = v.pipe(v.string(), v.maxLength(200, 'メモは200文字以内で入力してください。'))
const localDateTime = (label: string, date: string) =>
  v.pipe(
    v.string(),
    v.nonEmpty(`${label}を入力してください。`),
    v.check((value) => value.slice(0, 10) === date, `${date}の日付の時刻を指定してください。`),
  )

export const startActivitySchema = v.object({ categoryId, description })

export const createActiveActivitySchema = (date: string) =>
  v.object({
    categoryId,
    description,
    startedAtLocal: localDateTime('開始時刻', date),
  })

export const createCompletedActivitySchema = (date: string) =>
  v.pipe(
    v.object({
      categoryId,
      description,
      startedAtLocal: localDateTime('開始時刻', date),
      endedAtLocal: localDateTime('終了時刻', date),
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
export type ActiveActivityFormValues = v.InferOutput<ReturnType<typeof createActiveActivitySchema>>
export type CompletedActivityFormValues = v.InferOutput<
  ReturnType<typeof createCompletedActivitySchema>
>
