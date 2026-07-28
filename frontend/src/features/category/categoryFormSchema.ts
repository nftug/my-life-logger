import * as v from 'valibot'

export const categoryFormSchema = v.object({
  name: v.pipe(
    v.string(),
    v.transform((value) => value.trim()),
    v.nonEmpty('カテゴリ名を入力してください。'),
    v.maxLength(100, 'カテゴリ名は100文字以内で入力してください。'),
  ),
  color: v.pipe(
    v.string(),
    v.regex(/^#[0-9A-Fa-f]{6}$/, 'カラーは #RRGGBB 形式で指定してください。'),
  ),
})

export type CategoryFormValues = v.InferOutput<typeof categoryFormSchema>
