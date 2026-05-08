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
  const [isMarkingReviewed, setIsMarkingReviewed] = useState(false)

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

  async function handleMarkCloseoutReviewed() {
    setMarkError(null)
    setIsMarkingReviewed(true)
    try {
      await markCloseoutViewed({ jobId })
    } catch (error: unknown) {
      setMarkError(
        error instanceof Error
          ? error.message
          : 'Could not mark closeout as reviewed.',
      )
    } finally {
      setIsMarkingReviewed(false)
    }
  }

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
  const reviewed = Boolean(detail.job.closeoutViewedAt)
  const showMarkReviewed =
    !reviewed &&
    (detail.job.status === 'completed' || detail.job.status === 'invoice_ready')

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
                    className="overflow-hidden rounded-md border"
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
              <a href={detail.signatureUrl} rel="noreferrer" target="_blank">
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
          <div className="space-y-3">
            <p>
              Closeout reviewed:{' '}
              {reviewed
                ? new Date(detail.job.closeoutViewedAt!).toLocaleString()
                : 'Not yet'}
            </p>
            {detail.job.status === 'completed' ||
            detail.job.status === 'invoice_ready' ? (
              <div className="space-y-1 rounded-md border bg-muted/30 p-3">
                <p className="font-medium">Invoicing release</p>
                {detail.job.status === 'invoice_ready' ? (
                  <>
                    <p>
                      Released:{' '}
                      {detail.job.releasedForInvoiceAt
                        ? new Date(
                            detail.job.releasedForInvoiceAt,
                          ).toLocaleString()
                        : '—'}
                    </p>
                    <p>
                      Released by:{' '}
                      {detail.releasedBy?.displayName ?? 'Not available'}
                    </p>
                  </>
                ) : (
                  <p className="text-muted-foreground">Not released</p>
                )}
              </div>
            ) : null}
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              {showMarkReviewed ? (
                <Button
                  disabled={isMarkingReviewed}
                  onClick={() => {
                    void handleMarkCloseoutReviewed()
                  }}
                  type="button"
                >
                  {isMarkingReviewed ? 'Saving…' : 'Mark closeout reviewed'}
                </Button>
              ) : null}
              <Button
                disabled={!canRelease || !reviewed || isReleasing}
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
                variant="secondary"
              >
                {detail.job.status === 'invoice_ready'
                  ? 'Released for invoicing'
                  : isReleasing
                    ? 'Releasing...'
                    : 'Release for invoicing'}
              </Button>
            </div>
            {markError ? (
              <p className="text-destructive text-sm" role="alert">
                {markError}
              </p>
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
