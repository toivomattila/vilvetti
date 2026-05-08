import { useMutation, useQuery } from 'convex/react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import type { Id } from '../../convex/_generated/dataModel'
import { api } from '../../convex/_generated/api'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
  buildCloseoutPasteText,
  type CloseoutPasteInput,
} from '@/lib/closeoutText'
import { formatAppointmentDate } from '@/lib/date'
import { JOB_STATUS_LABELS } from '@/lib/jobs'

function jobHasPostSubmitCloseoutFields(job: {
  submittedAt?: number
  workCompleted: string | null
  laborHours: number | null
  materialsUsed: string | null
  notes: string | null
  photoStorageIds: string[]
  signatureStorageId?: string
}): boolean {
  return (
    job.submittedAt != null ||
    (job.workCompleted != null && job.workCompleted.trim() !== '') ||
    job.laborHours != null ||
    (job.materialsUsed != null && job.materialsUsed.trim() !== '') ||
    (job.notes != null && job.notes.trim() !== '') ||
    job.photoStorageIds.length > 0 ||
    Boolean(job.signatureStorageId)
  )
}

function CloseoutCopyButton({
  pastePayload,
}: {
  pastePayload: CloseoutPasteInput
}) {
  const [copyCloseoutStatus, setCopyCloseoutStatus] = useState<
    'idle' | 'copying' | 'copied'
  >('idle')
  const copySuccessTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  )

  useEffect(() => {
    return () => {
      if (copySuccessTimeoutRef.current) {
        clearTimeout(copySuccessTimeoutRef.current)
      }
    }
  }, [])

  async function handleCopyCloseoutText() {
    const text = buildCloseoutPasteText(pastePayload)

    setCopyCloseoutStatus('copying')
    let copied = false
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text)
        copied = true
      }
    } catch {
      copied = false
    }
    if (!copied) {
      window.prompt('Copy closeout text (select all, then copy)', text)
    }
    if (copySuccessTimeoutRef.current) {
      clearTimeout(copySuccessTimeoutRef.current)
    }
    setCopyCloseoutStatus('copied')
    copySuccessTimeoutRef.current = setTimeout(() => {
      setCopyCloseoutStatus('idle')
      copySuccessTimeoutRef.current = null
    }, 2000)
  }

  return (
    <div className="flex flex-wrap items-center gap-2 pt-1">
      <span aria-live="polite" className="sr-only">
        {copyCloseoutStatus === 'copied'
          ? 'Closeout text copied to clipboard.'
          : ''}
      </span>
      <Button
        disabled={copyCloseoutStatus === 'copying'}
        onClick={() => {
          void handleCopyCloseoutText()
        }}
        size="sm"
        type="button"
        variant="outline"
      >
        {copyCloseoutStatus === 'copying'
          ? 'Copying…'
          : copyCloseoutStatus === 'copied'
            ? 'Copied'
            : 'Copy closeout text'}
      </Button>
    </div>
  )
}

export function OfficeJobDetailPage() {
  const { id } = useParams<{ id: string }>()
  const jobId = id as Id<'jobs'>

  const detail = useQuery(
    api.jobs.getJobDetailWithUrls,
    id ? { jobId } : 'skip',
  )
  const markCloseoutViewed = useMutation(api.jobs.markCloseoutViewed)
  const releaseForInvoicing = useMutation(api.jobs.releaseForInvoicing)

  const [markError, setMarkError] = useState<string | null>(null)
  const [releaseError, setReleaseError] = useState<string | null>(null)
  const [isReleasing, setIsReleasing] = useState(false)
  const didAttemptMarkRef = useRef(false)

  const shouldMarkViewed = useMemo(() => {
    if (!detail) {
      return false
    }
    return (
      detail.job.status === 'completed' || detail.job.status === 'invoice_ready'
    )
  }, [detail])

  const canCopyCloseout = useMemo(() => {
    if (!detail) {
      return false
    }
    const { job } = detail
    if (job.status === 'completed' || job.status === 'invoice_ready') {
      return true
    }
    return jobHasPostSubmitCloseoutFields(job)
  }, [detail])

  useEffect(() => {
    if (!id || !detail || !shouldMarkViewed || didAttemptMarkRef.current) {
      return
    }

    didAttemptMarkRef.current = true
    void markCloseoutViewed({ jobId }).catch((error: unknown) => {
      didAttemptMarkRef.current = false
      setMarkError(
        error instanceof Error
          ? error.message
          : 'Could not mark closeout as viewed.',
      )
    })
  }, [detail, id, jobId, markCloseoutViewed, shouldMarkViewed])

  if (!id) {
    return <p className="text-destructive p-4 text-sm">Missing job id.</p>
  }

  if (detail === undefined) {
    return (
      <p className="p-4 text-sm text-muted-foreground">
        Loading job details...
      </p>
    )
  }

  const canRelease = detail.job.status === 'completed'
  const viewed = Boolean(detail.job.closeoutViewedAt)

  const closeoutPastePayload: CloseoutPasteInput = {
    customerName: detail.job.customerName,
    customerAddress: detail.job.customerAddress,
    appointmentDateMs: detail.job.appointmentDate,
    technicianDisplayName: detail.technicianDisplayName,
    problemDescription: detail.job.problemDescription,
    workCompleted: detail.job.workCompleted,
    laborHours: detail.job.laborHours,
    materialsUsed: detail.job.materialsUsed,
    notes: detail.job.notes,
    submittedAt: detail.job.submittedAt,
    submittedByDisplayName: detail.submittedBy?.displayName,
  }

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-4 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Button asChild size="sm" variant="outline">
          <Link to="/office">Back to jobs</Link>
        </Button>
        <div className="flex flex-wrap items-center gap-2">
          {detail.job.status === 'scheduled' ? (
            <Button asChild size="sm" variant="secondary">
              <Link to={`/office/jobs/${jobId}/edit`}>Edit job</Link>
            </Button>
          ) : null}
          <Badge variant="secondary">
            {JOB_STATUS_LABELS[detail.job.status]}
          </Badge>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{detail.job.customerName}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>{detail.job.customerAddress}</p>
          <p>
            Appointment: {formatAppointmentDate(detail.job.appointmentDate)}
          </p>
          <p>Technician: {detail.technicianDisplayName ?? 'Unknown'}</p>
          <p className="text-muted-foreground">
            {detail.job.problemDescription}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Closeout</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p>
            Submitted:{' '}
            {detail.job.submittedAt
              ? new Date(detail.job.submittedAt).toLocaleString()
              : 'Not submitted'}
          </p>
          <p>
            Submitted by: {detail.submittedBy?.displayName ?? 'Not available'}
          </p>
          <Separator />
          <p>
            <strong>Work completed:</strong> {detail.job.workCompleted ?? '—'}
          </p>
          <p>
            <strong>Labor hours:</strong>{' '}
            {detail.job.laborHours !== null ? detail.job.laborHours : '—'}
          </p>
          <p>
            <strong>Materials used:</strong> {detail.job.materialsUsed ?? '—'}
          </p>
          <p>
            <strong>Notes:</strong> {detail.job.notes ?? '—'}
          </p>

          {canCopyCloseout ? (
            <CloseoutCopyButton
              key={jobId}
              pastePayload={closeoutPastePayload}
            />
          ) : null}

          <Separator />
          <div className="space-y-2">
            <p className="font-medium">Photos</p>
            {detail.photoUrls.length === 0 ? (
              <p className="text-muted-foreground">No photos uploaded.</p>
            ) : (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {detail.photoUrls.map((photo) => (
                  <a
                    className="focus-visible:ring-ring overflow-hidden rounded-md border ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                    href={photo.url ?? '#'}
                    key={photo.storageId}
                    rel="noreferrer"
                    target="_blank"
                  >
                    {photo.url ? (
                      <img
                        alt="Closeout"
                        className="h-28 w-full object-cover"
                        src={photo.url}
                      />
                    ) : (
                      <div className="flex h-28 items-center justify-center text-xs text-muted-foreground">
                        Missing file
                      </div>
                    )}
                  </a>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <p className="font-medium">Signature</p>
            {detail.signatureUrl ? (
              <a
                className="focus-visible:ring-ring inline-block rounded-md ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                href={detail.signatureUrl}
                rel="noreferrer"
                target="_blank"
              >
                <img
                  alt="Customer signature"
                  className="h-28 rounded-md border object-contain p-2"
                  src={detail.signatureUrl}
                />
              </a>
            ) : (
              <p className="text-muted-foreground">No signature uploaded.</p>
            )}
          </div>

          <Separator />
          <div className="space-y-2">
            <p>
              Closeout viewed:{' '}
              {viewed
                ? new Date(detail.job.closeoutViewedAt!).toLocaleString()
                : 'No'}
            </p>
            <Button
              disabled={!canRelease || !viewed || isReleasing}
              onClick={() => {
                setReleaseError(null)
                setIsReleasing(true)
                void releaseForInvoicing({ jobId })
                  .catch((error: unknown) => {
                    setReleaseError(
                      error instanceof Error
                        ? error.message
                        : 'Could not release job for invoicing.',
                    )
                  })
                  .finally(() => setIsReleasing(false))
              }}
              type="button"
            >
              {detail.job.status === 'invoice_ready'
                ? 'Released for invoicing'
                : isReleasing
                  ? 'Releasing...'
                  : 'Release for invoicing'}
            </Button>
            {markError ? (
              <p className="text-destructive text-sm">{markError}</p>
            ) : null}
            {releaseError ? (
              <p className="text-destructive text-sm">{releaseError}</p>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
