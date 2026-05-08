import { useMutation, useQuery } from 'convex/react'
import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import type { Id } from '../../convex/_generated/dataModel'
import { api } from '../../convex/_generated/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import {
  appointmentDateMsToDateInputValue,
  dateInputValueToAppointmentDateMs,
  getTodayLocalDateInputValue,
} from '@/lib/date'

type OfficeJobFormInitialValues = {
  customerName: string
  customerAddress: string
  appointmentDateInput: string
  problemDescription: string
  assignedTechnicianId: string
}

function defaultCreateInitialValues(): OfficeJobFormInitialValues {
  return {
    customerName: '',
    customerAddress: '',
    appointmentDateInput: getTodayLocalDateInputValue(),
    problemDescription: '',
    assignedTechnicianId: '',
  }
}

type OfficeJobFormProps = OfficeJobFormInitialValues & {
  isEdit: boolean
  jobId: Id<'jobs'> | undefined
}

function OfficeJobForm({
  isEdit,
  jobId,
  customerName: initialCustomerName,
  customerAddress: initialCustomerAddress,
  appointmentDateInput: initialAppointmentDateInput,
  problemDescription: initialProblemDescription,
  assignedTechnicianId: initialAssignedTechnicianId,
}: OfficeJobFormProps) {
  const navigate = useNavigate()
  const technicians = useQuery(api.profiles.listTechniciansInOrg)
  const createJob = useMutation(api.jobs.createJob)
  const updateJob = useMutation(api.jobs.updateJob)

  const [assignedTechnicianId, setAssignedTechnicianId] = useState(
    () => initialAssignedTechnicianId,
  )
  const [customerName, setCustomerName] = useState(() => initialCustomerName)
  const [customerAddress, setCustomerAddress] = useState(
    () => initialCustomerAddress,
  )
  const [appointmentDateInput, setAppointmentDateInput] = useState(
    () => initialAppointmentDateInput,
  )
  const [problemDescription, setProblemDescription] = useState(
    () => initialProblemDescription,
  )

  const [error, setError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isDirty, setIsDirty] = useState(false)

  useEffect(() => {
    if (!isDirty) {
      return
    }
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault()
      event.returnValue = ''
    }
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [isDirty])

  function confirmLeaveIfDirty(): boolean {
    if (!isDirty) {
      return true
    }
    return window.confirm('You have unsaved changes. Leave this page?')
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    if (!assignedTechnicianId) {
      setError('Please choose a technician.')
      return
    }

    try {
      setIsSaving(true)
      if (isEdit && jobId) {
        await updateJob({
          jobId,
          customerName,
          customerAddress,
          appointmentDate:
            dateInputValueToAppointmentDateMs(appointmentDateInput),
          problemDescription,
          assignedTechnicianId: assignedTechnicianId as Id<'users'>,
        })
        setIsDirty(false)
        navigate(`/office/jobs/${jobId}`, { replace: true })
      } else {
        const newJobId = await createJob({
          customerName,
          customerAddress,
          appointmentDate:
            dateInputValueToAppointmentDateMs(appointmentDateInput),
          problemDescription,
          assignedTechnicianId: assignedTechnicianId as Id<'users'>,
        })
        setIsDirty(false)
        navigate(`/office/jobs/${newJobId}`, { replace: true })
      }
    } catch (mutationError) {
      setError(
        mutationError instanceof Error
          ? mutationError.message
          : isEdit
            ? 'Could not update job.'
            : 'Could not create job.',
      )
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <main className="mx-auto w-full max-w-2xl p-4">
      <Card>
        <CardHeader>
          <CardTitle>{isEdit ? 'Edit job' : 'Create a new job'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className="space-y-4"
            onChange={() => {
              setIsDirty(true)
              setError(null)
            }}
            onSubmit={handleSubmit}
          >
            <div className="space-y-2">
              <Label htmlFor="customerName">Customer name</Label>
              <Input
                id="customerName"
                name="customerName"
                onChange={(event) => setCustomerName(event.target.value)}
                required
                value={customerName}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customerAddress">Customer address</Label>
              <Input
                id="customerAddress"
                name="customerAddress"
                onChange={(event) => setCustomerAddress(event.target.value)}
                required
                value={customerAddress}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="appointmentDate">Appointment date</Label>
              <Input
                id="appointmentDate"
                name="appointmentDate"
                onChange={(event) =>
                  setAppointmentDateInput(event.target.value)
                }
                required
                type="date"
                value={appointmentDateInput}
              />
            </div>
            <div className="space-y-2">
              <Label>Assigned technician</Label>
              <Select
                onValueChange={(value) => {
                  setAssignedTechnicianId(value)
                  setError(null)
                  setIsDirty(true)
                }}
                value={assignedTechnicianId}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      technicians === undefined
                        ? 'Loading technicians...'
                        : 'Select a technician'
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {(technicians ?? []).map((technician) => (
                    <SelectItem
                      key={technician.userId}
                      value={technician.userId}
                    >
                      {technician.displayName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="problemDescription">Problem description</Label>
              <Textarea
                id="problemDescription"
                name="problemDescription"
                onChange={(event) => setProblemDescription(event.target.value)}
                required
                rows={5}
                value={problemDescription}
              />
            </div>
            {error ? <p className="text-destructive text-sm">{error}</p> : null}
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                className="w-full sm:w-auto"
                disabled={isSaving}
                type="submit"
              >
                {isSaving
                  ? isEdit
                    ? 'Saving...'
                    : 'Creating...'
                  : isEdit
                    ? 'Save changes'
                    : 'Create job'}
              </Button>
              <Button
                className="w-full sm:w-auto"
                onClick={() => {
                  if (confirmLeaveIfDirty()) {
                    navigate(
                      isEdit && jobId ? `/office/jobs/${jobId}` : '/office',
                    )
                  }
                }}
                type="button"
                variant="outline"
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </main>
  )
}

export function OfficeJobFormPage() {
  const { jobId: jobIdParam } = useParams<{ jobId?: string }>()
  const isEdit = jobIdParam !== undefined
  const jobId = jobIdParam as Id<'jobs'> | undefined

  const existing = useQuery(
    api.jobs.getJob,
    isEdit && jobId ? { jobId } : 'skip',
  )

  if (isEdit && jobId && existing === undefined) {
    return (
      <p className="p-4 text-sm text-muted-foreground">
        Loading job details...
      </p>
    )
  }

  const initialValues: OfficeJobFormInitialValues =
    isEdit && jobId && existing !== undefined
      ? {
          customerName: existing.job.customerName,
          customerAddress: existing.job.customerAddress,
          appointmentDateInput: appointmentDateMsToDateInputValue(
            existing.job.appointmentDate,
          ),
          problemDescription: existing.job.problemDescription,
          assignedTechnicianId: existing.job.assignedTechnicianId,
        }
      : defaultCreateInitialValues()

  return (
    <OfficeJobForm
      key={isEdit && jobId ? jobId : 'new'}
      appointmentDateInput={initialValues.appointmentDateInput}
      assignedTechnicianId={initialValues.assignedTechnicianId}
      customerAddress={initialValues.customerAddress}
      customerName={initialValues.customerName}
      isEdit={isEdit}
      jobId={jobId}
      problemDescription={initialValues.problemDescription}
    />
  )
}
