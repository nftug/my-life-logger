import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import utc from 'dayjs/plugin/utc'

dayjs.extend(customParseFormat)
dayjs.extend(utc)

const DATE_INPUT_FORMAT = 'YYYY-MM-DD'
const DATETIME_LOCAL_FORMAT = 'YYYY-MM-DDTHH:mm'

export const formatDateInput = (date: Date): string => dayjs(date).format(DATE_INPUT_FORMAT)

export const getTodayDateString = (): string => dayjs().format(DATE_INPUT_FORMAT)

export const shiftDate = (dateString: string, deltaDays: number): string =>
  dayjs(dateString, DATE_INPUT_FORMAT, true).add(deltaDays, 'day').format(DATE_INPUT_FORMAT)

export const isToday = (dateString: string): boolean =>
  dayjs(dateString, DATE_INPUT_FORMAT, true).isSame(dayjs(), 'day')

export const toUtcIsoFromLocalInput = (localDateTime: string): string => {
  const parsed = dayjs(localDateTime, DATETIME_LOCAL_FORMAT, true)
  if (!parsed.isValid()) {
    throw new Error('日時の形式が不正です。')
  }

  return parsed.utc().toISOString()
}

export const toLocalInputFromUtcIso = (utcIso: string): string => {
  const parsed = dayjs(utcIso)
  if (!parsed.isValid()) {
    throw new Error('日時の形式が不正です。')
  }

  return parsed.local().format(DATETIME_LOCAL_FORMAT)
}

export const isValidRange = (startLocal: string, endLocal: string): boolean => {
  const start = dayjs(startLocal, DATETIME_LOCAL_FORMAT, true)
  const end = dayjs(endLocal, DATETIME_LOCAL_FORMAT, true)
  return start.isValid() && end.isValid() && start.isBefore(end)
}
