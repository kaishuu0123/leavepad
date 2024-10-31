import { format, formatISO, isSameDay, isSameYear } from 'date-fns'

export const formatToISO8601 = (dateTimeMilliSeconds: number | undefined) => {
  if (dateTimeMilliSeconds == null) {
    return ''
  }

  return formatISO(new Date(dateTimeMilliSeconds), { format: 'extended' })
}

export const formatToRecent = (dateTimeMilliSeconds: number | undefined) => {
  if (dateTimeMilliSeconds == null) {
    return ''
  }

  const dateTime = new Date(dateTimeMilliSeconds)
  const now = new Date()
  const isFormatToTime = isSameDay(now, dateTime)
  const isFormatToMonthAndDay = isSameYear(now, dateTime)

  if (isFormatToTime) {
    return format(dateTime, 'HH:mm:ss')
  } else if (isFormatToMonthAndDay) {
    return format(dateTime, 'yy/MM/dd')
  } else {
    return format(dateTime, 'yyyy/MM/dd')
  }
}
