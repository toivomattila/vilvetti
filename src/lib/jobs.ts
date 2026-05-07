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
