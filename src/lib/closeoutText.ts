/** UTC calendar date for paste blocks (stable across environments). */
function formatAppointmentForPaste(appointmentDateMs: number): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(appointmentDateMs)
}

function formatSubmittedForPaste(submittedAtMs: number): string {
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'short',
    timeStyle: 'short',
    timeZone: 'UTC',
  }).format(submittedAtMs)
}

function isFilledString(value: string | null | undefined): value is string {
  return typeof value === 'string' && value.trim() !== ''
}

export type CloseoutPasteInput = {
  customerName: string
  customerAddress: string
  appointmentDateMs: number
  technicianDisplayName: string | null
  problemDescription: string
  workCompleted: string | null
  laborHours: number | null
  materialsUsed: string | null
  notes: string | null
  submittedAt?: number
  submittedByDisplayName?: string
}

/**
 * Plain-text closeout summary for pasting into email / invoicing tools.
 * Bilingual Finnish / English labels; empty sections are omitted.
 */
export function buildCloseoutPasteText(input: CloseoutPasteInput): string {
  const blocks: string[] = []

  const jobLines: string[] = [
    `Asiakas / Customer: ${input.customerName}`,
    `Osoite / Address: ${input.customerAddress}`,
    `Aika / Appointment: ${formatAppointmentForPaste(input.appointmentDateMs)}`,
  ]
  if (isFilledString(input.technicianDisplayName)) {
    jobLines.push(`Teknikko / Technician: ${input.technicianDisplayName}`)
  }
  blocks.push(jobLines.join('\n'))

  if (isFilledString(input.problemDescription)) {
    blocks.push(
      ['Kuvaus / Problem:', input.problemDescription.trim()].join('\n'),
    )
  }

  const closeoutLines: string[] = []
  if (isFilledString(input.workCompleted)) {
    closeoutLines.push(
      `Työ tehty / Work completed: ${input.workCompleted.trim()}`,
    )
  }
  if (input.laborHours != null && !Number.isNaN(input.laborHours)) {
    closeoutLines.push(`Tunnit / Labor hours: ${input.laborHours}`)
  }
  if (isFilledString(input.materialsUsed)) {
    closeoutLines.push(`Materiaalit / Materials: ${input.materialsUsed.trim()}`)
  }
  if (isFilledString(input.notes)) {
    closeoutLines.push(`Muistiinpanot / Notes: ${input.notes.trim()}`)
  }
  if (closeoutLines.length > 0) {
    blocks.push(closeoutLines.join('\n'))
  }

  const metaLines: string[] = []
  if (
    typeof input.submittedAt === 'number' &&
    !Number.isNaN(input.submittedAt)
  ) {
    metaLines.push(
      `Lähetetty / Submitted: ${formatSubmittedForPaste(input.submittedAt)} (UTC)`,
    )
  }
  if (isFilledString(input.submittedByDisplayName)) {
    metaLines.push(
      `Lähettäjä / Submitted by: ${input.submittedByDisplayName.trim()}`,
    )
  }
  if (metaLines.length > 0) {
    blocks.push(metaLines.join('\n'))
  }

  return blocks.join('\n\n')
}
