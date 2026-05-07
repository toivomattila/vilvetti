const dateFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: 'medium',
  timeZone: 'UTC',
})

function padDatePart(value: number): string {
  return value.toString().padStart(2, '0')
}

export function dateInputValueFromLocalDate(date: Date): string {
  return `${date.getFullYear()}-${padDatePart(date.getMonth() + 1)}-${padDatePart(
    date.getDate(),
  )}`
}

export function getTodayLocalDateInputValue(): string {
  return dateInputValueFromLocalDate(new Date())
}

// `appointmentDate` is encoded as UTC midnight for the selected local date.
export function dateInputValueToAppointmentDateMs(
  dateInputValue: string,
): number {
  const [year, month, day] = dateInputValue.split('-').map(Number)
  if (!year || !month || !day) {
    throw new Error('Please choose a valid date.')
  }
  return Date.UTC(year, month - 1, day)
}

export function appointmentDateMsToDateInputValue(
  appointmentDateMs: number,
): string {
  const date = new Date(appointmentDateMs)
  return `${date.getUTCFullYear()}-${padDatePart(date.getUTCMonth() + 1)}-${padDatePart(
    date.getUTCDate(),
  )}`
}

export function formatAppointmentDate(appointmentDateMs: number): string {
  return dateFormatter.format(appointmentDateMs)
}
