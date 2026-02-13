import dayjs from 'dayjs'
import 'dayjs/locale/ja'

export const formatDuration = (durationSeconds: number): string => {
  const seconds = Math.max(durationSeconds, 0)
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60

  if (h > 0) {
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }

  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export const formatDateLabel = (dateString: string): string =>
  dayjs(dateString).locale('ja').format('YYYY/MM/DD (dd)')

export const formatTimeLabel = (utcIso: string): string => dayjs(utcIso).format('HH:mm')
