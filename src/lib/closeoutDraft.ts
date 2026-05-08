import { z } from 'zod'

/** Max serialized JSON length for a closeout draft (text fields only). */
export const CLOSEOUT_DRAFT_MAX_BYTES = 100_000

const draftSchema = z.object({
  workCompleted: z.string(),
  laborHours: z.union([z.number(), z.null()]),
  materialsUsed: z.string(),
  notes: z.string(),
})

export type CloseoutDraftPayload = z.infer<typeof draftSchema>

export function closeoutDraftStorageKey(jobId: string): string {
  return `vilvettiCloseoutDraft:${jobId}`
}

export function parseCloseoutDraft(
  raw: string | null,
): CloseoutDraftPayload | null {
  if (raw === null || raw === '') {
    return null
  }
  try {
    const parsed: unknown = JSON.parse(raw)
    const result = draftSchema.safeParse(parsed)
    return result.success ? result.data : null
  } catch {
    return null
  }
}

export function loadCloseoutDraft(jobId: string): CloseoutDraftPayload | null {
  if (typeof localStorage === 'undefined') {
    return null
  }
  try {
    return parseCloseoutDraft(
      localStorage.getItem(closeoutDraftStorageKey(jobId)),
    )
  } catch {
    return null
  }
}

function closeoutDraftFieldsEmpty(draft: CloseoutDraftPayload): boolean {
  const laborUnset =
    draft.laborHours === null ||
    draft.laborHours === undefined ||
    Number.isNaN(draft.laborHours)
  return (
    draft.workCompleted.trim() === '' &&
    laborUnset &&
    draft.materialsUsed.trim() === '' &&
    draft.notes.trim() === ''
  )
}

export function persistCloseoutDraft(
  jobId: string,
  draft: CloseoutDraftPayload,
): boolean {
  if (typeof localStorage === 'undefined') {
    return false
  }
  if (closeoutDraftFieldsEmpty(draft)) {
    clearCloseoutDraft(jobId)
    return true
  }
  try {
    const json = JSON.stringify(draft)
    if (json.length > CLOSEOUT_DRAFT_MAX_BYTES) {
      return false
    }
    localStorage.setItem(closeoutDraftStorageKey(jobId), json)
    return true
  } catch {
    return false
  }
}

export function clearCloseoutDraft(jobId: string): void {
  if (typeof localStorage === 'undefined') {
    return
  }
  try {
    localStorage.removeItem(closeoutDraftStorageKey(jobId))
  } catch {
    // ignore quota / private mode
  }
}

/** Parse labor hours input for draft storage; empty → null. */
export function laborHoursToDraftValue(raw: string): number | null {
  const trimmed = raw.trim()
  if (trimmed === '') {
    return null
  }
  const n = Number(trimmed)
  return Number.isFinite(n) ? n : null
}

export function laborHoursDraftToInput(value: number | null): string {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return ''
  }
  return String(value)
}
