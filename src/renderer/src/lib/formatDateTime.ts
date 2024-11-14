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

  if (isFormatToTime) {
    return format(dateTime, 'HH:mm:ss')
  } else {
    return format(dateTime, 'yyyy/MM/dd')
  }
}
