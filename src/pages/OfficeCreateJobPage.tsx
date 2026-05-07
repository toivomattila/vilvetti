import { useMutation, useQuery } from 'convex/react'
import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
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
  dateInputValueToAppointmentDateMs,
  getTodayLocalDateInputValue,
} from '@/lib/date'

export function OfficeCreateJobPage() {
  const navigate = useNavigate()
  const technicians = useQuery(api.profiles.listTechniciansInOrg)
  const createJob = useMutation(api.jobs.createJob)

  const [assignedTechnicianId, setAssignedTechnicianId] = useState<string>('')
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

    const formData = new FormData(event.currentTarget)
    const customerName = String(formData.get('customerName') ?? '')
    const customerAddress = String(formData.get('customerAddress') ?? '')
    const appointmentDate = String(formData.get('appointmentDate') ?? '')
    const problemDescription = String(formData.get('problemDescription') ?? '')

    try {
      setIsSaving(true)
      const jobId = await createJob({
        customerName,
        customerAddress,
        appointmentDate: dateInputValueToAppointmentDateMs(appointmentDate),
        problemDescription,
        assignedTechnicianId: assignedTechnicianId as Id<'users'>,
      })
      setIsDirty(false)
      navigate(`/office/jobs/${jobId}`, { replace: true })
    } catch (mutationError) {
      setError(
        mutationError instanceof Error
          ? mutationError.message
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
          <CardTitle>Create a new job</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className="space-y-4"
            onSubmit={handleSubmit}
            onChange={() => {
              setIsDirty(true)
              setError(null)
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="customerName">Customer name</Label>
              <Input id="customerName" name="customerName" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customerAddress">Customer address</Label>
              <Input id="customerAddress" name="customerAddress" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="appointmentDate">Appointment date</Label>
              <Input
                defaultValue={getTodayLocalDateInputValue()}
                id="appointmentDate"
                name="appointmentDate"
                required
                type="date"
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
                required
                rows={5}
              />
            </div>
            {error ? <p className="text-destructive text-sm">{error}</p> : null}
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                className="w-full sm:w-auto"
                disabled={isSaving}
                type="submit"
              >
                {isSaving ? 'Creating...' : 'Create job'}
              </Button>
              <Button
                className="w-full sm:w-auto"
                onClick={() => {
                  if (confirmLeaveIfDirty()) {
                    navigate('/office')
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
