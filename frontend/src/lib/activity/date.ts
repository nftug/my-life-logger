const dateFormatter = new Intl.DateTimeFormat('ja-JP', {
  month: 'long',
  day: 'numeric',
  weekday: 'short',
})

const timeFormatter = new Intl.DateTimeFormat('ja-JP', {
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
})

export const todayDate = () => {
  const now = new Date()
  const timezoneOffset = now.getTimezoneOffset() * 60_000
  return new Date(now.getTime() - timezoneOffset).toISOString().slice(0, 10)
}

export const formatToday = () => dateFormatter.format(new Date())

export const formatTime = (iso: string) => timeFormatter.format(new Date(iso))

export const formatDuration = (seconds: number) => {
  const safeSeconds = Math.max(0, Math.floor(seconds))
  const hours = Math.floor(safeSeconds / 3600)
  const minutes = Math.floor((safeSeconds % 3600) / 60)
  const remainingSeconds = safeSeconds % 60
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(
    remainingSeconds,
  ).padStart(2, '0')}`
}

export const toDateTimeLocal = (iso: string) => {
  const date = new Date(iso)
  const timezoneOffset = date.getTimezoneOffset() * 60_000
  return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 16)
}

export const toUtcIso = (localValue: string) => new Date(localValue).toISOString()

export const isTodayLocal = (localValue: string) => localValue.slice(0, 10) === todayDate()

export const defaultEndTime = () => {
  const now = new Date()
  const date = new Date(now.getTime() + 30 * 60_000)
  if (date.getDate() !== now.getDate()) date.setHours(23, 59, 0, 0)
  const timezoneOffset = date.getTimezoneOffset() * 60_000
  return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 16)
}

export const errorMessage = (error: unknown) => {
  const raw = error instanceof Error ? error.message : String(error)
  if (raw.includes('ActivityOverlap')) return 'ほかの記録と時間帯が重なっています。'
  if (raw.includes('InvalidTimeRange')) return '開始時刻と終了時刻を確認してください。'
  if (raw.includes('CategoryNotFound')) return '選択したカテゴリが見つかりません。'
  return raw || '操作に失敗しました。もう一度お試しください。'
}
