export const parseDate = (value: string): Date => {
  const year = value.substring(0, 4).padStart(2, '0')
  const month = value.substring(5, 7).padStart(2, '0')
  const day = value.substring(8, 10).padStart(2, '0')
  const hour = value.substring(11, 13).padStart(2, '0')
  const minute = value.substring(14, 16).padStart(2, '0')
  const second = value.substring(17, 19).padStart(2, '0')

  const date = new Date(
    `${year}-${month}-${day}T${hour}:${minute}:${second}.000Z`
  )

  if (!isNaN(date.getTime())) {
    return date
  }
  throw new Error('CANNOT PARSE DATE')
}
