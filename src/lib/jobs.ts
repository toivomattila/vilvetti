export const JOB_STATUSES = [
  'scheduled',
  'in_progress',
  'completed',
  'invoice_ready',
] as const

export type JobStatus = (typeof JOB_STATUSES)[number]

export const JOB_STATUS_LABELS: Record<JobStatus, string> = {
  scheduled: 'Scheduled',
  in_progress: 'In progress',
  completed: 'Completed',
  invoice_ready: 'Invoice ready',
}

/** True when closeout was submitted by the tech or the job reached completed / invoice_ready. */
export function isCloseoutSubmitted(job: {
  status: JobStatus
  submittedAt?: number | null
}): boolean {
  if (job.submittedAt != null) return true
  return job.status === 'completed' || job.status === 'invoice_ready'
}
