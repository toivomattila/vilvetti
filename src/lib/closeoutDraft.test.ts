import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  CLOSEOUT_DRAFT_MAX_BYTES,
  clearCloseoutDraft,
  closeoutDraftStorageKey,
  laborHoursDraftToInput,
  laborHoursToDraftValue,
  loadCloseoutDraft,
  parseCloseoutDraft,
  persistCloseoutDraft,
} from './closeoutDraft'

describe('closeoutDraft', () => {
  const jobId = 'j123'
  const key = closeoutDraftStorageKey(jobId)

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('uses expected storage key', () => {
    expect(closeoutDraftStorageKey('abc')).toBe('vilvettiCloseoutDraft:abc')
  })

  it('parseCloseoutDraft accepts valid JSON', () => {
    const raw = JSON.stringify({
      workCompleted: 'Done',
      laborHours: 2.5,
      materialsUsed: 'Pipe',
      notes: '',
    })
    expect(parseCloseoutDraft(raw)).toEqual({
      workCompleted: 'Done',
      laborHours: 2.5,
      materialsUsed: 'Pipe',
      notes: '',
    })
  })

  it('parseCloseoutDraft rejects invalid shapes', () => {
    expect(parseCloseoutDraft('{')).toBeNull()
    expect(parseCloseoutDraft(JSON.stringify({ workCompleted: 1 }))).toBeNull()
  })

  it('loadCloseoutDraft reads from localStorage', () => {
    const store: Record<string, string> = {
      [key]: JSON.stringify({
        workCompleted: 'x',
        laborHours: null,
        materialsUsed: '',
        notes: '',
      }),
    }
    vi.stubGlobal('localStorage', {
      getItem: (k: string) => store[k] ?? null,
      setItem: (k: string, v: string) => {
        store[k] = v
      },
      removeItem: (k: string) => {
        delete store[k]
      },
    })

    expect(loadCloseoutDraft(jobId)).toEqual({
      workCompleted: 'x',
      laborHours: null,
      materialsUsed: '',
      notes: '',
    })
  })

  it('persistCloseoutDraft removes key when fields are empty', () => {
    const store: Record<string, string> = { [key]: '{}' }
    vi.stubGlobal('localStorage', {
      getItem: (k: string) => store[k] ?? null,
      setItem: (k: string, v: string) => {
        store[k] = v
      },
      removeItem: (k: string) => {
        delete store[k]
      },
    })

    expect(
      persistCloseoutDraft(jobId, {
        workCompleted: '',
        laborHours: null,
        materialsUsed: '',
        notes: '',
      }),
    ).toBe(true)
    expect(store[key]).toBeUndefined()
  })

  it('persistCloseoutDraft refuses oversized payloads', () => {
    const store: Record<string, string> = {}
    vi.stubGlobal('localStorage', {
      getItem: (k: string) => store[k] ?? null,
      setItem: (k: string, v: string) => {
        store[k] = v
      },
      removeItem: (k: string) => {
        delete store[k]
      },
    })

    const big = 'x'.repeat(CLOSEOUT_DRAFT_MAX_BYTES)
    expect(
      persistCloseoutDraft(jobId, {
        workCompleted: big,
        laborHours: null,
        materialsUsed: '',
        notes: '',
      }),
    ).toBe(false)
    expect(store[key]).toBeUndefined()
  })

  it('clearCloseoutDraft removes key', () => {
    const store: Record<string, string> = { [key]: '{}' }
    vi.stubGlobal('localStorage', {
      getItem: (k: string) => store[k] ?? null,
      setItem: (k: string, v: string) => {
        store[k] = v
      },
      removeItem: (k: string) => {
        delete store[k]
      },
    })
    clearCloseoutDraft(jobId)
    expect(store[key]).toBeUndefined()
  })

  it('laborHoursToDraftValue / laborHoursDraftToInput round-trip', () => {
    expect(laborHoursToDraftValue('')).toBeNull()
    expect(laborHoursToDraftValue('  ')).toBeNull()
    expect(laborHoursToDraftValue('1.25')).toBe(1.25)
    expect(laborHoursDraftToInput(null)).toBe('')
    expect(laborHoursDraftToInput(0)).toBe('0')
    expect(laborHoursDraftToInput(2)).toBe('2')
  })
})
