import { useQuery } from 'convex/react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../convex/_generated/api'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  dateInputValueToAppointmentDateMs,
  getTodayLocalDateInputValue,
} from '@/lib/date'
import { JOB_STATUS_LABELS } from '@/lib/jobs'

export function TechnicianJobsPage() {
  const [dateInputValue, setDateInputValue] = useState(
    getTodayLocalDateInputValue(),
  )
  const dayStartMs = dateInputValueToAppointmentDateMs(dateInputValue)
  const jobs = useQuery(api.jobs.listTechnicianJobsForDay, { dayStartMs })

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-4 p-4">
      <div className="space-y-2">
        <h1 className="text-xl font-semibold">My jobs</h1>
        <label className="space-y-1 text-sm">
          <span className="text-muted-foreground">Select day</span>
          <input
            className="border-input w-full rounded-md border bg-background px-3 py-2 text-base sm:max-w-xs"
            onChange={(event) => setDateInputValue(event.target.value)}
            type="date"
            value={dateInputValue}
          />
        </label>
      </div>

      {jobs === undefined ? (
        <p className="text-sm text-muted-foreground">Loading jobs...</p>
      ) : jobs.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-sm text-muted-foreground">
            No jobs for this day.
          </CardContent>
        </Card>
      ) : (
        jobs.map((job) => (
          <Card key={job._id}>
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-3">
                <CardTitle className="text-base">{job.customerName}</CardTitle>
                <Badge variant="secondary">
                  {JOB_STATUS_LABELS[job.status]}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>{job.customerAddress}</p>
              <p className="text-muted-foreground">{job.problemDescription}</p>
              <Button asChild className="w-full sm:w-auto" variant="outline">
                <Link to={`/field/jobs/${job._id}`}>Open job</Link>
              </Button>
            </CardContent>
          </Card>
        ))
      )}
    </main>
  )
}
