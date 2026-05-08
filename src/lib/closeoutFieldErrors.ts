export type CloseoutFieldKey =
  | 'workCompleted'
  | 'laborHours'
  | 'photos'
  | 'signature'
  | 'form'

export type CloseoutFieldErrors = Partial<Record<CloseoutFieldKey, string>>

const LABOR_HOURS_MAX = 24

/**
 * Map Convex / upload error text to a closeout field when a substring match is unambiguous.
 * Unknown messages go to `form`.
 */
export function mapCloseoutServerError(message: string): {
  field: CloseoutFieldKey
  message: string
} {
  const lower = message.toLowerCase()

  if (
    lower.includes('work completed') ||
    lower.includes('work completed is required')
  ) {
    return { field: 'workCompleted', message }
  }

  if (
    lower.includes('labor hours') ||
    lower.includes('between 0 and 24') ||
    lower.includes('must be between 0 and 24')
  ) {
    return { field: 'laborHours', message }
  }

  if (
    lower.includes('customer signature') ||
    (lower.includes('signature') && lower.includes('required'))
  ) {
    return { field: 'signature', message }
  }

  if (
    lower.includes('signature upload') ||
    (lower.includes('signature') && lower.includes('re-upload'))
  ) {
    return { field: 'signature', message }
  }

  if (
    lower.includes('photo') ||
    lower.includes('closeout photos') ||
    (lower.includes('at most') && lower.includes('photo'))
  ) {
    return { field: 'photos', message }
  }

  return { field: 'form', message }
}

export function validateCloseoutClient(args: {
  workCompleted: string
  laborHoursRaw: number
  hasSignature: boolean
}): CloseoutFieldErrors {
  const next: CloseoutFieldErrors = {}

  const work = args.workCompleted.trim()
  if (!work) {
    next.workCompleted = 'Describe what work you completed before submitting.'
  }

  if (Number.isNaN(args.laborHoursRaw)) {
    next.laborHours = 'Enter labor hours as a number (for example, 2.5).'
  } else if (args.laborHoursRaw < 0 || args.laborHoursRaw > LABOR_HOURS_MAX) {
    next.laborHours = `Labor hours must be between 0 and ${LABOR_HOURS_MAX}.`
  }

  if (!args.hasSignature) {
    next.signature = 'Ask the customer to sign in the box before you submit.'
  }

  return next
}
