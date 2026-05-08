import { useMutation, useQuery } from 'convex/react'
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'
import { X } from 'lucide-react'
import type { ChangeEvent, FormEvent, PointerEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import type { Id } from '../../convex/_generated/dataModel'
import { api } from '../../convex/_generated/api'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import {
  mapCloseoutServerError,
  validateCloseoutClient,
  type CloseoutFieldErrors,
} from '@/lib/closeoutFieldErrors'
import { formatAppointmentDate } from '@/lib/date'
import {
  clearCloseoutDraft,
  laborHoursDraftToInput,
  laborHoursToDraftValue,
  loadCloseoutDraft,
  persistCloseoutDraft,
} from '@/lib/closeoutDraft'
import { prepareCloseoutPhoto } from '@/lib/imageUploadPrep'
import { JOB_STATUS_LABELS } from '@/lib/jobs'
import {
  describeConnectivityError,
  uploadBlobToConvexStorage,
} from '@/lib/upload'

type StagedPhoto = {
  id: string
  file: File
  previewUrl: string
}

const CLOSEOUT_DRAFT_DEBOUNCE_MS = 500

export function TechnicianJobDetailPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const jobId = id as Id<'jobs'>

  const detail = useQuery(
    api.jobs.getJobDetailWithUrls,
    id ? { jobId } : 'skip',
  )
  const startJob = useMutation(api.jobs.startJob)
  const submitCloseout = useMutation(api.jobs.submitCloseout)
  const generateUploadUrlMutation = useMutation(api.storage.generateUploadUrl)

  const getUploadUrl = useCallback(
    () => generateUploadUrlMutation({ jobId }),
    [generateUploadUrlMutation, jobId],
  )

  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const canvasContainerRef = useRef<HTMLDivElement | null>(null)
  const stagedPhotosRef = useRef<StagedPhoto[]>([])
  const closeoutFormRef = useRef<HTMLFormElement | null>(null)
  const drawingRef = useRef(false)
  const [stagedPhotos, setStagedPhotos] = useState<StagedPhoto[]>([])
  const [hasSignature, setHasSignature] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [startJobError, setStartJobError] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<CloseoutFieldErrors>({})
  const [isDirty, setIsDirty] = useState(false)
  const [isOnline, setIsOnline] = useState(
    () => typeof navigator !== 'undefined' && navigator.onLine,
  )

  const [workCompleted, setWorkCompleted] = useState('')
  const [laborHoursInput, setLaborHoursInput] = useState('')
  const [materialsUsed, setMaterialsUsed] = useState('')
  const [notes, setNotes] = useState('')

  const closeoutRestoredJobRef = useRef<string | null>(null)
  const closeoutPersistAllowedRef = useRef(false)

  useEffect(() => {
    if (detail?.job.status !== 'in_progress' || !id) {
      closeoutRestoredJobRef.current = null
      closeoutPersistAllowedRef.current = false
      return
    }

    if (closeoutRestoredJobRef.current === id) {
      closeoutPersistAllowedRef.current = true
      return
    }

    const draft = loadCloseoutDraft(id)
    setWorkCompleted(draft?.workCompleted ?? '')
    setLaborHoursInput(laborHoursDraftToInput(draft?.laborHours ?? null))
    setMaterialsUsed(draft?.materialsUsed ?? '')
    setNotes(draft?.notes ?? '')

    const hasDraftText =
      (draft?.workCompleted.trim() ?? '') !== '' ||
      (draft?.materialsUsed.trim() ?? '') !== '' ||
      (draft?.notes.trim() ?? '') !== '' ||
      draft?.laborHours != null

    setIsDirty(hasDraftText)

    closeoutRestoredJobRef.current = id
    closeoutPersistAllowedRef.current = true
  }, [detail?.job.status, id])

  useEffect(() => {
    if (
      !closeoutPersistAllowedRef.current ||
      detail?.job.status !== 'in_progress' ||
      !id
    ) {
      return
    }

    const handle = window.setTimeout(() => {
      persistCloseoutDraft(id, {
        workCompleted,
        laborHours: laborHoursToDraftValue(laborHoursInput),
        materialsUsed,
        notes,
      })
    }, CLOSEOUT_DRAFT_DEBOUNCE_MS)

    return () => window.clearTimeout(handle)
  }, [
    detail?.job.status,
    id,
    laborHoursInput,
    materialsUsed,
    notes,
    workCompleted,
  ])

  useLayoutEffect(() => {
    const canvas = canvasRef.current
    const container = canvasContainerRef.current
    if (!canvas || !container || detail?.job.status !== 'in_progress') {
      return
    }

    function layoutCanvas() {
      const el = canvasRef.current
      const wrap = canvasContainerRef.current
      if (!el || !wrap) {
        return
      }
      const dpr = Math.min(Math.max(window.devicePixelRatio ?? 1, 1), 3)
      const rect = wrap.getBoundingClientRect()
      const cssWidth = rect.width
      const cssHeight = rect.height
      if (cssWidth < 2 || cssHeight < 2) {
        return
      }
      el.width = Math.round(cssWidth * dpr)
      el.height = Math.round(cssHeight * dpr)
      const ctx = el.getContext('2d')
      if (!ctx) {
        return
      }
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.scale(dpr, dpr)
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, cssWidth, cssHeight)
    }

    layoutCanvas()
    const observer = new ResizeObserver(() => layoutCanvas())
    observer.observe(container)
    return () => observer.disconnect()
  }, [detail?.job.status])

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

  useEffect(() => {
    stagedPhotosRef.current = stagedPhotos
  }, [stagedPhotos])

  useEffect(() => {
    return () => {
      for (const photo of stagedPhotosRef.current) {
        URL.revokeObjectURL(photo.previewUrl)
      }
    }
  }, [])

  useEffect(() => {
    const onOnline = () => setIsOnline(true)
    const onOffline = () => setIsOnline(false)
    window.addEventListener('online', onOnline)
    window.addEventListener('offline', onOffline)
    return () => {
      window.removeEventListener('online', onOnline)
      window.removeEventListener('offline', onOffline)
    }
  }, [])

  function addStagedFiles(fileList: FileList | File[]) {
    const incoming = Array.from(fileList).filter(
      (file) => file.size > 0 && file.type.startsWith('image/'),
    )
    if (incoming.length === 0) {
      return
    }
    setStagedPhotos((prev) => [
      ...prev,
      ...incoming.map((file) => ({
        id: crypto.randomUUID(),
        file,
        previewUrl: URL.createObjectURL(file),
      })),
    ])
    setIsDirty(true)
  }

  function removeStagedPhoto(photoId: string) {
    setStagedPhotos((prev) => {
      const target = prev.find((p) => p.id === photoId)
      if (target) {
        URL.revokeObjectURL(target.previewUrl)
      }
      return prev.filter((p) => p.id !== photoId)
    })
    setIsDirty(true)
  }

  function handlePhotosInputChange(event: ChangeEvent<HTMLInputElement>) {
    const { files } = event.target
    if (files?.length) {
      addStagedFiles(files)
    }
    event.target.value = ''
  }

  function withCanvasContext(
    callback: (
      context: CanvasRenderingContext2D,
      canvas: HTMLCanvasElement,
    ) => void,
  ) {
    const canvas = canvasRef.current
    if (!canvas) {
      return
    }
    const context = canvas.getContext('2d')
    if (!context) {
      return
    }
    callback(context, canvas)
  }

  function getCanvasPoint(event: PointerEvent<HTMLCanvasElement>) {
    const rect = event.currentTarget.getBoundingClientRect()
    return { x: event.clientX - rect.left, y: event.clientY - rect.top }
  }

  function startDrawing(event: PointerEvent<HTMLCanvasElement>) {
    event.preventDefault()
    const point = getCanvasPoint(event)
    withCanvasContext((context) => {
      drawingRef.current = true
      context.beginPath()
      context.lineWidth = 2
      context.lineCap = 'round'
      context.strokeStyle = '#111827'
      context.moveTo(point.x, point.y)
    })
    setHasSignature(true)
    setIsDirty(true)
  }

  function continueDrawing(event: PointerEvent<HTMLCanvasElement>) {
    if (!drawingRef.current) {
      return
    }
    event.preventDefault()
    const point = getCanvasPoint(event)
    withCanvasContext((context) => {
      context.lineTo(point.x, point.y)
      context.stroke()
    })
  }

  function stopDrawing() {
    drawingRef.current = false
  }

  function clearSignature() {
    withCanvasContext((context, canvas) => {
      const rect = canvas.getBoundingClientRect()
      context.clearRect(0, 0, rect.width, rect.height)
      context.fillStyle = '#ffffff'
      context.fillRect(0, 0, rect.width, rect.height)
    })
    setHasSignature(false)
    setIsDirty(true)
  }

  async function exportSignatureBlob(): Promise<Blob> {
    const canvas = canvasRef.current
    if (!canvas) {
      throw new Error('Signature pad is not ready.')
    }
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob((nextBlob) => resolve(nextBlob), 'image/png'),
    )
    if (!blob) {
      throw new Error('Could not read signature image.')
    }
    return blob
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFieldErrors({})
    setError(null)

    if (!id) {
      setFieldErrors({ form: 'Missing job id.' })
      return
    }

    const laborTrim = laborHoursInput.trim()
    const laborHoursRaw =
      laborTrim === '' ? Number.NaN : Number(laborHoursInput)
    const photos = stagedPhotos.map((p) => p.file)

    const clientErrors = validateCloseoutClient({
      workCompleted,
      laborHoursRaw,
      hasSignature,
    })
    if (Object.keys(clientErrors).length > 0) {
      setFieldErrors(clientErrors)
      return
    }

    setIsSubmitting(true)
    try {
      const uploadedPhotoIds: string[] = []
      for (const photo of photos) {
        try {
          const prepared = await prepareCloseoutPhoto(photo)
          const photoStorageId = await uploadBlobToConvexStorage(
            prepared.blob,
            prepared.fileName,
            getUploadUrl,
          )
          uploadedPhotoIds.push(photoStorageId)
        } catch (photoErr) {
          const message =
            photoErr instanceof Error
              ? photoErr.message
              : 'Could not upload photos. Please try again.'
          setFieldErrors({ photos: message })
          return
        }
      }

      let signatureStorageId: string
      try {
        const signatureBlob = await exportSignatureBlob()
        signatureStorageId = await uploadBlobToConvexStorage(
          signatureBlob,
          `signature-${jobId}.png`,
          getUploadUrl,
        )
      } catch (sigErr) {
        const message =
          sigErr instanceof Error
            ? sigErr.message
            : 'Could not upload signature. Please try again.'
        setFieldErrors({ signature: message })
        return
      }

      try {
        await submitCloseout({
          jobId,
          workCompleted,
          laborHours: laborHoursRaw,
          materialsUsed,
          notes,
          photoStorageIds: uploadedPhotoIds,
          signatureStorageId,
        })
      } catch (mutationErr) {
        const raw =
          mutationErr instanceof Error
            ? mutationErr.message
            : 'Could not submit closeout.'
        const mapped = mapCloseoutServerError(raw)
        setFieldErrors({ [mapped.field]: mapped.message })
        return
      }

      clearCloseoutDraft(jobId)
      setIsDirty(false)
      navigate('/field', { replace: true })
    } catch (submitError) {
      setError(describeConnectivityError(submitError))
    } finally {
      setIsSubmitting(false)
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

  const isReadOnly =
    detail.job.status === 'completed' || detail.job.status === 'invoice_ready'

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-4 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Button
          onClick={() => {
            if (
              !isDirty ||
              window.confirm('You have unsaved changes. Leave this page?')
            ) {
              navigate('/field')
            }
          }}
          size="sm"
          type="button"
          variant="outline"
        >
          Back to jobs
        </Button>
        <Badge variant="secondary">
          {JOB_STATUS_LABELS[detail.job.status]}
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{detail.job.customerName}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 text-sm">
          <p>{detail.job.customerAddress}</p>
          <p>
            Appointment: {formatAppointmentDate(detail.job.appointmentDate)}
          </p>
          <p className="text-muted-foreground">
            {detail.job.problemDescription}
          </p>
        </CardContent>
      </Card>

      {detail.job.status === 'scheduled' ? (
        <Card>
          <CardContent className="space-y-3 pt-6">
            <p className="text-sm text-muted-foreground">
              Start this job when you arrive on site.
            </p>
            <Button
              className="w-full sm:w-auto"
              onClick={() => {
                setStartJobError(null)
                void startJob({ jobId }).catch((startError: unknown) => {
                  setStartJobError(describeConnectivityError(startError))
                })
              }}
              type="button"
            >
              Start job
            </Button>
            {startJobError ? (
              <p className="text-destructive text-sm" role="alert">
                {startJobError}
              </p>
            ) : null}
          </CardContent>
        </Card>
      ) : null}

      {detail.job.status === 'in_progress' ? (
        <Card>
          <CardHeader>
            <CardTitle>Submit closeout</CardTitle>
          </CardHeader>
          <CardContent>
            {!isOnline ? (
              <p
                className="mb-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100"
                role="status"
              >
                You appear to be offline. Connect to the internet, then submit
                the closeout or tap Retry after you are back online.
              </p>
            ) : null}
            <form
              className="space-y-4"
              onSubmit={handleSubmit}
              ref={closeoutFormRef}
            >
              <div className="space-y-2">
                <Label htmlFor="workCompleted">Work completed</Label>
                <Textarea
                  aria-describedby={
                    fieldErrors.workCompleted
                      ? 'workCompleted-error'
                      : undefined
                  }
                  aria-invalid={!!fieldErrors.workCompleted}
                  id="workCompleted"
                  name="workCompleted"
                  onChange={(e) => {
                    setWorkCompleted(e.target.value)
                    setIsDirty(true)
                  }}
                  required
                  rows={4}
                  value={workCompleted}
                />
                {fieldErrors.workCompleted ? (
                  <p
                    className="text-destructive text-sm"
                    id="workCompleted-error"
                    role="alert"
                  >
                    {fieldErrors.workCompleted}
                  </p>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="laborHours">Labor hours</Label>
                <Input
                  aria-describedby={
                    fieldErrors.laborHours ? 'laborHours-error' : undefined
                  }
                  aria-invalid={!!fieldErrors.laborHours}
                  id="laborHours"
                  min={0}
                  name="laborHours"
                  onChange={(e) => {
                    setLaborHoursInput(e.target.value)
                    setIsDirty(true)
                  }}
                  required
                  step={0.25}
                  type="number"
                  value={laborHoursInput}
                />
                {fieldErrors.laborHours ? (
                  <p
                    className="text-destructive text-sm"
                    id="laborHours-error"
                    role="alert"
                  >
                    {fieldErrors.laborHours}
                  </p>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="materialsUsed">Materials used</Label>
                <Textarea
                  id="materialsUsed"
                  name="materialsUsed"
                  onChange={(e) => {
                    setMaterialsUsed(e.target.value)
                    setIsDirty(true)
                  }}
                  rows={3}
                  value={materialsUsed}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  onChange={(e) => {
                    setNotes(e.target.value)
                    setIsDirty(true)
                  }}
                  rows={3}
                  value={notes}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="photos">Photos</Label>
                <Input
                  accept="image/*"
                  aria-describedby={
                    fieldErrors.photos ? 'photos-error' : undefined
                  }
                  aria-invalid={!!fieldErrors.photos}
                  id="photos"
                  multiple
                  onChange={handlePhotosInputChange}
                  type="file"
                />
                {fieldErrors.photos ? (
                  <p
                    className="text-destructive text-sm"
                    id="photos-error"
                    role="alert"
                  >
                    {fieldErrors.photos}
                  </p>
                ) : null}
                {stagedPhotos.length > 0 ? (
                  <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                    {stagedPhotos.map((photo) => (
                      <li className="relative aspect-square" key={photo.id}>
                        <img
                          alt={
                            photo.file.name
                              ? `Preview: ${photo.file.name}`
                              : 'Photo preview'
                          }
                          className="size-full rounded-md border object-cover"
                          src={photo.previewUrl}
                        />
                        <Button
                          aria-label={`Remove ${photo.file.name || 'photo'}`}
                          className="absolute right-1 top-1 size-8 p-0"
                          onClick={() => removeStagedPhoto(photo.id)}
                          size="icon"
                          type="button"
                          variant="secondary"
                        >
                          <X className="size-4" />
                        </Button>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
              <Separator />
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <Label>Customer signature</Label>
                  <Button
                    onClick={clearSignature}
                    size="sm"
                    type="button"
                    variant="outline"
                  >
                    Clear
                  </Button>
                </div>
                <div className="min-h-[180px] w-full" ref={canvasContainerRef}>
                  <canvas
                    aria-describedby={
                      fieldErrors.signature ? 'signature-error' : undefined
                    }
                    aria-invalid={!!fieldErrors.signature}
                    aria-label="Customer signature"
                    className="w-full touch-none rounded-md border bg-white"
                    onPointerCancel={stopDrawing}
                    onPointerDown={startDrawing}
                    onPointerLeave={stopDrawing}
                    onPointerMove={continueDrawing}
                    onPointerUp={stopDrawing}
                    ref={canvasRef}
                  />
                </div>
                {fieldErrors.signature ? (
                  <p
                    className="text-destructive text-sm"
                    id="signature-error"
                    role="alert"
                  >
                    {fieldErrors.signature}
                  </p>
                ) : null}
              </div>
              {fieldErrors.form ? (
                <p
                  className="text-destructive text-sm"
                  id="closeout-form-error"
                  role="alert"
                >
                  {fieldErrors.form}
                </p>
              ) : null}
              {error ? (
                <div className="border-destructive/30 bg-destructive/5 flex flex-col gap-3 rounded-md border p-3 sm:flex-row sm:items-start sm:justify-between">
                  <p className="text-destructive text-sm">{error}</p>
                  <Button
                    disabled={isSubmitting}
                    onClick={() => closeoutFormRef.current?.requestSubmit()}
                    size="sm"
                    type="button"
                    variant="outline"
                  >
                    Retry
                  </Button>
                </div>
              ) : null}
              <Button
                className="w-full sm:w-auto"
                disabled={isSubmitting}
                type="submit"
              >
                {isSubmitting ? 'Submitting...' : 'Submit closeout'}
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : null}

      {isReadOnly ? (
        <Card>
          <CardContent className="space-y-3 pt-6 text-sm">
            <p>This closeout is complete and is now read-only.</p>
            <Button asChild variant="outline">
              <Link to="/field">Back to my jobs</Link>
            </Button>
          </CardContent>
        </Card>
      ) : null}
    </main>
  )
}
