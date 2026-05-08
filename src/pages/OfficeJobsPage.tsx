import { useMutation, usePaginatedQuery } from 'convex/react'
import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { api } from '../../convex/_generated/api'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { formatAppointmentDate } from '@/lib/date'
import { JOB_STATUS_LABELS, JOB_STATUSES } from '@/lib/jobs'
import type { JobStatus } from '@/lib/jobs'

const ALL_STATUSES_VALUE = 'all'

export function OfficeJobsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const statusParam = searchParams.get('status')
  const activeStatus =
    statusParam && JOB_STATUSES.includes(statusParam as JobStatus)
      ? (statusParam as JobStatus)
      : undefined

  const { results, status, loadMore } = usePaginatedQuery(
    api.jobs.listOfficeJobs,
    { status: activeStatus },
    { initialNumItems: 20 },
  )

  const ensureTechnicianInviteCode = useMutation(
    api.profiles.ensureTechnicianInviteCode,
  )
  const [inviteCodeText, setInviteCodeText] = useState<string | null>(null)
  const [inviteCodeError, setInviteCodeError] = useState<string | null>(null)
  const [inviteLoading, setInviteLoading] = useState(false)

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-4 p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Office jobs</h1>
          <p className="text-sm text-muted-foreground">
            Track work from scheduling to invoicing.
          </p>
        </div>
        <Button asChild>
          <Link to="/office/jobs/new">New job</Link>
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Technician access</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p className="text-muted-foreground">
            Technicians need your organization slug plus this invite code to
            join. Share the code verbally or through a trusted channel.
          </p>
          {inviteCodeText ? (
            <div className="space-y-1 break-all rounded-md border bg-muted/40 p-3 font-mono text-sm">
              {inviteCodeText}
            </div>
          ) : null}
          {inviteCodeError ? (
            <p className="text-destructive text-sm">{inviteCodeError}</p>
          ) : null}
          <Button
            disabled={inviteLoading}
            onClick={() => {
              setInviteCodeError(null)
              setInviteLoading(true)
              void ensureTechnicianInviteCode({})
                .then((out) => setInviteCodeText(out.technicianInviteCode))
                .catch((err: unknown) =>
                  setInviteCodeError(
                    err instanceof Error
                      ? err.message
                      : 'Could not load invite code.',
                  ),
                )
                .finally(() => setInviteLoading(false))
            }}
            size="sm"
            type="button"
            variant="outline"
          >
            {inviteLoading
              ? 'Loading…'
              : 'Show / refresh technician invite code'}
          </Button>
        </CardContent>
      </Card>

      <Tabs
        value={activeStatus ?? ALL_STATUSES_VALUE}
        onValueChange={(nextValue) => {
          if (nextValue === ALL_STATUSES_VALUE) {
            setSearchParams({})
            return
          }
          setSearchParams({ status: nextValue })
        }}
      >
        <TabsList className="grid h-auto w-full grid-cols-3 gap-2 sm:grid-cols-5">
          <TabsTrigger value={ALL_STATUSES_VALUE}>All</TabsTrigger>
          {JOB_STATUSES.map((status) => (
            <TabsTrigger key={status} value={status}>
              {JOB_STATUS_LABELS[status]}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {results === undefined ? (
        <p className="text-sm text-muted-foreground">Loading jobs...</p>
      ) : results.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-sm text-muted-foreground">
            No jobs match this filter.
          </CardContent>
        </Card>
      ) : (
        <>
          {results.map((job) => (
            <Card key={job._id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-3">
                  <CardTitle className="text-base">
                    {job.customerName}
                  </CardTitle>
                  <Badge variant="secondary">
                    {JOB_STATUS_LABELS[job.status]}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <p>{job.customerAddress}</p>
                <div className="grid gap-1 text-muted-foreground sm:grid-cols-2">
                  <p>
                    Appointment: {formatAppointmentDate(job.appointmentDate)}
                  </p>
                  <p>Technician: {job.technicianDisplayName ?? 'Unassigned'}</p>
                </div>
                <Button asChild className="w-full sm:w-auto" variant="outline">
                  <Link to={`/office/jobs/${job._id}`}>View details</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
          {status === 'CanLoadMore' ? (
            <Button
              className="w-full sm:w-auto"
              onClick={() => loadMore(20)}
              type="button"
              variant="secondary"
            >
              Load more
            </Button>
          ) : null}
        </>
      )}
    </main>
  )
}
