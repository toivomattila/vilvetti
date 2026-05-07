import { useMutation, useQuery } from 'convex/react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import type { Id } from '../../convex/_generated/dataModel'
import { api } from '../../convex/_generated/api'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { formatAppointmentDate } from '@/lib/date'
import { JOB_STATUS_LABELS } from '@/lib/jobs'

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

  useEffect(() => {
    if (!id || !detail || !shouldMarkViewed || didAttemptMarkRef.current) {
      return
    }

    didAttemptMarkRef.current = true
    void markCloseoutViewed({ jobId }).catch((error: unknown) => {
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

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-4 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Button asChild size="sm" variant="outline">
          <Link to="/office">Back to jobs</Link>
        </Button>
        <Badge variant="secondary">
          {JOB_STATUS_LABELS[detail.job.status]}
        </Badge>
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
